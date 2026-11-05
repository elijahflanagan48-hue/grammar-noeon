import {sqlStatements} from '../scripts/sql-statements.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { grade } from '../cloudflare/generated/checker.mjs';

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


let checks=0;
const equal=(a,b,message)=>{assert.deepEqual(a,b,message);checks++;};
try {
  const db=await runtime.getD1Database('DB');
  await db.batch(sqlStatements(fs.readFileSync(path.join(root,'cloudflare/schema.sql'),'utf8')).map(sql=>db.prepare(sql)));
  const teacher=new Client(),student=new Client(),guest=new Client();
  await teacher.ok('auth/setup',{code:'fictional-owner-code',name:'Teacher',email:'teacher@example.test',password:'FictionalPassword!2026'});
  const invite=await teacher.ok('teacher/invite',{});await student.ok('auth/join',{token:invite.token,name:'Anna',email:'anna@example.test',password:'FictionalPassword!2026'});
  const tid=(await teacher.ok('auth/me')).user.id,sid=(await student.ok('auth/me')).user.id;
  const item=fixtures.find(i=>i.type==='open_brackets'&&i.blanks?.length===1&&i.grading_mode!=='teacher');
  const draft=await teacher.ok('practice/start',{ids:[item.id]}),done=await teacher.ok('practice/start',{ids:[item.id]});
  await teacher.ok('practice/'+done.id+'/check',{index:0,revision:0,submitted:[item.blanks[0].answer]});
  equal((await teacher.ok('statistics')).kinds.practice.checked,1,'Completed work contributes a checked field');
  equal((await guest.call('practice/'+draft.id+'/delete',{})).status,401,'Guest denied');
  equal((await teacher.call('practice/'+draft.id+'/delete',{}, {badCsrf:true})).status,403,'CSRF required');
  equal((await student.call('practice/'+draft.id+'/delete',{})).status,403,'Learner cannot delete teacher practice');
  const assigned=await teacher.ok('teacher/students/'+sid+'/assignments',{title:'Keep this assignment',ids:[item.id]});
  equal((await teacher.call('practice/'+assigned.practiceId+'/delete',{})).status,404,'Teacher cannot delete pupil work');
  equal((await student.call('practice/'+assigned.practiceId+'/delete',{})).status,403,'Pupil assignment protected');
  const issue=await teacher.ok('task-issues',{practiceId:done.id,index:0,comment:'Own test comment',requestId:'delete-test-issue-001'});
  const snapshot=await db.prepare('SELECT items FROM practice WHERE id=?').bind(done.id).first();
  await db.prepare('INSERT INTO practice_format_events VALUES(?,?,?,?,?,?,1)').bind('delete-format-event',done.id,snapshot.items,null,0,1).run();
  await teacher.ok('practice/'+done.id+'/delete',{});
  equal((await teacher.call('practice/'+done.id)).status,404,'Completed snapshot inaccessible');
  equal((await teacher.ok('statistics')).kinds.practice.checked,0,'Aggregate excludes deleted work');
  equal((await db.prepare('SELECT COUNT(*) AS n FROM task_issues WHERE id=?').bind(issue.id).first()).n,0,'Dependent own issue removed');
  equal((await db.prepare('SELECT COUNT(*) AS n FROM practice_format_events WHERE practice_id=?').bind(done.id).first()).n,0,'Format events cleaned with work');
  const deletes=await Promise.all([teacher.call('practice/'+draft.id+'/delete',{}),teacher.call('practice/'+draft.id+'/delete',{})]);
  assert(deletes.every(r=>[200,404].includes(r.status)));checks++;
  equal((await teacher.ok('account')).history.length,0,'Teacher history cleared');
  equal((await student.ok('account')).assignments.length,1,'Pupil assignment preserved');
  const test=await teacher.ok('tests/tenses-1/start',{});await teacher.ok('test-attempts/'+test.id+'/submit',{revision:0,responses:(await teacher.ok('tests/tenses-1')).items.map(i=>i.options?null:['']),allowIncomplete:true});
  equal((await teacher.ok('statistics')).kinds.assessment.sessions,1,'Own fixed test counted');
  await teacher.ok('practice/'+test.id+'/delete',{});
  equal((await teacher.ok('statistics')).kinds.assessment.sessions,0,'Own fixed test removable too');
  equal((await teacher.call('test-attempts/'+test.id)).status,404,'Deleted fixed test no longer opens');
  await db.prepare('DROP INDEX one_teacher').run();
  await db.prepare("INSERT INTO users(id,email,name,role,active,created) VALUES('another-teacher','other@example.test','Other','teacher',1,0)").run();
  await db.prepare("INSERT INTO practice(id,user_id,items,created) VALUES('other-practice','another-teacher','[]',0)").run();
  equal((await teacher.call('practice/other-practice/delete',{})).status,404,'Other teacher work protected');
  equal((await db.prepare('PRAGMA foreign_key_check').all()).results.length,0,'No orphan foreign keys');
  console.log(JSON.stringify({checks,feature:'Own teacher work deletion, role/owner/CSRF, dependencies, history/statistics, fixed tests and concurrency',productionWrites:false}));
} finally {await runtime.dispose();fs.rmSync(temporary,{recursive:true,force:true});}
