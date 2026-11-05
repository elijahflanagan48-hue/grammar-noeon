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

let checks=0;const ok=(value,label)=>{assert(value,label);checks++;console.log('PASS',label);};
try {
 const db=await runtime.getD1Database('DB');await db.batch(sqlStatements(fs.readFileSync(path.join(root,'cloudflare/schema.sql'),'utf8')).map(sql=>db.prepare(sql)));
 const teacher=new Client(),student=new Client(),other=new Client(),anon=new Client();
 await teacher.ok('auth/setup',{code:'fictional-owner-code',name:'Учитель',email:'teacher@example.test',password:'FictionalPassword!2026'});
 for(const [client,name] of [[student,'anna'],[other,'misha']]){const invite=await teacher.ok('teacher/invite',{});await client.ok('auth/join',{token:invite.token,name,email:name+'@example.test',password:'FictionalPassword!2026'});}
 const tid=(await teacher.ok('auth/me')).user.id,sid=(await student.ok('auth/me')).user.id,oid=(await other.ok('auth/me')).user.id,time=Date.now()/1000;
 const single=target=>fixtures.filter(i=>i.type==='open_brackets'&&i.blanks.length===1&&i.blanks[0].tense_or_construction===target);
 const items=[],answers=[];
 for(const [target,total,correct] of [['present_simple',6,2],['past_simple',5,3],['present_perfect_continuous',5,0],['present_perfect',5,4],['future_simple',4,0]]) {
  assert(single(target).length>=total,target);
  single(target).slice(0,total).forEach((item,n)=>{items.push(item);answers.push(grade(item,[n<correct?item.blanks[0].answer:'wrong']));});
 }
 const unverified=grade(single('future_simple')[4],['wrong']);unverified.fields[0].verified=false;items.push(unverified.item);answers.push(unverified);
 async function work(id,owner,items,answers,created,completed=null,source='teacher',draft=null){
  const fields=answers.flatMap(a=>a.fields),score=fields.filter(f=>f.correct).length,max=fields.filter(f=>f.verified!==false).length,pending=fields.length-max;
  await db.prepare('INSERT INTO practice(id,user_id,items,answers,created,completed,score,max_score,pending_count,source,draft) VALUES(?,?,?,?,?,?,?,?,?,?,?)').bind(id,owner,JSON.stringify(items),JSON.stringify(answers),created,completed,score,max,pending,source,draft===null?null:JSON.stringify(draft)).run();
 }
 async function assign(id,owner,pid,created,cancelled=false){await db.prepare('INSERT INTO assignments VALUES(?,?,?,?,?,?)').bind(id,tid,owner,pid,id,created).run();if(cancelled)await db.prepare('INSERT INTO assignment_controls(assignment_id,cancelled) VALUES(?,1)').bind(id).run();}
 await work('recent',sid,items,answers,time-86400,time-86000);await assign('new-completion',sid,'recent',time-86400);
 const old=single('future_perfect').slice(0,5),oldAnswers=old.map(i=>grade(i,[i.blanks[0].answer]));await work('old',sid,old,oldAnswers,time-10*86400,time-9*86400);await assign('old-completion',sid,'old',time-10*86400);
 const resume=single('present_perfect').slice(0,20),resumeAnswers=resume.slice(0,8).map(i=>grade(i,[i.blanks[0].answer]));assert.equal(resume.length,20);
 await work('resume',sid,resume,resumeAnswers,time-60);await assign('Начатая работа',sid,'resume',time-60);
 for(const [id,age,cancelled,draft] of [['new',30,false,null],['stale',4*86400,false,null],['not-stale',3*86400-60,false,null],['cancelled',5*86400,true,null],['drafted',5*86400,false,['typed']]]){await work(id,sid,[items[0]],[],time-age,null,'teacher',draft);await assign('assignment-'+id,sid,id,time-age,cancelled);}
 await db.prepare('UPDATE users SET last_active=? WHERE id=?').bind(time-8*86400,oid).run();
 await db.prepare("INSERT INTO users(id,email,name,role,teacher_id,active,created) VALUES('never','never@example.test','Не заходил','student',?,1,?)").bind(tid,time-10*86400).run();
 const own=await teacher.ok('practice/start',{ids:[items[0].id]});
 const first=await student.ok('today');assert.equal(first.role,'student');assert.equal(first.resume.id,'resume');assert.equal(first.resume.index,8);assert.equal(first.resume.total,20);
 assert.deepEqual(first.weakTopics.map(t=>t.topicId),['present_perfect_continuous','present_simple','past_simple']);
 assert(first.weakTopics.every(t=>t.checked>=5&&t.correct/t.checked<0.7));assert.equal(first.freePracticeAllowed,false);
 const fields=answers.flatMap(a=>a.fields);
 assert.equal(first.week.maxScore,fields.filter(f=>f.verified!==false).length);assert.equal(first.week.score,fields.filter(f=>f.correct).length);assert.equal(first.week.sessions,1);assert.equal(first.week.pending,1);
 assert(!first.newAssignments.items.some(a=>a.practiceId==='resume'||a.practiceId==='cancelled'||a.practiceId==='drafted'));
 const accountView=await student.ok('account');for(const key of ['sessions','score','maxScore'])assert.equal(first.stats[key],accountView.stats[key]);
 ok(true,'Student Today: fresh started 8/20, real new assignments, three weak topics, week and account totals agree');
 const warm=await student.ok('today',undefined,{light:true});assert.deepEqual({...warm,week:{...warm.week,since:''}},{...first,week:{...first.week,since:''}});
 ok(Buffer.byteLength(JSON.stringify(first))<10000,'Warm Today reads no large JSON, bounded payload '+Buffer.byteLength(JSON.stringify(first))+' bytes');
 assert(!JSON.stringify(first).includes('accepted_answers'));assert(!JSON.stringify(first).includes('"answers"'));
 assert.equal((await anon.call('today')).status,401);
 const theirs=await other.ok('today');assert(!JSON.stringify(theirs).includes('Начатая работа'));assert.equal(theirs.resume,null);
 ok(true,'Guest denied, another learner sees only their own data, no keys or answer snapshots');
 await teacher.ok('teacher/students/'+sid+'/free-practice',{allowed:true});assert.equal((await student.ok('today')).freePracticeAllowed,true);
 await db.prepare('UPDATE users SET last_active=? WHERE id=?').bind(time-8*86400,oid).run();
 const teacherToday=await teacher.ok('today',undefined,{light:true});assert.equal(teacherToday.resume.id,own.id);
 assert(teacherToday.completed.items.some(w=>w.practiceId==='recent'));
 assert(teacherToday.inactiveStudents.items.some(u=>u.id===oid));assert(teacherToday.inactiveStudents.items.some(u=>u.id==='never'));
 assert.deepEqual(teacherToday.staleAssignments.items.map(a=>a.practiceId),['stale']);
 await teacher.ok('notifications/read',{id:'completed:new-completion'});assert(!(await teacher.ok('today')).completed.items.some(w=>w.practiceId==='recent'));
 ok(true,'Teacher Today: own draft, unread completions, inactive ≥7 days and genuinely untouched >3 days');
 await db.prepare('UPDATE users SET teacher_id=NULL WHERE id=?').bind(oid).run();await db.prepare("UPDATE users SET active=0 WHERE id='never'").run();
 assert.equal((await teacher.ok('today')).inactiveStudents.items.length,0);
 ok(true,'Foreign and archived pupils excluded from teacher attention lists');
 for(let n=0;n<7;n++){await work('extra-'+n,sid,[items[0]],[answers[0]],time-100,time-50-n);await assign('extra-'+n,sid,'extra-'+n,time-100);}
 const bounded=await teacher.ok('today');assert.equal(bounded.completed.items.length,5);assert.equal(bounded.completed.total,8);
 ok(true,'Lists capped at five with total count, stable role/owner selection');
 console.log(JSON.stringify({checks,studentBytes:Buffer.byteLength(JSON.stringify(first)),teacherBytes:Buffer.byteLength(JSON.stringify(teacherToday))}));
}finally{await runtime.dispose();fs.rmSync(temporary,{recursive:true,force:true});}
