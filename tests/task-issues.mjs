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
  const teacher=new Client(),student=new Client(),other=new Client(),guest=new Client();
  await teacher.ok('auth/setup',{code:'fictional-owner-code',name:'Teacher',email:'teacher@example.test',password:'FictionalPassword!2026'});
  for(const [client,name] of [[student,'anna'],[other,'misha']]) {
    const invite=await teacher.ok('teacher/invite',{});await client.ok('auth/join',{token:invite.token,name,email:name+'@example.test',password:'FictionalPassword!2026'});
  }
  const tid=(await teacher.ok('auth/me')).user.id,sid=(await student.ok('auth/me')).user.id,oid=(await other.ok('auth/me')).user.id;
  equal((await guest.call('teacher/task-issues')).status,401,'Guest cannot read issues');
  equal((await student.call('teacher/task-issues')).status,403,'Student cannot read teacher inbox');
  equal((await teacher.ok('teacher/task-issues')).totalOpen,0,'New inbox empty');
  const item=fixtures.find(i=>i.type==='open_brackets'&&i.blanks?.length===1);
  const work=await teacher.ok('teacher/students/'+sid+'/assignments',{title:'Issue source',ids:[item.id]});
  const payload={practiceId:work.practiceId,index:0,comment:'Condition <script> remains plain text.',requestId:'test-request-issues-0001',itemId:'forged-id',version:'forged-version'};
  equal((await guest.call('task-issues',payload)).status,401,'Guest cannot submit');
  equal((await student.call('task-issues',payload,{badCsrf:true})).status,403,'CSRF checked before reporting');
  equal((await other.call('task-issues',payload)).status,404,'Another student cannot report inaccessible work');
  for(const index of [-1,1.5,'0'])equal((await student.call('task-issues',{...payload,index})).status,400,'Index must be a nonnegative integer');
  equal((await student.call('task-issues',{...payload,index:5})).status,404,'Missing question rejected');
  equal((await student.call('task-issues',{...payload,comment:'   '})).status,400,'Blank comment rejected');
  equal((await student.call('task-issues',{...payload,comment:'x'.repeat(2001)})).status,400,'Comment length bounded');
  const [a,b]=await Promise.all([student.ok('task-issues',payload),student.ok('task-issues',payload)]);
  equal(a.id,b.id,'Concurrent repeat request is idempotent');
  equal((await student.call('task-issues',{...payload,comment:'A different message'})).status,409,'Same request id cannot silently replace a different payload');
  equal(Object.keys(a).sort(),['id','status'],'Submitting learner receives no keys or snapshot');
  let queue=await teacher.ok('teacher/task-issues');equal(queue.totalOpen,1,'Exactly one report');
  const issue=queue.items[0];equal([issue.itemId,issue.version,issue.prompt],[item.id,item.content_version,item.prompt],'Source id/version/prompt resolved from trusted snapshot, not learner claims');
  equal(issue.comment,payload.comment,'Original comment preserved as data');
  assert(!/"(?:answer|accepted_answers|correct_option_index|snapshot)"\s*:/.test(JSON.stringify(queue)));checks++;
  // Historical issue context remains unchanged even if the practice is later edited.
  await db.prepare('UPDATE practice SET items=? WHERE id=?').bind(JSON.stringify([{...item,prompt:'A later condition',content_version:'later-version'}]),work.practiceId).run();
  queue=await teacher.ok('teacher/task-issues');equal([queue.items[0].prompt,queue.items[0].version],[item.prompt,item.content_version],'Report stores immutable original condition/version');
  equal((await student.call('teacher/task-issues/'+a.id+'/resolve',{})).status,403,'Learner cannot resolve');
  equal((await teacher.call('teacher/task-issues/missing/resolve',{})).status,404,'Unknown issue rejected');
  await teacher.ok('teacher/task-issues/'+a.id+'/resolve',{});await teacher.ok('teacher/task-issues/'+a.id+'/resolve',{});
  queue=await teacher.ok('teacher/task-issues');equal([queue.totalOpen,queue.items.length,queue.recent.length],[0,0,1],'Resolve removes queue entry and retains recent immutable context');
  const test=await teacher.ok('tests/tenses-1/assign',{studentId:sid});
  const sent=await student.ok('task-issues',{practiceId:test.id,index:1,comment:'Question in a fixed test.',requestId:'test-request-issues-0002'});
  queue=await teacher.ok('teacher/task-issues');equal(queue.items[0].id,sent.id,'Fixed-test snapshots can be reported before grading');
  assert(queue.items[0].version.startsWith('assessment-tenses-'));checks++;
  // Explicit cross-teacher fixture, independent of the single-teacher sign-up restriction.
  await db.prepare('DROP INDEX one_teacher').run();
  await db.prepare("INSERT INTO users(id,email,name,role,active,created) VALUES('other-teacher','other-teacher@example.test','Other Teacher','teacher',1,0)").run();
  await db.prepare("UPDATE task_issues SET teacher_id='other-teacher' WHERE id=?").bind(sent.id).run();
  equal((await teacher.ok('teacher/task-issues')).totalOpen,0,'Teacher inbox scoped to ownership');
  equal((await teacher.call('teacher/task-issues/'+sent.id+'/resolve',{})).status,404,'Another teacher issue cannot be resolved');
  equal((await db.prepare('SELECT COUNT(*) AS n FROM task_issues').first()).n,2,'No unauthorized report side effects');
  console.log(JSON.stringify({checks,feature:'Immutable task issue snapshots, teacher inbox, permissions, CSRF, duplicate requests and fixed assessments',productionWrites:false}));
} finally {await runtime.dispose();fs.rmSync(temporary,{recursive:true,force:true});}
