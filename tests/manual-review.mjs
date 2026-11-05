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
  for(const [client,name] of [[student,'anna'],[other,'misha']]){
    const invite=await teacher.ok('teacher/invite',{});await client.ok('auth/join',{token:invite.token,name,email:name+'@example.test',password:'FictionalPassword!2026'});
  }
  const tid=(await teacher.ok('auth/me')).user.id,sid=(await student.ok('auth/me')).user.id,oid=(await other.ok('auth/me')).user.id;
  equal((await guest.call('teacher/reviews')).status,401,'Guest cannot read queue');
  equal((await student.call('teacher/reviews')).status,403,'Student cannot read queue');
  equal((await teacher.ok('teacher/reviews')).total,0,'Empty queue');
  const manual=fixtures.find(i=>i.grading_mode==='teacher');assert(manual);
  const work=await teacher.ok('teacher/students/'+sid+'/assignments',{title:'A manual translation',ids:[manual.id]});
  const view=await student.ok('practice/'+work.practiceId);
  const result=await student.ok('practice/'+work.practiceId+'/check',{revision:view.revision,index:0,submitted:['A student translation.']});
  equal([result.answer.correct,result.answer.fields[0].verified],[false,false],'Translation stays pending');
  equal((await student.ok('reports/'+work.practiceId)).attempt.maxScore,0,'Pending does not lower accuracy');
  assert(!result.answer.item.answer_text,'No model before teacher decision');
  const queue=await teacher.ok('teacher/reviews');equal([queue.total,queue.totalFields],[1,1],'Completed work is queued');
  assert(queue.items[0].studentId===sid&&queue.items[0].practiceId===work.practiceId);assert(!('answers'in queue.items[0]));
  equal((await teacher.ok('today')).reviews.totalFields,1,'Today exposes real queue count');
  const endpoint='teacher/students/'+sid+'/reports/'+work.practiceId+'/review';
  const payload={revision:result.revision,answerIndex:0,fieldIndex:0,correct:true,note:'Good translation <keep this>.'};
  equal((await student.call(endpoint,payload)).status,403,'Student cannot grade');
  equal((await teacher.call(endpoint,payload,{badCsrf:true})).status,403,'CSRF enforced');
  equal((await teacher.call('teacher/students/'+oid+'/reports/'+work.practiceId+'/review',payload)).status,404,'Work/student pair scoped');
  for(const fieldIndex of [-1,1,0.5,'0'])equal((await teacher.call(endpoint,{...payload,fieldIndex})).status,400,'Invalid field index');
  const accepted=await teacher.ok(endpoint,payload);
  equal((await teacher.ok('teacher/reviews')).total,0,'Reviewed work removed');
  let report=(await student.ok('reports/'+work.practiceId)).attempt;
  equal([report.score,report.maxScore,report.pending],[1,1,0],'Accept updates real scores');
  equal(report.answers[0].fields[0].manual_review.note,payload.note,'Teacher note delivered');
  assert(report.answers[0].item.answer_text);assert(!report.answers[0].manual_review_history);
  let notices=(await student.ok('notifications')).items.filter(n=>n.kind==='reviewed');equal(notices.length,1,'Exactly one result notice');
  const firstNotice=notices[0];equal([firstNotice.practiceId,firstNotice.answerIndex,firstNotice.fieldIndex,firstNotice.correct,firstNotice.read],[work.practiceId,0,0,true,false],'Exact answer/decision target');
  equal(await teacher.ok(endpoint,{...payload,revision:accepted.revision}),{ok:true,revision:accepted.revision,unchanged:true},'Unchanged decision is a no-op');
  equal((await student.ok('notifications')).items.find(n=>n.kind==='reviewed').id,firstNotice.id,'Unchanged decision does not send another notice');
  equal((await other.ok('notifications')).items.filter(n=>n.kind==='reviewed').length,0,'Other student gets no notice');
  equal((await teacher.call(endpoint,payload)).status,409,'Stale retry cannot duplicate grade');
  equal((await student.ok('notifications')).items.filter(n=>n.kind==='reviewed').length,1,'Retry cannot duplicate notice');
  equal((await other.call('notifications/read',{id:firstNotice.id})).status,404,'Cannot mark another student notice');
  await student.ok('notifications/read',{id:firstNotice.id});equal((await student.ok('notifications')).items.find(n=>n.id===firstNotice.id).read,true,'Read persists');
  const races=await Promise.all([teacher.call(endpoint,{...payload,revision:accepted.revision,correct:false,note:'Please correct the tense.'}),teacher.call(endpoint,{...payload,revision:accepted.revision,correct:false,note:'Competing review.'})]);
  equal(races.map(r=>r.status).sort(),[200,409],'Only one concurrent reviewer succeeds');
  report=(await student.ok('reports/'+work.practiceId)).attempt;equal([report.score,report.maxScore,report.pending],[0,1,0],'Reject updates score');
  notices=(await student.ok('notifications')).items.filter(n=>n.kind==='reviewed');equal(notices.length,1,'Only latest decision is actionable');
  assert(notices[0].id!==firstNotice.id&&notices[0].updated&&!notices[0].read&&!notices[0].correct);
  equal((await teacher.ok('teacher/students/'+sid+'/reports/'+work.practiceId)).attempt.answers[0].manual_review_history.length,2,'Audit retains decisions');

  // Historical unknown translations can have several independent answer fields.
  const legacy={id:'legacy-translation',type:'translation_ru_en',prompt:'Переведите две фразы.',answer_text:'First model. Second model.',blanks:[{answer:'First model.'},{answer:'Second model.'}],tags:['past_simple'],content_version:'old-snapshot'};
  const legacyAnswer={id:legacy.id,item:legacy,correct:false,submitted:['First alternative.','Second alternative.'],fields:[{submitted:'First alternative.',correct:false,verified:false},{submitted:'Second alternative.',correct:false,verified:false}],checker:3};
  const timestamp=Date.now()/1000;
  async function seed(id,owner=sid,completed=timestamp,pending=2,answer=legacyAnswer){
    await db.prepare('INSERT INTO practice(id,user_id,items,answers,created,completed,pending_count,source) VALUES(?,?,?,?,?,?,?,?)').bind(id,owner,JSON.stringify([answer.item]),JSON.stringify([answer]),timestamp-10,completed,pending,'self').run();
  }
  await seed('legacy-manual');
  equal((await teacher.ok('teacher/reviews')).totalFields,2,'Legacy fields are queued');
  const pendingReport=(await student.ok('reports/legacy-manual')).attempt;
  assert(!pendingReport.answers[0].item.answer_text&&!pendingReport.answers[0].item.blanks[0].answer,'Legacy model protected');
  const legacyEndpoint='teacher/students/'+sid+'/reports/legacy-manual/review';
  const half=await teacher.ok(legacyEndpoint,{revision:0,answerIndex:0,fieldIndex:1,correct:true,note:'Second accepted.'});
  equal((await teacher.ok('teacher/reviews')).totalFields,1,'Only reviewed field removed');
  report=(await student.ok('reports/legacy-manual')).attempt;
  equal([report.score,report.maxScore,report.pending],[1,1,1],'Partial manual score correct');assert(!report.answers[0].item.answer_text);
  await teacher.ok(legacyEndpoint,{revision:half.revision,answerIndex:0,fieldIndex:0,correct:false,note:''});
  report=(await student.ok('reports/legacy-manual')).attempt;equal([report.score,report.maxScore,report.pending],[1,2,0],'Per-field reject preserved other result');assert(report.answers[0].item.answer_text);
  equal(report.answers[0].item.content_version,'old-snapshot','Original version retained');
  equal(report.answers[0].fields[1].manual_review.note,'Second accepted.','Other field comment preserved');
  const stored=await db.prepare("SELECT items,answers FROM practice WHERE id='legacy-manual'").first();
  await student.ok('notifications');await student.ok('reports/legacy-manual');
  equal(await db.prepare("SELECT items,answers FROM practice WHERE id='legacy-manual'").first(),stored,'Reading reports/notices never rewrites snapshots');
  const closed=fixtures.find(i=>i.type==='open_brackets');await seed('closed-field',sid,timestamp,1,{item:closed,fields:[{submitted:'wrong',correct:false,verified:false}],correct:false});
  equal((await teacher.call('teacher/students/'+sid+'/reports/closed-field/review',{revision:0,answerIndex:0,correct:true})).status,400,'Cannot manually grade closed field');
  await seed('unfinished-manual',sid,null);equal((await teacher.call('teacher/students/'+sid+'/reports/unfinished-manual/review',{revision:0,answerIndex:0,correct:true})).status,404,'Only completed work reviewed');
  await seed('archived-manual',oid);await db.prepare('UPDATE users SET active=0 WHERE id=?').bind(oid).run();
  await db.prepare("INSERT INTO users(id,email,name,role,teacher_id,active,created) VALUES('foreign','foreign@example.test','Foreign','student',NULL,1,0)").run();await seed('foreign-manual','foreign');
  equal((await teacher.ok('teacher/reviews')).total,0,'Closed, unfinished, archived and foreign rows excluded');
  equal((await teacher.call('teacher/students/foreign/reports/foreign-manual/review',{revision:0,answerIndex:0,correct:true})).status,404,'Foreign grade forbidden');
  for(let i=0;i<23;i++)await seed('queue-page-'+String(i).padStart(2,'0'));
  const first=await teacher.ok('teacher/reviews');equal([first.total,first.totalFields,first.items.length],[23,46,20],'Queue bounded with full counts');assert(first.nextCursor);
  const second=await teacher.ok('teacher/reviews?cursor='+encodeURIComponent(first.nextCursor));
  equal([second.total,second.items.length,second.nextCursor],[23,3,null],'Stable next page');
  equal(new Set([...first.items,...second.items].map(i=>i.practiceId)).size,23,'No pagination duplicates');
  equal((await teacher.call('teacher/reviews?cursor=not-base64')).status,400,'Invalid cursor rejected');
  equal((await teacher.ok('today')).reviews.items.length,5,'Today preview remains bounded');
  console.log(`Manual review workflow: ${checks} assertions; queue, legacy multi-field decisions, trusted scores, privacy, concurrency, notices, audit, model protection and pagination passed.`);
} finally {await runtime.dispose();fs.rmSync(temporary,{recursive:true,force:true});}
