// Post-release guest-only checks. Never signs in or writes user records.
const {chromium}=require('playwright');
const fs=require('fs'),assert=require('node:assert/strict');
const base='https://grammar-noeon.grammar-noeon.workers.dev';
const version=fs.readFileSync('index.html','utf8').match(/app\.js\?v=([^"']+)/)[1];
const immutable='public, max-age=31536000, immutable';
let checks=0;const scans=[],errors=[];
const ok=(value,label)=>{assert(value,label);checks++;console.log('PASS',label);};
(async()=>{
 for(const file of ['wixt-lat.woff2','wixt-cyr.woff2','wixd-lat.woff2','wixd-cyr.woff2','icons/icon-192.png','icons/favicon-32.png','favicon.svg','icons/app-icon.svg','app.js?v='+version,'styles.css?v='+version,'accounts.js?v='+version,'theme-boot.js?v='+version,'notifications.js?v='+version,'practice-report.js?v='+version,'pwa.js?v='+version,'manifest.webmanifest?v='+version]){
  const r=await fetch(base+'/'+file,{cache:'no-store'});ok(r.status===200,file+' available');ok(r.headers.get('cache-control')===immutable,file+' immutable');
  const bytes=Buffer.from(await r.arrayBuffer());ok(bytes.equals(fs.readFileSync(file.split('?')[0])),file+' matches local bytes');
 }
 for(const file of ['','index.html','index.html?v='+version,'sw.js','sw.js?v='+version]){const r=await fetch(base+'/'+file,{cache:'no-store'});ok(r.status===200,'HTML/SW '+file+' available');ok(r.headers.get('cache-control')==='no-cache','HTML/SW '+file+' no-cache');}
 const manifest=await fetch(base+'/data/exercises/index.json');ok(manifest.headers.get('cache-control')==='no-cache','Public bank manifest revalidates');
 for(const endpoint of ['/api/today','/api/today?v='+version]){const r=await fetch(base+endpoint);ok(r.status===401,'Today guest denied');ok(r.headers.get('cache-control')==='no-store','Today no-store');}
 for(const part of JSON.parse(fs.readFileSync('data/exercises/index.json')).parts){const r=await fetch(base+'/'+part.file+'?v='+version);ok(r.status===401,part.file+' with version protected');ok(r.headers.get('cache-control')==='no-store',part.file+' no-store');}
 const axe=fs.readFileSync(require.resolve('axe-core/axe.min.js'),'utf8');
 const browser=await chromium.launch({headless:true,...(process.env.GRAMMAR_CHROME_PATH?{executablePath:process.env.GRAMMAR_CHROME_PATH}:{})});
 try {
  for(const viewport of [{width:375,height:812},{width:1280,height:800}])for(const theme of ['light','dark']){
   const context=await browser.newContext({viewport,colorScheme:theme,serviceWorkers:'block'}),page=await context.newPage();
   page.setDefaultTimeout(20000);page.on('pageerror',e=>errors.push(e.message));const requests=[];page.on('request',r=>requests.push(new URL(r.url()).pathname));
   await page.addInitScript(t=>{localStorage.setItem('noeon-theme',t);localStorage.setItem('noeon-history','[{"total":999,"correct":999}]');},theme);
   const r=await page.goto(base);ok(r.headers()['content-security-policy'].includes("script-src 'self'"),'Published CSP script-src self');await page.waitForSelector('.today-guest');await page.waitForTimeout(350);
   const text=await page.locator('#app').innerText();ok(!/999|1424|1\s?424|Ваш прогресс|ответов выполнено/.test(text),'Guest has no local progress/bank totals');ok(await page.locator('#app a[href^="#practice"]').count()===0,'Guest has explained public actions');ok(!requests.includes('/api/today'),'Guest does not fetch Today');
   ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Guest no horizontal overflow');
   await page.evaluate(axe);const bad=await page.evaluate(async()=>(await axe.run(document)).violations.filter(v=>['serious','critical'].includes(v.impact)).map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)})));
   ok(bad.length===0,'Guest axe serious/critical zero');scans.push({viewport,theme,violations:bad});await context.close();
  }
  ok(errors.length===0,'No published JavaScript errors');console.log(JSON.stringify({checks,guestOnly:true,axeScans:scans,errors},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
