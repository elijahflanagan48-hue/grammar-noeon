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
   await page.goto(base+'/#grammar/comparison');await page.getByRole('link',{name:'Проверочные тесты →',exact:true}).click();await page.waitForSelector('[data-test-start="comparison-1"]');assert.equal(await page.locator('[data-test-start]').count(),5);await scan('catalog');
   for(let t=1;t<=5;t++){
    await page.goto(base+'/#test-preview/comparison-'+t);await page.waitForSelector('.assessment-question');assert.equal(await page.locator('.assessment-question').count(),25);assert.equal(await page.locator('.assessment-question input[type=radio]').count(),40);await scan('preview-'+t);checks++;
   }
   await page.goto(base+'/#tests/comparison');await page.click('[data-test-start="comparison-1"]');await page.waitForSelector('#assessment-form');
   const tests=JSON.parse(fs.readFileSync('content/assessments/comparison.json','utf8')),items=tests[0].items;
   async function fill(n){const i=items[n];if(i.options)await page.check(`[name="test-${n}"][value="${i.correct_option_index}"]`);else await page.fill(`[name="test-${n}"]`,i.blanks[0].answer);}
   for(let n=0;n<3;n++)await fill(n);
   const save=page.waitForResponse(r=>r.url().includes('/draft')&&r.request().method()==='POST');await page.click('#test-save');assert.equal((await save).status(),200);await page.reload();await page.waitForSelector('#assessment-form');
   for(let n=0;n<3;n++){const i=items[n];if(i.options)assert(await page.isChecked(`[name="test-${n}"][value="${i.correct_option_index}"]`));else assert.equal(await page.inputValue(`[name="test-${n}"]`),i.blanks[0].answer);}
   assert.equal(await page.locator('.practice-report').count(),0);assert.equal(await page.locator('#feedback').count(),0);await page.evaluate(()=>scrollTo(0,0));await scan('draft-restored');checks++;
   await page.click('#assessment-form [type=submit]');await page.waitForSelector('.assessment-confirm[open]');assert((await page.locator('.assessment-confirm').innerText()).includes('22 из 25'));await scan('partial-confirm');await page.click('[data-test-return]');assert.equal(await page.locator('.assessment-confirm').count(),0);assert.equal(await page.inputValue('[name="test-0"]'),items[0].blanks[0].answer);checks++;
   for(let n=0;n<25;n++)await fill(n);
   const before=await page.evaluate(async()=>{const id=location.hash.split('/')[1];return accountRequest('test-attempts/'+id);});assert(!before.completed);assert(!('attempt'in before));assert(before.items.every(i=>!('correct_option_index'in i)&&!('answer_text'in i)));
   await page.click('#assessment-form [type=submit]');await page.waitForSelector('.practice-report');assert((await page.locator('.report-metrics').innerText()).includes('Баллов: 25 из 25'));await scan('complete');checks++;
   await page.reload();await page.waitForSelector('.practice-report');assert((await page.locator('.report-metrics').innerText()).includes('Баллов: 25 из 25'));checks++;
   await page.goto(base+'/#tests/comparison');await page.click('[data-test-start="comparison-2"]');await page.waitForSelector('#assessment-form');await page.click('#assessment-form [type=submit]');await page.waitForSelector('.assessment-confirm[open]');assert((await page.locator('.assessment-confirm').innerText()).includes('25 из 25'));await page.click('[data-test-finish]');await page.waitForSelector('.practice-report');assert((await page.locator('.report-metrics').innerText()).includes('Баллов: 0 из 25'));checks++;
   await context.close();

  }
  assert.deepEqual(errors,[]);console.log(JSON.stringify({checks,scans,errors,viewports:2,themes:2,levels:3,fixedForms:5,draftRestored:true,deferredScore:true,completedScore:25,blankScore:0,incompleteConfirmation:true}));
 }finally{if(browser)await browser.close();child.kill('SIGTERM');}
})().catch(e=>{console.error(e);process.exitCode=1;});
