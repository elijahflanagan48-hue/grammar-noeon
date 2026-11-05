// Content rendering only. Auth, API privacy and persistence run separately on Miniflare.
const {chromium} = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const root = process.cwd();
const manifest = JSON.parse(fs.readFileSync('data/exercises/index.json'));
const bank = manifest.parts.flatMap(p => JSON.parse(fs.readFileSync(p.file)));
const additions = bank.filter(i => /^(?:bal|ext)-20261030-/.test(i.id));
const longest = items => items.sort((a,b)=>b.prompt.length-a.prompt.length)[0];
const samples = [
  ...['past_continuous','past_perfect_continuous','future_perfect_continuous','present_perfect'].map(target => longest(additions.filter(i=>i.id.startsWith('bal-')&&i.practice_tenses[0]===target))),
  bank.find(i=>i.id==='bal-20261030-present-simple-015'),
  bank.find(i=>i.id==='bal-20261030-present-simple-062'),
  longest(additions.filter(i=>i.type==='multiple_choice')),
  longest(additions.filter(i=>i.type==='context_cloze')),
  bank.find(i=>i.id==='ext-20261030-present-continuous-mc-010'),
  bank.find(i=>i.id==='mix-20261030-009'),
  bank.find(i=>i.id==='mix-20261030-028'),
  bank.find(i=>i.id==='ext-20261030-future-perfect-cl-006'),
  bank.find(i=>i.id==='bal-20261030-future-perfect-continuous-006'),
  bank.find(i=>i.id==='ext-20261030-future-simple-cl-015'),
  bank.find(i=>i.id==='src-u01-024'),
  bank.find(i=>i.id==='bal-20261030-present-continuous-019'),
  bank.find(i=>i.id==='ext-20261030-present-perfect-continuous-ob-002'),
  bank.find(i=>i.id==='ext-20261030-past-simple-ob-052'),
  bank.find(i=>i.id==='ext-20261030-future-perfect-continuous-ob-046'),
  bank.find(i=>i.id==='ext-20261030-future-perfect-continuous-mc-009'),
  bank.find(i=>i.id==='ext-20261030-future-perfect-continuous-cl-006'),
  bank.find(i=>i.id==='bal-20261030-future-perfect-continuous-133'),
  bank.find(i=>i.id==='ext-20261030-present-continuous-cl-016'),
  bank.find(i=>i.id==='ext-20261030-present-simple-cl-013'),
];
const axe = fs.readFileSync(require.resolve('axe-core/axe.min.js'),'utf8');
const server = http.createServer((req,res) => {
  const url = new URL(req.url,'http://localhost');
  if (url.pathname.startsWith('/api/')) {
    res.setHeader('Content-Type','application/json');
    res.end(JSON.stringify(url.pathname.endsWith('/info') ? {ready:true} : {user:null})); return;
  }
  try {
    const file = path.join(root,url.pathname === '/' ? 'index.html' : url.pathname);
    const type = {'.js':'text/javascript','.json':'application/json','.html':'text/html','.css':'text/css','.svg':'image/svg+xml','.md':'text/plain','.woff2':'font/woff2'}[path.extname(file)] || 'application/octet-stream';
    res.setHeader('Content-Type',type); res.end(fs.readFileSync(file));
  } catch {res.statusCode=404;res.end();}
});
(async () => {
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({headless:true,...(process.env.GRAMMAR_CHROME_PATH ? {executablePath:process.env.GRAMMAR_CHROME_PATH} : {})});
  const scans = [], errors = [];
  try {
    for (const [width,height] of [[375,812],[1280,800]]) for (const theme of ['light','dark']) {
      const context = await browser.newContext({viewport:{width,height}, serviceWorkers:'block',colorScheme:theme,reducedMotion:'reduce'});
      const page = await context.newPage();
      page.setDefaultTimeout(15000);
      page.on('pageerror',e => errors.push(e.message));
      await page.addInitScript(theme => localStorage.setItem('noeon-theme',theme),theme);
      await page.goto(origin);
      await page.waitForSelector('.library-link');
      await page.evaluate(() => document.fonts.ready);
      await page.addScriptTag({content:axe});
      await page.evaluate(manifest=>{account.user={id:'content-teacher',role:'teacher',email:'content@example.test'};state.manifest=manifest;renderPractice(null,'tenses');},manifest);
      assert.deepEqual(await page.locator('[name="format"]').evaluateAll(nodes=>nodes.map(n=>n.value).sort()),['context_cloze','multiple_choice','open_brackets']);
      for (const item of samples) {
        const smoothCase=width===375&&theme==='light'&&item===samples[0];
        console.log('Content',width,theme,item.id);
        await page.evaluate(({item,manifest,theme}) => {
          history.replaceState(null,'','#session');
          window.NoeonTheme.set(theme);
          account.user = {id:'fictional-content-teacher',role:'teacher',email:'content@example.test'};
          state.manifest = manifest;
          state.session = {items:[item],index:0,answers:[],correct:0,checked:false,remote:false};
          renderSession(); syncScreenChrome();
        },{item,manifest,theme});
        // renderSession focuses the first input in requestAnimationFrame. Let that
        // finish before Playwright inserts text into any subsequent field.
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        const title = item.title || '';
        assert.equal(await page.locator('.exercise-card h2').count(),title ? 1 : 0);
        if(title)assert.equal(await page.locator('.exercise-card h2').innerText(),title);
        assert(!/\b(?:Present|Past|Future)\s+(?:Simple|Perfect|Continuous)\b|Используйте will/i.test(title),item.id+': title leaks tense');
        assert.equal(await page.locator('.session > .verb-only-note').count(),0,'Fresh bank record must not show an outdated notice');
        assert.equal(await page.locator('#feedback').innerText(),'','No explanation before checking');
        assert(!(await page.locator('#answer-form').innerText()).includes(item.explanation_ru),'Explanation hidden before answer');
        const inputs = page.locator('#answer-form input[data-answer-index]');
        if(item.options){
          assert.equal(await page.locator('.choice-list input').count(),4);
          await page.locator(`.choice-list input[value="${item.correct_option_index}"]`).check();
        }else{
          assert.equal(await inputs.count(),item.blanks.length);
          for(let n=0;n<item.blanks.length;n++)await inputs.nth(n).fill(item.blanks[n].answer);
          assert.deepEqual(await inputs.evaluateAll(ns=>ns.map(n=>n.value)),item.blanks.map(b=>b.answer),item.id+': entered text');
          if(item.id==='bal-20261030-present-simple-015'){
            assert((await page.locator('.supplied-note').innerText()).includes('you'));
            assert(!(await page.locator('#answer-form').innerText()).includes('you можно повторить или опустить'));
            assert((await inputs.first().getAttribute('aria-label')).includes('you'));
          }
          if(item.id==='bal-20261030-present-simple-062')assert(!(await page.locator('#answer-form').innerText()).includes('never можно повторить или опустить'));
        }
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),`${width}/${theme}/${item.id}: overflow`);
        const result = await page.evaluate(async () => {
          const result = await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}});
          return result.violations.filter(v => ['serious','critical'].includes(v.impact)).map(v => ({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,html:n.html,summary:n.failureSummary}))}));
        });
        assert.deepEqual(result,[],`${width}/${theme}/${item.id}: axe`);
        if(process.env.GRAMMAR_SCREENSHOT_DIR){await page.evaluate(()=>{document.activeElement?.blur();scrollTo(0,0)});if(item.id==='ext-20261030-present-continuous-mc-010')await page.locator('.exercise-card h2').evaluate(node=>scrollBy(0,node.getBoundingClientRect().top-100));fs.mkdirSync(process.env.GRAMMAR_SCREENSHOT_DIR,{recursive:true});await page.screenshot({path:path.join(process.env.GRAMMAR_SCREENSHOT_DIR,`reviewed-${item.type}-${item.id}-${width}-${theme}.png`),fullPage:false,animations:'disabled'});}
        if(smoothCase)await page.emulateMedia({reducedMotion:'no-preference'});
        const submitted = await page.evaluate(() => {
          document.getElementById('answer-form').requestSubmit();
          return {checked:state.session.checked,role:account.user?.role,values:[...document.querySelectorAll('[data-answer-index]')].map(n=>n.value),feedback:document.getElementById('feedback')?.textContent};
        });
        assert(submitted.checked,JSON.stringify(submitted));
        assert.equal(await page.evaluate(() => state.session.correct),1,item.id);
        assert((await page.locator('#feedback').innerText()).length>0,'Explanation shown after checking');
        await page.waitForFunction(() => {
          const explanation=document.querySelector('#feedback .explanation')?.getBoundingClientRect();
          const next=document.getElementById('next-question')?.getBoundingClientRect();
          const header=document.querySelector('.site-header')?.getBoundingClientRect().bottom||0;
          const bottom=innerWidth<1000?document.querySelector('.main-nav').getBoundingClientRect().top:innerHeight;
          return explanation && next && explanation.top>=header-2 && explanation.top<bottom && next.top>=header && next.bottom<=bottom;
        });
        assert.equal(await page.locator('#next-question').evaluate(n=>document.activeElement===n),true,'Keyboard focus stays on Next without fighting the scroll');
        if(process.env.GRAMMAR_SCREENSHOT_DIR&&item.id.startsWith('mix-')){await page.screenshot({path:path.join(process.env.GRAMMAR_SCREENSHOT_DIR,`checked-${item.id}-${width}-${theme}.png`),fullPage:false,animations:'disabled'});}
        if(smoothCase){
          await page.emulateMedia({reducedMotion:'reduce'});
          await page.evaluate(({item,next})=>{state.session={items:[item,next],index:0,answers:[],correct:0,checked:false,remote:false};renderSession();},{item,next:samples[1]});
          await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
          for(const input of await page.locator('#answer-form input[data-answer-index]').all())await input.fill('incorrect');
          await page.evaluate(()=>document.getElementById('answer-form').requestSubmit());
          await page.waitForFunction(()=>{
            const next=document.getElementById('next-question')?.getBoundingClientRect(),explanation=document.querySelector('#feedback .explanation')?.getBoundingClientRect();
            return document.querySelector('#feedback .wrong')&&explanation?.top>=70&&explanation.top<innerHeight-100&&next?.bottom<innerHeight-90;
          });
          assert.equal(await page.evaluate(()=>state.session.correct),0,'Incorrect answer uses the same explanation scroll');
          assert.equal(await page.locator('#next-question').innerText(),'Далее');
          if(process.env.GRAMMAR_SCREENSHOT_DIR)await page.screenshot({path:path.join(process.env.GRAMMAR_SCREENSHOT_DIR,'feedback-next-375-light.png'),fullPage:false,animations:'disabled'});
          await page.locator('#next-question').click();
          await page.waitForFunction(()=>state.session.index===1&&!state.session.checked&&scrollY<5);
          assert.equal(await page.locator('#feedback').innerText(),'','Next opens the new question at the top');
        }
        scans.push({width,height,theme,id:item.id,blanks:item.blanks?.length||1,axe:result});
      }
      await context.close();
    }
    assert.deepEqual(errors,[]);
    console.log(JSON.stringify({contentScans:scans.length,scans,errors},null,2));
  } finally {await browser.close(); await new Promise(resolve => server.close(resolve));}
})().catch(error => {console.error(error);server.close();process.exitCode=1;});
