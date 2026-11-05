if(process.env.GRAMMAR_TEST_BROWSER!=='1'){console.log('Browser management: run npm run test:browser.');process.exit(0);}
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
const {chromium}=require('playwright');
let server,browser;const contexts=[];let checks=0;const errors=[];
const ok=(value,label)=>{assert(value,label);checks++;console.log('PASS',label);};
try {
 const db=await runtime.getD1Database('DB');await db.batch(sqlStatements(fs.readFileSync(path.join(root,'cloudflare/schema.sql'),'utf8')).map(sql=>db.prepare(sql)));
 const teacher=new Client(),student=new Client(),other=new Client();
 await teacher.ok('auth/setup',{code:'fictional-owner-code',name:'Учитель',email:'teacher@example.test',password:'FictionalPassword!2026'});
 for(const [client,name] of [[student,'anna'],[other,'misha']]){const invite=await teacher.ok('teacher/invite',{});await client.ok('auth/join',{token:invite.token,name,email:name+'@example.test',password:'FictionalPassword!2026'});}
 const sid=(await student.ok('auth/me')).user.id;
 const chosen=fixtures.filter(i=>i.type==='open_brackets'&&i.blanks.length===1&&i.blanks[0].tense_or_construction==='present_simple').slice(0,2);
 const assignment=await teacher.ok(`teacher/students/${sid}/assignments`,{title:'Проверка тем',ids:chosen.map(i=>i.id)});
 await student.ok(`practice/${assignment.practiceId}/check`,{index:0,revision:0,submitted:['wrong']});
 await student.ok(`practice/${assignment.practiceId}/check`,{index:1,revision:1,submitted:[chosen[1].blanks[0].answer]});
 await teacher.ok(`teacher/students/${sid}/assignments`,{title:'Осталось выполнить',ids:[fixtures.at(-1).id]});
 server=http.createServer(async(req,res)=>{try{const chunks=[];for await(const chunk of req)chunks.push(chunk);const headers=new Headers(req.headers);if(headers.get('Origin')==='http://localhost:8802')headers.set('Origin','https://grammar.test');const response=await runtime.dispatchFetch('https://grammar.test'+req.url,{method:req.method,headers,body:['GET','HEAD'].includes(req.method)?undefined:Buffer.concat(chunks)});res.statusCode=response.status;for(const [key,value] of response.headers)res.setHeader(key,key==='set-cookie'?value.replace(/; Secure/g,''):value);res.end(Buffer.from(await response.arrayBuffer()));}catch(error){console.error(error);res.statusCode=500;res.end();}});
 await new Promise(resolve=>server.listen(8802,'127.0.0.1',resolve));
 browser=await chromium.launch({headless:true,...(process.env.GRAMMAR_CHROME_PATH?{executablePath:process.env.GRAMMAR_CHROME_PATH}:{})});
 const viewport=JSON.parse(process.env.GRAMMAR_TEST_VIEWPORT||'{"width":375,"height":812}'),theme=process.env.GRAMMAR_TEST_THEME||'light';
 async function pageFor(address){const context=await browser.newContext({serviceWorkers:'block',viewport,colorScheme:theme});contexts.push(context);const page=await context.newPage();page.setDefaultTimeout(12000);page.on('pageerror',e=>(errors.push(e.message),console.error('PAGEERROR',e.message)));await page.addInitScript(t=>localStorage.setItem('noeon-theme',t),theme);await page.goto('http://localhost:8802/#profile');await page.waitForSelector('#account-login-form');await page.fill('#account-email',address);await page.fill('#account-password','FictionalPassword!2026');await page.click('#account-login-form button.primary');await page.waitForSelector('#account-logout');return page;}
 const teacherPage=await pageFor('teacher@example.test'),studentPage=await pageFor('anna@example.test');
 await teacherPage.goto('http://localhost:8802/#students');await teacherPage.waitForSelector('#student-sort');
 if(process.env.GRAMMAR_SCREENSHOT_DIR){fs.mkdirSync(process.env.GRAMMAR_SCREENSHOT_DIR,{recursive:true});await teacherPage.waitForTimeout(400);await teacherPage.screenshot({path:path.join(process.env.GRAMMAR_SCREENSHOT_DIR,`roster-${viewport.width}-${theme}.png`),fullPage:true,animations:'disabled'});}
 ok(await teacherPage.locator('.student-card').count()===2,'Roster cards render both learners');
 ok((await teacherPage.locator('#active-students').innerText()).includes('Невыполненных назначений: 1'),'Unfinished assignment count visible');
 ok((await teacherPage.locator('#active-students').innerText()).includes('Последняя активность:'),'Activity date visible');
 for(const value of ['activity','accuracy','name']){await teacherPage.selectOption('#student-sort',value);ok(await teacherPage.locator('.student-card').count()===2,'Sorting '+value+' keeps cards');}
 const columns=await teacherPage.locator('.student-card').evaluateAll(nodes=>nodes.map(n=>({width:n.getBoundingClientRect().width,second:n.children[1].getBoundingClientRect().x})));
 ok(columns.every(c=>Math.abs(c.width-columns[0].width)<1&&Math.abs(c.second-columns[0].second)<1),'Identical card columns regardless of email width');
 await teacherPage.locator(`a[href="#student/${sid}"]`).click();await teacherPage.waitForSelector('#student-rename',{state:'attached'});
 await teacherPage.locator('.student-management > summary').click();
 await teacherPage.fill('#student-display-name','Анна <img src=x onerror=alert(1)>');await teacherPage.click('#student-rename button');
 await teacherPage.waitForFunction(()=>document.querySelector('h1')?.textContent.includes('Анна <img'));
 ok(await teacherPage.locator('h1 img').count()===0,'Teacher rename is escaped');
 await teacherPage.waitForSelector('[data-statistics-section="tenses"]');
 await teacherPage.locator('[data-statistics-section="tenses"] > summary').click();
 await teacherPage.click('[data-topic-id="present_simple"]');await teacherPage.waitForSelector('.topic-error');
 ok((await teacherPage.locator('[data-topic-id="present_simple"]').innerText()).includes('50%'),'Teacher topic summary from lightweight history');
 ok((await teacherPage.locator('.topic-error').innerText()).includes('wrong'),'Teacher mistakes load separately');
 const requests=[];studentPage.on('request',r=>requests.push(new URL(r.url()).pathname));
 await studentPage.goto('http://localhost:8802/#results');await studentPage.waitForSelector('[data-statistics-section="tenses"]');await studentPage.locator('[data-statistics-section="tenses"] > summary').click();await studentPage.waitForSelector('[data-topic-id="present_simple"]');await studentPage.click('[data-topic-id="present_simple"]');await studentPage.waitForSelector('.topic-error');
 ok((await studentPage.locator('[data-topic-id="present_simple"]').innerText()).includes('50%'),'Learner topic summary agrees with teacher');
 ok(requests.includes('/api/mistakes'),'Learner requests separate mistakes endpoint');
 ok(!requests.some(path=>path.startsWith('/data/exercises/part-')),'Learner never downloads the bank');
 await teacherPage.locator('.student-management > summary').click();
 await teacherPage.click('#student-active');await teacherPage.waitForSelector('.student-manage-dialog[open]');if(process.env.GRAMMAR_SCREENSHOT_DIR)await teacherPage.screenshot({path:path.join(process.env.GRAMMAR_SCREENSHOT_DIR,`dialog-${viewport.width}-${theme}.png`)});
 await teacherPage.click('.student-manage-dialog [value="cancel"]');
 ok((await teacher.ok(`teacher/students/${sid}`)).user.active,'Cancel dialog preserves access');
 await teacherPage.click('#student-active');await teacherPage.click('.student-manage-dialog [value="disable"]');await teacherPage.waitForFunction(()=>document.querySelector('#student-active')?.textContent==='Включить ученика');
 await teacherPage.goto('http://localhost:8802/#students');await teacherPage.waitForSelector('.student-archive');
 ok(await teacherPage.locator('#active-students .student-card').count()===1,'Disabled learner removed from active list');
 ok(await teacherPage.locator('.student-archive').evaluate(el=>!el.open),'Archive starts collapsed');
 await teacherPage.locator('.student-archive > summary').click();await teacherPage.locator(`#archived-students a[href="#student/${sid}"]`).click();await teacherPage.waitForSelector('#student-active',{state:'attached'});
 await teacherPage.locator('.student-management > summary').click();await teacherPage.click('#student-active');await teacherPage.waitForFunction(()=>document.querySelector('#student-active')?.textContent==='Отключить ученика');
 ok(true,'Re-enable available from archived profile');
 await teacherPage.goto('http://localhost:8802/#students');await teacherPage.waitForSelector('#invite-form',{state:'attached'});await teacherPage.locator('.invite-panel > summary').click();await teacherPage.click('#invite-form button.primary');await teacherPage.waitForSelector('#invite-link');
 const inviteUrl=await teacherPage.inputValue('#invite-link');ok(inviteUrl.includes('/#join/'),'New invitation displayed once');
 await teacherPage.reload();await teacherPage.waitForSelector('[data-revoke-invite]');
 ok(await teacherPage.locator('#invite-link').count()===0,'Invitation link is not redisplayed after reload');
 await teacherPage.click('[data-revoke-invite]');await teacherPage.waitForFunction(()=>document.querySelector('#active-invites')?.textContent.includes('Действующих приглашений нет'));
 ok(true,'Active invitation dates and revoke action work');
 ok(await teacherPage.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow');
 ok(errors.length===0,'No JavaScript errors');
 console.log(JSON.stringify({checks,viewport,theme,errors}));
}catch(error){for(const context of contexts)for(const page of context.pages())console.error('PAGE STATE',await page.locator('#app').innerText());throw error;}finally{if(browser)await browser.close();if(server)await new Promise(r=>server.close(r));await runtime.dispose();fs.rmSync(temporary,{recursive:true,force:true});}
