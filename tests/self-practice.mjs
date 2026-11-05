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

const http=await import('node:http');
const browserTests = process.env.GRAMMAR_TEST_BROWSER !== '0';
let server,browser,checks=0;
const browserDiagnostics=[],browserTrace=[];
const ok=(condition,label)=>{assert(condition,label);checks++;console.log('PASS',label)};
const same=(a,b,label)=>{assert.deepEqual(a,b,label);checks++;console.log('PASS',label)};
try {
  const db=await runtime.getD1Database('DB');
  const migration=fs.readFileSync(path.join(root,'cloudflare/migrations/0007_student_self_practice.sql'),'utf8');
  const sql=fs.readFileSync(path.join(root,'cloudflare/schema.sql'),'utf8').replace(migration,'').replace(/^--.*$/gm,'');
  await db.batch(sqlStatements(sql).map(sql=>db.prepare(sql)));
  await db.prepare("INSERT INTO users(id,email,name,role,active,created) VALUES('legacy','legacy@example.test','Legacy','student',1,0)").run();
  await db.prepare("INSERT INTO practice(id,user_id,items,answers,created,completed,score,max_score) VALUES('legacy-practice','legacy',?,'[]',0,1,1,1)").bind(JSON.stringify([known])).run();
  const beforeMigration=await db.prepare("SELECT * FROM practice WHERE id='legacy-practice'").first();
  await db.batch(migration.replace(/^--.*$/gm,'').split(';').map(s=>s.trim()).filter(Boolean).map(sql=>db.prepare(sql)));
  const afterMigration=await db.prepare("SELECT * FROM practice WHERE id='legacy-practice'").first();
  same(afterMigration,{...beforeMigration,source:'teacher'},'Additive migration preserves old snapshots, answers and grades');
  same((await db.prepare('SELECT COUNT(*) AS n FROM student_practice_settings').first()).n,0,'Migration grants nobody permission');
  await db.prepare("DELETE FROM practice WHERE id='legacy-practice'").run();await db.prepare("DELETE FROM users WHERE id='legacy'").run();
  const teacher=new Client(),student=new Client(),other=new Client(),anonymous=new Client();
  await teacher.ok('auth/setup',{code:'fictional-owner-code',name:'Тестовый учитель',email:'teacher@example.test',password:'FictionalPassword!2026'});
  for(const [client,name] of [[student,'anna'],[other,'misha']]) {const invite=await teacher.ok('teacher/invite',{});await client.ok('auth/join',{token:invite.token,name,email:name+'@example.test',password:'FictionalPassword!2026'});}
  const sid=(await student.ok('auth/me')).user.id,oid=(await other.ok('auth/me')).user.id;
  const permission='teacher/students/'+sid+'/free-practice';
  const filters={topic:'tenses',tenses:['present_simple'],levels:['basic'],type:'open_brackets',count:1};
  same((await anonymous.call('practice/start',filters)).status,401,'Guest cannot start');
  same((await student.ok('account')).freePracticeAllowed,false,'Default deny');
  same((await student.call('practice/start',filters)).status,403,'Disabled student cannot start');
  same((await student.call(permission,{allowed:true})).status,403,'Student cannot grant permission');
  same((await teacher.call(permission,{allowed:true},{badCsrf:true})).status,403,'Permission requires CSRF');
  same((await teacher.call(permission,{allowed:'true'})).status,400,'Boolean permission enforced');
  await db.prepare('UPDATE users SET teacher_id=NULL WHERE id=?').bind(oid).run();
  same((await teacher.call('teacher/students/'+oid+'/free-practice',{allowed:true})).status,404,'Teacher cannot enable unrelated learner');
  await teacher.ok(permission,{allowed:true});
  same((await student.call('practice/preview',{...filters,levels:['A2']})).status,400,'CEFR is no longer an accepted selection filter');
  for(const level of ['basic','medium','advanced']){const preview=await student.ok('practice/preview',{...filters,levels:[level],tenses:['present_simple','past_simple','future_simple']});ok(preview.canStart===true,'New difficulty available: '+level);}
  const historicalItems=JSON.parse(fs.readFileSync(path.join(root,'tests/fixtures/v8-historical-items.json')));
  for(const [n,oldItem] of historicalItems.entries()){
    const id='v8-historical-'+n,submitted=oldItem.options?oldItem.correct_option_index:oldItem.blanks.map(b=>b.answer),answer=grade(oldItem,submitted),fields=answer.fields.length;
    await db.prepare("INSERT INTO practice(id,user_id,items,answers,created,completed,score,max_score,source) VALUES(?,?,?,?,1,2,?,?, 'self')").bind(id,sid,JSON.stringify([oldItem]),JSON.stringify([answer]),fields,fields).run();
    const before=await db.prepare('SELECT items,answers,score,max_score FROM practice WHERE id=?').bind(id).first();
    same((await student.ok('practice/'+id)).contentOutdated,true,'Historical or retired snapshot correctly marked outdated');
    const oldReport=await student.ok('reports/'+id);same(oldReport.attempt.score,fields,'Historical grade unchanged after bank import');
    const detail=await teacher.ok('teacher/students/'+sid+'/reports/'+id);same(detail.attempt.answers[0].item,oldItem,'Teacher reads exact historical snapshot, including retired IDs');
    same(await db.prepare('SELECT items,answers,score,max_score FROM practice WHERE id=?').bind(id).first(),before,'Reading old reports does not rewrite snapshots or grades');
  }
  const preview=await student.ok('practice/preview',filters);
  ok(preview.canStart===true&&preview.size===1&&Object.keys(preview).every(k=>['canStart','size','missing','coverage'].includes(k)),'Preview only aggregate metadata');
  for(const bad of [{...filters,ids:[known.id]},{...filters,count:51},{...filters,tenses:['fake']},{...filters,levels:[]},{...filters,type:'fake'},{...filters,topic:'fake'}])same((await student.call('practice/start',bad)).status,400,'Invalid/forged filters rejected');
  const session=await student.ok('practice/start',filters);
  const view=await student.ok('practice/'+session.id);
  same(view.contentOutdated,false,'Fresh work is not outdated even with an older unchanged item version');same(view.items.length,1,'Bounded session');same(view.source,'self','Session marked self');
  const forbidden=new Set(['answer','answer_text','accepted_answers','correct_option_index','accepted_option_indices','summary','explanation_ru','rule_refs','tense_or_construction']);
  function noAnswers(value){if(!value||typeof value!=='object')return;for(const [k,v] of Object.entries(value)){assert(!forbidden.has(k),'Leaked '+k);noAnswers(v);}}
  noAnswers(view.items);ok(true,'No answer keys before checking, recursively');
  same((await other.call('practice/'+session.id)).status,404,'Other learner cannot read session');
  same((await student.call('practice/'+session.id+'/check',{index:1,revision:0,submitted:['test']})).status,409,'Cannot skip forward to obtain keys');
  const draft=view.items[0].blanks.map(()=>"draft");
  same((await student.call('practice/'+session.id+'/draft',{index:0,revision:0,submitted:draft})).status,200,'Self draft saved on server');
  same((await student.ok('practice/'+session.id)).draft,draft,'Draft restored');
  await teacher.ok(permission,{allowed:false});
  same((await student.call('practice/start',filters)).status,403,'Revocation blocks new starts');
  ok((await student.ok('attempts/'+session.id)).canResume,'Revocation preserves existing progress');
  const item=fixtures.find(i=>i.id===view.items[0].id),submitted=item.blanks.map(b=>b.answer);
  const result=await student.ok('practice/'+session.id+'/check',{index:0,revision:1,submitted,correct:false,score:-100});
  ok(result.answer.correct,'Server grades independently of forged client score');
  same((await student.ok('practice/'+session.id+'/check',{index:0,revision:1,submitted})).answer,result.answer,'Replay safe');
  const history=await teacher.ok('teacher/students/'+sid);
  ok(history.history.some(h=>h.id===session.id&&h.source==='self'&&h.status==='completed'),'Teacher history identifies independent session');
  same((await teacher.ok('teacher/students/'+sid+'/reports/'+session.id)).attempt.source,'self','Teacher report marked self');
  await teacher.ok(permission,{allowed:true});
  const comparison={topic:'comparison',tenses:['cmp_forms'],levels:['basic','medium'],type:'all',count:5};
  const cmp=await student.ok('practice/start',comparison),cmpView=await student.ok('practice/'+cmp.id);
  ok(cmpView.items.length<=5&&cmpView.items.every(i=>i.id.startsWith('cmp-')),'Comparison filters honoured');noAnswers(cmpView.items);
  const passiveTargets=['present_simple','past_simple','future_simple','present_continuous','present_perfect','past_continuous','past_perfect','future_perfect'].map(t=>'pv_'+t);
  for(const topic of ['tenses','comparison','passive']){
    const types=topic==='passive'?['open_brackets','active_to_passive']:['open_brackets','multiple_choice'];
    const tenses=[...new Set(fixtures.filter(item=>exerciseSection(item)===topic).flatMap(exerciseTenses))];
    const multipleFilters={topic,tenses,types,levels:['basic','medium','advanced'],count:50};
    const preview=await student.ok('practice/preview',multipleFilters);ok(preview.canStart&&preview.size===50,'Multiple format preview: '+topic);
    const started=await student.ok('practice/start',multipleFilters),view=await student.ok('practice/'+started.id);
    same(view.items.length,50,'Multiple format size: '+topic);
    ok(view.items.every(item=>types.includes(item.type)&&exerciseSection(item)===topic),'No unselected format or section: '+topic);
    same([...new Set(view.items.map(item=>item.type))].sort(),types.slice().sort(),'Both chosen formats present: '+topic);noAnswers(view.items);
    for(const count of [17,33]){
      const started=await student.ok('practice/start',{...multipleFilters,count}),saved=await student.ok('practice/'+started.id);
      same(saved.items.length,count,'Custom exact quantity '+count+': '+topic);noAnswers(saved.items);
      ok(saved.items.every(item=>types.includes(item.type)&&exerciseSection(item)===topic),'Custom quantity preserves formats and section');
    }
  }
  const multipleFilters={topic:'passive',tenses:passiveTargets,levels:['basic','medium','advanced'],types:['open_brackets','active_to_passive'],count:5};
  for(const invalid of [[],['open_brackets','open_brackets'],['multiple_choice'],['unknown'],'open_brackets',null])same((await student.call('practice/start',{...multipleFilters,types:invalid})).status,400,'Reject invalid format union');
  same((await student.call('practice/start',{...multipleFilters,type:'all'})).status,400,'Reject conflicting old/new format filters');
  for(const type of ['open_brackets','active_to_passive','translation_ru_en']){
    const filters={topic:'passive',tenses:passiveTargets,levels:['basic','medium','advanced'],type,count:1};
    const started=await student.ok('practice/start',filters),view=await student.ok('practice/'+started.id);
    same(view.items.length,1,'Passive '+type+' session');const visible=view.items[0];same(visible.type,type,'Native format');same(visible.topic,'passive','Topic isolation');noAnswers(view.items);
    assert(visible.instruction_ru,'Instructions visible');assert(!('answer_profile' in visible),'Normalization contract server-only');
    const source=fixtures.find(i=>i.id===visible.id),submitted=source.blanks.map(b=>b.answer);
    const checked=await student.ok('practice/'+started.id+'/check',{index:0,revision:0,submitted});
    same(checked.answer.correct,type!=='translation_ru_en','Server grading '+type);
    same(checked.answer.fields.every(f=>f.verified),type!=='translation_ru_en','All translations wait for teacher');
    const report=await teacher.ok('teacher/students/'+sid+'/reports/'+started.id);assert(report.attempt,'Teacher can inspect result');
    if(type==='translation_ru_en'){
      noAnswers(checked.answer.item);same(checked.answer.item.grading_mode,'teacher','Display manual mode safely');
      const own=await student.ok('reports/'+started.id);noAnswers(own.attempt.answers[0].item);same(own.attempt.answers[0].item.practice_tenses,source.practice_tenses,'Submitted manual translation retains safe report topic');
      noAnswers((await student.ok('practice/'+started.id)).items);
      const endpoint='teacher/students/'+sid+'/reports/'+started.id+'/review';
      same((await student.call(endpoint,{revision:1,answerIndex:0,correct:true})).status,403,'Learner cannot grade own translation');
      same((await other.call(endpoint,{revision:1,answerIndex:0,correct:true})).status,403,'Other learner cannot grade');
      same((await teacher.call(endpoint,{revision:0,answerIndex:0,correct:true})).status,409,'Review uses optimistic revision');
      same((await teacher.call(endpoint,{revision:1,answerIndex:0,correct:'yes'})).status,400,'Review rejects non-boolean grade');
      same((await teacher.call('teacher/students/'+oid+'/reports/'+started.id+'/review',{revision:1,answerIndex:0,correct:true})).status,404,'Review student/work pair is scoped');
      const reviewed=await teacher.ok(endpoint,{revision:1,answerIndex:0,correct:true,note:'Good translation.'});same(reviewed.revision,2,'Teacher review increments revision');
      const final=await student.ok('reports/'+started.id);same([final.attempt.score,final.attempt.maxScore,final.attempt.pending],[1,1,0],'Reviewed grade updates real report');
      same(final.attempt.answers[0].fields[0].manual_review.note,'Good translation.','Student receives teacher comment');assert(final.attempt.answers[0].item.answer_text,'Model released after review');
      same((await teacher.call(endpoint,{revision:1,answerIndex:0,correct:false})).status,409,'Stale review cannot overwrite');
      await teacher.ok(endpoint,{revision:2,answerIndex:0,correct:false,note:'Please revise this.'});
      const revised=await student.ok('reports/'+started.id);same([revised.attempt.score,revised.attempt.maxScore,revised.attempt.pending],[0,1,0],'Teacher correction updates score consistently');
      const audit=await teacher.ok('teacher/students/'+sid+'/reports/'+started.id);same(audit.attempt.answers[0].manual_review_history.length,2,'Manual changes have an audit trail');
      assert(!('manual_review_history' in revised.attempt.answers[0]),'Student receives current result, not internal review history');
    }else same((await teacher.call('teacher/students/'+sid+'/reports/'+started.id+'/review',{revision:1,answerIndex:0,correct:true})).status,400,'Closed exercise cannot be manually regraded');
    ok(true,'Passive '+type+': redaction, grading and report');
  }
  const multiple=await student.ok('practice/start',{...filters,type:'multiple_choice',levels:['basic','medium','advanced'],tenses:['present_simple','present_continuous','present_perfect','present_perfect_continuous','past_simple','past_continuous','past_perfect','past_perfect_continuous','future_simple','future_continuous','future_perfect','future_perfect_continuous','other_constructions'],count:20});
  noAnswers((await student.ok('practice/'+multiple.id)).items);ok(true,'Choice keys and answer-derived summary withheld');
  for(const part of JSON.parse(fs.readFileSync(path.join(root,'data/exercises/index.json'))).parts) {
    const r=await runtime.dispatchFetch('https://grammar.test/'+part.file,{headers:{Cookie:student.cookie}});same(r.status,403,'Learner denied '+part.file);
  }
  await teacher.ok(permission,{allowed:false});
  if (browserTests) {
  const {chromium}=require('playwright');
  server=http.createServer(async(req,res)=>{try{const chunks=[];for await(const chunk of req)chunks.push(chunk);const headers=new Headers(req.headers);if(headers.get('Origin')==='http://localhost:8801')headers.set('Origin','https://grammar.test');headers.set('CF-Connecting-IP','192.0.2.2');const response=await runtime.dispatchFetch('https://grammar.test'+req.url,{method:req.method,headers,body:['GET','HEAD'].includes(req.method)?undefined:Buffer.concat(chunks)});res.statusCode=response.status;for(const [key,value] of response.headers)res.setHeader(key,key==='set-cookie'?value.replace(/; Secure/g,''):value);res.end(Buffer.from(await response.arrayBuffer()));}catch(error){console.error(error);res.statusCode=500;res.end();}});
  await new Promise(resolve=>server.listen(8801,'127.0.0.1',resolve));
  browser=await chromium.launch({headless:true,...(process.env.GRAMMAR_CHROME_PATH ? {executablePath:process.env.GRAMMAR_CHROME_PATH} : {})});
  const errors=[],contexts=[];
  async function pageFor(address){const context=await browser.newContext({serviceWorkers:'block',reducedMotion:'reduce',viewport:JSON.parse(process.env.GRAMMAR_TEST_VIEWPORT||'{"width":375,"height":812}'),colorScheme:process.env.GRAMMAR_TEST_THEME||'light'});contexts.push(context);const page=await context.newPage();browserDiagnostics.push({page,address:address||'guest'});page.on('request',request=>{const pathname=new URL(request.url()).pathname;if(/^\/api\/practice\/(?:preview|start)$/.test(pathname))browserTrace.push({address,pathname,filters:request.postDataJSON()});});page.on('response',response=>{const pathname=new URL(response.url()).pathname;if(/^\/api\/practice\/(?:preview|start)$/.test(pathname))browserTrace.push({address,pathname,status:response.status()});});page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(theme=>{localStorage.setItem('noeon-theme',theme)},process.env.GRAMMAR_TEST_THEME||'light');await page.goto('http://localhost:8801/#profile');await page.waitForSelector('#account-login-form');if(address){await page.fill('#account-email',address);await page.fill('#account-password','FictionalPassword!2026');await page.click('#account-login-form button.primary');await page.waitForSelector('#account-logout');}return page;}
  const guestPage=await pageFor(null);await guestPage.goto('http://localhost:8801/#practice/tenses');await guestPage.waitForFunction(()=>document.querySelector('#app').textContent.includes('Войти в кабинет'));ok(await guestPage.locator('#practice-form').count()===0,'Guest browser has no private form');
  const studentPage=await pageFor('anna@example.test'),teacherPage=await pageFor('teacher@example.test');
  const studentRequests=[];studentPage.on('request',request=>studentRequests.push(new URL(request.url()).pathname));
  await studentPage.goto('http://localhost:8801/#practice/tenses');await studentPage.waitForFunction(()=>document.querySelector('#app').textContent.includes('Учитель пока не разрешил'));
  ok(await studentPage.locator('#practice-form').count()===0,'Disabled learner sees permission message');
  await teacherPage.goto('http://localhost:8801/#student/'+sid);await teacherPage.waitForSelector('#free-practice-toggle');await teacherPage.check('#free-practice-toggle');await teacherPage.waitForFunction(()=>document.querySelector('#free-practice-status').textContent.includes('разрешена'));ok(true,'Teacher enables permission via UI');
  await studentPage.goto('http://localhost:8801/#practice/tenses');await studentPage.reload();await studentPage.waitForSelector('#practice-form');
  same(await studentPage.locator('[name=level]').evaluateAll(ns=>ns.map(n=>n.value)),['basic','medium','advanced'],'Three level values in learner UI');
  ok(!(await studentPage.locator('.practice-levels').innerText()).match(/A1|A2|B1|B2|C1|C2/),'CEFR absent from current difficulty filter');
  if(process.env.GRAMMAR_SCREENSHOT_DIR){await studentPage.locator('.practice-levels').scrollIntoViewIfNeeded();fs.mkdirSync(process.env.GRAMMAR_SCREENSHOT_DIR,{recursive:true});await studentPage.screenshot({path:path.join(process.env.GRAMMAR_SCREENSHOT_DIR,`levels-${process.env.GRAMMAR_TEST_VIEWPORT}-${process.env.GRAMMAR_TEST_THEME}.png`),fullPage:false,animations:'disabled'});}
  await studentPage.click('[data-tense-action=none]');await studentPage.check('[name=tense][value=present_simple]');
  await studentPage.click('[data-level-action=none]');await studentPage.check('[name=level][value=basic]');await studentPage.click('[data-format-action="none"]');await studentPage.check('[name="format"][value="open_brackets"]');await studentPage.fill('#count','1');
  await studentPage.waitForFunction(()=>!document.querySelector('#practice-form [type=submit]').disabled);
  // Keep focus in the quantity input until a real button click. Blurring it must
  // neither disable the button during that click nor silently drop the start.
  same(await studentPage.locator('#count').evaluate(input=>input===document.activeElement),true,'Quantity remains focused before direct Start click');
  const startsBeforeClick=browserTrace.filter(entry=>entry.address==='anna@example.test'&&entry.pathname==='/api/practice/start'&&entry.filters).length;
  await studentPage.click('#practice-form [type=submit]');await studentPage.waitForSelector('#answer-form');
  same(browserTrace.filter(entry=>entry.address==='anna@example.test'&&entry.pathname==='/api/practice/start'&&entry.filters).length-startsBeforeClick,1,'Direct quantity-to-Start click creates exactly one learner session');
  ok(await studentPage.locator('.session > .verb-only-note').count()===0,'Fresh learner work has no false outdated-content banner');
  const active=await studentPage.evaluate(()=>({id:state.session.remote.id,item:state.session.items[0]}));noAnswers(active.item);ok(true,'Learner UI receives only sanitized selected item');
  const actual=fixtures.find(i=>i.id===active.item.id);
  const inputs=studentPage.locator('#answer-form .answer-input');same(await inputs.count(),actual.blanks.length,'Rendered input count');
  for(let n=0;n<actual.blanks.length;n++)await inputs.nth(n).fill(actual.blanks[n].answer);
  await studentPage.click('#answer-form [type=submit]');await studentPage.waitForFunction(()=>state.session.checked);
  ok(await studentPage.evaluate(()=>state.session.answers[0].correct),'Learner UI server check succeeds');
  await studentPage.waitForFunction(()=>{
    const explanation=document.querySelector('#feedback .explanation')?.getBoundingClientRect();
    const next=document.getElementById('next-question')?.getBoundingClientRect();
    const header=document.querySelector('.site-header')?.getBoundingClientRect().bottom||0;
    const bottom=innerWidth<1000?document.querySelector('.main-nav').getBoundingClientRect().top:innerHeight;
    return explanation&&next&&explanation.top>=header-2&&explanation.top<bottom&&next.top>=header&&next.bottom<=bottom;
  });
  ok(true,'Server answer scrolls to explanation with Next visible');
  await studentPage.reload();await studentPage.waitForSelector('#feedback');ok((await studentPage.locator('#feedback').innerText()).length>0,'Checked feedback survives reload');
  await teacherPage.reload();await teacherPage.waitForSelector('.work-card-origin');ok((await teacherPage.locator('.work-card-origin').allTextContents()).every(t=>t==='самостоятельно'),'Teacher sees self marker in history');
  await teacherPage.uncheck('#free-practice-toggle');await teacherPage.waitForFunction(()=>document.querySelector('#free-practice-status').textContent.includes('запрещены'));
  await studentPage.goto('http://localhost:8801/#practice/comparison');await studentPage.waitForFunction(()=>document.querySelector('#app').textContent.includes('Учитель пока не разрешил'));ok(true,'Permission revocation reflected in learner browser');
  await teacherPage.goto('http://localhost:8801/#practice/comparison');await teacherPage.waitForSelector('#practice-form');
  await teacherPage.fill('#count','1');await teacherPage.waitForFunction(()=>!document.querySelector('#practice-form [type=submit]').disabled);
  await teacherPage.click('#practice-form [type=submit]');await teacherPage.waitForSelector('#answer-form');ok(await teacherPage.evaluate(()=>!!state.session.remote&&state.exercises.length>0),'Teacher original practice still starts');
  await teacherPage.goto('http://localhost:8801/#profile');await teacherPage.waitForSelector('#account-logout');await teacherPage.click('#account-logout');await teacherPage.waitForSelector('#account-login-form');
  ok(await teacherPage.evaluate(()=>state.exercises===null),'Teacher bank cleared on logout');
  await teacherPage.fill('#account-email','anna@example.test');await teacherPage.fill('#account-password','FictionalPassword!2026');await teacherPage.click('#account-login-form button.primary');await teacherPage.waitForSelector('#account-logout');
  ok(await teacherPage.evaluate(()=>account.user.role==='student'&&state.exercises===null),'Switching same browser to learner keeps bank absent');
  ok(!studentRequests.some(url=>/^\/data\/exercises\/part-/.test(url)),'Learner browser never requests the full bank');
  ok(errors.length===0,'No browser JavaScript errors');
  console.log(JSON.stringify({checks,errors,studentRequests},null,2));
  } else console.log('Browser scenarios: run npm run test:browser.');
  for(const format of ['multiple_choice','context_cloze','question','mixed']){
    const fresh=fixtures.find(i=>/^(?:bal|ext|mix)-20261030-/.test(i.id)&&(format==='question'?i.id==='bal-20261030-present-simple-015':format==='mixed'?i.id==='mix-20261030-001':i.type===format));
    assert(fresh,'Missing reviewed format '+format);
    const work=await teacher.ok('teacher/students/'+sid+'/assignments',{title:'Проверка нового банка '+format,ids:[fresh.id]});
    const before=await student.ok('practice/'+work.practiceId);noAnswers(before.items);
    same((await other.call('practice/'+work.practiceId)).status,404,'Reviewed '+format+' private to assigned pupil');
    const response=await student.ok('practice/'+work.practiceId+'/check',{index:0,revision:before.revision,submitted:fresh.options?fresh.correct_option_index:fresh.blanks.map(b=>b.answer)});
    ok(response.answer.correct,'Reviewed '+format+' checked by Worker');
    const report=(await teacher.ok('teacher/students/'+sid+'/reports/'+work.practiceId)).attempt;
    ok(report.answers[0].correct,'Reviewed '+format+' report retains grade');
  }
  // Diagnostics are trusted stored feedback, not client-supplied grading data.
  const diagnosticItem=fixtures.find(i=>i.id==='src-u08-010');
  const diagnosticWork=await teacher.ok('teacher/students/'+sid+'/assignments',{title:'Конкретная причина ошибки',ids:[diagnosticItem.id]});
  const diagnosticView=await student.ok('practice/'+diagnosticWork.practiceId);
  noAnswers(diagnosticView.items);
  assert(!JSON.stringify(diagnosticView).includes('множественное число'),'No diagnosis before submission');
  const diagnosticResult=await student.ok('practice/'+diagnosticWork.practiceId+'/check',{index:0,revision:diagnosticView.revision,submitted:['celebrates'],diagnostic:{code:'forged',message:'Client supplied'}});
  const expectedDiagnostic=grade(diagnosticItem,['celebrates']).fields[0].diagnostic;
  assert(expectedDiagnostic);
  same(diagnosticResult.answer.fields[0].diagnostic,expectedDiagnostic,'Worker generates specific agreement feedback');
  same((await student.ok('practice/'+diagnosticWork.practiceId+'/check',{index:0,revision:diagnosticView.revision,submitted:['celebrates']})).answer,diagnosticResult.answer,'Replay returns the original stored diagnosis');
  for(const route of ['practice/'+diagnosticWork.practiceId,'reports/'+diagnosticWork.practiceId,'teacher/students/'+sid+'/reports/'+diagnosticWork.practiceId]){
    const saved=await (route.startsWith('teacher/')?teacher:student).ok(route);
    same((saved.attempt||saved).answers[0].fields[0].diagnostic,expectedDiagnostic,'Stored diagnosis survives reload/report: '+route);
  }
  const savedDiagnostic=await db.prepare('SELECT answers FROM practice WHERE id=?').bind(diagnosticWork.practiceId).first();
  const legacyAnswers=JSON.parse(savedDiagnostic.answers);delete legacyAnswers[0].fields[0].diagnostic;
  await db.prepare('UPDATE practice SET answers=? WHERE id=?').bind(JSON.stringify(legacyAnswers),diagnosticWork.practiceId).run();
  const legacyReport=await student.ok('reports/'+diagnosticWork.practiceId);
  assert(!legacyReport.attempt.answers[0].fields[0].diagnostic,'Reading an old answer does not add a diagnosis');
  same((await db.prepare('SELECT answers FROM practice WHERE id=?').bind(diagnosticWork.practiceId).first()).answers,JSON.stringify(legacyAnswers),'Reports never rewrite historical feedback');
  const current=fixtures.find(i=>i.id==='src-u01-099'),oldSnapshot=structuredClone(current);
  oldSnapshot.content_version='tenses-2026-10-29.2';oldSnapshot.blanks[0].accepted_answers=['finishes','will have finished'];
  const legacyWork=await teacher.ok('teacher/students/'+sid+'/assignments',{title:'Исторический снимок',ids:[current.id]});
  await db.prepare('UPDATE practice SET items=? WHERE id=?').bind(JSON.stringify([oldSnapshot]),legacyWork.practiceId).run();
  const oldView=await student.ok('practice/'+legacyWork.practiceId);
  const oldResult=await student.ok('practice/'+legacyWork.practiceId+'/check',{index:0,revision:oldView.revision,submitted:['finishes']});
  ok(oldResult.answer.correct,'Stored historical src-u01-099 keeps its own accepted finishes');

} catch(error) {
  for(const {page,address} of browserDiagnostics)if(!page.isClosed()){
    const state=await page.evaluate(()=>{
      const form=document.querySelector('#practice-form'),count=form?.elements.count;
      return {url:location.href,active:document.activeElement?.outerHTML?.slice(0,500),
        form:form?{hidden:form.hidden,inert:form.inert,valid:form.checkValidity(),
          submitDisabled:form.querySelector('[type=submit]')?.disabled,
          count:{value:count?.value,min:count?.min,max:count?.max,validationMessage:count?.validationMessage},
          filters:typeof practiceFilterPayload==='function'?practiceFilterPayload(form):null}:null,
        available:document.querySelector('#available')?.textContent,error:document.querySelector('#practice-error')?.textContent,
        answerForm:!!document.querySelector('#answer-form'),preview:!!document.querySelector('#assignment-preview'),
        session:typeof window.state!=='undefined'?{index:window.state.session?.index}:null};
    }).catch(diagnosticError=>({diagnosticError:diagnosticError.message}));
    console.error('Browser failure state:',JSON.stringify({address,...state}));
  }
  if(browserTrace.length)console.error('Browser practice trace:',JSON.stringify(browserTrace.slice(-30)));
  throw error;
} finally {if(browser)await browser.close();if(server)await new Promise(r=>server.close(r));await runtime.dispose();fs.rmSync(temporary,{recursive:true,force:true});}
