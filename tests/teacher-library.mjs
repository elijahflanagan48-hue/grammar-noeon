import {sqlStatements} from '../scripts/sql-statements.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
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
  if(!await db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='teacher_sets'").first())await db.batch(sqlStatements(fs.readFileSync(path.join(root,'cloudflare/migrations/0010_teacher_library.sql'),'utf8')).map(sql=>db.prepare(sql)));
  const teacher=new Client(),student=new Client(),other=new Client(),guest=new Client();
  await teacher.ok('auth/setup',{code:'fictional-owner-code',name:'Teacher',email:'teacher@example.test',password:'FictionalPassword!2026'});
  for(const [client,name] of [[student,'anna'],[other,'misha']]){const invite=await teacher.ok('teacher/invite',{});await client.ok('auth/join',{token:invite.token,name,email:name+'@example.test',password:'FictionalPassword!2026'});}
  const sid=(await student.ok('auth/me')).user.id,oid=(await other.ok('auth/me')).user.id,tid=(await teacher.ok('auth/me')).user.id;
  const item=fixtures.find(item=>item.type==='open_brackets'),second=fixtures.find(i=>i.type==='open_brackets'&&i.id!==item.id&&i.prompt!==item.prompt);
  const filters={topic:'tenses',tenses:['present_simple'],levels:['basic'],types:['open_brackets'],count:5};
  const selection={title:'A reusable set',ids:[item.id],itemVersions:[item.content_version],filters};
  equal((await guest.call('teacher/library')).status,401,'Guest library denied');
  equal((await student.call('teacher/library')).status,403,'Student library denied');
  equal((await teacher.call('teacher/library',selection,{badCsrf:true})).status,403,'CSRF enforced');
  equal((await teacher.call('teacher/library',{...selection,itemVersions:['forged']})).status,409,'Untrusted version denied');
  const set=await teacher.ok('teacher/library',selection);
  equal((await teacher.ok('teacher/library')).sets.length,1,'Library lists owned sets');
  equal((await teacher.ok('teacher/library/'+set.id)).items[0].id,item.id,'Stored trusted snapshot');
  equal((await student.call('teacher/library/'+set.id)).status,403,'Student cannot get keys');
  equal((await teacher.call('teacher/library/missing')).status,404,'Unknown set denied');
  const endpoint='teacher/library/'+set.id+'/assign',payload={studentIds:[sid,oid],allowRepeat:false,requestId:'first-delivery-request-123'};
  const sent=await teacher.ok(endpoint,payload);equal(sent.deliveries.length,2,'Bulk delivery creates2');
  equal(new Set(sent.deliveries.map(d=>d.practiceId)).size,2,'Independent practice IDs');
  for(const delivery of sent.deliveries){const owner=delivery.studentId===sid?student:other;const view=await owner.ok('practice/'+delivery.practiceId);equal(view.items.length,1,'Learner assigned snapshot');equal(/"(?:answer|accepted_answers|correct_option_index)"\s*:/.test(JSON.stringify(view.items)),false,'No learner keys');}
  equal((await teacher.ok(endpoint,payload)).replayed,true,'Same request idempotent');
  equal((await teacher.call(endpoint,{...payload,studentIds:[sid]})).status,409,'Request token cannot change meaning');
  equal((await db.prepare('SELECT COUNT(*) AS n FROM assignments').first()).n,2,'Replay no duplicates');
  equal((await teacher.call('teacher/students/'+sid+'/assignments',{title:'No duplicate',ids:[item.id]})).status,409,'Library reservations protect ordinary assignment');
  equal((await teacher.call(endpoint,{...payload,requestId:'another-delivery-request-456'})).status,409,'Library repeated sentences require explicit permission');
  const repeated=await teacher.ok(endpoint,{...payload,allowRepeat:true,requestId:'repeat-delivery-request-789'});
  equal(repeated.deliveries.every(d=>!sent.deliveries.some(old=>old.practiceId===d.practiceId)),true,'Explicit repeat has separate results');
  await teacher.ok('teacher/students/'+sid+'/assignments',{title:'Ordinary first',ids:[second.id]});
  const secondSet=await teacher.ok('teacher/library',{...selection,ids:[second.id],itemVersions:[second.content_version]});
  equal((await teacher.call('teacher/library/'+secondSet.id+'/assign',{...payload,studentIds:[sid],requestId:'ordinary-prevents-library-123'})).status,409,'Ordinary reservation protects library');
  await db.prepare('UPDATE users SET active=0 WHERE id=?').bind(oid).run();
  const before=(await db.prepare('SELECT COUNT(*) AS n FROM practice').first()).n;
  equal((await teacher.call(endpoint,{...payload,allowRepeat:true,requestId:'disabled-recipient-12345'})).status,409,'Inactive recipient rejects entire bulk');
  equal((await db.prepare('SELECT COUNT(*) AS n FROM practice').first()).n,before,'No partial bulk assignment');
  await db.prepare('UPDATE users SET active=1 WHERE id=?').bind(oid).run();
  const racers=await Promise.all([teacher.call(endpoint,{...payload,allowRepeat:true,requestId:'race-delivery-request-000'}),teacher.call(endpoint,{...payload,allowRepeat:true,requestId:'race-delivery-request-000'})]);
  equal(racers.map(r=>r.status),[200,200],'Concurrent identical request is safe');
  equal(racers[0].data.deliveries,racers[1].data.deliveries,'Concurrent replay same IDs');
  await db.prepare('UPDATE teacher_sets SET teacher_id=? WHERE id=?').bind(sid,set.id).run();
  equal((await teacher.call(endpoint,payload)).status,404,'Other owner template hidden');
  await db.prepare('UPDATE teacher_sets SET teacher_id=? WHERE id=?').bind(tid,set.id).run();
  const draftPath='teacher/library-drafts/'+sid;
  equal((await teacher.ok(draftPath)).draft,null,'No draft initially');
  equal((await student.call(draftPath)).status,403,'Draft snapshots teacher only');
  let saved=await teacher.ok(draftPath,{...selection,revision:0});equal(saved.revision,1,'Draft saved');
  equal((await teacher.ok(draftPath)).draft.items[0],item,'Draft server snapshot matches bank');
  equal((await teacher.call(draftPath,{...selection,revision:0,title:'Stale tab'})).status,409,'Stale draft cannot overwrite');
  const changes=await Promise.all([teacher.call(draftPath,{...selection,revision:1,title:'Tab A'}),teacher.call(draftPath,{...selection,revision:1,title:'Tab B'})]);
  equal(changes.map(r=>r.status).sort(),[200,409],'One concurrent draft writer');
  equal((await teacher.ok(draftPath)).draft.revision,2,'Single draft revision increment');
  const old={...item,content_version:'archived-before-editorial',prompt:'Archived exact prompt'};
  await db.prepare('UPDATE teacher_set_drafts SET items=? WHERE teacher_id=? AND student_id=?').bind(JSON.stringify([old]),tid,sid).run();
  saved=await teacher.ok(draftPath,{...selection,revision:2,itemVersions:[old.content_version]});
  equal((await teacher.ok(draftPath)).draft.items[0].prompt,old.prompt,'Old draft snapshot preserved exactly');
  const archivedSet=await teacher.ok('teacher/library',{...selection,itemVersions:[old.content_version],draftStudentId:sid});
  equal((await teacher.ok('teacher/library/'+archivedSet.id)).items[0].prompt,old.prompt,'Saving old draft template preserves snapshot');
  equal((await teacher.call(draftPath,{discard:true,revision:2})).status,409,'Stale discard denied');
  await teacher.ok(draftPath,{discard:true,revision:3});equal((await teacher.ok(draftPath)).draft,null,'Explicit discard clears owned draft');
  await db.prepare('UPDATE users SET teacher_id=? WHERE id=?').bind(sid,oid).run();
  equal((await teacher.call('teacher/library-drafts/'+oid)).status,404,'Other teacher pupil draft hidden');
  for(const serverOK of [false,true]){
    const status={textContent:'',setAttribute(){}},form={dataset:{assignmentStudent:'pupil'},elements:{title:{value:'Saved title'}},parentElement:{querySelector(){return status;}}};
    const context={account:{user:{id:'teacher',role:'teacher'},csrf:'fixture'},practiceFilterPayload:()=>filters,localStorage:{setItem(){throw Error('Storage disabled');},removeItem(){throw Error('Storage disabled');}},fetch:async()=>({ok:serverOK,status:503,json:async()=>serverOK?{revision:1}:{error:'Offline save failed.'}}),Promise,JSON,Date,encodeURIComponent};
    vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(root,'teacher-library.js'),'utf8'),context);context.form=form;context.items=[item];
    vm.runInContext('rememberTeacherDraft(form,items)',context);await form.libraryDraftState.pending;
    if(serverOK)equal(status.textContent,'Черновик сохранён','Blocked device storage does not mask acknowledged server save');
    else equal(status.textContent.includes('Резервная копия на устройстве недоступна'),true,'Failed storage and server never claim a local saved copy');
  }
  console.log(JSON.stringify({checks,result:'passed',scope:'Snapshots, two-way sentence reservations, bulk atomicity, replay/races, permissions, draft revisions and exact historical restore'}));
} finally {await runtime.dispose();fs.rmSync(temporary,{recursive:true,force:true});}
