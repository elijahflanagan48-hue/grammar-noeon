// Isolated Worker: exact draft restore, failed-save recovery and reusable bulk templates.
const {spawn}=require('node:child_process'), {chromium}=require('playwright');
const fs=require('node:fs'), path=require('node:path'), assert=require('node:assert/strict');
(async()=>{
  const child=spawn(process.execPath,['scripts/local-worker.mjs'],{env:{...process.env,GRAMMAR_PORT:'0'},stdio:['ignore','pipe','pipe']});
  let log='',browser,checks=0;const errors=[];
  child.stderr.on('data',chunk=>log+=chunk);
  try {
    const base=await new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>reject(Error(log)),30000);
      child.once('exit',code=>{clearTimeout(timer);reject(Error('Local server exit '+code+' '+log));});
      child.stdout.on('data',chunk=>{log+=chunk;const match=log.match(/Grammar NOEON: (http:\/\/127\.0\.0\.1:\d+)/);if(match){clearTimeout(timer);resolve(match[1]);}});
    });
    browser=await chromium.launch({headless:true,...(process.env.GRAMMAR_CHROME_PATH?{executablePath:process.env.GRAMMAR_CHROME_PATH}:{})});

    const axe=fs.readFileSync(require.resolve('axe-core/axe.min.js'),'utf8');
    for(const width of [375,1280])for(const theme of ['light','dark']){
      const context=await browser.newContext({viewport:{width,height:812},colorScheme:theme,serviceWorkers:'block',reducedMotion:'reduce'});
      const page=await context.newPage();page.setDefaultTimeout(25000);page.on('pageerror',error=>errors.push(error.message));
      await page.addInitScript(value=>localStorage.setItem('noeon-theme',value),theme);
      await page.goto(base+'/#profile');await page.fill('#account-email','teacher@example.test');await page.fill('#account-password','FictionalPassword!2026');await page.click('#account-login-form button.primary');await page.waitForSelector('#account-logout');
      if(width===375&&theme==='light'){
        const invite=await page.evaluate(()=>accountRequest('teacher/invite',{}));
        const joinContext=await browser.newContext({serviceWorkers:'block'}),joinPage=await joinContext.newPage();
        await joinPage.goto(base+'/#profile');
        await joinPage.evaluate(token=>accountRequest('auth/join',{token,name:'Второй ученик',email:'misha@example.test',password:'FictionalPassword!2026'}),invite.token);
        await joinContext.close();
      }
      const studentId=await page.evaluate(async()=>{const data=await accountRequest('teacher/students');const pupil=data.students.find(item=>item.email==='anna@example.test');const old=await accountRequest('teacher/library-drafts/'+pupil.id);if(old.draft)await accountRequest('teacher/library-drafts/'+pupil.id,{discard:true,revision:old.draft.revision});return pupil.id;});
      await page.goto(base+'/#assign/'+studentId+'/tenses');await page.waitForSelector('[data-practice-preset="short"][data-preset-action="start"]');
      await page.waitForFunction(()=>!document.querySelector('#practice-form').inert);
      await page.click('[data-practice-preset="short"][data-preset-action="start"]');await page.waitForSelector('#assignment-preview');
      const title='Reusable '+width+' '+theme;await page.fill('#preview-title',title);
      await page.locator('[data-preview-remove="1"]').click();
      await page.waitForFunction(()=>document.querySelector('#library-draft-status')?.textContent==='Черновик сохранён');
      const ids=await page.locator('[data-preview-id]').evaluateAll(nodes=>nodes.map(node=>node.dataset.previewId));assert.equal(ids.length,4);
      await page.reload();await page.waitForSelector('#assignment-preview');
      assert.deepEqual(await page.locator('[data-preview-id]').evaluateAll(nodes=>nodes.map(node=>node.dataset.previewId)),ids,'Exact draft order survives refresh');
      assert.equal(await page.inputValue('#preview-title'),title,'Draft title survives refresh');checks+=2;
      // No acknowledgement: a local write-ahead intent restores a failed save without storing keys.
      await page.route('**/api/teacher/library-drafts/*',route=>route.request().method()==='POST'?route.abort():route.continue());
      await page.fill('#preview-title',title+' unsaved');await page.waitForFunction(()=>document.querySelector('#library-draft-status')?.getAttribute('role')==='alert');
      await page.unroute('**/api/teacher/library-drafts/*');await page.reload();await page.waitForSelector('#assignment-preview');
      assert.equal(await page.inputValue('#preview-title'),title+' unsaved','Unacknowledged title restored by write-ahead');
      const localDrafts=await page.evaluate(()=>Object.keys(localStorage).filter(key=>key.startsWith('noeon-teacher-draft:')).map(key=>localStorage.getItem(key)));
      assert(localDrafts.every(value=>!value.includes('accepted_answers')&&!value.includes('answer_text')),'Local write-ahead has IDs, versions, filters and title only');checks+=2;
      await page.waitForFunction(()=>document.querySelector('#library-draft-status')?.textContent==='Черновик сохранён');
      await page.click('[data-library-save]');await page.waitForSelector('[data-library-save-status] a');
      const href=await page.locator('[data-library-save-status] a').getAttribute('href');
      await page.locator('[data-library-save-status] a').click();await page.waitForSelector('#library-assign-form');
      for(const input of await page.locator('#library-assign-form [name=student]').all())await input.check();await page.check('#library-assign-form [name=repeat]');
      await page.click('#library-assign-form [type=submit]');await page.waitForFunction(()=>document.querySelector('#library-assign-status')?.textContent.includes('Набор назначен: 2'));
      const assigned=await page.evaluate(async sid=>(await accountRequest('teacher/students/'+sid)).assignments,studentId);
      assert(assigned.some(item=>item.title===title+' unsaved'),'Template created a real individual assignment');checks++;
      const separate=await page.evaluate(async title=>{const roster=await accountRequest('teacher/students');return Promise.all(roster.students.map(async pupil=>{const data=await accountRequest('teacher/students/'+pupil.id);return data.assignments.find(item=>item.title===title)?.practiceId;}));},title+' unsaved');
      assert.equal(separate.filter(Boolean).length,2);assert.equal(new Set(separate).size,2,'Multi-select UI creates independent results');checks++;

      await page.goto(base+'/'+href);await page.reload();await page.waitForSelector('#library-assign-form');await page.evaluate(()=>scrollTo(0,0));
      await page.evaluate(axe);assert.deepEqual(await page.evaluate(async()=>(await axe.run(document.querySelector('#app'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}})).violations.filter(v=>['serious','critical'].includes(v.impact))),[]);
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));checks++;
      if(process.env.GRAMMAR_SCREENSHOT_DIR){fs.mkdirSync(process.env.GRAMMAR_SCREENSHOT_DIR,{recursive:true});await page.screenshot({path:path.join(process.env.GRAMMAR_SCREENSHOT_DIR,`library-${width}-${theme}.png`),animations:'disabled'});}
      await context.close();
    }
    assert.deepEqual(errors,[]);console.log(JSON.stringify({checks,viewports:2,themes:2,accessibility:'4 scoped axe scans, no serious/critical violations',errors}));
  }finally{if(browser)await browser.close();child.kill('SIGTERM');}
})().catch(error=>{console.error(error);process.exitCode=1;});
