// Disposable local Worker/D1 and TEST-ONLY sentences; never the published bank.
const {spawn}=require('node:child_process');
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const child=spawn(process.execPath,['scripts/local-worker.mjs','--passive-v7-fixture'],{env:{...process.env,GRAMMAR_PORT:'0'},stdio:['ignore','pipe','pipe']});
 let log='',browser,checks=0;const errors=[];
 child.stderr.on('data',c=>log+=c);
 try{
  const base=await new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>reject(Error(log)),30000);
   child.on('exit',c=>{clearTimeout(timer);reject(Error('Server '+c+' '+log));});
   child.stdout.on('data',c=>{log+=c;const m=log.match(/Grammar NOEON: (http:\/\/127\.0\.0\.1:\d+)/);if(m){clearTimeout(timer);resolve(m[1]);}});
  });
  browser=await chromium.launch({headless:true,...(process.env.GRAMMAR_CHROME_PATH?{executablePath:process.env.GRAMMAR_CHROME_PATH}:{})});
  for(const width of [360,390,1280]){
   const context=await browser.newContext({viewport:{width,height:900},serviceWorkers:'block',reducedMotion:'reduce'});
   const page=await context.newPage();page.on('pageerror',e=>{errors.push(e.message);console.error('Browser error:',e.message);});
   await page.goto(base+'/#profile');await page.fill('#account-email','teacher@example.test');await page.fill('#account-password','FictionalPassword!2026');
   await page.click('#account-login-form button.primary');await page.waitForSelector('#account-logout');
   await page.goto(base+'/#practice/passive');await page.waitForFunction(()=>Array.isArray(state.exercises));
   const items=await page.evaluate(()=>state.exercises.filter(i=>i.id.startsWith('pv7-')));
   assert.equal(items.length,11);
   assert.equal(await page.locator('[data-section="passive"] [name="tense"]').count(),11);
   const poolIds=await page.evaluate(()=>{const f=document.querySelector('#practice-form');return filteredExercises(f).map(i=>i.id);});
   assert(!poolIds.includes('pv5-s001'),'Retired records excluded from browser picker');
   for(const item of items){
    console.log('Checking',width,item.id,item.type);
    await page.goto(base+'/#practice/passive/pv_'+item.cell);await page.waitForSelector('#practice-form');
    assert.deepEqual(await page.locator('[name="tense"]:checked').evaluateAll(xs=>xs.map(x=>x.value)),['pv_'+item.cell]);
    await page.evaluate(async id=>{
     const item=state.exercises.find(i=>i.id===id),remote=await accountRequest('practice/start',{ids:[id]});
     state.session={items:[item],index:0,answers:[],correct:0,checked:false,remote};location.hash='session';
    },item.id);
    await page.waitForSelector('#answer-form').catch(async error=>{console.error(await page.locator('main').innerText());throw error;});
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No overflow '+item.id+' / '+width);
    assert.equal(await page.locator('.exercise-instruction').count(),1);
    if(item.options){
     assert.equal(await page.locator('.choice-list label').count(),4);
     for(const box of await page.locator('.choice-list label').evaluateAll(xs=>xs.map(x=>x.getBoundingClientRect().height)))assert(box>=44);
    }
    if(item.type==='error_fix')assert.equal(await page.locator('#answer').count(),1);
    if(['error_fix','multiple_choice'].includes(item.type)){
     const dir=process.env.GRAMMAR_SCREENSHOT_DIR;
     if(dir){fs.mkdirSync(dir,{recursive:true});await page.screenshot({path:path.join(dir,`${item.id}-${width}.png`),fullPage:true,animations:'disabled'});}
    }
    // Exercise every rule reference inside the actual practice panel.
    await page.click('#practice-rule');await page.waitForSelector('[data-reference-chapter="passive"]');
    for(const ref of item.rule_refs){const anchor=ref.split('#')[1];assert.equal(await page.locator('[data-passive-id="'+anchor+'"]').count(),1);}
    await page.click('[data-reference-close]');
    if(item.options)await page.locator('.choice-list label').nth(item.correct_option_index).click();
    else if(item.blanks)for(let n=0;n<item.blanks.length;n++)await page.locator('[data-answer-index="'+n+'"]').fill(item.blanks[n].accepted_answers.at(-1));
    else await page.locator('#answer').fill('  '+item.accepted_answers.at(-1).toUpperCase().replaceAll(' ','  ').replace(/\.$/,'')+'  ');
    await page.locator('#answer-form [type="submit"]').click();
    await page.waitForFunction(()=>state.session.checked);
    assert(await page.evaluate(()=>state.session.answers[0].correct),'Worker grades '+item.id);
    checks++;
    if(item.type==='error_fix'){
     assert((await page.locator('#feedback').innerText()).includes(item.answer),'Full correct sentence in feedback');
     const remoteId=await page.evaluate(()=>state.session.remote.id);
     await page.goto(base+'/#results/'+remoteId);await page.waitForSelector('.report-topic h3');
     assert(!(await page.locator('.report-topic h3').innerText()).includes('pv_D'),'Cell name in report');
     assert((await page.locator('.report-review').textContent()).includes(item.answer),'Correct sentence in report');
    }
   }
   // A mixed session preserves every fixture and separates mini-texts.
   await page.evaluate(async()=>{const items=balancedPractice(state.exercises,11),remote=await accountRequest('practice/start',{ids:items.map(i=>i.id)});state.session={items,index:0,answers:[],correct:0,checked:false,remote};location.hash='session';});
   await page.waitForSelector('#answer-form');assert.equal(await page.evaluate(()=>state.session.items.length),11);checks++;
   // Student resumes the immutable retired snapshot seeded before this test.
   await page.goto(base+'/#profile');await page.waitForSelector('#account-logout');await page.click('#account-logout');
   await page.waitForSelector('#account-login-form');await page.fill('#account-email','anna@example.test');await page.fill('#account-password','FictionalPassword!2026');await page.click('#account-login-form button.primary');await page.waitForSelector('#account-logout');
   await page.evaluate(width=>{state.session={remote:{id:'fixture-retired-'+width}};location.hash='session';},width);
   await page.waitForSelector('#answer-form');
   const retired=JSON.parse(fs.readFileSync('data/exercises/part-56.json','utf8')).find(i=>i.id==='pv5-s001');
   await page.locator('[data-answer-index="0"]').fill(retired.blanks[0].answer);
   await page.locator('#answer-form [type="submit"]').click();await page.waitForFunction(()=>state.session.checked);
   assert.equal(await page.evaluate(()=>state.session.answers[0].correct),true);checks++;
   await context.close();
  }
  assert.deepEqual(errors,[]);
  console.log(`Passive v7 browser: ${checks} cell/format/mixed/retired checks at 360, 390 and 1280 px; all anchors and Worker grading verified.`);
 }finally{if(browser)await browser.close();child.kill('SIGTERM');}
})().catch(e=>{console.error(e);process.exitCode=1;});
