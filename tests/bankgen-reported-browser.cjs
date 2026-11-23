// Actual approved bank in a disposable Worker/D1; no production credentials or data.
const {spawn}=require('node:child_process'), {chromium}=require('playwright');
const fs=require('node:fs'), assert=require('node:assert/strict');
(async()=>{
 const child=spawn(process.execPath,['scripts/local-worker.mjs'],{env:{...process.env,GRAMMAR_PORT:'0'},stdio:['ignore','pipe','pipe']});
 let log='',browser,checks=0; const errors=[];
 child.stderr.on('data',c=>log+=c);
 try {
  const base=await new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>reject(Error(log)),30000);
   child.once('exit',code=>{clearTimeout(timer);reject(Error('Local server '+code+': '+log));});
   child.stdout.on('data',c=>{log+=c;const match=log.match(/Grammar NOEON: (http:\/\/127\.0\.0\.1:\d+)/);if(match){clearTimeout(timer);resolve(match[1]);}});
  });
  browser=await chromium.launch({headless:true,...(process.env.GRAMMAR_CHROME_PATH?{executablePath:process.env.GRAMMAR_CHROME_PATH}:{})});
  const manifest=JSON.parse(fs.readFileSync('data/exercises/index.json'));
  const bank=manifest.parts.flatMap(p=>JSON.parse(fs.readFileSync(p.file))).filter(i=>i.topic==='reported'&&!i.retired);
  const samples=['gap','mini','mc','fix','which','transform'].map(format=>bank.find(i=>i.bankgen_format===format));
  for(const width of [390,1280]){
   const context=await browser.newContext({viewport:{width,height:850},serviceWorkers:'block',reducedMotion:'reduce'}),page=await context.newPage();
   page.on('pageerror',error=>errors.push(error.message));
   await page.goto(base+'/#profile');await page.fill('#account-email','teacher@example.test');await page.fill('#account-password','FictionalPassword!2026');
   await page.click('#account-login-form button.primary');await page.waitForSelector('#account-logout');
   await page.goto(base+'/#practice/reported');await page.waitForFunction(()=>Array.isArray(state.exercises));
   assert.equal(await page.locator('[data-section="reported"] [name="tense"]').count(),30);checks++;
   assert(await page.evaluate(()=>filteredExercises(document.querySelector('#practice-form')).every(i=>!i.retired)));checks++;
   await page.goto(base+'/#practice/reported/rs09');await page.waitForSelector('#practice-form');
   assert.deepEqual(await page.locator('[data-section="reported"] [name="tense"]:checked').evaluateAll(xs=>xs.map(x=>x.value)),['rp_question_yesno']);checks++;
   for(const item of samples){
    await page.evaluate(async id=>{const item=state.exercises.find(i=>i.id===id),remote=await accountRequest('practice/start',{ids:[id]});state.session={items:[item],index:0,answers:[],correct:0,checked:false,remote};location.hash='session';},item.id);
    await page.waitForSelector('#answer-form');
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),item.id+' overflow at '+width);checks++;
    assert.equal(await page.locator('.exercise-instruction').count(),1);checks++;
    if(item.options)await page.locator('#answer-form input[type="radio"][value="'+item.correct_option_index+'"]').check();
    else if(item.blanks)for(let n=0;n<item.blanks.length;n++)await page.locator('[data-answer-index="'+n+'"]').fill(item.blanks[n].accepted_answers.at(-1));
    else await page.locator('#answer').fill(item.accepted_answers.at(-1));
    await page.locator('#answer-form [type="submit"]').click();await page.waitForSelector('#next-question');
    assert(await page.evaluate(()=>state.session.answers.at(-1).correct),item.id+' server grade');checks++;
    assert(await page.locator('[data-rule-ref], a[href*="#theory/reported"]').count()>0);checks++;
    await page.goto(base+'/#practice/reported');await page.waitForSelector('#practice-form');
   }
   await context.close();
  }
  assert.deepEqual(errors,[]);
  console.log(`Reported browser: ${checks} checks, six formats, 390/1280, real Worker grading.`);
 } finally {await browser?.close();child.kill();}
})().catch(error=>{console.error(error);process.exit(1);});
