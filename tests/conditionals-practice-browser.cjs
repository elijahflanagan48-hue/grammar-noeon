// Real Worker/D1 and UI at the requested mobile width and desktop width.
const {spawn}=require('node:child_process'),{chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
  const child=spawn(process.execPath,['scripts/local-worker.mjs'],{env:{...process.env,GRAMMAR_PORT:'0',PATH:path.dirname(process.execPath)+path.delimiter+process.env.PATH},stdio:['ignore','pipe','pipe']});
  let log='',browser,checks=0;const errors=[];
  child.stderr.on('data',c=>log+=c);
  const ok=(v,message)=>{assert(v,message);checks++;};
  const index=JSON.parse(fs.readFileSync('data/exercises/index.json'));
  const bank=index.parts.flatMap(p=>JSON.parse(fs.readFileSync(p.file))).filter(i=>i.topic==='conditionals');
  const keys=new Map(bank.map(i=>[i.id,i]));
  try{
    const base=await new Promise((resolve,reject)=>{
      const t=setTimeout(()=>reject(Error(log)),45000);
      child.once('exit',code=>{clearTimeout(t);reject(Error('Local Worker '+code+'\n'+log));});
      child.stdout.on('data',c=>{log+=c;const m=log.match(/Grammar NOEON: (http:\/\/127\.0\.0\.1:\d+)/);if(m){clearTimeout(t);resolve(m[1]);}});
    });
    browser=await chromium.launch({headless:true,...(process.env.GRAMMAR_CHROME_PATH?{executablePath:process.env.GRAMMAR_CHROME_PATH}:{})});
    for(const width of [390,1280]){
      const context=await browser.newContext({viewport:{width,height:850},serviceWorkers:'block',reducedMotion:'reduce'}),page=await context.newPage();
      page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(20000);
      await page.goto(base+'/#profile');await page.fill('#account-email','teacher@example.test');await page.fill('#account-password','FictionalPassword!2026');
      await page.click('#account-login-form button.primary');await page.waitForSelector('#account-logout');
      await page.goto(base+'/#theory/conditionals');await page.waitForSelector('a.theory-practice[href="#practice/conditionals"]');
      ok(await page.locator('.theory-soon').count()===0,'practice available');
      await page.goto(base+'/#practice/conditionals');await page.waitForSelector('#practice-form');
      ok(await page.locator('[data-section="conditionals"] [name="tense"]').count()===11,'eleven targets');
      for(const type of Object.keys(index.section_types.conditionals)){
        await page.goto(base+'/#practice/conditionals');await page.waitForSelector('#practice-form');await page.waitForFunction(()=>Array.isArray(state.exercises));
        await page.locator('[data-format-action="none"]').click();await page.locator(`[name="format"][value="${type}"]`).check();await page.fill('#count','1');
        await page.locator('#practice-form [type="submit"]').click();await page.waitForSelector('#answer-form');
        const id=await page.evaluate(()=>state.session.items[0].id),item=keys.get(id);
        ok(item&&item.type===type,'selected '+type);
        ok(!(await page.locator('#feedback').textContent()).trim(),'no feedback before answer');
        ok(!(await page.locator('#answer-form').textContent()).includes(item.explanation_ru),'explanation hidden');
        if(item.options)await page.locator(`input[name="choice"][value="${item.correct_option_index}"]`).check();
        else if(type==='error_fix')await page.fill('#answer',item.answer);
        else if(type==='hunt'){
          for(const [n,b]of item.blanks.entries())if(b.answer==='1')await page.locator(`[data-hunt="${n}"]`).click();
        }else if(type==='word_order'){
          let remaining=item.blanks[0].answer;const used=new Set();
          while(remaining){const n=item.blocks.findIndex((b,n)=>!used.has(n)&&(remaining===b||remaining.startsWith(b+' ')));assert(n>=0,id);used.add(n);await page.locator(`[data-word-block="${n}"]`).click();remaining=remaining.slice(item.blocks[n].length).trimStart();}
        }else{
          for(const [n,b]of item.blanks.entries()){
            const input=page.locator(`[data-answer-index="${n}"]`);
            if(['match','sort','bank'].includes(type))await input.selectOption(b.answer);else await input.fill(b.answer);
          }
        }
        await page.waitForFunction(()=>!state.session.draftPending);
        const draft=await page.evaluate(()=>state.session.draft);
        await page.reload();await page.waitForSelector('#answer-form');
        ok(JSON.stringify(await page.evaluate(()=>getSubmitted(state.session.items[0],document.querySelector('#answer-form'))))===JSON.stringify(draft),'draft restored '+type);
        ok(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)),'no horizontal overflow '+width+' '+type);
        await page.click('#answer-form [type="submit"]');await page.waitForSelector('#next-question');
        ok(await page.evaluate(()=>state.session.answers.at(-1).correct),'server graded '+type);
        ok((await page.locator('#feedback').textContent()).includes(item.explanation_ru),'explanation after checking');
        if(type==='hunt')for(const text of Object.values(item.fixes))ok((await page.locator('.hunt-fixes').textContent()).includes(text),'hunt correction');
        ok(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)),'feedback fits '+width);
      }
      await page.goto(base+'/#practice/conditionals/cd_conj_unless');await page.waitForSelector('#practice-form');
      ok(await page.locator('[name="construction"]').inputValue()==='cd_conj_unless','construction deep link');
      await context.close();
    }
    ok(errors.length===0,errors.join('\n'));
    console.log('Conditionals browser: '+checks+' checks passed at 390/1280px.');
  }finally{await browser?.close();child.kill();}
})().catch(error=>{console.error(error);process.exit(1);});
