if(process.env.GRAMMAR_TEST_BROWSER!=='1'){console.log('Today browser: run npm run test:browser.');process.exit(0);}
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
  if(item.grading_mode==='teacher'){const result=grade(item,item.blanks.map(b=>b.answer));assert(result.fields.every(f=>!f.correct&&!f.verified),item.id+': translation must wait for teacher');continue;}
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
  try {return new Response(fs.readFileSync(target),{headers:{'Content-Type':target.endsWith('.js')?'text/javascript':target.endsWith('.html')?'text/html':target.endsWith('.css')?'text/css':target.endsWith('.json')?'application/json':target.endsWith('.woff2')?'font/woff2':target.endsWith('.svg')?'image/svg+xml':target.endsWith('.png')?'image/png':'text/plain','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; object-src 'none'"}});}catch{return new Response('',{status:404});}
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
const {chromium}=require('playwright');
let server,browser;let checks=0;const contexts=[],errors=[],scans=[];
const ok=(value,label)=>{assert(value,label);checks++;console.log('PASS',label);};
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
 const baseline=await student.ok('today');
 server=http.createServer(async(req,res)=>{try{const chunks=[];for await(const chunk of req)chunks.push(chunk);const headers=new Headers(req.headers);if(headers.get('Origin')==='http://localhost:8803')headers.set('Origin','https://grammar.test');const response=await runtime.dispatchFetch('https://grammar.test'+req.url,{method:req.method,headers,body:['GET','HEAD'].includes(req.method)?undefined:Buffer.concat(chunks)});res.statusCode=response.status;for(const [key,value] of response.headers)res.setHeader(key,key==='set-cookie'?value.replace(/; Secure/g,''):value);res.end(Buffer.from(await response.arrayBuffer()));}catch(error){console.error(error);res.statusCode=500;res.end();}});
 await new Promise(resolve=>server.listen(8803,'127.0.0.1',resolve));
 browser=await chromium.launch({headless:true,...(process.env.GRAMMAR_CHROME_PATH?{executablePath:process.env.GRAMMAR_CHROME_PATH}:{})});
 const viewport=JSON.parse(process.env.GRAMMAR_TEST_VIEWPORT||'{"width":375,"height":812}'),theme=process.env.GRAMMAR_TEST_THEME||'light';
 const axeSource=fs.readFileSync(require.resolve('axe-core/axe.min.js'),'utf8');
 async function scan(page,label){
  await page.waitForTimeout(350);await page.evaluate(axeSource);
  const result=await page.evaluate(async()=>{const report=await axe.run(document);return report.violations.filter(v=>['serious','critical'].includes(v.impact)).map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}));});
  scans.push({label,violations:result});assert.deepEqual(result,[],label+' axe');
  ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),label+' no overflow');
  if(process.env.GRAMMAR_SCREENSHOT_DIR){fs.mkdirSync(process.env.GRAMMAR_SCREENSHOT_DIR,{recursive:true});await page.screenshot({path:path.join(process.env.GRAMMAR_SCREENSHOT_DIR,`today-${label}-${viewport.width}-${theme}.png`),fullPage:true,animations:'disabled'});}
 }
 async function pageFor(address,fallback=false){
  const context=await browser.newContext({serviceWorkers:'block',viewport,colorScheme:theme});contexts.push(context);
  const page=await context.newPage();page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(({theme,fallback})=>{localStorage.setItem('noeon-theme',theme);localStorage.setItem('noeon-history','[{"total":999,"correct":999}]');if(fallback){const original=CSS.supports.bind(CSS);CSS.supports=(a,b)=>a==='field-sizing'?false:original(a,b);}},{theme,fallback});
  if(address){await page.goto('http://localhost:8803/#profile');await page.waitForSelector('#account-login-form');await page.fill('#account-email',address);await page.fill('#account-password','FictionalPassword!2026');await page.click('#account-login-form button.primary');await page.waitForSelector('#account-logout');}
  return page;
 }
 const guestPage=await pageFor(null);const guestRequests=[];guestPage.on('request',r=>guestRequests.push(new URL(r.url()).pathname));await guestPage.goto('http://localhost:8803/#home');await guestPage.waitForSelector('.today-guest');
 const guestText=await guestPage.locator('#app').innerText();ok(!/999|1424|1\s?424|Ваш прогресс|ответов выполнено/.test(guestText),'Guest has no bank totals or local progress');
 ok(await guestPage.locator('#app a[href^="#practice"]').count()===0,'Guest has only public theory/map and login actions');
 ok(!guestRequests.includes('/api/today'),'Guest does not request account Today');await scan(guestPage,'guest');
 const pupil=await pageFor('anna@example.test'),device=await pageFor('anna@example.test',true),teacherPage=await pageFor('teacher@example.test');
 const requests=[];pupil.on('request',r=>requests.push(new URL(r.url()).pathname));await pupil.goto('http://localhost:8803/#home');await pupil.waitForSelector('[data-resume]');
 ok(requests.filter(path=>path==='/api/today').length===1&&!requests.includes('/api/account'),'Home account data uses one Today GET');
 ok((await pupil.locator('.today-resume-progress').innerText()).includes('8 из 20'),'Server continuation progress 8/20');
 const position=await pupil.locator('[data-resume]').boundingBox();ok(position.y+position.height<viewport.height,'Continue visible without scrolling');
 if(viewport.width===375){const navTop=await pupil.locator('#main-nav').evaluate(n=>n.getBoundingClientRect().top);ok(position.y+position.height<navTop,'Continue above mobile navigation');}
 ok(await pupil.locator('a[href^="#practice/"]').count()===0,'Weak-topic practice hidden when teacher has not permitted it');
 await scan(pupil,'student');
 const allChecked=Number(await pupil.locator('[data-today-stat="all-checked"]').innerText()),allScore=Number(await pupil.locator('[data-today-stat="all-score"]').innerText());
 // Both screens aggregate completed work; the started 8/20 and unverified field must stay out.
 const completedFields=[...answers,...oldAnswers].flatMap(answer=>answer.fields).filter(field=>field.verified!==false);
 const expectedChecked=completedFields.length,expectedScore=completedFields.filter(field=>field.correct).length;
 ok(allChecked===expectedChecked&&allScore===expectedScore,'Today totals match completed verified fields and exclude started work');
 await device.goto('http://localhost:8803/#results');await device.waitForSelector('#all-time-topics > .statistics-kinds > .statistics-kind');
 const summary=await device.evaluate(()=>accountRequest('statistics'));
 ok(summary.kinds.practice.sessions===2&&summary.kinds.practice.checked===expectedChecked&&summary.kinds.practice.correct===expectedScore,'Results server totals independently match both completed practices');
 ok(summary.kinds.assessment.sessions===0&&summary.kinds.assessment.checked===0,'Results keep absent assessments separate');
 const practiceStats=device.locator('#all-time-topics > .statistics-kinds > .statistics-kind').first();
 const accuracy=await practiceStats.locator(':scope > .statistics-metrics > strong').innerText();
 ok(accuracy===Math.round(allScore/allChecked*100)+'%','Another device Results accuracy agrees with Today');
 ok((await practiceStats.innerText()).includes('Проверено ответов: '+allChecked),'Another device Results checked count agrees with Today');
 ok((await device.locator('#screen-title').innerText())==='Результаты'&&(await device.locator('#app > h1').textContent())==='Мои результаты','Results exposes the current route title and semantic heading');await scan(device,'results');
 await teacherPage.goto('http://localhost:8803/#home');await teacherPage.waitForSelector('[data-today-completed]');
 ok((await teacherPage.locator('#app').innerText()).includes('misha'),'Teacher sees inactive owned pupil');ok(await teacherPage.locator('a[href="#student-work/'+sid+'/stale"]').count()===1,'Teacher sees untouched old assignment');
 await scan(teacherPage,'teacher');
 const teacherContinue=teacherPage.locator('[data-resume]');await teacherContinue.click();await teacherPage.waitForSelector('.answer-input');
 const teacherInitial=await teacherPage.locator('.answer-input').first().boundingBox();
 await pupil.locator('[data-resume]').click();await pupil.waitForSelector('.answer-input');
 const field=pupil.locator('.answer-input').first(),initial=await field.boundingBox();ok(Math.abs(initial.width-teacherInitial.width)<2,'Teacher and pupil initial answer widths are neutral');
 await pupil.waitForTimeout(400);await pupil.evaluate(()=>{window.__chromeCalls=0;const old=syncScreenChrome;syncScreenChrome=function(...args){window.__chromeCalls++;return old(...args);};});
 await field.fill('had been doing');const grown=await field.boundingBox();ok(grown.width>initial.width,'Native field-sizing expands entered long form');await pupil.waitForTimeout(500);
 ok(await pupil.evaluate(()=>window.__chromeCalls===0),'Typing and draft status do not resynchronize screen chrome');
 await scan(pupil,'answer');
 await field.fill(resume[8].blanks[0].answer);await pupil.click('#answer-form [type="submit"]');await pupil.waitForFunction(()=>state.session.checked);
 await pupil.goto('http://localhost:8803/#home');await pupil.waitForSelector('[data-resume]');await device.goto('http://localhost:8803/#home');await device.waitForSelector('[data-resume]');
 ok((await device.locator('.today-resume-progress').innerText()).includes('9 из 20'),'Second device sees latest server progress after checking');
 await device.locator('[data-resume]').click();await device.waitForSelector('.answer-input');const fallback=device.locator('.answer-input').first(),before=await fallback.boundingBox();await fallback.fill('had been doing');const after=await fallback.boundingBox();ok(after.width>before.width,'JS fallback expands independently of answer key');await fallback.fill('x'.repeat(200));
 ok(await device.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Long fallback input stays inside viewport');
 await teacherPage.locator('.answer-input').first().fill(items[0].blanks[0].answer);await teacherPage.click('#answer-form [type="submit"]');await teacherPage.waitForFunction(()=>state.session.checked);await teacherPage.click('#next-question');await teacherPage.waitForSelector('.practice-report');
 ok(await teacherPage.evaluate(()=>localStorage.getItem('noeon-history:'+account.user.id)===null),'Completed remote work does not write local history');
 await teacher.ok('teacher/students/'+sid+'/free-practice',{allowed:true});
 await pupil.goto('http://localhost:8803/#home');await pupil.reload();await pupil.waitForSelector('a[href="#practice/tenses/present_perfect_continuous"]');await pupil.locator('a[href="#practice/tenses/present_perfect_continuous"]').click();await pupil.waitForSelector('#practice-form');
 ok(JSON.stringify(await pupil.locator('[name="tense"]:checked').evaluateAll(ns=>ns.map(n=>n.value)))===JSON.stringify(['present_perfect_continuous']),'Weak-topic practice link preselects exactly its topic');
 await pupil.waitForFunction(()=>!document.querySelector('#practice-form [type="submit"]').disabled);await scan(pupil,'practice');
 const cloze=fixtures.find(i=>i.type==='context_cloze');
 const inlineWork=await teacher.ok('teacher/students/'+sid+'/assignments',{title:'Контекстные пропуски',ids:[cloze.id]});
 for(const page of [pupil,device]){
  await page.goto('http://localhost:8803/#work/'+inlineWork.practiceId);await page.waitForSelector('[data-resume]');await page.locator('[data-resume]').click();await page.waitForSelector('.inline-blank .answer-input');
  // The other device may already have autosaved text into this same work.
  const inline=page.locator('.inline-blank .answer-input').first();await inline.fill('');await page.evaluate(()=>document.fonts.ready);const initial=await inline.boundingBox();const twelve=await inline.evaluate(n=>{const style=getComputedStyle(n),probe=document.createElement('span');Object.assign(probe.style,{position:'absolute',display:'block',width:'12ch',height:'0',fontFamily:style.fontFamily,fontSize:style.fontSize,fontWeight:style.fontWeight});document.body.append(probe);const width=probe.getBoundingClientRect().width;probe.remove();return width;});ok(Math.abs(initial.width-twelve)<2,'Empty inline gap starts at 12ch');await inline.fill('had been doing');ok(await inline.evaluate(n=>n.scrollWidth<=n.clientWidth+2),'Inline gap fits had been doing without clipping');await inline.fill('had been doing the work');const grown=await inline.boundingBox();ok(grown.width>initial.width,'Inline gap grows from the entered text');await inline.fill('x'.repeat(200));
  ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Long inline gap stays inside viewport');
 }
 await scan(pupil,'inline-answer');
 ok(errors.length===0,'No JavaScript errors');
 console.log(JSON.stringify({checks,viewport,theme,axeScans:scans.length,seriousCritical:scans.flatMap(s=>s.violations).length,errors}));
}catch(error){for(const context of contexts)for(const page of context.pages())console.error('PAGE',page.url(),await page.locator('#app').innerText().catch(()=>''));throw error;}
finally{if(browser)await browser.close();if(server)await new Promise(r=>server.close(r));await runtime.dispose();fs.rmSync(temporary,{recursive:true,force:true});}
