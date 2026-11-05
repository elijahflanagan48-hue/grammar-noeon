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
    const bank=JSON.parse(fs.readFileSync('cloudflare/generated/bank.json')),source=bank.find(i=>i.id==='src-u08-010');
    const axe=fs.readFileSync(require.resolve('axe-core/axe.min.js'),'utf8');
    for(const [width,height] of [[375,812],[1280,800]])for(const theme of ['light','dark']){
      const settings={viewport:{width,height},colorScheme:theme,serviceWorkers:'block',reducedMotion:'reduce'};
      const tc=await browser.newContext(settings),sc=await browser.newContext(settings);
      async function login(context,email){const page=await context.newPage();page.setDefaultTimeout(20000);page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(t=>localStorage.setItem('noeon-theme',t),theme);await page.goto(base+'/#profile');await page.fill('#account-email',email);await page.fill('#account-password','FictionalPassword!2026');await page.click('#account-login-form button.primary');await page.waitForSelector('#account-logout');return page;}
      const teacher=await login(tc,'teacher@example.test'),student=await login(sc,'anna@example.test');
      const work=await teacher.evaluate(async id=>{
        const roster=await accountRequest('teacher/students'),pupil=roster.students.find(s=>s.email==='anna@example.test');
        await accountRequest('teacher/students/'+pupil.id+'/free-practice',{allowed:false});
        const old=await accountRequest('practice/start',{ids:[id]});return {studentId:pupil.id,teacherPractice:old.id};
      },source.id);
      // Distinct bank examples per viewport avoid the ordinary assignment duplicate guard.
      const item=bank.filter(i=>i.type==='open_brackets'&&i.blanks.length===1&&i.blanks[0].tense_or_construction==='present_simple')[(width===375?0:2)+(theme==='light'?0:1)];
      const assigned=await teacher.evaluate(async({sid,id})=>accountRequest('teacher/students/'+sid+'/assignments',{title:'Работа для закрепления',ids:[id]}),{sid:work.studentId,id:item.id});
      await student.goto(base+'/#work/'+assigned.practiceId);await student.click('[data-resume]');await student.waitForSelector('#answer-form');await student.fill('#blank-0','wrong');await student.click('#answer-form [type=submit]');await student.waitForSelector('#next-question');await student.click('#next-question');await student.waitForSelector('.remediation-actions');
      const original=await student.evaluate(async id=>(await accountRequest('reports/'+id)).attempt.score,assigned.practiceId);
      await student.click('[data-remediation-mode="new"]');await student.waitForFunction(()=>document.querySelector('.remediation-preview').textContent.includes('Свободная практика закрыта'));
      await teacher.goto(base+'/#report/'+work.studentId+'/'+assigned.practiceId);await teacher.waitForSelector('.remediation-actions');await teacher.click('[data-remediation-mode="new"]');await teacher.waitForSelector('[data-remediation-start]');
      const proposed=await teacher.locator('[data-remediation-include]').count();assert.equal(proposed,5);
      await teacher.locator('.remediation-actions').scrollIntoViewIfNeeded();await teacher.evaluate(axe);assert.deepEqual(await teacher.evaluate(async()=>(await axe.run(document.querySelector('.remediation-actions'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}})).violations.filter(v=>['serious','critical'].includes(v.impact))),[]);
      assert(await teacher.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      if(process.env.GRAMMAR_SCREENSHOT_DIR){fs.mkdirSync(process.env.GRAMMAR_SCREENSHOT_DIR,{recursive:true});await teacher.screenshot({path:path.join(process.env.GRAMMAR_SCREENSHOT_DIR,`proposal-${width}-${theme}.png`),animations:'disabled'});}
      await teacher.click('[data-remediation-start]');await teacher.waitForURL('**/#student/'+work.studentId);
      const notifications=await student.evaluate(()=>accountRequest('notifications'));const next=notifications.items.find(n=>n.title==='Тренировка по ошибкам'&&n.kind==='assigned');assert(next);
      const fresh=await student.evaluate(async id=>accountRequest('practice/'+id),next.practiceId);assert(fresh.items.every(i=>i.id!==item.id));assert(!JSON.stringify(fresh.items).includes('accepted_answers'));
      await teacher.evaluate(sid=>accountRequest('teacher/students/'+sid+'/free-practice',{allowed:true}),work.studentId);
      await student.goto(base+'/#results/'+assigned.practiceId);await student.waitForSelector('.remediation-actions');await student.click('[data-remediation-mode="repeat"]');await student.waitForSelector('[data-remediation-start]');assert.equal(await student.locator('[data-remediation-include]').count(),1);
      assert(!(await student.locator('.remediation-preview').innerText()).includes('Ответы для преподавателя'));
      await student.click('[data-remediation-start]');await student.waitForSelector('#answer-form');assert.equal(await student.evaluate(()=>state.session.items[0].id),item.id);
      await student.fill('#blank-0',item.blanks[0].answer);await student.click('#answer-form [type=submit]');await student.waitForSelector('#next-question');assert(await student.evaluate(()=>state.session.answers[0].correct));
      assert.equal(await student.evaluate(async id=>(await accountRequest('reports/'+id)).attempt.score,assigned.practiceId),original);
      await student.goto(base+'/#results/'+assigned.practiceId);await student.waitForSelector('.remediation-actions');await student.click('[data-remediation-mode="new"]');await student.waitForSelector('[data-remediation-start]');await student.click('[data-remediation-start]');await student.waitForSelector('#answer-form');assert.notEqual(await student.evaluate(()=>state.session.items[0].id),item.id);
      checks+=8;await tc.close();await sc.close();
    }
    assert.deepEqual(errors,[]);console.log(JSON.stringify({checks,viewports:2,themes:2,accessibility:'4 scoped axe scans, no serious/critical violations',errors}));
  } finally {if(browser)await browser.close();child.kill('SIGTERM');}
})().catch(error=>{console.error(error);process.exitCode=1;});
