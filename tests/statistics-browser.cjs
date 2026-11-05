// Isolated Worker, fictional accounts; no production data.
const {spawn}=require('node:child_process'),{chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const child=spawn(process.execPath,['scripts/local-worker.mjs'],{env:{...process.env,GRAMMAR_PORT:'0'},stdio:['ignore','pipe','pipe']});
 let log='',browser,checks=0;const errors=[];
 child.stderr.on('data',c=>log+=c);
 try {
  const base=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error(log)),30000);child.once('exit',code=>{clearTimeout(timer);reject(Error('Server '+code+' '+log));});child.stdout.on('data',c=>{log+=c;const m=log.match(/Grammar NOEON: (http:\/\/127\.0\.0\.1:\d+)/);if(m){clearTimeout(timer);resolve(m[1]);}});});
  browser=await chromium.launch({headless:true,...(process.env.GRAMMAR_CHROME_PATH?{executablePath:process.env.GRAMMAR_CHROME_PATH}:{})});
  const axe=fs.readFileSync(require.resolve('axe-core/axe.min.js'),'utf8');
  const bank=JSON.parse(fs.readFileSync('cloudflare/generated/bank.json'));
  const item=bank.find(i=>i.type==='open_brackets'&&i.blanks?.length===1&&i.blanks[0].tense_or_construction==='present_simple');
  let seeded=false;
  for(const width of [375,1280])for(const theme of ['light','dark']){
   const settings={viewport:{width,height:812},colorScheme:theme,serviceWorkers:'block',reducedMotion:'reduce'};
   const context=await browser.newContext(settings),sc=await browser.newContext(settings);
   async function login(ctx,email){const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(t=>localStorage.setItem('noeon-theme',t),theme);await page.goto(base+'/#profile');await page.fill('#account-email',email);await page.fill('#account-password','FictionalPassword!2026');await page.click('#account-login-form button.primary');await page.waitForSelector('#account-logout');return page;}
   const teacher=await login(context,'teacher@example.test'),student=await login(sc,'anna@example.test');
   await student.waitForFunction(()=>document.querySelectorAll('.statistics-section').length===4);
   assert.equal(await student.locator('[data-statistics-section="modals"]').count(),1);checks++;
   assert.equal(await student.locator('.statistics-section[open]').count(),0);
   assert.equal(await student.locator('.statistics-section [data-topic-id]').count(),0);
   assert((await student.locator('#all-time-topics').innerText()).includes('Статистика появится после первой завершённой работы'));checks+=3;
   const denied=await student.evaluate(async()=>({other:(await fetch('/api/teacher/students/missing/statistics')).status}));assert.equal(denied.other,403);checks++;
   if(!seeded){
    await teacher.evaluate(async item=>{
      for(let n=0;n<31;n++){
       const start=await accountRequest('practice/start',{ids:[item.id]});
       await accountRequest('practice/'+start.id+'/check',{index:0,revision:0,submitted:[n===30?'wrong':item.blanks[0].answer]});
      }
      const test=await accountRequest('tests/tenses-1'),started=await accountRequest('tests/tenses-1/start',{});
      await accountRequest('test-attempts/'+started.id+'/submit',{revision:0,responses:test.items.map(i=>i.options?null:['']),allowIncomplete:true});
    },item);seeded=true;
   }
   const roster=await teacher.evaluate(()=>accountRequest('teacher/students')),pupil=roster.students.find(s=>s.email==='anna@example.test');
   await teacher.goto(base+'/#student/'+pupil.id);await teacher.waitForFunction(()=>document.querySelectorAll('.statistics-section').length===4);
   assert.equal(await teacher.locator('.statistics-section[open]').count(),0);
   assert.equal(await teacher.locator('.statistics-section [data-topic-id]').count(),0);checks+=2;
   await teacher.goto(base+'/#results');await teacher.waitForFunction(()=>document.querySelectorAll('.statistics-section').length===4);
   const stats=await teacher.evaluate(()=>accountRequest('statistics'));
   assert.equal(stats.kinds.practice.sessions,31);assert.equal(stats.kinds.practice.checked,31);assert.equal(stats.kinds.practice.correct,30);
   assert.equal(stats.kinds.assessment.sessions,1);assert.equal(stats.kinds.assessment.checked,25);assert.equal(stats.kinds.assessment.correct,0);checks+=6;
   const before=await teacher.locator('#all-time-topics').innerHTML();
   await teacher.locator('[data-history-more]').click();await teacher.waitForFunction(()=>!document.querySelector('[data-history-more]'));
   assert.equal(await teacher.locator('#all-time-topics').innerHTML(),before,'Loading remaining history does not change statistics');checks++;
   await teacher.locator('[data-statistics-section="tenses"] summary').click();
   assert.equal(await teacher.locator('[data-statistics-section="tenses"] [data-statistics-kind="practice"]').count(),1);
   assert(await teacher.locator('[data-statistics-section="tenses"] [data-statistics-kind="assessment"]').count()>0);
   await teacher.locator('[data-statistics-section="tenses"] [data-statistics-kind="practice"]').click();
   await teacher.waitForFunction(()=>document.querySelector('#topic-errors')?.textContent.includes('wrong'));
   assert((await teacher.locator('#topic-errors').innerText()).includes('Тренировки'));checks+=3;
   await teacher.evaluate(axe);
   assert.deepEqual(await teacher.evaluate(async()=>(await axe.run(document.querySelector('#all-time-topics'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}})).violations.filter(v=>['serious','critical'].includes(v.impact))),[]);
   assert(await teacher.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));checks++;
   if(process.env.GRAMMAR_SCREENSHOT_DIR){fs.mkdirSync(process.env.GRAMMAR_SCREENSHOT_DIR,{recursive:true});await teacher.screenshot({path:path.join(process.env.GRAMMAR_SCREENSHOT_DIR,`statistics-${width}-${theme}.png`)});}
   await context.close();await sc.close();
  }
  assert.deepEqual(errors,[]);console.log(JSON.stringify({checks,viewports:2,themes:2,axe:4,errors}));
 }finally{if(browser)await browser.close();child.kill('SIGTERM');}
})().catch(e=>{console.error(e);process.exitCode=1});
