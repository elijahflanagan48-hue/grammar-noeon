// Isolated real Worker/D1, fictional teacher and learner; never production.
const {spawn}=require('node:child_process');
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const child=spawn(process.execPath,['scripts/local-worker.mjs'],{env:{...process.env,GRAMMAR_PORT:'0'},stdio:['ignore','pipe','pipe']});
 let browser,log='',checks=0,scans=0;const errors=[];
 child.stderr.on('data',c=>log+=c);
 try {
  const base=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error(log)),30000);child.on('exit',c=>{clearTimeout(timer);reject(Error('Server '+c+log));});child.stdout.on('data',c=>{log+=c;const m=log.match(/Grammar NOEON: (http:\/\/127\.0\.0\.1:\d+)/);if(m){clearTimeout(timer);resolve(m[1]);}});});
  browser=await chromium.launch({headless:true,...(process.env.GRAMMAR_CHROME_PATH?{executablePath:process.env.GRAMMAR_CHROME_PATH}:{})});
  const axe=fs.readFileSync(require.resolve('axe-core/axe.min.js'),'utf8');
  for(const width of [375,1280])for(const theme of ['light','dark']) {
   const context=await browser.newContext({viewport:{width,height:850},serviceWorkers:'block',reducedMotion:'reduce'});
   const page=await context.newPage();page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(t=>localStorage.setItem('noeon-theme',t),theme);
   async function login(email){await page.goto(base+'/#profile');await page.fill('#account-email',email);await page.fill('#account-password','FictionalPassword!2026');await page.click('#account-login-form button.primary');await page.waitForSelector('#account-logout');}
   async function scan(label){await page.evaluate(axe);assert.deepEqual(await page.evaluate(async()=>(await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}})).violations.filter(v=>['serious','critical'].includes(v.impact))),[],label);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),label+' overflow');scans++;}
   await login('teacher@example.test');
   for(const topic of ['tenses','comparison']) {
    await page.goto(base+'/#practice/'+topic);await page.waitForSelector('#practice-form');await page.waitForFunction(()=>Array.isArray(state.exercises));
    await page.evaluate(async topic=>{const items=state.exercises.filter(i=>i.type==='open_brackets'&&i.id.startsWith('cmp-')===(topic==='comparison')).slice(0,2);const remote=await accountRequest('practice/start',{ids:items.map(i=>i.id)});state.session={items,index:0,answers:[],correct:0,checked:false,remote};location.hash='session';},topic);
    await page.waitForSelector('#practice-rule');
    const input=page.locator('#answer-form input[data-answer-index]').first();await input.fill('my draft');
    await page.click('#practice-rule');await page.waitForSelector('#practice-reference article');
    assert.equal(await page.locator('#reference-section').inputValue(),topic==='comparison'?'comparison':'tenses');
    assert.equal(await page.evaluate(()=>document.querySelector('#practice-reference').matches(':modal')),width<1200);checks++;
    await scan('open '+topic);
    let top=await page.evaluate(()=>{const r=document.querySelector('.reference-reader');r.scrollTop=260;return r.scrollTop;});assert(top>0);
    await page.click('[data-reference-close]');await page.waitForSelector('#practice-reference:not([open])',{state:'attached'});
    assert.equal(await input.inputValue(),'my draft');await page.click('#practice-rule');
    assert.equal(await page.locator('.reference-reader').evaluate(r=>r.scrollTop),top);checks++;
    assert.deepEqual(await page.locator('#reference-section option').allTextContents(),['Tenses','Adjectives (Degrees of Comparison)','Passive Voice','Modal Verbs']);
    if(topic==='tenses'){assert.equal(await page.locator('[data-reference-chapter]').count(),5);assert.equal(await page.locator('#tenses-map [data-tense]').count(),12);const before=await input.inputValue();await page.click('#tenses-map [data-map-action=fullscreen]');await page.waitForSelector('.map-fullscreen-dialog[open]');await page.selectOption('.map-fullscreen-dialog .map-jump','Past Perfect');await page.waitForSelector('.map-detail:not([hidden])');await page.click('.map-fullscreen-dialog .map-detail a');await page.waitForSelector('.reference-reader article');assert.equal(await page.locator('.map-fullscreen-dialog').count(),0);assert.equal(await input.inputValue(),before);assert((await page.url()).endsWith('#session'));await page.locator('.reference-reader').evaluate(r=>r.scrollTop=260);checks++;}
    top=await page.locator('.reference-reader').evaluate(r=>r.scrollTop);await page.selectOption('#reference-section',topic==='comparison'?'tenses':'comparison');await page.waitForSelector('.reference-reader article');
    await page.selectOption('#reference-section',topic==='comparison'?'comparison':'tenses');await page.waitForFunction(()=>!!document.querySelector('.reference-reader article'));
    assert.equal(await page.locator('.reference-reader').evaluate(r=>r.scrollTop),top);checks++;
    // Wide view permits editing the actual exercise while reading.
    if(width>=1200){await input.fill('edited beside rule');assert.equal(await page.locator('#practice-reference[open]').count(),1);}
    await page.keyboard.press('Escape');await page.waitForSelector('#practice-reference:not([open])',{state:'attached'});
    assert.equal(await page.locator('#practice-rule').getAttribute('aria-expanded'),'false');checks++;
    await page.evaluate(()=>{const item=state.session.items[0];document.querySelectorAll('#answer-form [data-answer-index]').forEach((c,n)=>{c.value=item.blanks[n].answer;c.dispatchEvent(new Event('input',{bubbles:true}));});});
    await page.click('#answer-form [type=submit]');await page.waitForSelector('#next-question');await page.click('#practice-rule');
    if(width<1200)await page.click('[data-reference-close]');
    await page.click('#next-question');await page.waitForFunction(()=>state.session.index===1);
    assert.equal(await page.locator('#practice-rule').getAttribute('aria-expanded'),width>=1200?'true':'false');checks++;
    if(width>=1200){await page.setViewportSize({width:700,height:850});await page.waitForFunction(()=>document.querySelector('#practice-reference').matches(':modal'));await page.click('[data-reference-close]');await page.setViewportSize({width,height:850});}
    if(process.env.GRAMMAR_SCREENSHOT_DIR){await page.click('#practice-rule');fs.mkdirSync(process.env.GRAMMAR_SCREENSHOT_DIR,{recursive:true});await page.screenshot({path:path.join(process.env.GRAMMAR_SCREENSHOT_DIR,`${topic}-${width}-${theme}.png`)});if(width<1200)await page.click('[data-reference-close]');}
    await page.goto(base+'/#tests/'+topic);await page.waitForSelector('[data-test-start]');assert.equal(await page.locator('#practice-reference').count(),0);
    await page.click(`[data-test-start="${topic==='tenses'?'tenses':'comparison'}-1"]`);await page.waitForSelector('#assessment-form');assert.equal(await page.locator('#practice-rule').count(),0);assert.equal(await page.locator('#practice-reference').count(),0);checks++;
   }
   // Assign a real exercise to a fictional learner, without opening their keys.
   await page.goto(base+'/#practice/tenses');await page.waitForSelector('#practice-form');await page.waitForFunction(()=>Array.isArray(state.exercises));
   await page.evaluate(async()=>{const roster=await accountRequest('teacher/students');const sid=roster.students[0].id;const pool=await accountRequest('teacher/students/'+sid+'/assignment-pool');const item=state.exercises.find(i=>pool.availableIds.includes(i.id)&&i.type==='open_brackets');await accountRequest('teacher/students/'+sid+'/assignments',{title:'Reference QA',ids:[item.id]});});
   await page.goto(base+'/#profile');await page.click('#account-logout');await page.waitForSelector('#account-login-form');await login('anna@example.test');
   await page.evaluate(async()=>{const data=await accountRequest('account');const work=data.assignments.find(a=>a.title==='Reference QA');const saved=await accountRequest('practice/'+work.practiceId);state.session={items:saved.items,index:saved.index,answers:saved.answers,correct:0,checked:false,remote:{id:saved.id,revision:saved.revision}};location.hash='session';});
   await page.waitForSelector('#practice-rule');assert(await page.evaluate(()=>state.session.items.every(i=>!i.rule_refs&&!i.answer_text&&!i.blanks?.some(b=>b.answer))));
   await page.click('#practice-rule');await page.waitForSelector('.reference-reader article');await scan('learner');checks++;
   if(width<1200)await page.click('[data-reference-close]');
   await page.goto(base+'/#profile');await page.waitForSelector('#account-logout');assert.equal(await page.locator('#practice-reference').count(),0);assert.equal(await page.evaluate(()=>document.body.style.overflow),'');checks++;
   await context.close();
  }
  assert.deepEqual(errors,[]);console.log(JSON.stringify({checks,scans,errors}));
 }finally{if(browser)await browser.close();child.kill('SIGTERM');}
})().catch(e=>{console.error(e);process.exitCode=1;});
