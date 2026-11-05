/* Fixed assessments use private server snapshots; no client-side grading. */
const ASSESSMENT_SECTIONS = {
  comparison:{title:'Степени сравнения',openBrackets:15,multipleChoice:10},
  tenses:{title:'Tenses',openBrackets:20,multipleChoice:5},
  passive:{title:'Passive Voice',openBrackets:20,multipleChoice:5},
};
function assessmentSection(id){return Object.keys(ASSESSMENT_SECTIONS).find(topic=>String(id||'').startsWith(topic+'-'))||'comparison';}
function assessmentTitle(id){return ASSESSMENT_SECTIONS[assessmentSection(id)].title+' — Тест '+String(id).split('-').at(-1);}
let disposeAssessment = null;
let assessmentTopic = 'comparison';
async function renderAssessmentCatalog(topic='comparison') {
  if(account.user?.role!=='teacher'){location.hash='practice';return;}
  const owner=account.user.id,routeAtStart=location.hash;
  app.innerHTML='<h1>Проверочные тесты</h1><p role="status">Загружаем тесты…</p>';
  const [catalog,roster]=await Promise.all([accountRequest('tests'),accountRequest('teacher/students')]);
  if(account.user?.id!==owner||location.hash!==routeAtStart)return;
  app.innerHTML=`<div class="reading"><h1>${ASSESSMENT_SECTIONS[topic].title}: проверочные тесты</h1><p>Пять постоянных вариантов по 25 вопросов. Состав и порядок не меняются. Эти задания не используются в тренировках.</p><div class="field"><label for="test-student">Ученик для назначения</label><select id="test-student"><option value="">Выберите ученика</option>${roster.students.filter(s=>s.active!==false&&s.active!==0).map(s=>`<option value="${escapeHtml(s.id)}">${escapeHtml(s.name)}</option>`).join('')}</select></div><div class="grammar-sections">${catalog.tests.filter(t=>t.id.startsWith(topic+'-')).map(t=>`<article class="card"><h2>${escapeHtml(t.title)}</h2><p>25 вопросов · ${ASSESSMENT_SECTIONS[topic].openBrackets} со скобками · ${ASSESSMENT_SECTIONS[topic].multipleChoice} с выбором ответа</p><div class="actions"><a class="button" href="#test-preview/${escapeHtml(t.id)}">Просмотреть</a><button class="button" data-test-start="${escapeHtml(t.id)}">Пройти самому</button><button class="button primary" data-test-assign="${escapeHtml(t.id)}">Назначить ученику</button></div></article>`).join('')}</div><p id="test-catalog-status" role="status"></p></div>`;
  for(const button of app.querySelectorAll('[data-test-start],[data-test-assign]'))button.addEventListener('click',async()=>{
    const assign=!!button.dataset.testAssign,id=button.dataset.testAssign||button.dataset.testStart,studentId=app.querySelector('#test-student').value;
    if(assign&&!studentId){app.querySelector('#test-catalog-status').textContent='Сначала выберите ученика.';return;}
    button.disabled=true;
    try{const result=await accountRequest(`tests/${id}/${assign?'assign':'start'}`,assign?{studentId}:{});if(account.user?.id!==owner||location.hash!==routeAtStart)return;if(assign){app.querySelector('#test-catalog-status').textContent='Тест назначен. Ученик увидит его в заданиях от учителя.';button.disabled=false;}else location.hash='test-attempt/'+result.id;}
    catch(error){if(button.isConnected){button.disabled=false;app.querySelector('#test-catalog-status').textContent=error.message;}}
  });
}
function assessmentQuestion(item,n,preview=false) {
  const prompt=escapeHtml(item.prompt).replace(/\(([^)]+)\)/g,item.topic==='passive'?'<span class="blank-token">($1)</span>':'<span class="blank-token">[$1]</span>');
  const controls=item.options?`<div class="choice-list">${item.options.map((o,k)=>`<label><input type="radio" name="test-${n}" value="${k}"  ${preview?'disabled':''}> <span>${escapeHtml(o)}</span></label>`).join('')}</div>`:`<div class="field"><label for="test-${n}">Ответ на вопрос ${n+1}</label><input class="answer-input" id="test-${n}" name="test-${n}" lang="en" spellcheck="false" autocomplete="off" ${preview?'disabled':''}></div>`;
  return `<fieldset class="assessment-question" data-test-question="${n}"><legend>${n+1}. ${item.options?'Выберите один правильный ответ.':'Раскройте скобки.'}</legend><p class="prompt" lang="en">${prompt}</p>${controls}${preview?`<details><summary>Ответ и объяснение для учителя</summary><p>${escapeHtml(item.options?item.options[item.correct_option_index]:item.blanks[0].accepted_answers.join(' / '))}</p><p>${escapeHtml(item.explanation_ru)}</p></details>`:''}</fieldset>`;
}
async function renderAssessmentPreview(id) {
  if(account.user?.role!=='teacher'){location.hash='practice';return;}
  const owner=account.user.id,routeAtStart=location.hash;
  const test=await accountRequest('tests/'+encodeURIComponent(id));
  if(account.user?.id!==owner||location.hash!==routeAtStart)return;
  app.innerHTML=`<div class="assessment-page"><a class="button" href="#tests/${assessmentSection(id)}">← К тестам</a><h1>${escapeHtml(test.title)} · ${ASSESSMENT_SECTIONS[assessmentSection(id)].title}</h1><p>Постоянный вариант · 25 вопросов · 25 баллов. Просмотр для учителя.</p>${test.items.map((i,n)=>assessmentQuestion(i,n,true)).join('')}</div>`;
}
async function renderAssessmentAttempt(id) {
  if(!account.user){location.hash='profile';return;}
  const owner=account.user.id,routeAtStart=location.hash;
  app.innerHTML='<h1>Проверочный тест</h1><p role="status">Загружаем работу…</p>';
  const saved=await accountRequest('test-attempts/'+encodeURIComponent(id));
  assessmentTopic=assessmentSection(saved.assessmentId);
  if(account.user?.id!==owner||location.hash!==routeAtStart)return;
  document.title=saved.title+' — Grammar NOEON';
  if(saved.completed){app.innerHTML=reportMarkup(saved.attempt,saved.title);bindPracticeReport();return;}
  let revision=saved.revision,pending=Promise.resolve(),timer=null,submitting=false,failed=false;
  const items=saved.items;
  app.innerHTML=`<div class="assessment-page"><h1>${escapeHtml(saved.title)}</h1><p>25 вопросов · 25 баллов. Ответы и результат появятся после сдачи всего теста.</p><form id="assessment-form">${items.map((i,n)=>assessmentQuestion(i,n)).join('')}<div class="assessment-actions"><p id="assessment-progress" role="status">Заполнено 0 из 25</p><div class="actions"><button class="button" type="button" id="test-save">Сохранить черновик</button><button class="button primary" type="submit">Сдать тест</button></div><p id="test-save-status" role="status"></p></div></form></div>`;
  const form=app.querySelector('#assessment-form'),status=form.querySelector('#test-save-status');
  if(typeof mountTaskIssueButton==='function')form.querySelectorAll('[data-test-question]').forEach((node,index)=>mountTaskIssueButton(node,{practiceId:id,index}));
  const responses=()=>items.map((i,n)=>i.options?(form.querySelector(`[name="test-${n}"]:checked`)?Number(form.querySelector(`[name="test-${n}"]:checked`).value):null):[form.elements['test-'+n].value]);
  if(saved.draft)saved.draft.forEach((v,n)=>{if(items[n].options){if(v!==null)form.querySelector(`[name="test-${n}"][value="${v}"]`).checked=true;}else form.elements['test-'+n].value=v[0];});
  const progress=()=>{const done=responses().filter(v=>Array.isArray(v)?v[0].trim():v!==null).length;form.querySelector('#assessment-progress').textContent=`Заполнено ${done} из 25`;};progress();
  const queueSave=()=>{
    clearTimeout(timer);timer=null;const values=responses();
    pending=pending.then(async()=>{
      if(account.user?.id!==owner||failed)return;
      const result=await accountRequest(`test-attempts/${id}/draft`,{revision,responses:values});revision=result.revision;if(status.isConnected)status.textContent='Черновик сохранён.';
    }).catch(error=>{failed=true;if(status.isConnected)status.textContent=error.message+' Обновите страницу перед продолжением.';});
    return pending;
  };
  form.addEventListener('input',()=>{progress();status.textContent='Сохраняем черновик…';clearTimeout(timer);timer=setTimeout(queueSave,500);});
  form.querySelector('#test-save').addEventListener('click',queueSave);
  disposeAssessment=()=>{clearTimeout(timer);if(!submitting&&!failed&&account.user?.id===owner&&form.isConnected)void queueSave();};
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(submitting)return;submitting=true;
    const values=responses(),missing=values.map((v,n)=>({v,n})).filter(({v})=>Array.isArray(v)?!v[0].trim():v===null);
    let allowIncomplete=false;
    if(missing.length){allowIncomplete=await confirmIncompleteAssessment(missing.length);if(!allowIncomplete){submitting=false;if(form.isConnected){const control=form.querySelector(`[name="test-${missing[0].n}"]`);control?.focus();control?.scrollIntoView({block:'center',behavior:'smooth'});}return;}}
    if(account.user?.id!==owner||location.hash!==routeAtStart)return;
    clearTimeout(timer);const button=form.querySelector('[type=submit]');button.disabled=true;
    try{await queueSave();if(failed)throw Error('Черновик изменился. Обновите страницу.');const result=await accountRequest(`test-attempts/${id}/submit`,{revision,responses:responses(),allowIncomplete});if(account.user?.id!==owner||location.hash!==routeAtStart)return;disposeAssessment=null;app.innerHTML=reportMarkup(result.attempt,result.title);bindPracticeReport();window.scrollTo({top:0,behavior:'instant'});}
    catch(error){submitting=false;if(button.isConnected){button.disabled=false;status.textContent=error.message;}}
  });
}

function confirmIncompleteAssessment(count) {
  return new Promise(resolve=>{
    const dialog=document.createElement('dialog');dialog.className='assessment-confirm';dialog.setAttribute('aria-labelledby','test-confirm-title');
    dialog.innerHTML=`<h2 id="test-confirm-title">Сдать тест с пропусками?</h2><p>Не отвечено: <strong>${count} из 25</strong>. За эти вопросы будет 0 баллов. После сдачи изменить ответы нельзя.</p><div class="actions"><button class="button" type="button" data-test-return>Вернуться к вопросам</button><button class="button primary" type="button" data-test-finish>Всё равно сдать</button></div>`;
    const finish=value=>{dialog.close();dialog.remove();resolve(value);};
    dialog.addEventListener('cancel',event=>{event.preventDefault();finish(false);});dialog.querySelector('[data-test-return]').onclick=()=>finish(false);dialog.querySelector('[data-test-finish]').onclick=()=>finish(true);
    document.body.append(dialog);dialog.showModal();dialog.querySelector('[data-test-return]').focus();
  });
}
