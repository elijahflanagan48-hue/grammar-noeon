import {sqlStatements} from './sql-statements.mjs';
// Local-only Worker/D1 with a fictional identity service. Never reads cloud credentials.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {build} from 'esbuild';
const root=fileURLToPath(new URL('../',import.meta.url));
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'grammar-local-'));
const bundled=path.join(temporary,'worker.mjs');
await build({entryPoints:[path.join(root,'cloudflare/worker.mjs')],outfile:bundled,bundle:true,format:'esm',platform:'neutral',external:['node:crypto']});
const identities=new Map(); let identityCounter=0;
async function fakeFirebase(request){
  const url=new URL(request.url);
  assert.equal(url.origin,'https://identitytoolkit.googleapis.com','No unexpected outbound network calls');
  const action=url.pathname.split(':').at(-1), data=await request.json();
  const fail=message=>Response.json({error:{message}},{status:400});
  if(action==='sendOobCode')return Response.json({email:data.email||'fixture@example.test'});
  if(action==='lookup'){
    const identity=[...identities.values()].find(value=>value.token===data.idToken);
    return identity?Response.json({users:[{localId:identity.id,email:identity.email,emailVerified:identity.verified,disabled:!!identity.disabled}]}):fail('INVALID_ID_TOKEN');
  }
  let identity=identities.get(data.email);
  if(action==='signUp'){
    if(identity)return fail('EMAIL_EXISTS');
    identity={id:'firebase-fixture-'+(++identityCounter),email:data.email,password:data.password,token:'fictional-token-'+identityCounter,verified:!data.email.startsWith('unverified')};
    identities.set(data.email,identity);
  }else if(action==='signInWithPassword'){
    if(!identity||identity.password!==data.password)return fail('INVALID_LOGIN_CREDENTIALS');
    if(identity.disabled)return fail('USER_DISABLED');
  }else return fail('UNKNOWN_METHOD');
  return Response.json({localId:identity.id,email:identity.email,idToken:identity.token,expiresIn:'3600'});
}
async function assets(request) {
  const filename=new URL(request.url).pathname==='/'?'index.html':decodeURIComponent(new URL(request.url).pathname).slice(1);
  const target=path.resolve(root,'cloudflare/public',filename);
  if(!target.startsWith(path.resolve(root,'cloudflare/public')+path.sep))return new Response('',{status:404});
  try {return new Response(fs.readFileSync(target),{headers:{'Content-Type':({'.js':'text/javascript','.html':'text/html','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.woff2':'font/woff2','.png':'image/png','.svg':'image/svg+xml','.md':'text/plain; charset=utf-8'}[path.extname(target)]||'application/octet-stream'),'Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; object-src 'none'"}});}catch{return new Response('',{status:404});}
}
const options={name:'grammar-local',modules:true,script:fs.readFileSync(bundled,'utf8'),compatibilityDate:'2026-10-26',
 bindings:{PUBLIC_ORIGIN:'https://grammar.test',OWNER_SETUP_CODE:'fictional-owner-code',FIREBASE_API_KEY:'fictional-public-api-key'},
 serviceBindings:{ASSETS:assets},d1Databases:{DB:'grammar-local-only'},d1Persist:false,outboundService:fakeFirebase};
const runtime=new Miniflare(convertV4MiniflareOptions?convertV4MiniflareOptions(options):options);
let server;
async function close(){if(server)await new Promise(r=>server.close(r));await runtime.dispose();fs.rmSync(temporary,{recursive:true,force:true});}
try {
 const db=await runtime.getD1Database('DB');
 const statements=sqlStatements(fs.readFileSync(path.join(root,'cloudflare/schema.sql'),'utf8'));
 await db.batch(statements.map(sql=>db.prepare(sql)));
 let cookie='',csrf='';
 async function call(route,data){
  const response=await runtime.dispatchFetch('https://grammar.test/api/'+route,{method:data?'POST':'GET',headers:{Origin:'https://grammar.test','Content-Type':'application/json',Cookie:cookie,'X-CSRF-Token':csrf},body:data?JSON.stringify(data):undefined});
  const json=await response.json();assert.equal(response.status,200,JSON.stringify(json));
  if(response.headers.get('Set-Cookie'))cookie=response.headers.get('Set-Cookie').split(';')[0];
  if(json.csrf)csrf=json.csrf;return json;
 }
 await call('auth/setup',{code:'fictional-owner-code',name:'Тестовый учитель',email:'teacher@example.test',password:'FictionalPassword!2026'});
 const invite=await call('teacher/invite',{});cookie='';csrf='';
 await call('auth/join',{token:invite.token,name:'Тестовый ученик',email:'anna@example.test',password:'FictionalPassword!2026'});
 server=http.createServer(async(req,res)=>{
  try {
   const chunks=[];for await(const chunk of req)chunks.push(chunk);
   const headers=new Headers(req.headers);
   const origin=headers.get('Origin');
   if(origin===base)headers.set('Origin','https://grammar.test');
   const response=await runtime.dispatchFetch('https://grammar.test'+req.url,{method:req.method,headers,body:['GET','HEAD'].includes(req.method)?undefined:Buffer.concat(chunks)});
   res.statusCode=response.status;
   for(const [key,value] of response.headers)res.setHeader(key,key==='set-cookie'?value.replace(/; Secure/g,''):value);
   res.end(Buffer.from(await response.arrayBuffer()));
  }catch(error){console.error(error);res.statusCode=500;res.end();}
 });
 const smoke=process.argv.includes('--smoke');
 await new Promise(resolve=>server.listen(smoke?0:Number(process.env.GRAMMAR_PORT||4175),'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port;
 if(smoke){
  assert.equal((await fetch(base+'/')).status,200);
  assert.equal((await fetch(base+'/data/exercises/index.json')).status,200);
  assert.equal((await fetch(base+'/data/exercises/part-01.json')).status,401);
  assert.deepEqual(await (await fetch(base+'/api/auth/me')).json(),{user:null});
  console.log('Local Worker smoke: schema, fictional sign-up, public manifest, private bank, guest auth passed.');
  await close();
 }else{
  console.log(`Grammar NOEON: ${base}/#profile`);
  console.log('teacher@example.test / anna@example.test — FictionalPassword!2026');
  console.log('Temporary isolated D1. Restart resets data. Mail is simulated.');
  for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>close().then(()=>process.exit(0)));
 }
}catch(error){await close();throw error;}
