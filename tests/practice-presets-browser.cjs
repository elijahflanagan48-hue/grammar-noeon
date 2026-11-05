// Isolated Worker and fictional accounts: ready presets, permissions and assignment review.
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
    for(const [width,height] of [[375,812],[1280,800]])for(const theme of ['light','dark']){
      console.log('Layout',width,theme);
      const settings={viewport:{width,height},colorScheme:theme,serviceWorkers:'block',reducedMotion:'reduce'};
      const tc=await browser.newContext(settings),sc=await browser.newContext(settings);
      async function login(context,email){
        const page=await context.newPage();page.setDefaultTimeout(20000);page.on('pageerror',error=>errors.push(error.message));
        await page.addInitScript(value=>localStorage.setItem('noeon-theme',value),theme);
        await page.goto(base+'/#profile');await page.fill('#account-email',email);await page.fill('#account-password','FictionalPassword!2026');
        await page.click('#account-login-form button.primary');await page.waitForSelector('#account-logout');return page;
      }
      const teacher=await login(tc,'teacher@example.test'),student=await login(sc,'anna@example.test');
      const studentId=await teacher.evaluate(async()=>{
        const roster=await accountRequest('teacher/students'),pupil=roster.students.find(item=>item.email==='anna@example.test');
        await accountRequest('teacher/students/'+pupil.id+'/free-practice',{allowed:false});return pupil.id;
      });
      await student.goto(base+'/#practice/tenses');await student.waitForSelector('.account-section');
      assert.equal(await student.locator('.practice-presets').count(),0,'Closed practice does not offer shortcuts');
      assert.equal(await student.locator('#practice-form').count(),0);
      checks++;
      for(const topic of ['tenses','passive','comparison']){
        await teacher.goto(base+'/#practice/'+topic);await teacher.waitForSelector('.practice-presets');
        const presets=await teacher.evaluate(topic=>practicePresets(topic),topic);
        assert.equal(await teacher.locator('.practice-preset').count(),presets.length);
        assert(await teacher.locator('#practice-form').isVisible(),'Detailed filters stay available');
        for(const preset of presets){
          await teacher.locator(`[data-practice-preset="${preset.id}"][data-preset-action="customize"]`).click();
          await teacher.waitForFunction(()=>!document.querySelector('#practice-form').dataset.presetBusy);
          const applied=await teacher.evaluate(()=>practiceFilterPayload(document.querySelector('#practice-form')));
          applied.tenses.sort();
          assert.deepEqual(applied,{topic,tenses:[...preset.tenses].sort(),levels:preset.levels,types:[preset.type],count:preset.count});
          assert((await teacher.locator('#preset-status').innerText()).includes('Выбрано:'));
          assert(await teacher.locator('#practice-form').isVisible());checks++;
        }
        await teacher.evaluate(()=>scrollTo(0,0));
        assert(await teacher.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${topic}: no horizontal overflow`);
      }
      await teacher.goto(base+'/#practice/tenses');await teacher.waitForSelector('.practice-presets');
      await teacher.evaluate(axe);
      assert.deepEqual(await teacher.evaluate(async()=>(await axe.run(document.querySelector('.practice-presets'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}})).violations.filter(item=>['serious','critical'].includes(item.impact))),[]);
      if(process.env.GRAMMAR_SCREENSHOT_DIR){fs.mkdirSync(process.env.GRAMMAR_SCREENSHOT_DIR,{recursive:true});await teacher.screenshot({path:path.join(process.env.GRAMMAR_SCREENSHOT_DIR,`presets-${width}-${theme}.png`),animations:'disabled'});}
      // Exercise all server-start paths once; layout and customization above run in every combination.
      if(width===375&&theme==='light'){
        await teacher.evaluate(id=>accountRequest('teacher/students/'+id+'/free-practice',{allowed:true}),studentId);
        for(const [topic,id,count] of [['tenses','short',5],['tenses','present-pair',10],['tenses','past-pair',10],['passive','passive-core',10]]){
          console.log('Server start',topic,id);
          await student.goto(base+'/#practice/'+topic);await student.reload();await student.waitForSelector('.practice-presets');
          const preset=await student.evaluate(({topic,id})=>practicePresets(topic).find(item=>item.id===id),{topic,id});
          await student.locator(`[data-practice-preset="${id}"][data-preset-action="start"]`).click();await student.waitForSelector('#answer-form');
          const session=await student.evaluate(()=>({items:state.session.items,remote:state.session.remote}));
          assert.equal(session.items.length,count);assert(session.remote.id);
          assert(!/"(?:answer|accepted_answers|correct_option_index)"\s*:/.test(JSON.stringify(session.items)),'Student receives no answer keys');
          const actualTargets=await teacher.evaluate(ids=>state.exercises.filter(item=>ids.includes(item.id)).flatMap(exerciseTenses),session.items.map(item=>item.id));
          for(const target of preset.tenses)assert(actualTargets.includes(target),`${id}: covers ${target}`);
          assert(actualTargets.every(target=>preset.tenses.includes(target)));checks++;
        }
        await teacher.goto(base+'/#assign/'+studentId+'/passive');await teacher.waitForSelector('.practice-presets');
        let sent=0;const watch=request=>{if(request.method()==='POST'&&new URL(request.url()).pathname.endsWith('/assignments'))sent++;};teacher.on('request',watch);
        await teacher.locator('[data-practice-preset="passive-core"][data-preset-action="start"]').click();await teacher.waitForSelector('#assignment-preview');
        assert.equal(await teacher.locator('#assignment-preview-items article').count(),10);
        assert.equal(sent,0,'A teacher reviews the preset before sending');
        assert((await teacher.locator('#assignment-preview').innerText()).includes('Задания ещё не отправлены'));
        teacher.off('request',watch);checks++;
        await teacher.evaluate(id=>renderPractice({id,name:'Тестовый ученик',availableIds:[]},'passive'),studentId);
        // The preceding preview is an autosaved draft; reopen its settings.
        await teacher.waitForFunction(()=>{const form=document.querySelector('#practice-form');return form&&!form.inert;});
        if(await teacher.locator('#assignment-preview').count())await teacher.click('#preview-settings');
        await teacher.locator('[data-practice-preset="passive-core"][data-preset-action="start"]').click();
        await teacher.waitForFunction(()=>!document.querySelector('#practice-form').dataset.presetBusy);
        assert((await teacher.locator('#preset-status').innerText()).includes('недоступна целиком'));
        assert.equal(await teacher.locator('#assignment-preview').count(),0);
        assert.equal(await teacher.locator('.practice-presets button:disabled').count(),0);
        assert.equal(await teacher.locator('#practice-form').evaluate(form=>form.inert),false);checks++;
        await student.goto(base+'/#practice/tenses');await student.waitForSelector('.practice-presets');
        const starts=[];student.on('request',request=>{if(request.method()==='POST'&&new URL(request.url()).pathname.endsWith('/practice/start'))starts.push(request.url());});
        await teacher.evaluate(id=>accountRequest('teacher/students/'+id+'/free-practice',{allowed:false}),studentId);
        await student.locator('[data-practice-preset="short"][data-preset-action="start"]').click();
        await student.waitForFunction(()=>!document.querySelector('#practice-form').dataset.presetBusy);
        assert.equal(starts.length,0,'Revoked access is rejected by the server preview before any new session');
        assert.equal(await student.locator('#answer-form').count(),0);
        assert((await student.locator('#practice-error').innerText()).length>0);checks++;
      }
      await tc.close();await sc.close();
    }
    assert.deepEqual(errors,[]);console.log(JSON.stringify({checks,viewports:2,themes:2,accessibility:'4 scoped axe scans, no serious/critical violations',errors}));
  }finally{if(browser)await browser.close();child.kill('SIGTERM');}
})().catch(error=>{console.error(error);process.exitCode=1;});
