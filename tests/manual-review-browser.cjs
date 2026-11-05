// Complete human review loop against a local Worker and fictional accounts.
const {spawn}=require('node:child_process'),{chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
  const child=spawn(process.execPath,['scripts/local-worker.mjs'],{env:{...process.env,GRAMMAR_PORT:'0'},stdio:['ignore','pipe','pipe']});
  let browser,log='',checks=0,scans=0;const errors=[];child.stderr.on('data',c=>log+=c);
  try{
    const base=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error(log)),30000);child.once('exit',code=>{clearTimeout(timer);reject(Error('Local server exit '+code+' '+log));});child.stdout.on('data',c=>{log+=c;const m=log.match(/Grammar NOEON: (http:\/\/127\.0\.0\.1:\d+)/);if(m){clearTimeout(timer);resolve(m[1]);}});});
    browser=await chromium.launch({headless:true,...(process.env.GRAMMAR_CHROME_PATH?{executablePath:process.env.GRAMMAR_CHROME_PATH}:{})});
    const bank=JSON.parse(fs.readFileSync('cloudflare/generated/bank.json')),translations=bank.filter(i=>i.grading_mode==='teacher');
    const axe=fs.readFileSync(require.resolve('axe-core/axe.min.js'),'utf8');let iteration=0;
    for(const [width,height]of [[375,812],[1280,800]])for(const theme of ['light','dark']){
      const options={viewport:{width,height},colorScheme:theme,serviceWorkers:'block',reducedMotion:'reduce'};
      const tc=await browser.newContext(options),sc=await browser.newContext(options);
      async function login(context,email){const page=await context.newPage();page.setDefaultTimeout(20000);page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(t=>localStorage.setItem('noeon-theme',t),theme);await page.goto(base+'/#profile');await page.fill('#account-email',email);await page.fill('#account-password','FictionalPassword!2026');await page.click('#account-login-form button.primary');await page.waitForSelector('#account-logout');return page;}
      const teacher=await login(tc,'teacher@example.test'),student=await login(sc,'anna@example.test');
      async function scan(page,label){await page.waitForFunction(()=>!document.getElementById('toast')||document.getElementById('toast').hidden);await page.evaluate(axe);const bad=await page.evaluate(async()=>(await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}})).violations.filter(v=>['serious','critical'].includes(v.impact)));assert.deepEqual(bad,[],label);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),label+' overflow');scans++;if(process.env.GRAMMAR_SCREENSHOT_DIR){fs.mkdirSync(process.env.GRAMMAR_SCREENSHOT_DIR,{recursive:true});await page.screenshot({path:path.join(process.env.GRAMMAR_SCREENSHOT_DIR,`${label}-${width}-${theme}.png`),fullPage:false,animations:'disabled'});}}
      const selected=translations.slice(iteration*2,iteration*2+2);iteration++;
      const work=await teacher.evaluate(async ids=>{const data=await accountRequest('teacher/students'),pupil=data.students.find(s=>s.email==='anna@example.test');const work=await accountRequest('teacher/students/'+pupil.id+'/assignments',{title:'Переводы для ручной проверки',ids});return {...work,studentId:pupil.id};},selected.map(i=>i.id));
      await student.goto(base+'/#work/'+work.practiceId);await student.click('[data-resume]');await student.waitForSelector('#answer-form');
      for(let n=0;n<2;n++){
        await student.fill('#blank-0',n?'A second alternative translation.':'My own first translation.');await student.click('#answer-form [type=submit]');
        await student.waitForSelector('#next-question');assert((await student.locator('#feedback').innerText()).includes('Оценка появится после проверки'));
        await student.click('#next-question');if(n===0)await student.waitForSelector('#answer-form');else await student.waitForSelector('.practice-report');
      }
      assert((await student.locator('.report-legacy').innerText()).includes('не включены в процент'));checks++;
      await teacher.goto(base+'/#home');await teacher.waitForSelector('.review-queue-entry');assert((await teacher.locator('.review-queue-entry').innerText()).includes('2'));
      await teacher.locator('.review-queue-entry a').click();await teacher.waitForSelector('.review-queue-card');assert.equal(await teacher.locator('.review-queue-card').count(),1);await scan(teacher,'queue');
      await teacher.locator('.review-queue-card a').click();await teacher.waitForSelector('[data-review-answer="0"]');
      assert(await teacher.locator('[data-answer-index="0"]').getAttribute('open')!==null);
      assert((await teacher.locator('[data-answer-index="0"]').innerText()).includes(selected[0].prompt));
      assert((await teacher.locator('[data-answer-index="0"]').innerText()).includes('My own first translation.'));await scan(teacher,'teacher-answer');checks++;
      const stale=await tc.newPage();await stale.goto(teacher.url());await stale.waitForSelector('[data-review-answer="0"]');
      await teacher.locator('[data-review-answer="1"] textarea').fill('Черновик комментария ко второму переводу.');
      const first=teacher.locator('[data-review-answer="0"][data-review-field="0"]');
      await first.locator('textarea').fill('Хороший перевод. <Продолжайте>');await first.locator('[data-review-decision="correct"]').click();
      await teacher.waitForFunction(()=>document.querySelector('[data-review-answer="0"] .manual-review-status')?.textContent.includes('Решение сохранено'));
      assert.equal(await teacher.locator('[data-review-answer="1"] textarea').inputValue(),'Черновик комментария ко второму переводу.');
      const staleCard=stale.locator('[data-review-answer="0"]');await staleCard.locator('textarea').fill('Не потерять мой комментарий');await staleCard.locator('[data-review-decision="incorrect"]').click();
      await stale.waitForSelector('[data-review-refresh]:not([hidden])');assert.equal(await staleCard.locator('textarea').inputValue(),'Не потерять мой комментарий');
      await staleCard.locator('[data-review-refresh]').click();await stale.waitForFunction(()=>document.querySelector('[data-review-answer="0"] textarea')?.value==='Хороший перевод. <Продолжайте>');await stale.close();checks++;
      const second=teacher.locator('[data-review-answer="1"][data-review-field="0"]');await second.locator('textarea').fill('Сохраните исходное время глагола.');await second.locator('[data-review-decision="incorrect"]').click();
      await teacher.waitForFunction(()=>document.querySelector('.manual-review-overview')?.textContent.includes('Все переводы проверены'));
      await scan(teacher,'review-finished');checks++;
      await teacher.locator('.manual-review-overview a').click();await teacher.waitForSelector('.review-queue-empty');assert.equal(await teacher.locator('.review-queue-card').count(),0);checks++;
      await student.goto(base+'/#notifications');await student.waitForSelector('[data-notification-kind="reviewed"]');
      const accepted=student.locator('[data-notification-kind="reviewed"]').filter({hasText:'Хороший перевод. <Продолжайте>'});assert.equal(await accepted.count(),1);
      await scan(student,'student-notices');await accepted.locator('[data-open-notification]').click();await student.waitForSelector('.report-submitted.review-focus');
      assert(student.url().endsWith('/answer/0/field/0'));assert((await student.locator('.report-submitted.review-focus').innerText()).includes('Преподаватель: зачтено'));checks++;
      await student.reload();await student.waitForSelector('.report-submitted.review-focus');assert((await student.locator('.report-metrics').innerText()).includes('1 из 2'));
      const teacherReport=base+'/#report/'+work.studentId+'/'+work.practiceId;
      await teacher.goto(teacherReport);await teacher.waitForSelector('.practice-report');await teacher.locator('.report-review-toggle').click();await teacher.locator('[data-answer-index="0"] > summary').click();
      const correction=teacher.locator('[data-review-answer="0"]');await correction.locator('textarea').fill('Уточняю оценку: исправьте порядок слов.');await correction.locator('[data-review-decision="incorrect"]').click();
      await teacher.waitForFunction(()=>document.querySelector('[data-review-answer="0"] .manual-review-status')?.textContent.includes('Решение сохранено'));
      await student.goto(base+'/#notifications');await student.waitForSelector('[data-notification-kind="reviewed"]');
      const updated=student.locator('[data-notification-kind="reviewed"].unread').filter({hasText:'Уточняю оценку'});assert((await updated.innerText()).includes('Решение по переводу обновлено'));assert((await updated.innerText()).includes('не зачёл'));
      await updated.locator('button').click();await student.waitForSelector('.review-focus');assert((await student.locator('.review-focus').innerText()).includes('не зачтено'));checks++;
      await tc.close();await sc.close();
    }
    assert.deepEqual(errors,[]);console.log(JSON.stringify({checks,scans,viewports:2,themes:2,errors,workflow:'submit → queue → teacher decision/comment → notice → exact answer → revised decision',concurrency:'stale review rejected; comment preserved'}));
  }finally{if(browser)await browser.close();child.kill('SIGTERM');}
})().catch(error=>{console.error(error);process.exitCode=1;});
