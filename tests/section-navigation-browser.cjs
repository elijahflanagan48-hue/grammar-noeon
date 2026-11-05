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
    for(const [width,height] of [[375,812],[1280,800]])for(const theme of ['light','dark']){
      const context=await browser.newContext({viewport:{width,height},colorScheme:theme,serviceWorkers:'block',reducedMotion:'reduce'});
      const page=await context.newPage();page.on('pageerror',e=>{errors.push(e.message);console.log('PAGEERROR',e.message)});
      await page.addInitScript(t=>localStorage.setItem('noeon-theme',t),theme);
      await page.goto(base+'/#grammar');await page.waitForSelector('[data-grammar-section="passive"]');
      assert.equal(await page.locator('[data-grammar-section]').count(),4);
      await page.locator('[data-grammar-section="passive"] a[href="#theory/passive"]').click();
      await page.waitForSelector('.theory-section-nav');
      assert.deepEqual(await page.locator('.theory-nav a').allTextContents(),['Формы','Зачем пассив','Особые конструкции','Практика →']);
      assert((await page.locator('.grammar-breadcrumb').innerText()).includes('Passive Voice'));
      await page.locator('.theory-nav a').filter({hasText:'Зачем пассив'}).click();
      await page.waitForFunction(()=>location.hash.endsWith('/pv-focus')&&document.querySelector('.grammar-breadcrumb [aria-current]').textContent==='Зачем пассив');
      await page.locator('.theory-nav a').filter({hasText:'Особые конструкции'}).click();
      await page.waitForFunction(()=>location.hash.endsWith('/pv-modals')&&document.querySelector('.grammar-breadcrumb [aria-current]').textContent==='Особые конструкции');
      assert(await page.locator('[data-passive-id="pv-modals"]').evaluate(n=>n.open),'Details opened by existing anchor');
      await page.evaluate(()=>scrollTo(0,0));
      assert(await page.locator('.theory-nav').evaluate(n=>n.scrollWidth<=n.clientWidth),'Navigation is not horizontally clipped');
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      await page.evaluate(axe);assert.deepEqual(await page.evaluate(async()=>(await axe.run(document.querySelector('.theory-section-nav'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}})).violations.filter(v=>['serious','critical'].includes(v.impact))),[]);
      if(process.env.GRAMMAR_SCREENSHOT_DIR){fs.mkdirSync(process.env.GRAMMAR_SCREENSHOT_DIR,{recursive:true});await page.screenshot({path:path.join(process.env.GRAMMAR_SCREENSHOT_DIR,`passive-nav-${width}-${theme}.png`),animations:'disabled'});}
      await page.goto(base+'/#theory/comparison/равенство-и-неравенство');await page.waitForSelector('.comparison-rule table');
      assert((await page.locator('.grammar-breadcrumb').innerText()).includes('Конструкции'));
      assert(!await page.locator('.theory-nav').innerText().then(t=>/Present|Past|Пассив/.test(t)));
      await page.goto(base+'/#theory/present');await page.waitForSelector('.theory-content article');
      assert((await page.locator('.grammar-breadcrumb').innerText()).includes('Tenses'));
      assert((await page.locator('.grammar-breadcrumb [aria-current]').innerText()).includes('Present'));
      assert(!await page.locator('.theory-nav').innerText().then(t=>/Сравнения|Пассив/.test(t)));
      await page.locator('.grammar-breadcrumb a[href="#grammar"]').click();await page.waitForSelector('[data-grammar-section="comparison"]');
      checks+=4;await context.close();
    }
    assert.deepEqual(errors,[]);console.log(JSON.stringify({checks,viewports:2,themes:2,accessibility:'4 axe scans, no serious/critical violations',errors}));
  } finally {if(browser)await browser.close();child.kill('SIGTERM');}
})().catch(error=>{console.error(error);process.exitCode=1;});
