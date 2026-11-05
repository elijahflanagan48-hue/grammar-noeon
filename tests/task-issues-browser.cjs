// Fictional local accounts only: report dialog, immutable context, field focus and teacher queue.
const {spawn}=require('node:child_process'),{chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const child=spawn(process.execPath,['scripts/local-worker.mjs'],{env:{...process.env,GRAMMAR_PORT:'0'},stdio:['ignore','pipe','pipe']});
 let log='',browser,checks=0,scans=0;const errors=[];child.stderr.on('data',c=>log+=c);
 try{
  const base=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error(log)),30000);child.once('exit',code=>{clearTimeout(timer);reject(Error('Local server '+code+' '+log));});child.stdout.on('data',c=>{log+=c;const m=log.match(/Grammar NOEON: (http:\/\/127\.0\.0\.1:\d+)/);if(m){clearTimeout(timer);resolve(m[1]);}});});
  browser=await chromium.launch({headless:true,...(process.env.GRAMMAR_CHROME_PATH?{executablePath:process.env.GRAMMAR_CHROME_PATH}:{})});
  const axe=fs.readFileSync(require.resolve('axe-core/axe.min.js'),'utf8');
  for(const [width,height] of [[375,812],[1280,800]])for(const theme of ['light','dark']){
   const context=await browser.newContext({viewport:{width,height},colorScheme:theme,serviceWorkers:'block',reducedMotion:'reduce'}),page=await context.newPage();
   page.setDefaultTimeout(20000);page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(t=>localStorage.setItem('noeon-theme',t),theme);
   await page.goto(base+'/#profile');await page.fill('#account-email','teacher@example.test');await page.fill('#account-password','FictionalPassword!2026');await page.click('#account-login-form button.primary');await page.waitForSelector('#account-logout');
   await page.evaluate(async()=>{const started=await accountRequest('practice/start',{ids:['src-u08-010']});const saved=await accountRequest('practice/'+started.id);state.session={items:saved.items,index:0,answers:[],correct:0,checked:false,remote:{id:saved.id,revision:saved.revision}};saveSession();location.hash='session';});
   await page.waitForSelector('#answer-form');
   assert.equal(await page.locator('.exercise-instruction-details[open]').count(),0);
   assert.equal(await page.locator('.exercise-card .button.primary:visible').count(),1);
   await page.fill('#blank-0','celebrates');await page.click('#answer-form [type=submit]');await page.waitForSelector('.error-explanation');
   assert.equal(await page.locator('.field-error-fragment mark').innerText(),'celebrates');
   assert.equal(await page.locator('.exercise-card .button.primary:visible').count(),1);
   assert.equal(await page.locator('#answer-form [type=submit]').isVisible(),false);checks+=5;
   await page.evaluate(axe);
   const scan=async selector=>{assert.deepEqual(await page.evaluate(async selector=>(await axe.run(document.querySelector(selector),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}})).violations.filter(v=>['serious','critical'].includes(v.impact)),selector),[]);scans++;};
   await scan('.session');
   const before=await page.evaluate(()=>({index:state.session.index,answers:state.session.answers}));
   await page.click('.task-issue-trigger');await page.waitForSelector('#task-issue-dialog[open]');
   const comment=`Check condition <script>window.issueInjected=true</script> ${width} ${theme}`;
   await page.fill('#task-issue-comment',comment);await scan('#task-issue-dialog');
   await page.route('**/api/task-issues',route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'Временная ошибка'})}));
   await page.click('#task-issue-dialog [type=submit]');await page.waitForFunction(()=>document.querySelector('#task-issue-status').textContent==='Временная ошибка');
   assert.equal(await page.inputValue('#task-issue-comment'),comment,'Failed submission preserves comment');
   await page.unroute('**/api/task-issues');await page.click('#task-issue-dialog [type=submit]');
   await page.waitForFunction(()=>document.querySelector('#task-issue-status').textContent==='Сообщение передано преподавателю.');
   assert.deepEqual(await page.evaluate(()=>({index:state.session.index,answers:state.session.answers})),before,'Report leaves answer/progress untouched');
   await page.click('#task-issue-dialog [data-issue-close]');checks+=2;
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   if(process.env.GRAMMAR_SCREENSHOT_DIR){fs.mkdirSync(process.env.GRAMMAR_SCREENSHOT_DIR,{recursive:true});await page.screenshot({path:path.join(process.env.GRAMMAR_SCREENSHOT_DIR,`exercise-${width}-${theme}.png`),animations:'disabled'});}
   await page.goto(base+'/#task-issues');await page.waitForSelector('[data-resolve-task-issue]');
   assert((await page.locator('.task-issue-list').innerText()).includes(comment));
   assert((await page.locator('.task-issue-list').innerText()).includes('src-u08-010'));
   assert.equal(await page.evaluate(()=>!!window.issueInjected),false);await scan('.reading');
   await page.locator('[data-resolve-task-issue]').first().click();await page.waitForFunction(()=>document.querySelector('.task-issue-list').textContent.includes('Новых сообщений нет'));
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));checks+=4;
   await context.close();
  }
  // Report from an unanswered fixed test uses the exact server-side test snapshot.
  const context=await browser.newContext({serviceWorkers:'block'}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/#profile');await page.fill('#account-email','teacher@example.test');await page.fill('#account-password','FictionalPassword!2026');await page.click('#account-login-form button.primary');await page.waitForSelector('#account-logout');
  const work=await page.evaluate(async()=>{const roster=await accountRequest('teacher/students'),student=roster.students.find(s=>s.email==='anna@example.test');return accountRequest('tests/tenses-1/assign',{studentId:student.id});});
  await page.click('#account-logout');await page.waitForSelector('#account-email');await page.fill('#account-email','anna@example.test');await page.fill('#account-password','FictionalPassword!2026');await page.click('#account-login-form button.primary');await page.waitForSelector('#account-logout');
  await page.goto(base+'/#test-attempt/'+work.id);await page.waitForSelector('#assessment-form');
  assert.equal(await page.locator('#assessment-form .task-issue-trigger').count(),25);
  await page.locator('#assessment-form .task-issue-trigger').nth(1).click();await page.fill('#task-issue-comment','The second question needs clarification.');await page.click('#task-issue-dialog [type=submit]');await page.waitForFunction(()=>document.querySelector('#task-issue-status').textContent==='Сообщение передано преподавателю.');
  assert.equal(await page.locator('#assessment-form fieldset').count(),25);checks+=2;
  await context.close();assert.deepEqual(errors,[]);console.log(JSON.stringify({checks,scans,viewports:2,themes:2,errors}));
 }finally{if(browser)await browser.close();child.kill('SIGTERM');}
})().catch(error=>{console.error(error);process.exitCode=1});
