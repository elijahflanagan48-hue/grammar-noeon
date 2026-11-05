import vm from 'node:vm';
import {sqlStatements} from '../scripts/sql-statements.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { grade } from '../cloudflare/generated/checker.mjs';
import { assignmentSentenceKeys } from '../cloudflare/generated/assignment-keys.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const require=createRequire(path.join(process.env.GRAMMAR_TOOLING_DIR||root,'package.json'));
const {Miniflare,convertV4MiniflareOptions}=await import(pathToFileURL(require.resolve('miniflare')));
const fixtures=JSON.parse(fs.readFileSync(path.join(root,'cloudflare/generated/bank.json'),'utf8'));
let count=0;
for(const item of fixtures){
  if(item.grading_mode==='teacher'){const r=grade(item,item.blanks.map(b=>b.answer));assert(r.fields.every(f=>!f.verified&&!f.correct));continue;}
  if(item.options){for(let n=0;n<item.options.length;n++)assert.equal(grade(item,n).correct,(item.accepted_option_indices||[item.correct_option_index]).includes(n));}
  else if(item.blanks){
    const values=item.blanks.map(field=>field.answer);
    for(const [index,field] of item.blanks.entries())for(const answer of [field.answer,...(field.accepted_answers||[])]){
      const submitted=values.slice();submitted[index]=answer;assert.equal(grade(item,submitted).correct,true,item.id);count++;
    }
  }else for(const answer of [item.answer,...(item.accepted_answers||[])]){assert.equal(grade(item,answer).correct,true,item.id);count++;}
}
const known=fixtures.find(item=>item.id==='src-u02-020');
for(const value of ['had already translated','already translated'])assert.equal(grade(known,[value]).correct,true);
for(const value of ['had translate','has translated','had not translated'])assert.equal(grade(known,[value]).correct,false);
console.log('Worker grader:',fixtures.length,'items;',count,'accepted variants and negative regressions passed.');

const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'grammar-worker-test-'));
const bundled=path.join(temporary,'worker.mjs');
await require('esbuild').build({entryPoints:[path.join(root,'cloudflare/worker.mjs')],outfile:bundled,bundle:true,format:'esm',platform:'neutral',external:['node:crypto']});
let instrumented=fs.readFileSync(bundled,'utf8').replaceAll('JSON.parse(', 'checkedParse(');
instrumented='let rejectLargeParse=false;function checkedParse(value,...args){if(rejectLargeParse&&typeof value==="string"&&value.length>4000)throw Error("Large JSON parsed in a list");return JSON.parse(value,...args); }\n'+instrumented.replace('async fetch(request, env) {','async fetch(request, env) {rejectLargeParse=request.headers.get("X-Test-Light-List")==="1";');
fs.writeFileSync(bundled,instrumented);
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
        'X-Test-Light-List':settings.light?'1':'0','CF-Connecting-IP':settings.ip||'192.0.2.1','X-CSRF-Token':settings.badCsrf?'bad':this.csrf},body:data===undefined?undefined:JSON.stringify(data)});
    const json=await response.json();
    if(response.headers.get('Set-Cookie'))this.cookie=response.headers.get('Set-Cookie').split(';')[0];
    if(json.csrf)this.csrf=json.csrf;
    return {status:response.status,data:json,headers:response.headers};
  }
  async ok(route,data,settings){const result=await this.call(route,data,settings);assert.equal(result.status,200,JSON.stringify(result));return result.data;}
}

let checks=0;
function ok(value,label){assert(value,label);checks++;console.log('PASS',label);}
try {
 const db=await runtime.getD1Database('DB');
 const migration=fs.readFileSync(path.join(root,'cloudflare/migrations/0008_light_history_and_students.sql'),'utf8');
 const schema=fs.readFileSync(path.join(root,'cloudflare/schema.sql'),'utf8');
 await db.batch(sqlStatements(schema.replace(migration,'')).map(sql=>db.prepare(sql)));
 const chosen=fixtures.filter(i=>i.type==='open_brackets'&&i.blanks.length===1).slice(0,20);
 const answers=chosen.map((item,n)=>grade(item,[n%3?item.blanks[0].answer:'wrong']));
 // Include an old, unverified field; it must never appear in checked totals or mistakes.
 answers[1].fields[0].verified=false;answers[1].fields[0].correct=false;answers[1].correct=false;
 const score=answers.flatMap(a=>a.fields).filter(f=>f.correct).length,max=answers.flatMap(a=>a.fields).filter(f=>f.verified).length;
 await db.prepare("INSERT INTO users(id,email,name,role,active,created) VALUES('legacy','legacy@example.test','Legacy','student',1,1)").run();
 await db.prepare("INSERT INTO practice(id,user_id,items,answers,created,completed,score,max_score,pending_count) VALUES('legacy','legacy',?,?,1,2,?,?,1)").bind(JSON.stringify(chosen),JSON.stringify(answers),score,max).run();
 const original=await db.prepare("SELECT * FROM practice WHERE id='legacy'").first();
 await db.batch(sqlStatements(migration).map(sql=>db.prepare(sql)));
 const migrated=await db.prepare("SELECT * FROM practice WHERE id='legacy'").first();
 for(const key of Object.keys(original))assert.deepEqual(migrated[key],original[key],key);
 ok(migrated.topic_summary===null,'0008 is additive: original snapshots, drafts and scores preserved');
 const teacher=new Client(),student=new Client(),other=new Client(),anon=new Client();
 await teacher.ok('auth/setup',{code:'fictional-owner-code',name:'Учитель',email:'teacher@example.test',password:'FictionalPassword!2026'});
 for(const [client,name] of [[student,'anna'],[other,'misha']]){const invite=await teacher.ok('teacher/invite',{});await client.ok('auth/join',{token:invite.token,name,email:name+'@example.test',password:'FictionalPassword!2026'});}
 const tid=(await teacher.ok('auth/me')).user.id,sid=(await student.ok('auth/me')).user.id,oid=(await other.ok('auth/me')).user.id;
 const prefix='teacher/students/'+sid;
 await db.prepare('UPDATE users SET teacher_id=? WHERE id=?').bind(tid,'legacy').run();
 for(let n=0;n<25;n++){
  const id='history-'+String(n).padStart(2,'0');
  await db.prepare('INSERT INTO practice(id,user_id,items,answers,created,completed,score,max_score,pending_count) VALUES(?,?,?,?,?,?,?,?,1)').bind(id,sid,JSON.stringify(chosen),JSON.stringify(answers),100+n,200+n,score,max).run();
  await db.prepare('INSERT INTO assignments VALUES(?,?,?,?,?,?)').bind('a-'+n,tid,sid,id,'Тестовая тренировка '+n,100+n).run();
 }
 const ctx={module:{exports:{}},document:{querySelector(){return {}}},localStorage:{getItem(){return null}}};vm.createContext(ctx);
 for(const file of ['app.js','practice-report.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx);
 const oldSummary=ctx.reportSummary({answers});
 const expected=Object.fromEntries(oldSummary.topics.map(t=>[t.id,[t.correct,t.checked]]));
 const first=await student.ok('account');
 ok(Buffer.byteLength(JSON.stringify(first))<30000,'25 completed × 20 exercises: /account < 30 KB ('+Buffer.byteLength(JSON.stringify(first))+' bytes)');
 ok(first.history.length===25&&!first.history.some(a=>'answers' in a||'items' in a||'draft' in a),'History contains only lightweight summaries');
 for(const a of first.history){assert.deepEqual(a.topic_summary,expected);assert.equal(a.score,score);assert.equal(a.maxScore,max);assert.equal(a.pending,1);assert.equal(a.index,20);assert.equal(a.total,20);}
 ok(true,'Materialized topics, fields, pending and totals match pre-change reportSummary on the same D1 fixtures');
 const warm=await student.ok('account',undefined,{light:true});assert.deepEqual(warm,first);
 const teacherWarm=await teacher.ok(prefix,undefined,{light:true});assert.deepEqual(teacherWarm.history,first.history);
 ok(true,'Warm own/teacher lists reject parsing large JSON and still succeed');
 const persisted=await db.prepare("SELECT topic_summary,total_items,answered_count FROM practice WHERE id='history-00'").first();assert.deepEqual(JSON.parse(persisted.topic_summary),expected);assert.equal(persisted.answered_count,20);
 const report=await student.ok('reports/history-00');assert.deepEqual(report.attempt.answers,answers);
 const teacherReport=await teacher.ok(prefix+'/reports/history-00');assert.deepEqual(teacherReport.attempt.answers,answers);
 const legacy=await teacher.ok('teacher/students/legacy/attempts/legacy');assert.deepEqual(legacy.attempt.answers,answers);
 ok(true,'Full own/teacher reports and legacy details keep exact stored answers');
 for(const [topic,counts] of Object.entries(expected)){
  const errors=await student.ok('mistakes?topic='+topic),theirs=await teacher.ok(prefix+'/mistakes?topic='+topic);
  assert.equal(errors.errors.length,(counts[1]-counts[0])*25);assert.deepEqual(theirs.errors,errors.errors);
  assert(errors.errors.every(e=>!e.field.correct&&e.field.verified!==false));
 }
 ok(true,'Separate own/teacher mistake endpoints match old checked errors, excluding unverified fields');
 assert.equal((await other.call('teacher/students/'+sid+'/mistakes?topic=present_simple')).status,403);
 assert.equal((await teacher.call('mistakes?topic=unknown')).status,400);
 await db.prepare('UPDATE users SET teacher_id=NULL WHERE id=?').bind(oid).run();
 for(const action of ['rename','active','free-practice'])assert.equal((await teacher.call('teacher/students/'+oid+'/'+action,{name:'Foreign',active:false,allowed:true})).status,404);
 assert.equal((await teacher.call('teacher/students/'+oid+'/mistakes?topic=present_simple')).status,404);
 for(const [action,data] of [['rename',{name:'Новое имя'}],['active',{active:false}]]){
  assert.equal((await teacher.call(prefix+'/'+action,data,{badCsrf:true})).status,403);
  assert.equal((await student.call(prefix+'/'+action,data)).status,403);
 }
 await teacher.ok(prefix+'/rename',{name:'Имя для учителя <img>'});
 assert.equal((await teacher.ok(prefix)).user.name,'Имя для учителя <img>');assert.equal((await student.ok('auth/me')).user.name,'anna');
 ok(true,'Ownership/CSRF guards; teacher-only alias preserves learner name');
 const pending=await teacher.ok(prefix+'/assignments',{title:'Невыполнено',ids:[fixtures.at(-1).id]});
 let list=await teacher.ok('teacher/students');let row=list.students.find(s=>s.id===sid);
 assert.equal(row.unfinished,1);assert(row.lastActive);assert.equal(row.stats.sessions,25);assert.equal(row.stats.score,score*25);
 await teacher.ok(prefix+'/assignments/'+pending.id+'/cancel',{version:0});
 assert.equal((await teacher.ok('teacher/students')).students.find(s=>s.id===sid).unfinished,0);
 ok(true,'Single roster aggregate: activity, unfinished non-cancelled assignments and unmultiplied accuracy');
 await teacher.ok(prefix+'/active',{active:false});
 assert.equal((await student.call('auth/me')).data.user,null);
 assert.equal((await student.call('practice/'+pending.practiceId)).status,401);
 assert.equal((await anon.call('auth/login',{email:'anna@example.test',password:'FictionalPassword!2026'})).status,401);
 assert.equal((await teacher.call(prefix+'/assignments',{title:'No',ids:[fixtures[0].id]})).status,409);
 assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM sessions WHERE user_id=?').bind(sid).first()).n,0);
 assert.equal((await teacher.ok(prefix+'/reports/history-00')).attempt.score,score);
 ok((await teacher.ok('teacher/students')).students.find(s=>s.id===sid).active===false,'Disable deletes sessions, denies login/assignment, retains history and marks archived');
 await teacher.ok(prefix+'/active',{active:true});await student.ok('auth/login',{email:'anna@example.test',password:'FictionalPassword!2026'});
 ok(true,'Re-enable restores login without changing history');
 const invite=await teacher.ok('teacher/invite',{}),invites=await teacher.ok('teacher/invites');
 const live=invites.invites.find(i=>i.id===invite.id);assert(live.created&&live.expires>live.created);assert(!JSON.stringify(invites).includes(invite.token));
 assert.equal((await teacher.call('teacher/invites/'+invite.id+'/revoke',{}, {badCsrf:true})).status,403);
 await teacher.ok('teacher/invites/'+invite.id+'/revoke',{});
 assert.equal((await anon.call('auth/join',{token:invite.token,name:'No',email:'no@example.test',password:'FictionalPassword!2026'})).status,410);
 assert(!(await teacher.ok('teacher/invites')).invites.some(i=>i.id===invite.id));
 const foreign=await teacher.ok('teacher/invite',{});await db.prepare('UPDATE invites SET teacher_id=? WHERE token=?').bind(oid,foreign.id).run();assert.equal((await teacher.call('teacher/invites/'+foreign.id+'/revoke',{})).status,404);
 ok(true,'Invitation dates, hash-only IDs, ownership, CSRF and revoked-link rejection');
 const time=Date.now()/1000;
 for(const [id,expires] of [['expired',time-60],['current',time+86400]])await db.prepare('INSERT INTO sessions VALUES(?,?,?,?)').bind(id,tid,'csrf',expires).run();
 for(const [id,until] of [['expired',time-60],['current',time+86400]])await db.prepare('INSERT INTO limits VALUES(?,1,?)').bind(id,until).run();
 for(const [id,expiry] of [['old',time-31*86400],['recent',time-86400],['current',time+86400]])await db.prepare("INSERT INTO invites(token,teacher_id,email,name,expires,created) VALUES(?,?,'','',?,?)").bind(id,tid,expiry,time-40*86400).run();
 const module=await import(pathToFileURL(bundled));let scheduled;
 module.default.scheduled({}, {DB:{withSession(){return db;}}}, {waitUntil(p){scheduled=p;}});await scheduled;
 for(const table of ['sessions','limits']){const key=table==='sessions'?'token':'key';assert.equal(await db.prepare(`SELECT * FROM ${table} WHERE ${key}='expired'`).first(),null);assert(await db.prepare(`SELECT * FROM ${table} WHERE ${key}='current'`).first());}
 assert.equal(await db.prepare("SELECT * FROM invites WHERE token='old'").first(),null);
 for(const id of ['recent','current'])assert(await db.prepare('SELECT * FROM invites WHERE token=?').bind(id).first());
 assert.equal((await db.prepare("SELECT answers FROM practice WHERE id='legacy'").first()).answers,original.answers);
 ok(true,'Scheduled cleanup removes only expired sessions/limits and invites older than 30 days; history unchanged');
 // A real check must materialize counters atomically, not wait for a history read.
 const started=await teacher.ok('practice/start',{ids:[chosen[0].id]});
 await teacher.ok('practice/'+started.id+'/check',{index:0,revision:0,submitted:[chosen[0].blanks[0].answer]});
 const stored=await db.prepare('SELECT total_items,answered_count,topic_summary FROM practice WHERE id=?').bind(started.id).first();
 assert.equal(stored.total_items,1);assert.equal(stored.answered_count,1);assert(Object.keys(JSON.parse(stored.topic_summary)).length);
 ok(true,'Answer checks update materialized counters/topics in the same optimistic write');
 const updated=structuredClone(answers);updated[0].fields[0].correct=true;updated[0].correct=true;
 await db.prepare('UPDATE practice SET answers=?,score=score+1,revision=revision+1 WHERE id=?').bind(JSON.stringify(updated),'history-00').run();
 assert.equal((await db.prepare("SELECT topic_summary FROM practice WHERE id='history-00'").first()).topic_summary,null);
 await student.ok('account');
 const repaired=await db.prepare("SELECT topic_summary FROM practice WHERE id='history-00'").first();
 const updatedExpected=Object.fromEntries(ctx.reportSummary({answers:updated}).topics.map(t=>[t.id,[t.correct,t.checked]]));
 assert.deepEqual(JSON.parse(repaired.topic_summary),updatedExpected);
 ok(true,'Legacy-writer trigger invalidates stale metadata; next read repairs it without regrading');
 // Retiring a current-bank format must never break stored reports or unfinished work.
 const retired=JSON.parse(fs.readFileSync(path.join(root,'docs/review/PRACTICE-FORMATS-2026-10-31/retired-records.json'),'utf8'));
 const oldChoice=retired.find(i=>i.id==='new-choice-010');assert(oldChoice);
 const oldResult=grade(oldChoice,oldChoice.correct_option_index);
 await db.prepare('INSERT INTO practice(id,user_id,items,answers,created,completed,score,max_score,pending_count) VALUES(?,?,?,?,?,?,?,?,0)').bind('retired-done',sid,JSON.stringify([oldChoice]),JSON.stringify([oldResult]),time,time,1,1).run();
 for(const report of [await student.ok('reports/retired-done'),await teacher.ok(prefix+'/reports/retired-done')]){
  assert.equal(report.attempt.score,1);assert.deepEqual(report.attempt.answers,[oldResult]);
 }
 await db.prepare('INSERT INTO practice(id,user_id,items,answers,created,score,max_score,pending_count,source) VALUES(?,?,?,?,?,0,0,0,?)').bind('retired-active',sid,JSON.stringify([oldChoice]),'[]',time,'self').run();
 const oldCheck=await student.ok('practice/retired-active/check',{index:0,revision:0,submitted:oldChoice.correct_option_index});
 assert(oldCheck.answer.correct);assert.equal((await student.ok('reports/retired-active')).attempt.answers[0].item.id,oldChoice.id);
 assert.equal((await teacher.call('practice/start',{ids:[oldChoice.id]})).status,400);
 ok(true,'Retired meaning-choice reports and unfinished snapshots remain usable; new selection rejects the retired ID');
 console.log(JSON.stringify({checks,accountBytes:Buffer.byteLength(JSON.stringify(first)),history:25,itemsPerAttempt:20}));
}finally{await runtime.dispose();fs.rmSync(temporary,{recursive:true,force:true});}
