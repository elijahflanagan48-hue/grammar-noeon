const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const root=require('path').join(process.cwd(),'cloudflare/public');
const srv=http.createServer((req,res)=>{const u=new URL(req.url,'http://x');if(u.pathname.startsWith('/api/')){res.setHeader('Content-Type','application/json');return res.end(JSON.stringify(u.pathname.endsWith('/info')?{ready:true}:{user:null}));}
 try{const f=path.join(root,u.pathname==='/'?'index.html':decodeURIComponent(u.pathname));const b=fs.readFileSync(f);res.setHeader('Content-Type',f.endsWith('.js')?'text/javascript':f.endsWith('.html')?'text/html':f.endsWith('.css')?'text/css':f.endsWith('.json')?'application/json':'application/octet-stream');res.end(b);}catch{res.statusCode=404;res.end();}}).listen(8768);
const results=[];const ok=(c,m)=>{results.push((c?'PASS ':'FAIL ')+m);};
(async()=>{const b=await chromium.launch();const errs=[];
// ---------- desktop
{const ctx=await b.newContext({viewport:{width:1366,height:860}});const p=await ctx.newPage();p.on('pageerror',e=>errs.push(String(e)));
 await p.goto('http://localhost:8768/#theory/infinitive');await p.waitForSelector('#im-canvas svg');await p.waitForTimeout(600);
 const V=()=>p.evaluate(()=>({...document.querySelector('#im-canvas').__nc.v,active:document.querySelector('#im-canvas').__nc.isActive(),sy:scrollY,panel:!document.querySelector('.im-panel').hidden}));
 const r=await (await p.$('#im-canvas')).boundingBox();const cx=r.x+r.width/2, cy=r.y+r.height/2;
 await p.evaluate(()=>scrollTo(0,0));let a=await V();
 await p.mouse.move(cx,cy);await p.mouse.wheel(0,300);await p.waitForTimeout(400);let c=await V();
 ok(c.k===a.k&&c.sy>a.sy,'desktop: колесо над неактивной картой прокручивает страницу');
 ok(await p.$eval('.nc-toast',t=>!t.hidden),'desktop: подсказка «щёлкните по карте»');
 await p.evaluate(()=>scrollTo(0,document.querySelector('#im-canvas').getBoundingClientRect().top+scrollY-20));await p.waitForTimeout(200);
 const r2=await (await p.$('#im-canvas')).boundingBox();const X=r2.x+r2.width*0.55, Y=r2.y+r2.height*0.92;
 await p.mouse.click(X,Y);a=await V();ok(a.active,'desktop: клик по карте делает её активной');
 await p.mouse.wheel(0,-240);await p.waitForTimeout(300);c=await V();ok(c.k>a.k&&Math.abs(c.sy-a.sy)<2,'desktop: колесо масштабирует, страница стоит');
 a=c;await p.mouse.move(X,Y);await p.mouse.down();await p.mouse.move(X-200,Y-50,{steps:12});await p.mouse.up();await p.waitForTimeout(100);c=await V();
 ok(c.x<a.x-150&&!c.panel,'desktop: перетаскивание двигает карту и не открывает карточку');
 await p.evaluate(()=>{const n=document.querySelector('#im-canvas').__nc;n.fit();});await p.waitForTimeout(600);
 const st=await p.$('[data-st="s0"] .im-dot');const sb=await st.boundingBox();await p.mouse.click(sb.x+sb.width/2,sb.y+sb.height/2);await p.waitForTimeout(600);c=await V();
 ok(c.panel,'desktop: клик по станции открывает карточку');
 const pb=await (await p.$('.im-panel')).boundingBox();a=await V();const st0=await p.$eval('.im-panel',e=>e.scrollTop);
 await p.mouse.move(pb.x+pb.width/2,pb.y+pb.height/2);await p.mouse.wheel(0,400);await p.waitForTimeout(300);c=await V();
 ok(c.k===a.k&&c.x===a.x,'desktop: колесо над карточкой не трогает карту');
 await p.keyboard.press('Escape');await p.waitForTimeout(100);ok(!(await V()).panel,'desktop: Esc закрывает карточку');
 a=await V();await p.mouse.dblclick(r2.x+r2.width*0.3,r2.y+r2.height*0.95);await p.waitForTimeout(500);c=await V();ok(c.k>a.k*1.5,'desktop: двойной клик приближает');
 await p.focus('#im-canvas');a=await V();await p.keyboard.press('ArrowRight');await p.waitForTimeout(300);c=await V();ok(c.x<a.x,'desktop: стрелки двигают карту');
 await p.keyboard.press('0');await p.waitForTimeout(600);c=await V();ok(c.k<0.4,'desktop: 0 показывает всю карту');
 a=await V();await p.mouse.move(X,Y);await p.evaluate(([x,y])=>{document.elementFromPoint(x,y).dispatchEvent(new WheelEvent('wheel',{deltaX:30,deltaY:20,clientX:x,clientY:y,bubbles:true,cancelable:true}))},[X,Y]);await p.waitForTimeout(100);c=await V();
 ok(c.k===a.k&&c.x!==a.x,'desktop: тачпад двумя пальцами двигает карту');
 a=await V();await p.evaluate(([x,y])=>{document.elementFromPoint(x,y).dispatchEvent(new WheelEvent('wheel',{deltaY:-20,ctrlKey:true,clientX:x,clientY:y,bubbles:true,cancelable:true}))},[X,Y]);c=await V();ok(c.k>a.k,'desktop: щипок тачпада (Ctrl+колесо) масштабирует');
 await p.mouse.move(X,Y);await p.mouse.down();await p.mouse.move(X+4000,Y+4000,{steps:20});await p.mouse.up();c=await V();
 const vis=await p.evaluate(()=>{const b=document.querySelector('#im-canvas'),n=b.__nc,v=n.v;return v.x<b.clientWidth&&v.x+4140*v.k>0&&v.y<b.clientHeight&&v.y+2780*v.k>0});ok(vis,'desktop: карту нельзя потерять за краем');
 await p.click('[data-nc-full]');await p.waitForTimeout(300);ok(await p.evaluate(()=>document.querySelector('#im-canvas').classList.contains('is-full')),'desktop: полный экран');
 await p.keyboard.press('Escape');await p.waitForTimeout(300);ok(await p.evaluate(()=>!document.querySelector('#im-canvas').classList.contains('is-full')&&!!document.querySelector('.im-wrap #im-canvas')),'desktop: Esc выходит из полного экрана, карта на месте');
 await p.mouse.click(5,5);ok(!(await V()).active,'desktop: клик вне карты отключает колесо');
 await p.click('[data-im-mode="time"]');ok(await p.$eval('.im-explain',e=>!e.hidden),'desktop: режим «Время» показывает пояснение');
 await ctx.close();}
// ---------- phone (touch через CDP)
{const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:2});const p=await ctx.newPage();p.on('pageerror',e=>errs.push(String(e)));
 await p.goto('http://localhost:8768/#theory/infinitive');await p.waitForSelector('#im-canvas svg');await p.waitForTimeout(600);
 const cdp=await ctx.newCDPSession(p);
 const touch=async(type,pts)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pts.map((q,i)=>({x:q[0],y:q[1],id:i}))});
 const drag=async(x,y,dx,dy,n=10,ms=16)=>{await touch('touchStart',[[x,y]]);for(let i=1;i<=n;i++){await touch('touchMove',[[x+dx*i/n,y+dy*i/n]]);await p.waitForTimeout(ms);}await touch('touchEnd',[]);};
 const V=()=>p.evaluate(()=>({...document.querySelector('#im-canvas').__nc.v,sy:scrollY,panel:!document.querySelector('.im-panel').hidden}));
 await p.evaluate(()=>scrollTo(0,document.querySelector('#im-canvas').getBoundingClientRect().top+scrollY-10));await p.waitForTimeout(300);
 const r=await (await p.$('#im-canvas')).boundingBox();const X=r.x+r.width*0.5,Y=r.y+r.height*0.6;
 let a=await V();await drag(X,Y,-120,-60,12,30);await p.waitForTimeout(150);let c=await V();ok(c.x<a.x-80&&Math.abs(c.sy-a.sy)<2,'телефон: палец двигает карту, страница стоит');
 a=await V();await drag(X,Y,-150,0,5,8);const c1=await V();await p.waitForTimeout(500);const c2=await V();ok(c2.x<c1.x-5,'телефон: бросок — карта катится по инерции');
 a=await V();await touch('touchStart',[[X-40,Y],[X+40,Y]]);for(let i=1;i<=10;i++){await touch('touchMove',[[X-40-i*8,Y],[X+40+i*8,Y]]);await p.waitForTimeout(16);}await touch('touchEnd',[]);c=await V();
 ok(c.k>a.k*1.6,'телефон: щипок масштабирует ('+a.k.toFixed(2)+' → '+c.k.toFixed(2)+')');
 a=await V();await touch('touchStart',[[X-60,Y],[X+60,Y]]);for(let i=1;i<=10;i++){await touch('touchMove',[[X-60+i*6,Y+i*5],[X+60+i*6,Y+i*5]]);await p.waitForTimeout(16);}await touch('touchEnd',[]);c=await V();
 ok(Math.abs(c.x-a.x-60)<15&&Math.abs(c.y-a.y-50)<15,'телефон: двумя пальцами можно и двигать');
 await p.evaluate(()=>document.querySelector('#im-canvas').__nc.fit(false));await p.waitForTimeout(100);
 a=await V();const ex=r.x+r.width*0.5, ey=r.y+r.height*0.97;await touch('touchStart',[[ex,ey]]);await touch('touchEnd',[]);await p.waitForTimeout(120);await touch('touchStart',[[ex,ey]]);await touch('touchEnd',[]);await p.waitForTimeout(500);c=await V();
 ok(c.k>a.k*1.5,'телефон: двойной тап приближает');
 await p.evaluate(()=>document.querySelector('#im-canvas').__nc.flyTo(260+240,640,0.6));await p.waitForTimeout(600);
 const sb=await (await p.$('[data-st="s2"] .im-dot')).boundingBox();await touch('touchStart',[[sb.x+sb.width/2,sb.y+sb.height/2]]);await touch('touchEnd',[]);await p.waitForTimeout(700);c=await V();
 const geo=await p.evaluate(()=>{const b=document.querySelector('#im-canvas').getBoundingClientRect(),pn=document.querySelector('.im-panel').getBoundingClientRect(),d=document.querySelector('[data-st="s2"] .im-dot').getBoundingClientRect();return {dot:d.top+d.height/2,panelTop:pn.top,boxTop:b.top}});
 ok(c.panel&&geo.dot>geo.boxTop&&geo.dot<geo.panelTop,'телефон: тап по станции открывает карточку, станция видна над ней');
 const pb=await (await p.$('.im-panel')).boundingBox();a=await V();const s0=await p.$eval('.im-panel',e=>e.scrollTop);
 await drag(pb.x+pb.width/2,pb.y+pb.height-30,0,-120,8,20);await p.waitForTimeout(200);c=await V();const s1=await p.$eval('.im-panel',e=>e.scrollTop);
 ok(c.x===a.x&&c.y===a.y,'телефон: свайп по карточке не двигает карту (прокрутка карточки '+s0+' → '+s1+')');
 const sb2=await (await p.$('.im-ch-o button')).boundingBox();if(sb2){await p.touchscreen.tap(sb2.x+5,sb2.y+5);await p.waitForTimeout(100);ok(await p.$eval('.im-check',e=>e.classList.contains('done')),'телефон: вопрос в карточке нажимается');}
 await p.touchscreen.tap(r.x+20,r.y+r.height*0.25);await p.waitForTimeout(200);ok(!(await V()).panel,'телефон: тап по пустому месту закрывает карточку');
 await p.touchscreen.tap(...await p.$eval('[data-nc-full]',e=>{const q=e.getBoundingClientRect();return [q.x+q.width/2,q.y+q.height/2]}));await p.waitForTimeout(400);
 ok(await p.evaluate(()=>document.querySelector('#im-canvas').classList.contains('is-full')&&document.querySelector('#im-canvas').clientHeight>800),'телефон: полный экран на всю высоту');
 a=await V();const cen=await p.evaluate(()=>{const b=document.querySelector('#im-canvas'),v=b.__nc.v;return [(b.clientWidth/2-v.x)/v.k,(b.clientHeight/2-v.y)/v.k]});
 await p.setViewportSize({width:844,height:390});await p.waitForTimeout(400);
 const cen2=await p.evaluate(()=>{const b=document.querySelector('#im-canvas'),v=b.__nc.v;return [(b.clientWidth/2-v.x)/v.k,(b.clientHeight/2-v.y)/v.k]});
 ok(Math.hypot(cen[0]-cen2[0],cen[1]-cen2[1])<40,'телефон: при повороте центр карты остаётся на месте');
 
 await p.setViewportSize({width:390,height:844});await p.waitForTimeout(300);
 await ctx.close();}
console.log(results.join('\n'));console.log('errors',errs);if(results.some(x=>x.startsWith('FAIL'))||errs.length)process.exitCode=1;await b.close();srv.close();})();
