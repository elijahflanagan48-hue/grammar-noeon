// Local fictional accounts only: advanced filters, trusted grading and assignment preview.
const {spawn}=require('node:child_process');
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const child=spawn(process.execPath,['scripts/local-worker.mjs'],{env:{...process.env,GRAMMAR_PORT:'0'},stdio:['ignore','pipe','pipe']});
 let browser,log='',scans=0,checks=0;const errors=[];
 child.stderr.on('data',c=>log+=c);
 const base=await new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>reject(Error('Preview timeout: '+log)),30000);
  child.once('exit',code=>{clearTimeout(timer);reject(Error('Preview exited: '+code+' '+log));});
  child.stdout.on('data',c=>{log+=c;const m=log.match(/Grammar NOEON: (http:\/\/127\.0\.0\.1:\d+)/);if(m){clearTimeout(timer);resolve(m[1]);}});
 });
 try{
  browser=await chromium.launch({headless:true,...(process.env.GRAMMAR_CHROME_PATH?{executablePath:process.env.GRAMMAR_CHROME_PATH}:{})});
  const axe=fs.readFileSync(require.resolve('axe-core/axe.min.js'),'utf8');
  for(const [width,height] of [[375,812],[1280,800]])for(const theme of ['light','dark']){
   const context=await browser.newContext({viewport:{width,height},colorScheme:theme,serviceWorkers:'block',reducedMotion:'reduce'});
   const page=await context.newPage();page.setDefaultTimeout(20000);page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(t=>localStorage.setItem('noeon-theme',t),theme);
   await page.goto(base+'/#profile');await page.fill('#account-email','teacher@example.test');await page.fill('#account-password','FictionalPassword!2026');await page.click('#account-login-form button.primary');await page.waitForSelector('#account-logout');
   async function scan(label){
    await page.evaluate(axe);
    const bad=await page.evaluate(async()=> (await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}})).violations.filter(v=>['serious','critical'].includes(v.impact)));
    assert.deepEqual(bad,[],label);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),label+': overflow');scans++;
    if(process.env.GRAMMAR_SCREENSHOT_DIR){fs.mkdirSync(process.env.GRAMMAR_SCREENSHOT_DIR,{recursive:true});await page.screenshot({path:path.join(process.env.GRAMMAR_SCREENSHOT_DIR,`${label}-${width}-${theme}.png`),fullPage:true,animations:'disabled'});}
   }
   async function filters(route,count){
    await page.goto(base+'/#'+route);
    // Saved teacher drafts reopen as a preview; use the public settings action.
    await page.waitForFunction(()=>{const form=document.querySelector('#practice-form');return form&&!form.inert&&(document.querySelector('#assignment-preview')||!form.querySelector('[type=submit]').disabled);});
    if(await page.locator('#assignment-preview').count())await page.click('#preview-settings');
    await page.waitForSelector('#practice-form');
    await page.click('[data-level-action="none"]');await page.check('[name="level"][value="advanced"]');
    await page.click('[data-format-action="none"]');await page.check('[name="format"][value="open_brackets"]');await page.fill('#count',count);
    await page.waitForFunction(()=>filteredExercises(document.querySelector('#practice-form')).length===300);
    assert((await page.locator('#available').innerText()).includes('300'));
    assert.equal(await page.locator('[name="level"][value="advanced"]').isDisabled(),false);
   }
   await filters('practice/comparison','5');await scan('advanced-filters');
   await page.click('#practice-form [type="submit"]');await page.waitForSelector('#answer-form');
   const selected=await page.evaluate(()=>state.session.items.map(i=>({id:i.id,level:i.level,type:i.type,target:exerciseTenses(i)[0]})));
   assert.equal(selected.length,5);assert(selected.every(i=>/^cmp-(adv|pro)-/.test(i.id)&&i.level==='advanced'&&i.type==='open_brackets'));assert.equal(new Set(selected.map(i=>i.target)).size,5);checks++;
   // Exercise with the current two independent adjective fields, through the real local API.
   await page.evaluate(async()=>{
    const item=state.exercises.find(i=>i.id==='cmp-adv-20261101-047');
    const remote=await accountRequest('practice/start',{ids:[item.id]});
    state.session={items:[item],index:0,answers:[],correct:0,checked:false,remote};renderSession();
   });
   await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   const inputs=page.locator('#answer-form [data-answer-index]');assert.equal(await inputs.count(),2);assert.equal(await page.locator('#feedback').innerText(),'');
   for(const [n,value] of ['less well-off','most stringent'].entries())await inputs.nth(n).fill(value);
   await scan('advanced-four-fields');await page.click('#answer-form [type="submit"]');await page.waitForSelector('#next-question');
   assert(await page.evaluate(()=>state.session.answers[0].correct));assert(await page.evaluate(()=>state.session.answers[0].fields.every(f=>f.verified)));assert((await page.locator('#feedback').innerText()).includes('Основной ответ: less well-off'));
   await scan('advanced-checked');checks++;
   const roster=await (await context.request.get(base+'/api/teacher/students')).json();
   await filters('assign/'+roster.students[0].id+'/comparison','50');
   await page.click('#practice-form [type="submit"]');await page.waitForSelector('#assignment-preview');
   const ids=await page.locator('#assignment-preview-items [data-preview-id]').evaluateAll(ns=>ns.map(n=>n.dataset.previewId));
   assert.equal(ids.length,50);assert.equal(new Set(ids).size,50);assert(ids.every(id=>/^cmp-(adv|pro)-/.test(id)));await scan('advanced-assignment');checks++;
   await context.close();
  }
  assert.deepEqual(errors,[]);console.log(JSON.stringify({checks,scans,errors,viewports:2,themes:2}));
 }finally{if(browser)await browser.close();child.kill('SIGTERM');}
})().catch(e=>{console.error(e);process.exitCode=1;});
