// Isolated local Worker/D1: Infinitive · -ing practice form, a real session and server grading.
const {spawn}=require('node:child_process'),{chromium}=require('playwright');
const path=require('node:path'),fsx=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const child=spawn(process.execPath,['scripts/local-worker.mjs'],{env:{...process.env,PATH:path.dirname(process.execPath)+path.delimiter+(process.env.PATH||''),GRAMMAR_PORT:'0'},stdio:['ignore','pipe','pipe']});
 let log='',browser,checks=0;const errors=[];child.stderr.on('data',c=>log+=c);
 const ok=(v,l)=>{assert(v,l);checks++;};
 const keys=new Map(JSON.parse(fsx.readFileSync('data/exercises/index.json')).parts.flatMap(p=>JSON.parse(fsx.readFileSync(p.file))).map(i=>[i.id,i]));
 try{
  const base=await new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(Error(log)),45000);child.once('exit',code=>{clearTimeout(t);reject(Error('Local server '+code+' '+log));});child.stdout.on('data',c=>{log+=c;const m=log.match(/Grammar NOEON: (http:\/\/127\.0\.0\.1:\d+)/);if(m){clearTimeout(t);resolve(m[1]);}});});
  browser=await chromium.launch({headless:true,...(process.env.GRAMMAR_CHROME_PATH?{executablePath:process.env.GRAMMAR_CHROME_PATH}:{})});
  for(const width of [360,1280]){
   const context=await browser.newContext({viewport:{width,height:850},serviceWorkers:'block',reducedMotion:'reduce'}),page=await context.newPage();
   page.setDefaultTimeout(20000);page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+'/#profile');await page.fill('#account-email','teacher@example.test');await page.fill('#account-password','FictionalPassword!2026');await page.click('#account-login-form button.primary');await page.waitForSelector('#account-logout');
   await page.goto(base+'/#theory/infinitive');await page.waitForSelector('a.theory-practice[href="#practice/infinitive"]');ok(await page.locator('.theory-soon').count()===0,'no soon note');
   await page.goto(base+'/#practice/infinitive');await page.waitForSelector('#practice-form');
   const fs=page.locator('fieldset[data-section="infinitive"]');await fs.waitFor();
   ok(await fs.locator('input[name="tense"]').count()===9,'nine targets');
   ok(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)),'no horizontal overflow at '+width);
   await page.waitForFunction(()=>Array.isArray(state.exercises));
   for(const type of ['open_brackets','multiple_choice']){
    await page.goto(base+'/#practice/infinitive');await page.waitForSelector('#practice-form');await page.waitForFunction(()=>Array.isArray(state.exercises));
    await page.locator('[data-format-action="none"]').click();await page.locator('input[name="format"][value="'+type+'"]').check();await page.fill('#count','1');
    await page.locator('#practice-form [type="submit"]').click();await page.waitForSelector('#answer-form');
    const id=await page.evaluate(()=>state.session.items[0].id),item=keys.get(id);ok(item&&item.topic==='infinitive'&&item.type===type,'server starts '+type+' '+id);
    if(item.options){await page.locator('#answer-form input[type="radio"]').nth(item.correct_option_index).check();}
    else{const inputs=page.locator('#answer-form input[type="text"], #answer-form input:not([type]), #answer-form textarea');ok(await inputs.count()===item.blanks.length,'one field per blank');for(let i=0;i<item.blanks.length;i++)await inputs.nth(i).fill(item.blanks[i].answer);}
    await page.click('#answer-form [type="submit"]');await page.waitForSelector('#next-question');
    ok(await page.evaluate(()=>state.session.answers.at(-1).correct),'server grades canonical answer correct: '+id);
    ok(await page.locator('[data-rule-ref], a[href*="#theory/infinitive"]').count()>0,'rule link after checking');
    ok(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)),'no overflow in session at '+width);
   }
   await context.close();
  }
  ok(errors.length===0,'page errors: '+errors.join('; '));
  console.log('Infinitive practice browser: '+checks+' checks passed (360/1280, form, 9 targets, real session).');
 }finally{await browser?.close();child.kill();}
})().catch(e=>{console.error(e);process.exit(1);});
