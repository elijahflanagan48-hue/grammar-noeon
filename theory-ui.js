/* Interactive widgets for Tenses & Passive theory pages */
(function(){
const V={work:['work','worked','worked','working','works'],go:['go','went','gone','going','goes'],write:['write','wrote','written','writing','writes'],study:['study','studied','studied','studying','studies'],see:['see','saw','seen','seeing','sees'],build:['build','built','built','building','builds']};
const SUBJ={I:{be:['am','was'],have:'have',p:1},You:{be:['are','were'],have:'have',p:1},He:{be:['is','was'],have:'has',p:3},She:{be:['is','was'],have:'has',p:3},We:{be:['are','were'],have:'have',p:1},They:{be:['are','were'],have:'have',p:1}};
const TENSES=[
['Present Simple','pres'],['Past Simple','past'],['Future Simple','fut'],
['Present Continuous','presC'],['Past Continuous','pastC'],['Future Continuous','futC'],
['Present Perfect','presP'],['Past Perfect','pastP'],['Future Perfect','futP'],
['Present Perfect Continuous','presPC'],['Past Perfect Continuous','pastPC'],['Future Perfect Continuous','futPC']];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function third(s,v){return SUBJ[s].p===3}
function build(sub,verb,t){
  const s=SUBJ[sub],v=V[verb],base=v[0],pp=v[2],ing=v[3];
  const he=s.p===3,sl=sub==='I'?'I':sub;
  const f={
   pres:{a:[],m:he?'does':'do',main:base,sMain:v[4]},
   past:{a:[],m:'did',main:base,sMain:v[1]},
   fut:{a:['will'],main:base},
   presC:{a:[s.be[0]],main:ing},pastC:{a:[s.be[1]],main:ing},futC:{a:['will','be'],main:ing},
   presP:{a:[s.have],main:pp},pastP:{a:['had'],main:pp},futP:{a:['will','have'],main:pp},
   presPC:{a:[s.have,'been'],main:ing},pastPC:{a:['had','been'],main:ing},futPC:{a:['will','have','been'],main:ing}}[t];
  let pos,neg,q;
  if(f.m){ // simple present/past with do-support
    pos=`${sl} ${f.sMain}`;neg=`${sl} ${f.m} not ${f.main}`;q=`${f.m[0].toUpperCase()+f.m.slice(1)} ${sl.toLowerCase()==='i'?'I':sl.toLowerCase()} ${f.main}?`;
  }else{
    const a=f.a;pos=`${sl} ${a.join(' ')} ${f.main}`.replace('  ',' ');
    neg=`${sl} ${a[0]} not ${a.slice(1).concat(f.main).join(' ')}`;
    q=`${a[0][0].toUpperCase()+a[0].slice(1)} ${sl==='I'?'I':sl.toLowerCase()} ${a.slice(1).concat(f.main).join(' ')}?`;
  }
  const fix=x=>x.replace(/\s+/g,' ').replace(/(\w) not\b/,'$1 not');
  return {pos:fix(pos),neg:fix(neg),q:fix(q)};
}
function builderHtml(){
  const opt=(a,sel)=>a.map(x=>`<option${x===sel?' selected':''}>${x}</option>`).join('');
  return `<section class="tui tui-builder" id="tui-builder"><div class="tui-head"><h2>Конструктор форм</h2><span>выберите подлежащее, глагол и время</span></div>
  <div class="tui-row"><label>Подлежащее<select data-b="s">${opt(Object.keys(SUBJ),'She')}</select></label>
  <label>Глагол<select data-b="v">${opt(Object.keys(V),'write')}</select></label>
  <label>Время<select data-b="t">${TENSES.map(t=>`<option value="${t[1]}">${t[0]}</option>`).join('')}</select></label></div>
  <div class="tui-out"><div><b>＋</b><span data-o="pos"></span></div><div><b>−</b><span data-o="neg"></span></div><div><b>?</b><span data-o="q"></span></div></div></section>`;
}
function initBuilder(root){
  const el=root.querySelector('#tui-builder');if(!el)return;
  const g=k=>el.querySelector(`[data-b=${k}]`).value;
  const upd=()=>{const r=build(g('s'),g('v'),g('t'));for(const k in r)el.querySelector(`[data-o=${k}]`).textContent=r[k]};
  el.addEventListener('change',upd);upd();
}
/* ---------- quizzes ---------- */
function quizHtml(id,title,items){
  return `<section class="tui tui-quiz" id="${id}" data-n="${items.length}"><div class="tui-head"><h2>${title}</h2><span class="tui-score">0 / ${items.length}</span></div>`+
  items.map((it,i)=>`<div class="tui-q" data-a="${it.a}"><p><b>${i+1}.</b> ${it.q}</p><div class="tui-opts">${it.o.map((o,j)=>`<button type="button" data-j="${j}">${esc(o)}</button>`).join('')}</div><small class="tui-why" hidden>${it.w}</small></div>`).join('')+`</section>`;
}
function initQuiz(root,id){
  const el=root.querySelector('#'+id);if(!el)return;let score=0;
  el.addEventListener('click',e=>{const b=e.target.closest('.tui-opts button');if(!b)return;
    const q=b.closest('.tui-q');if(q.dataset.done)return;q.dataset.done=1;
    const ok=+b.dataset.j===+q.dataset.a;b.classList.add(ok?'ok':'bad');
    if(!ok)q.querySelector(`button[data-j="${q.dataset.a}"]`).classList.add('ok');else score++;
    q.querySelector('.tui-why').hidden=false;el.querySelector('.tui-score').textContent=score+' / '+el.dataset.n;});
}
const TENSE_QUIZ=[
{q:'By 2030 she ___ here for ten years.',o:['will work','will have been working','works'],a:1,w:'Future Perfect Continuous: длительность до момента в будущем.'},
{q:'I ___ TV when you called.',o:['watched','was watching','have watched'],a:1,w:'Past Continuous: процесс в момент другого действия.'},
{q:'We ___ each other since 2019.',o:['know','knew','have known'],a:2,w:'Present Perfect со since; state verb — не Continuous.'},
{q:'When he arrived, the film ___ already ___.',o:['had / started','has / started','was / starting'],a:0,w:'Past Perfect: действие до другого прошлого.'},
{q:'Look! It ___.',o:['rains','is raining','has rained'],a:1,w:'Present Continuous: происходит сейчас.'},
{q:'This time tomorrow I ___ on a beach.',o:['will lie','will be lying','will have lain'],a:1,w:'Future Continuous: процесс в конкретный момент будущего.'}];
const PASSIVE_QUIZ=[
{q:'The letter ___ yesterday.',o:['was sent','is sent','has sent'],a:0,w:'Past Simple Passive: was/were + V3.'},
{q:'English ___ all over the world.',o:['speaks','is spoken','is speaking'],a:1,w:'Present Simple Passive: am/is/are + V3.'},
{q:'The bridge ___ at the moment.',o:['is being repaired','is repaired','has repaired'],a:0,w:'Present Continuous Passive: is/are being + V3.'},
{q:'The report ___ by Friday.',o:['will finish','will be finished','will be finishing'],a:1,w:'Future Simple Passive: will be + V3.'},
{q:'The room ___ already ___.',o:['has / cleaned','has / been cleaned','is / cleaned'],a:1,w:'Present Perfect Passive: has/have been + V3.'},
{q:'The rules ___ be followed.',o:['must','must be','must been'],a:1,w:'Modal Passive: modal + be + V3.'}];
/* ---------- passive transformer ---------- */
const PT=[['Present Simple',(s,pl)=>[pl?'are':'is']],['Past Simple',(s,pl)=>[pl?'were':'was']],['Future Simple',()=>['will be']],['Present Continuous',(s,pl)=>[pl?'are':'is','being']],['Past Continuous',(s,pl)=>[pl?'were':'was','being']],['Present Perfect',(s,pl)=>[pl?'have':'has','been']],['Past Perfect',()=>['had been']],['can / must',()=>['can be']]];
const ING={build:'building',write:'writing',bake:'baking',clean:'cleaning',open:'opening'};
const OBJ=[['the house',0],['the letters',1],['the cake',0],['the windows',1]];
const AG=['Tom','my brother','the workers','she'];
const PV={build:'built',write:'written',bake:'baked',clean:'cleaned',open:'opened'};
function transformerHtml(){
  const o=a=>a.map((x,i)=>`<option value="${i}">${Array.isArray(x)?x[0]:x}</option>`).join('');
  return `<section class="tui tui-trans" id="tui-trans"><div class="tui-head"><h2>Active → Passive</h2><span>соберите пассив из активного предложения</span></div>
  <div class="tui-row"><label>Кто<select data-p="a">${o(AG)}</select></label><label>Глагол<select data-p="v">${Object.keys(PV).map(k=>`<option>${k}</option>`).join('')}</select></label><label>Что<select data-p="o">${o(OBJ)}</select></label><label>Время<select data-p="t">${o(PT)}</select></label></div>
  <div class="tui-out"><div><b>Active</b><span data-r="act"></span></div><div><b>Passive</b><span data-r="pas"></span></div></div>
  <p class="tui-steps" data-r="steps"></p></section>`;
}
function initTransformer(root){
  const el=root.querySelector('#tui-trans');if(!el)return;
  const g=k=>el.querySelector(`[data-p=${k}]`).value;
  const upd=()=>{
    const ag=AG[+g('a')],v=g('v'),[ob,pl]=OBJ[+g('o')],ti=+g('t'),pp=PV[v],plural=!!pl;
    const base=v,t3=/^(he|she|it|Tom|my brother)$/.test(ag);
    const act=[
      `${ag} ${t3?(base==='clean'?'cleans':base+'s'):base} ${ob}.`,
      `${ag} ${({build:'built',write:'wrote',bake:'baked',clean:'cleaned',open:'opened'})[v]} ${ob}.`,
      `${ag} will ${base} ${ob}.`,
      `${ag} ${t3?'is':'is'} ${ING[base]} ${ob}.`.replace('is',/^(the workers)$/.test(ag)?'are':'is'),
      `${ag} ${/^(the workers)$/.test(ag)?'were':'was'} ${ING[base]} ${ob}.`,
      `${ag} ${t3?'has':'has'} ${pp} ${ob}.`.replace('has',/^(the workers)$/.test(ag)?'have':'has'),
      `${ag} had ${pp} ${ob}.`,
      `${ag} can ${base} ${ob}.`][ti];
    const be=PT[ti][1](0,plural).join(' ');
    const cap=ob[0].toUpperCase()+ob.slice(1);
    el.querySelector('[data-r=act]').textContent=act.replace(/^./,c=>c.toUpperCase());
    el.querySelector('[data-r=pas]').textContent=`${cap} ${be} ${pp} by ${ag}.`;
    el.querySelector('[data-r=steps]').innerHTML=`1. «${esc(ob)}» → подлежащее · 2. be в нужном времени: <b>${esc(be)}</b> · 3. V3: <b>${pp}</b> · 4. <b>by ${esc(ag)}</b> (можно опустить)`;
  };
  el.addEventListener('change',upd);upd();
}
/* ---------- outline ---------- */
function slug(t){return 'o-'+t.toLowerCase().replace(/[^a-zа-я0-9]+/gi,'-').replace(/^-|-$/g,'')}
function outline(root,selector){
  const hs=[...root.querySelectorAll(selector)].filter(h=>h.textContent.trim().length>1);
  if(hs.length<3||root.querySelector('.tui-outline'))return;
  hs.forEach(h=>{if(!h.id)h.id=slug(h.textContent)});
  const nav=document.createElement('nav');nav.className='tui-outline';nav.setAttribute('aria-label','На этой странице');
  nav.innerHTML='<b>На этой странице</b>'+hs.map(h=>`<a href="#${h.id}" data-o>${esc(h.textContent.trim().slice(0,40))}</a>`).join('');
  nav.addEventListener('click',e=>{const a=e.target.closest('a[data-o]');if(!a)return;e.preventDefault();document.getElementById(a.getAttribute('href').slice(1))?.scrollIntoView({behavior:'smooth',block:'start'});});
  const first=root.querySelector('h1');(first?first.after(nav):root.prepend(nav));
  if('IntersectionObserver' in window){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){nav.querySelectorAll('a').forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+e.target.id))}}),{rootMargin:'-10% 0px -80% 0px'});hs.forEach(h=>io.observe(h));}
}
window.tenseToolsHtml=()=>builderHtml()+quizHtml('tui-tq','Мини-тест: Tenses',TENSE_QUIZ);
window.initialiseTenseTools=root=>{initBuilder(root);initQuiz(root,'tui-tq');outline(root,'article h2');};
window.passiveToolsHtml=()=>transformerHtml()+quizHtml('tui-pq','Мини-тест: Passive',PASSIVE_QUIZ);
window.initialisePassiveTools=root=>{initTransformer(root);initQuiz(root,'tui-pq');outline(root,'.passive-rule .block-head h2');};
})();
