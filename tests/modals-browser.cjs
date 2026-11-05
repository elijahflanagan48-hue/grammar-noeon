// Isolated local Worker/D1 only. Canonical keys stay in this test process until grading.
const {spawn}=require('node:child_process'),{chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const child=spawn(process.execPath,['scripts/local-worker.mjs'],{env:{...process.env,PATH:path.dirname(process.execPath)+path.delimiter+(process.env.PATH||''),GRAMMAR_PORT:'0'},stdio:['ignore','pipe','pipe']});
 let log='',browser,checks=0,scans=0;const errors=[],a11yIssues=[],output=process.env.GRAMMAR_SCREENSHOT_DIR||path.join('docs/review/MODAL-VERBS-2026-11-05','screenshots');
 fs.mkdirSync(output,{recursive:true});child.stderr.on('data',chunk=>log+=chunk);
 const bank=JSON.parse(fs.readFileSync('data/exercises/index.json')).parts.flatMap(part=>JSON.parse(fs.readFileSync(part.file))),keys=new Map(bank.map(item=>[item.id,item]));
 const expectedStats={sessions:0,checked:0,correct:0,topics:new Map()};
 function recordCompleted(item,correctFields){
  expectedStats.sessions++;expectedStats.checked+=correctFields.length;expectedStats.correct+=correctFields.filter(Boolean).length;
  const id='mv_'+item.modal_sub,topic=expectedStats.topics.get(id)||{id,checked:0,correct:0};topic.checked+=correctFields.length;topic.correct+=correctFields.filter(Boolean).length;expectedStats.topics.set(id,topic);
 }
 function ok(value,label){assert(value,label);checks++;}
 function equal(value,wanted,label){assert.deepEqual(value,wanted,label);checks++;}
 try{
  const base=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error(log)),45000);child.once('exit',code=>{clearTimeout(timer);reject(Error('Local server '+code+' '+log));});child.stdout.on('data',chunk=>{log+=chunk;const match=log.match(/Grammar NOEON: (http:\/\/127\.0\.0\.1:\d+)/);if(match){clearTimeout(timer);resolve(match[1]);}});});
  browser=await chromium.launch({headless:true,...(process.env.GRAMMAR_CHROME_PATH?{executablePath:process.env.GRAMMAR_CHROME_PATH}:{})});
  const axe=fs.readFileSync(require.resolve('axe-core/axe.min.js'),'utf8');
  for(const width of [360,1280])for(const theme of ['light','dark']){
   console.log('Modal layout',width,theme);
   const context=await browser.newContext({viewport:{width,height:850},colorScheme:theme,serviceWorkers:'block',reducedMotion:'reduce'}),page=await context.newPage();
   page.setDefaultTimeout(20000);page.on('pageerror',error=>errors.push(error.message));await page.addInitScript(t=>localStorage.setItem('noeon-theme',t),theme);
   async function scan(label,selector){
    await page.evaluate(axe);const violations=await page.evaluate(async selector=>(await axe.run(selector?document.querySelector(selector):document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}})).violations.filter(v=>['serious','critical'].includes(v.impact)).map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),selector);
    if(violations.length){a11yIssues.push({label,violations});console.log('ACCESSIBILITY',JSON.stringify({label,violations}));}else checks++;ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),label+' no page overflow');scans++;
   }
   await page.goto(base+'/#grammar');await page.waitForSelector('[data-grammar-section="modals"]');
   await page.locator('[data-grammar-section="modals"] a[href="#theory/modals"]').click();await page.waitForSelector('#mv-root');
   equal(await page.locator('.mv .mv-sec[id^="mv-r"]').count(),11,'Eleven rule sections');equal(await page.locator('.theory-content h1').count(),1,'One title');
   for(let n=1;n<=11;n++){
    await page.locator('.mv-nav a[href="#theory/modals/mv-r'+n+'"]').click();
    await page.waitForFunction(n=>location.hash==='#theory/modals/mv-r'+n,n);
    ok(await page.locator('#mv-r'+n).isVisible(),'Anchor '+n+' resolves');
   }
   await scan('theory '+width+' '+theme,'.theory-content');
   await page.screenshot({path:path.join(output,`modals-theory-${width}-${theme}.png`),animations:'disabled'});
   await page.emulateMedia({media:'print'});equal(await page.locator('.mv-nav').isVisible(),false,'Print hides sticky navigation');ok(await page.locator('#mv-r8').isVisible(),'Print retains rule');await page.emulateMedia({media:'screen'});
   await page.goto(base+'/#profile');await page.fill('#account-email','teacher@example.test');await page.fill('#account-password','FictionalPassword!2026');await page.click('#account-login-form button.primary');await page.waitForSelector('#account-logout');
   await page.goto(base+'/#practice/modals');await page.waitForSelector('#practice-form');await page.waitForFunction(()=>Array.isArray(state.exercises));
   equal(await page.locator('[data-section="modals"] input[name="tense"]').count(),31,'All subrules available');
   equal((await page.locator('input[name="format"]').evaluateAll(nodes=>nodes.map(node=>node.value))).sort(),['context_cloze','modal_fix','modal_gap','modal_meaning','multiple_choice'].sort(),'Five formats');
   await page.locator('[data-modal-rule="R8"]').locator('xpath=ancestor::details/summary').click();await page.click('[data-modal-rule="R8"]');
   equal(await page.locator('input[name="tense"]:checked').evaluateAll(nodes=>nodes.map(node=>node.value)),['mv_S22','mv_S23','mv_S24','mv_S25','mv_S26'],'Rule group selects its subrules');
   await page.locator('[data-tense-action="none"]').click();await page.locator('input[value="mv_S19"]').locator('xpath=ancestor::details/summary').click();await page.locator('input[value="mv_S19"]').check();
   equal(await page.locator('input[name="tense"]:checked').evaluateAll(nodes=>nodes.map(node=>node.value)),['mv_S19'],'Individual subrule selected');
   await page.reload();await page.waitForSelector('#practice-form');await page.waitForFunction(()=>Array.isArray(state.exercises));
   equal(await page.locator('input[name="tense"]:checked').evaluateAll(nodes=>nodes.map(node=>node.value)),['mv_S19'],'Filter survives reload');
   await scan('practice '+width+' '+theme,'#practice-form');
   await page.screenshot({path:path.join(output,`modals-practice-${width}-${theme}.png`),animations:'disabled'});
   for(const type of ['modal_gap','context_cloze','modal_fix','modal_meaning','multiple_choice']){
    console.log('Modal format',width,theme,type);
    await page.goto(base+'/#practice/modals');await page.waitForSelector('#practice-form');await page.waitForFunction(()=>Array.isArray(state.exercises));
    await page.click('[data-tense-action="all"]');await page.click('[data-level-action="all"]');await page.click('[data-format-action="none"]');await page.locator('input[name="format"][value="'+type+'"]').check();await page.fill('#count','1');
    await page.locator('#practice-form [type="submit"]').click();await page.waitForSelector('#answer-form');
    const id=await page.evaluate(()=>state.session.items[0].id),item=keys.get(id);ok(item&&item.type===type,'Server starts requested format');
    equal(await page.locator('#feedback .explanation').count(),0,'No feedback before answer');equal(await page.locator('[data-rule-ref]').count(),0,'No answer-specific rule link before checking');
    ok(!(await page.locator('.exercise-card').innerText()).includes(item.explanation_ru),'No explanation before answer');
    if(type==='modal_gap'){
     equal(await page.locator('#answer-form select[data-answer-index]').count(),1,'Gap has one select');
     await page.selectOption('#blank-0',item.blanks[0].answer);
     await page.click('#practice-rule');await page.waitForSelector('#reference-modals-mv-root');equal(await page.locator('#reference-section').inputValue(),'modals','Reference starts in modals');
     await page.locator('#reference-modals-mv-root [data-modal-anchor="mv-r8"]').click();
     ok(await page.locator('.reference-reader').evaluate(node=>node.scrollTop>0),'Reference anchor scrolls its reader');equal(new URL(page.url()).hash,'#session','Reference leaves session route intact');
     await scan('reference '+width+' '+theme,'#practice-reference');
     await page.screenshot({path:path.join(output,`modals-reference-${width}-${theme}.png`),animations:'disabled'});
     await page.click('[data-reference-close]');equal(await page.locator('#blank-0').inputValue(),item.blanks[0].answer,'Reference retains draft');
    }
    const chosenIndex=type==='multiple_choice'&&width===360&&theme==='light'?(item.correct_option_index+1)%item.options.length:item.correct_option_index;
    if(item.options){await page.locator('input[name="choice"][value="'+chosenIndex+'"]').check();}
    else for(let index=0;index<item.blanks.length;index++){
     const field=page.locator('[data-answer-index="'+index+'"]');
     if(await field.evaluate(node=>node.tagName)==='SELECT')await field.selectOption(item.blanks[index].answer);
     else await field.fill(item.blanks[index].answer.toUpperCase().replace(/'/g,'’')+'!');
    }
    if(type==='context_cloze')equal(await page.locator('#answer-form select[data-answer-index]').count(),item.blanks.length,'Every text gap is independently selectable');
    if(type==='modal_fix')equal(await page.locator('#answer-form textarea').count(),1,'Correction uses complete-sentence input');
    await page.click('#answer-form [type="submit"]');await page.waitForSelector('#next-question');
    equal(await page.evaluate(()=>state.session.answers.at(-1).correct),!item.options||chosenIndex===item.correct_option_index,'Server grades canonical/normalised or wrong answer correctly');
    if(item.options){equal(await page.locator('.choice-list .answer-correct span').allTextContents(),(item.accepted_option_indices||[item.correct_option_index]).map(index=>item.options[index]),'Shuffled choices highlight the actual correct option');if(chosenIndex!==item.correct_option_index)equal(await page.locator('.choice-list .answer-wrong span').allTextContents(),[item.options[chosenIndex]],'Shuffled choices highlight the actual wrong selection');}
    equal(await page.evaluate(()=>state.session.answers.at(-1).fields.length),item.blanks?.length||1,'One grade per field');
    recordCompleted(item,Array(item.blanks?.length||1).fill(!item.options||chosenIndex===item.correct_option_index));
    ok((await page.locator('#feedback').innerText()).includes(item.explanation_ru),'Feedback preserves authored explanation');
    await page.waitForSelector('[data-rule-ref]');
    await page.locator('[data-rule-ref]').first().click();await page.waitForSelector('.rule-dialog-content #modal-modals-mv-root');
    ok(await page.locator('.rule-dialog-content [data-modal-id="mv-'+item.modal_rule.toLowerCase()+'"]').isVisible(),'Post-answer rule opens correct theory');
    await page.keyboard.press('Escape');await page.waitForSelector('.rule-dialog',{state:'detached'});
    if(type==='context_cloze'){
     await page.reload();await page.waitForSelector('#next-question');ok(await page.evaluate(()=>state.session.checked&&state.session.answers[0].correct),'Checked text persists after reload');
     await scan('checked text '+width+' '+theme,'.exercise-card');await page.screenshot({path:path.join(output,`modals-text-checked-${width}-${theme}.png`),animations:'disabled'});
    }
   }
   if(width===360&&theme==='light'){
    await page.goto(base+'/#practice/modals');await page.waitForSelector('#practice-form');await page.waitForFunction(()=>Array.isArray(state.exercises));
    await page.click('[data-tense-action="all"]');await page.click('[data-level-action="all"]');await page.click('[data-format-action="none"]');await page.locator('input[name="format"][value="context_cloze"]').check();await page.fill('#count','1');await page.locator('#practice-form [type="submit"]').click();await page.waitForSelector('#answer-form');
    const partialId=await page.evaluate(()=>state.session.items[0].id),partial=keys.get(partialId);
    for(let i=0;i<partial.blanks.length;i++)await page.selectOption('[data-answer-index="'+i+'"]',i?partial.blanks[i].answer:partial.blanks[i].modal_options.find(option=>option!==partial.blanks[i].answer));
    await page.click('#answer-form [type="submit"]');await page.waitForSelector('#next-question');
    equal(await page.evaluate(()=>state.session.answers[0].fields.map(field=>field.correct)),partial.blanks.map((_,index)=>index>0),'Mini-text grades each gap independently');
    recordCompleted(partial,partial.blanks.map((_,index)=>index>0));
    equal(await page.locator('.feedback-title').innerText(),'Верно '+(partial.blanks.length-1)+' из '+partial.blanks.length,'Mini-text reports partial score');
    ok((await page.locator('#blank-0').locator('xpath=..').innerText()).includes(partial.blanks[0].answer),'Incorrect gap exposes its correction');
    // A complete UI assignment review/send followed by a learner's real server check.
    const sid=await page.evaluate(async()=>{const roster=await accountRequest('teacher/students');return roster.students.find(p=>p.email==='anna@example.test').id;});
    await page.goto(base+'/#assign/'+sid+'/modals');await page.waitForSelector('#practice-form');await page.waitForFunction(()=>!document.querySelector('#practice-form').inert&&Array.isArray(state.exercises));
    await page.fill('#assignment-title','Modal browser QA');await page.click('[data-tense-action="all"]');await page.click('[data-level-action="all"]');await page.click('[data-format-action="none"]');await page.locator('input[name="format"][value="context_cloze"]').check();await page.fill('#count','2');
    await page.locator('#practice-form [type="submit"]').click();await page.waitForSelector('#assignment-preview');equal(await page.locator('#assignment-preview-items article').count(),2,'Teacher reviews two texts');
    await page.locator('[data-preview-submit]').click();await page.waitForFunction(()=>location.hash.startsWith('#student/'));
    const learnerContext=await browser.newContext({viewport:{width,height:850},serviceWorkers:'block',reducedMotion:'reduce'}),learner=await learnerContext.newPage();learner.on('pageerror',error=>errors.push(error.message));
    await learner.goto(base+'/#profile');await learner.fill('#account-email','anna@example.test');await learner.fill('#account-password','FictionalPassword!2026');await learner.click('#account-login-form button.primary');await learner.waitForSelector('#account-logout');
    const saved=await learner.evaluate(async()=>{const account=await accountRequest('account');const assignment=account.assignments.find(a=>a.title==='Modal browser QA');return await accountRequest('practice/'+assignment.practiceId);});
    equal(saved.items.length,2,'Learner receives both assigned texts');
    const forbidden=['answer','accepted_answers','correct_option_index','accepted_option_indices','answer_text','explanation_ru','rule_refs','modal_sub','modal_rule','practice_tenses'];
    ok(!new RegExp('"(?:'+forbidden.join('|')+')"\\s*:').test(JSON.stringify(saved.items)),'Unanswered learner payload has no keys, explanation, or targeted metadata');
    equal(await learner.evaluate(async()=> (await fetch('/data/exercises/part-66.json')).status),403,'Learner cannot fetch full private bank');
    await learner.evaluate(saved=>{state.session={items:saved.items,index:saved.index,answers:saved.answers,correct:0,checked:false,remote:{id:saved.id,revision:saved.revision}};saveSession();location.hash='session';},saved);await learner.waitForSelector('#answer-form');
    const canonical=keys.get(saved.items[0].id);equal(await learner.locator('#answer-form select').count(),canonical.blanks.length,'Learner text renders all gaps');
    for(let i=0;i<canonical.blanks.length;i++)await learner.selectOption('[data-answer-index="'+i+'"]',canonical.blanks[i].answer);
    await learner.click('#answer-form [type="submit"]');await learner.waitForSelector('#next-question');ok(await learner.evaluate(()=>state.session.answers[0].correct),'Assigned learner text checked on server');
    equal(await learner.evaluate(async()=>{const saved=await accountRequest('practice/'+state.session.remote.id);return {first:!!saved.items[0].explanation_ru,second:!!saved.items[1].explanation_ru};}),{first:true,second:false},'Only checked item reveals its explanation');
    await learnerContext.close();
   }
   // All completed modal work must appear as one section with its actual field totals.
   await page.goto(base+'/#results');await page.waitForSelector('[data-statistics-section="modals"]');
   const statistics=await page.evaluate(()=>accountRequest('statistics')),modalStatistics=statistics.kinds.practice.sections.find(section=>section.id==='modals');
   equal({sessions:statistics.kinds.practice.sessions,checked:modalStatistics.checked,correct:modalStatistics.correct,pending:modalStatistics.pending},{sessions:expectedStats.sessions,checked:expectedStats.checked,correct:expectedStats.correct,pending:0},'Modal statistics counts exactly the completed fields');
   equal(modalStatistics.topics.map(({id,checked,correct})=>({id,checked,correct})).sort((a,b)=>a.id.localeCompare(b.id)),[...expectedStats.topics.values()].sort((a,b)=>a.id.localeCompare(b.id)),'Modal subtopic totals match completed answers');
   const section=page.locator('[data-statistics-section="modals"]');
   equal(await section.getAttribute('open'),null,'Modal statistics starts collapsed');
   const percent=Math.round(expectedStats.correct/expectedStats.checked*100);
   ok((await section.locator(':scope > summary').innerText()).includes('Тренировки: '+percent+'% · Проверено: '+expectedStats.checked),'Collapsed modal summary shows correct percent and count');
   await section.locator(':scope > summary').click();
   equal(await section.locator('[data-statistics-kind="practice"]').count(),expectedStats.topics.size,'Expanded section exposes every trained subtopic');
   equal(await section.locator(':scope > .statistics-kinds > .statistics-kind').first().locator(':scope > .statistics-metrics > strong').innerText(),percent+'%','Expanded section shows correct accuracy');
   ok((await section.locator(':scope > .statistics-kinds > .statistics-kind').first().innerText()).includes('Проверено ответов: '+expectedStats.checked),'Expanded section shows checked field count');
   for(const topic of expectedStats.topics.values()){
    const button=section.locator('[data-topic-id="'+topic.id+'"][data-statistics-kind="practice"]');
    equal(await button.locator('.statistics-metrics > strong').innerText(),Math.round(topic.correct/topic.checked*100)+'%','Subtopic '+topic.id+' percentage');
    ok((await button.innerText()).includes('Проверено ответов: '+topic.checked),'Subtopic '+topic.id+' checked count');
   }
   const wrongTopic=[...expectedStats.topics.values()].find(topic=>topic.correct<topic.checked);
   await section.locator('[data-topic-id="'+wrongTopic.id+'"][data-statistics-kind="practice"]').click();await page.waitForSelector('#topic-errors .topic-error');
   ok((await page.locator('#topic-errors').innerText()).includes('Ваш ответ:'),'Modal subtopic opens the stored mistakes');
   equal(await page.locator('[data-statistics-section="modals"] [data-topic-id="'+wrongTopic.id+'"][data-statistics-kind="practice"]').getAttribute('aria-pressed'),'true','Chosen modal topic stays selected');
   await scan('modal statistics '+width+' '+theme,'#all-time-topics');await page.screenshot({path:path.join(output,`modals-statistics-${width}-${theme}.png`),animations:'disabled'});
   await context.close();
  }
  equal(errors,[],'No uncaught page errors');equal(a11yIssues,[],'No serious or critical accessibility violations');
  const result={checks,scans,viewports:[360,1280],themes:['light','dark'],formats:5,errors,scope:'Temporary isolated Worker/D1 and fictional accounts only'};
  fs.writeFileSync(path.join(output,'browser-results.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
 }finally{if(browser)await browser.close();child.kill('SIGTERM');}
})().catch(error=>{console.error(error);process.exitCode=1;});
