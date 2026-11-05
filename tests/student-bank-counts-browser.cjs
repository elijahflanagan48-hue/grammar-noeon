// Real local Worker, fictional accounts, whole-phrase grading, learner privacy and layout.
const {spawn}=require('node:child_process'),{chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const child=spawn(process.execPath,['scripts/local-worker.mjs'],{env:{...process.env,GRAMMAR_PORT:'0'},stdio:['ignore','pipe','pipe']});
 let browser,assignedPractice,log='',scans=0,checks=0;const errors=[];child.stderr.on('data',c=>log+=c);
 const base=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error(log)),30000);child.once('exit',c=>{clearTimeout(timer);reject(Error('Server exit '+c+' '+log));});child.stdout.on('data',c=>{log+=c;const m=log.match(/Grammar NOEON: (http:\/\/127\.0\.0\.1:\d+)/);if(m){clearTimeout(timer);resolve(m[1]);}});});
 try{
  browser=await chromium.launch({headless:true,...(process.env.GRAMMAR_CHROME_PATH?{executablePath:process.env.GRAMMAR_CHROME_PATH}:{})});const axe=fs.readFileSync(require.resolve('axe-core/axe.min.js'),'utf8');
  for(const [width,height]of [[375,812],[1280,800]])for(const theme of ['light','dark']){
   const context=await browser.newContext({viewport:{width,height},colorScheme:theme,serviceWorkers:'block',reducedMotion:'reduce'}),page=await context.newPage();page.setDefaultTimeout(20000);page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(t=>localStorage.setItem('noeon-theme',t),theme);
   await page.goto(base+'/#profile');await page.fill('#account-email','teacher@example.test');await page.fill('#account-password','FictionalPassword!2026');await page.click('#account-login-form button.primary');await page.waitForSelector('#account-logout');
   async function scan(label){await page.evaluate(axe);const bad=await page.evaluate(async()=>(await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}})).violations.filter(v=>['serious','critical'].includes(v.impact)));assert.deepEqual(bad,[],label);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),label+' overflow');scans++;if(process.env.GRAMMAR_SCREENSHOT_DIR){fs.mkdirSync(process.env.GRAMMAR_SCREENSHOT_DIR,{recursive:true});await page.screenshot({path:path.join(process.env.GRAMMAR_SCREENSHOT_DIR,`${label}-${width}-${theme}.png`),fullPage:false,animations:'disabled'});}}
   await page.goto(base+'/#practice/comparison');await page.waitForSelector('#practice-form');await page.waitForFunction(()=>document.querySelector('#available')?.textContent.startsWith('Доступно'));
   assert((await page.locator('.practice-formats').innerText()).match(/ · \d+/),'Teacher keeps bank counts');
   // Frontend role fixtures only. No student login, permissions API or practice creation.
   for(const topic of ['comparison','tenses']){
    await page.evaluate(topic=>{
     account.user={id:'ui-fixture-only',role:'student',name:'UI fixture'};
     accountRequest=async route=>{if(route!=='practice/preview')throw Error('Unexpected request: '+route);return{canStart:true,size:20,missing:[],coverage:topic==='tenses'?13:5};};
     renderPractice(null,topic,true);
    },topic);
    await page.waitForFunction(()=>document.querySelector('#available')?.textContent.startsWith('В тренировке:'));
    assert(!(await page.locator('body').innerText()).includes('Доступно'));
    assert(!(await page.locator('.practice-formats').innerText()).match(/ · \d+/));
    assert(!(await page.locator('.practice-levels').innerText()).match(/ · \d+/));
    assert((await page.locator('#available').innerText()).includes('20'));
    await scan('student-'+topic);checks++;
   }
   await context.close();

  }
  assert.deepEqual(errors,[]);console.log(JSON.stringify({checks,scans,errors,viewports:2,themes:2,levels:3,studentPoolCountsHidden:true,teacherCountsPreserved:true}));
 }finally{if(browser)await browser.close();child.kill('SIGTERM');}
})().catch(e=>{console.error(e);process.exitCode=1;});
