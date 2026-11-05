// Real isolated Worker; targeted feedback, reload, report, accessibility and layout.
const {spawn}=require('node:child_process'), {chromium}=require('playwright');
const fs=require('node:fs'), path=require('node:path'), assert=require('node:assert/strict');
(async()=>{
  const child=spawn(process.execPath,['scripts/local-worker.mjs'],{env:{...process.env,GRAMMAR_PORT:'0'},stdio:['ignore','pipe','pipe']});
  let log='', browser, checks=0;const errors=[];
  child.stderr.on('data',c=>log+=c);
  try {
    const base=await new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>reject(Error(log)),30000);
      child.once('exit',code=>{clearTimeout(timer);reject(Error('Local server exit '+code+' '+log));});
      child.stdout.on('data',c=>{log+=c;const match=log.match(/Grammar NOEON: (http:\/\/127\.0\.0\.1:\d+)/);if(match){clearTimeout(timer);resolve(match[1]);}});
    });
    browser=await chromium.launch({headless:true,...(process.env.GRAMMAR_CHROME_PATH?{executablePath:process.env.GRAMMAR_CHROME_PATH}:{})});
    const axe=fs.readFileSync(require.resolve('axe-core/axe.min.js'),'utf8');
    for(const [width,height] of [[375,812],[1280,800]]) for(const theme of ['light','dark']) {
      const context=await browser.newContext({viewport:{width,height},colorScheme:theme,serviceWorkers:'block',reducedMotion:'reduce'});
      const page=await context.newPage();page.setDefaultTimeout(20000);page.on('pageerror',e=>errors.push(e.message));
      await page.addInitScript(t=>localStorage.setItem('noeon-theme',t),theme);
      await page.goto(base+'/#profile');
      await page.fill('#account-email','teacher@example.test');await page.fill('#account-password','FictionalPassword!2026');
      await page.click('#account-login-form button.primary');await page.waitForSelector('#account-logout');
      for(const [id,value,pattern] of [
        ['src-u08-010','celebrates','множественное число'],
        ['ext-20261030-past-simple-ob-019','did not believed','После did'],
        ['pv5-s004','are been washed','нужна форма being'],
        ['src-u07-092','waiting','Пропущен вспомогательный глагол are'],
      ]) {
        await page.goto(base+'/#profile');await page.waitForSelector('#account-logout');
        const workId=await page.evaluate(async id=>{
          const started=await accountRequest('practice/start',{ids:[id]});
          const saved=await accountRequest('practice/'+started.id);
          state.session={items:saved.items,index:0,answers:[],correct:0,checked:false,remote:{id:saved.id,revision:saved.revision}};
          saveSession();location.hash='session';return saved.id;
        },id);
        await page.waitForSelector('#answer-form');
        assert.equal(await page.locator('.error-explanation').count(),0,'No feedback before checking');
        await page.fill('#blank-0',value);await page.click('#answer-form [type=submit]');
        await page.waitForSelector('.error-explanation');assert((await page.locator('.error-explanation').innerText()).includes(pattern));
        assert.equal(await page.locator('.explanation > details > summary').innerText(),'Общее правило');
        assert.equal(await page.locator('.explanation > details').getAttribute('open'),null);
        await page.evaluate(axe);
        const violations=await page.evaluate(async()=>(await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}})).violations.filter(v=>['serious','critical'].includes(v.impact)));
        assert.deepEqual(violations,[],id+' accessibility');
        assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),id+' overflow');
        if(id==='src-u08-010') {
          if(process.env.GRAMMAR_SCREENSHOT_DIR){fs.mkdirSync(process.env.GRAMMAR_SCREENSHOT_DIR,{recursive:true});await page.screenshot({path:path.join(process.env.GRAMMAR_SCREENSHOT_DIR,`americans-${width}-${theme}.png`),animations:'disabled'});}
          await page.reload();await page.waitForSelector('.error-explanation');assert((await page.locator('.error-explanation').innerText()).includes(pattern),'Reload preserves feedback');
          await page.click('#next-question');await page.waitForSelector('.practice-report');
          assert.equal(new URL(page.url()).hash,'#results/'+workId);
          assert((await page.locator('.report-answer .error-explanation').textContent()).includes(pattern),'Report retains feedback');
        }
        checks++;
      }
      await context.close();
    }
    assert.deepEqual(errors,[]);console.log(JSON.stringify({checks,viewports:2,themes:2,accessibility:'16 axe scans, no serious/critical violations',errors}));
  } finally {if(browser)await browser.close();child.kill('SIGTERM');}
})().catch(error=>{console.error(error);process.exitCode=1;});
