import {sqlStatements} from '../scripts/sql-statements.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { grade } from '../cloudflare/generated/checker.mjs';
import { assignmentSentenceKeys } from '../cloudflare/generated/assignment-keys.mjs';
import {exerciseSection,exerciseTenses} from '../cloudflare/generated/selection.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const require=createRequire(path.join(process.env.GRAMMAR_TOOLING_DIR||root,'package.json'));

const {Miniflare,convertV4MiniflareOptions}=await import(pathToFileURL(require.resolve('miniflare')));
const fixtures=JSON.parse(fs.readFileSync(path.join(root,'cloudflare/generated/bank.json'),'utf8'));
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'grammar-worker-test-'));
const bundled=path.join(temporary,'worker.mjs');
await require('esbuild').build({entryPoints:[path.join(root,'cloudflare/worker.mjs')],outfile:bundled,bundle:true,format:'esm',platform:'neutral',external:['node:crypto']});
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
  try {return new Response(fs.readFileSync(target),{headers:{'Content-Type':target.endsWith('.js')?'text/javascript':target.endsWith('.html')?'text/html':target.endsWith('.css')?'text/css':target.endsWith('.json')?'application/json':'text/plain','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; object-src 'none'"}});}catch{return new Response('',{status:404});}
}
const options={name:"grammar-test",modules:true,script:fs.readFileSync(bundled,"utf8"),compatibilityDate:'2026-10-26',
  bindings:{PUBLIC_ORIGIN:'https://grammar.test',OWNER_SETUP_CODE:'fictional-owner-code',FIREBASE_API_KEY:'fictional-public-api-key'},
  serviceBindings:{ASSETS:assets},d1Databases:{DB:'grammar-isolated-tests'},d1Persist:false,outboundService:fakeFirebase};
const runtime=new Miniflare(convertV4MiniflareOptions?convertV4MiniflareOptions(options):options);
class Client{
  cookie='';csrf='';
  async call(route,data,settings={}){
    const response=await runtime.dispatchFetch('https://grammar.test/api/'+route,{
      method:data===undefined?'GET':'POST',headers:{'Content-Type':'application/json','Origin':settings.origin||'https://grammar.test',Cookie:this.cookie,
        'CF-Connecting-IP':settings.ip||'192.0.2.1','X-CSRF-Token':settings.badCsrf?'bad':this.csrf},body:data===undefined?undefined:JSON.stringify(data)});
    const json=await response.json();
    if(response.headers.get('Set-Cookie'))this.cookie=response.headers.get('Set-Cookie').split(';')[0];
    if(json.csrf)this.csrf=json.csrf;
    return {status:response.status,data:json,headers:response.headers};
  }
  async ok(route,data,settings){const result=await this.call(route,data,settings);assert.equal(result.status,200,JSON.stringify(result));return result.data;}
}

const bankItems=fixtures;
const run=async()=>{
  const db=await runtime.getD1Database('DB');
  const migration=fs.readFileSync(path.join(root,'cloudflare/migrations/0007_student_self_practice.sql'),'utf8');
  const sql=fs.readFileSync(path.join(root,'cloudflare/schema.sql'),'utf8').replace(/^--.*$/gm,'');
  await db.batch(sqlStatements(sql).map(s=>db.prepare(s)));
  const teacher=new Client(),a=new Client(),b=new Client();
  await teacher.ok('auth/setup',{code:'fictional-owner-code',name:'T',email:'teacher@example.test',password:'FictionalPassword!2026'});
  for(const [c,n] of [[a,'anna'],[b,'misha']]){const inv=await teacher.ok('teacher/invite',{});await c.ok('auth/join',{token:inv.token,name:n,email:n+'@example.test',password:'FictionalPassword!2026'});}
  const aid=(await a.ok('auth/me')).user.id,bid=(await b.ok('auth/me')).user.id;
  for(const id of [aid,bid])await teacher.ok(`teacher/students/${id}/free-practice`,{allowed:true});
  const filters={topic:'tenses',tenses:['present_simple','past_simple'],levels:['basic'],type:'all',count:10};
  const keysOf=items=>new Set(items.flatMap(i=>assignmentSentenceKeys(i)));
  // 1) free practice first -> assignments must avoid those sentences
  const started=await a.ok('practice/start',filters);
  const attempt=await a.ok('practice/'+started.id);
  const freeItems=(attempt.attempt||attempt).items||[];
  assert(freeItems.length>0,'free practice has items');
  const freeKeys=keysOf(freeItems);
  const pool=await teacher.ok(`teacher/students/${aid}/assignment-pool`);
  const byId=new Map(bankItems.map(i=>[i.id,i]));
  assert(pool.availableIds.every(id=>assignmentSentenceKeys(byId.get(id)).every(k=>!freeKeys.has(k))),'assignment pool excludes free-practice sentences');
  const clash=freeItems[0].id;
  const refused=await teacher.call(`teacher/students/${aid}/assignments`,{title:'x',ids:[clash]});
  assert.equal(refused.status,409,'cannot assign a sentence done in free practice');
  // 2) other student: assign first -> free practice must avoid those sentences
  const ok=pool.availableIds.filter(id=>byId.get(id).level==='basic'&&['present_simple','past_simple'].some(t=>exerciseTenses(byId.get(id)).includes(t))).slice(0,15);
  await teacher.ok(`teacher/students/${bid}/assignments`,{title:'hw',ids:ok});
  const assignedKeys=keysOf(ok.map(id=>byId.get(id)));
  for(let n=0;n<5;n++){
    const s=await b.ok('practice/start',filters);const at=await b.ok('practice/'+s.id);const items=(at.attempt||at).items||[];
    assert(items.every(i=>assignmentSentenceKeys(i).every(k=>!assignedKeys.has(k))),'free practice avoids assigned sentences');
  }
  console.log('PASS free practice and assignments never overlap');
  const own=await b.ok('practice/start',filters),extra=await b.ok('practice/start',filters);
  assert.equal((await b.ok('practice/cleanup',{})).removed>=2,true);
  assert.equal((await b.ok('practice/'+own.id+'/delete',{}).catch(e=>({gone:true}))).gone,true,'cleaned practice is gone');
  const keep=await b.ok('practice/start',filters);assert.equal((await b.ok('practice/'+keep.id+'/delete',{})).removed,1);
  console.log('PASS own unfinished practices can be removed');
};
try{await run();}finally{await runtime.dispose();}
