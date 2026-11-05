const {spawn}=require('node:child_process');
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const child=spawn(process.execPath,['scripts/local-worker.mjs'],{env:{...process.env,GRAMMAR_PORT:'0'},stdio:['ignore','pipe','pipe']});
 let browser;let log='';child.stderr.on('data',c=>{log+=c});
 const base=await new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>reject(new Error('Local preview startup timed out: '+log)),30000);
  child.once('exit',code=>{clearTimeout(timer);reject(new Error('Local preview server exited: '+code+' '+log))});
  child.stdout.on('data',c=>{log+=c;const match=log.match(/Grammar NOEON: (http:\/\/127\.0\.0\.1:\d+)/);if(match){clearTimeout(timer);resolve(match[1]);}});
 });
 const axe=fs.readFileSync(require.resolve('axe-core/axe.min.js'),'utf8');let scans=0;const errors=[];
 try{
  browser=await chromium.launch({headless:true,...(process.env.GRAMMAR_CHROME_PATH?{executablePath:process.env.GRAMMAR_CHROME_PATH}:{})});
  for(const [width,height]of [[375,812],[1280,800]])for(const theme of ['light','dark']){
   const context=await browser.newContext({viewport:{width,height},colorScheme:theme,serviceWorkers:'block',reducedMotion:'reduce'}),page=await context.newPage();page.setDefaultTimeout(20000);
   page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(t=>localStorage.setItem('noeon-theme',t),theme);
   await page.goto(base+'/#profile');await page.fill('#account-email','teacher@example.test');await page.fill('#account-password','FictionalPassword!2026');await page.click('#account-login-form button.primary');await page.waitForSelector('#account-logout');
   const students=await (await context.request.get(base+'/api/teacher/students')).json(),sid=students.students[0].id;
   const learner=await browser.newContext({serviceWorkers:'block'});const signed=await (await learner.request.post(base+'/api/auth/login',{headers:{Origin:base},data:{email:'anna@example.test',password:'FictionalPassword!2026'}})).json();assert(signed.user);
   const account=async()=>await(await learner.request.get(base+'/api/account')).json();
   const before=(await account()).assignments.length;
   async function openPreview(){
    await page.goto(base+'/#assign/'+sid+'/tenses');
    await page.waitForFunction(()=>{const form=document.querySelector('#practice-form');return form&&!form.inert&&(document.querySelector('#assignment-preview')||!form.querySelector('[type=submit]').disabled);});
    if(await page.locator('#assignment-preview').count())await page.click('#preview-settings');
    await page.waitForSelector('#practice-form');
    await page.locator('[data-tense-action="none"]').click();await page.getByRole('checkbox',{name:'Present Simple',exact:true}).check();
    await page.click('[data-format-action="none"]');await page.check('[name="format"][value="open_brackets"]');await page.fill('#count','5');await page.fill('#assignment-title','Проверенный набор');
    await page.locator('#practice-form [type=submit]').click();await page.waitForSelector('#assignment-preview');
   }
   async function ids(){return page.locator('#assignment-preview-items [data-preview-id]').evaluateAll(nodes=>nodes.map(n=>n.dataset.previewId));}
   async function scan(name){
    await page.evaluate(axe);const failures=await page.evaluate(async()=> (await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}})).violations.filter(v=>['serious','critical'].includes(v.impact)));
    assert.deepEqual(failures,[],name);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),name+': overflow');scans++;
    if(process.env.GRAMMAR_SCREENSHOT_DIR){fs.mkdirSync(process.env.GRAMMAR_SCREENSHOT_DIR,{recursive:true});await page.screenshot({path:path.join(process.env.GRAMMAR_SCREENSHOT_DIR,`assignment-${name}-${width}-${theme}.png`),fullPage:false,animations:'disabled'});}
   }
   await openPreview();const original=await ids();assert.equal(original.length,5);assert.equal((await account()).assignments.length,before,'Preview does not create an assignment');await scan('preview');
   const originalPool=await page.evaluate(()=>filteredExercises(document.querySelector('#practice-form')).map(i=>i.id));
   const tried=new Set([original[0]]);
   for(let n=0;n<5;n++){
    await page.locator('[data-preview-random="0"]').click();const next=await ids();assert(!tried.has(next[0]),'Avoid previously shown random alternatives');assert(originalPool.includes(next[0]),'Random stays in original filters');assert.deepEqual(next.slice(1),original.slice(1));tried.add(next[0]);
   }
   await scan('random');
   await page.locator('[data-preview-replace="0"]').click();await scan('chooser');
   await page.check('#assignment-search-section');await page.locator('[data-preview-random="0"]').click();assert(originalPool.includes((await ids())[0]),'Expanded manual search does not broaden random replacement');await page.locator('[data-preview-replace="0"]').click();await page.uncheck('#assignment-search-section');
   const replacement=await page.locator('[data-preview-pick]').first().getAttribute('data-preview-pick');await page.fill('#assignment-search',replacement);assert.equal(await page.locator('[data-preview-pick]').count(),1);await page.click('[data-preview-pick]');
   const replaced=await ids();assert.equal(replaced[0],replacement);assert.deepEqual(replaced.slice(1),original.slice(1));
   await page.locator('[data-preview-remove="4"]').click();assert.equal((await ids()).length,4);
   await page.click('#preview-add');await page.locator('[data-preview-pick]').first().click();const reviewed=await ids();assert.equal(reviewed.length,5);assert.equal(new Set(reviewed).size,5);
   assert.equal((await account()).assignments.length,before,'Adding/removing does not send');
   const csrf=await page.evaluate(()=>account.csrf);
   const stale=await context.request.post(base+`/api/teacher/students/${sid}/assignments`,{headers:{Origin:base,'X-CSRF-Token':csrf},data:{title:'Stale',ids:reviewed,itemVersions:reviewed.map(()=> 'stale')}});assert.equal(stale.status(),409);assert.equal((await account()).assignments.length,before);
   const responseWait=page.waitForResponse(r=>r.url().endsWith(`/api/teacher/students/${sid}/assignments`)&&r.request().method()==='POST');
   await page.click('#preview-send');const response=await responseWait;assert.equal(response.status(),200);const assigned=await response.json();await page.waitForURL('**/#student/'+sid);
   const saved=await(await learner.request.get(base+'/api/practice/'+assigned.practiceId)).json();assert.deepEqual(saved.items.map(i=>i.id),reviewed,'Student receives exact reviewed order');for(const i of saved.items){assert(!('answer_text'in i));for(const b of i.blanks||[])assert(!('accepted_answers'in b));}
   assert.equal((await account()).assignments.length,before+1);
   await page.goto(base+`/#edit/${sid}/${assigned.id}`);await page.click('#replace-assignment');await page.locator('#practice-form [type=submit]').click();await page.waitForSelector('#assignment-preview');
   const editedIds=await ids();const editResponse=page.waitForResponse(r=>r.url().endsWith(`/assignments/${assigned.id}/edit`)&&r.request().method()==='POST');await page.click('#preview-send');assert.equal((await editResponse).status(),200);await page.waitForURL('**/#student/'+sid);
   const edited=await(await learner.request.get(base+'/api/practice/'+assigned.practiceId)).json();assert.deepEqual(edited.items.map(i=>i.id),editedIds,'Editing preserves exact reviewed order');assert.equal((await account()).assignments.length,before+1);
   await openPreview();const racing=await ids();const reviewedVersions=await page.locator('#assignment-preview-items [data-preview-id]').evaluateAll(nodes=>nodes.map(n=>state.exercises.find(i=>i.id===n.dataset.previewId).content_version));
   const other=await context.request.post(base+`/api/teacher/students/${sid}/assignments`,{headers:{Origin:base,'X-CSRF-Token':csrf},data:{title:'Other tab',ids:racing,itemVersions:reviewedVersions}});assert.equal(other.status(),200);
   await page.click('#preview-send');await page.waitForFunction(()=>document.querySelector('#assignment-preview-error')?.textContent.includes('другой вкладке'));assert.deepEqual(await ids(),racing,'409 preserves reviewed selection');assert(await page.locator('#preview-send').isDisabled());await scan('conflict');
   while(await page.locator('[data-preview-remove]').count())await page.locator('[data-preview-remove]').last().click();assert(await page.locator('#preview-send').isDisabled());await scan('empty');
   await page.click('#preview-add');await page.locator('[data-preview-pick]').first().click();assert.equal((await ids()).length,1);assert(await page.locator('#preview-send').isEnabled());
   await page.fill('#preview-title','Название после просмотра');await page.click('#preview-settings');assert.equal(await page.inputValue('#assignment-title'),'Название после просмотра');assert(await page.locator('#practice-form').isVisible());
   if(width===375&&theme==='light'){await page.fill('#count','50');await page.locator('#practice-form [type=submit]').click();await page.waitForSelector('#assignment-preview');assert.equal((await ids()).length,50);assert(await page.locator('#preview-add').isDisabled());await page.locator('[data-preview-remove="49"]').click();assert(await page.locator('#preview-add').isEnabled());}
   await context.close();await learner.close();
   console.log('Assignment preview passed',width,theme);
  }
  assert.deepEqual(errors,[]);console.log(JSON.stringify({assignmentPreviewScans:scans,errors,checks:'preview, replace, search, remove, add, exact order, no early send, stale bank, conflict, empty set, settings, student key privacy'}));
 }finally{if(browser)await browser.close();child.kill('SIGTERM');}
})().catch(e=>{console.error(e);process.exitCode=1});
