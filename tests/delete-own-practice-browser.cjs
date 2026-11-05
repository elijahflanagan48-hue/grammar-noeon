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
   const work=await page.evaluate(async()=>{
    const started=await accountRequest('practice/start',{ids:['src-u08-010']});
    const saved=await accountRequest('practice/'+started.id);
    state.session={items:saved.items,index:0,answers:[],correct:0,checked:false,remote:{id:saved.id,revision:saved.revision}};saveSession();
    return started;
   });
   await page.goto(base+'/#results');await page.waitForSelector('[data-delete-own-work="'+work.id+'"]');
   const trigger=page.locator('[data-delete-own-work="'+work.id+'"]');
   assert.equal(await trigger.locator('xpath=ancestor::a').count(),0);checks++;
   await trigger.click();await page.waitForSelector('#delete-own-work-dialog');
   assert(await page.locator('[data-delete-cancel]').evaluate(n=>n===document.activeElement));
   await page.click('[data-delete-cancel]');await page.waitForSelector('#delete-own-work-dialog',{state:'detached'});assert.equal(await page.locator('#delete-own-work-dialog').count(),0);
   assert.equal(await trigger.count(),1);checks+=3;
   await trigger.click();await page.evaluate(axe);
   assert.deepEqual(await page.evaluate(async()=>(await axe.run(document.querySelector('#delete-own-work-dialog'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}})).violations.filter(v=>['serious','critical'].includes(v.impact))),[]);scans++;
   let release,begin;const gate=new Promise(resolve=>release=resolve),started=new Promise(resolve=>begin=resolve);
   await page.route('**/api/practice/*/delete',async route=>{begin();await gate;await route.abort();});
   await page.click('[data-delete-confirm]');await started;
   assert(await page.locator('[data-delete-cancel]').isDisabled());await page.keyboard.press('Escape');assert(await page.locator('#delete-own-work-dialog').isVisible());checks+=2;release();
   await page.waitForFunction(()=>document.querySelector('[data-delete-error]').textContent.length>0);
   assert.equal(await trigger.count(),1);assert((await page.locator('[data-delete-error]').innerText()).includes('Проверьте соединение'));checks+=2;
   await page.unroute('**/api/practice/*/delete');
   if(process.env.GRAMMAR_SCREENSHOT_DIR){fs.mkdirSync(process.env.GRAMMAR_SCREENSHOT_DIR,{recursive:true});await page.screenshot({path:path.join(process.env.GRAMMAR_SCREENSHOT_DIR,`delete-${width}-${theme}.png`)});}
   await page.click('[data-delete-confirm]');await page.waitForFunction(id=>!document.querySelector('[data-delete-own-work="'+id+'"]')&&!document.querySelector('#delete-own-work-dialog'),work.id);
   assert.equal(await page.evaluate(()=>state.session),null);
   assert.equal(await page.evaluate(()=>localStorage.getItem(storageKey('session'))),null);
   assert.equal(await page.evaluate(async id=>(await fetch('/api/practice/'+id)).status,work.id),404);checks+=3;
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await page.evaluate(axe);assert.deepEqual(await page.evaluate(async()=>(await axe.run(document.querySelector('.account-history-pages'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}})).violations.filter(v=>['serious','critical'].includes(v.impact))),[]);scans++;
   if(width===375&&theme==='light'){
    const ids=await page.evaluate(async()=>{const ids=[];for(let n=0;n<26;n++)ids.push((await accountRequest('practice/start',{ids:['src-u08-010']})).id);return ids;});
    await page.reload();await page.waitForSelector('[data-history-more]');await page.click('[data-history-more]');
    await page.waitForSelector('[data-delete-own-work="'+ids[0]+'"]');
    await page.locator('[data-delete-own-work="'+ids[0]+'"]').click();await page.click('[data-delete-confirm]');
    await page.waitForSelector('#delete-own-work-dialog',{state:'detached'});
    assert.equal(await page.evaluate(async id=>(await fetch('/api/practice/'+id)).status,ids[0]),404);checks++;
    await page.evaluate(async ids=>{for(const id of ids.slice(1))await accountRequest('practice/'+id+'/delete',{});},ids);
   }
   await context.close();
  }
  assert.deepEqual(errors,[]);console.log(JSON.stringify({checks,scans,viewports:2,themes:2,errors}));
 }finally{if(browser)await browser.close();child.kill('SIGTERM');}
})().catch(error=>{console.error(error);process.exitCode=1});
