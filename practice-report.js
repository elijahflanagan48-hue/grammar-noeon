/* Reports use stored server grades, never regrade historical answers. */
function reportFieldTopics(item, index) {
  const target=item.blanks?.[index]?.tense_or_construction;
  return target ? exerciseTenses({tags:[target]}) : exerciseTenses(item);
}
function storedTopicSummary(answers) {
  const topics={};
  for(const answer of answers) (answer.fields||[]).forEach((field,index)=>{
    for(const id of reportFieldTopics(answer.item,index)) {
      const counts=topics[id]||(topics[id]=[0,0]);
      if(field.verified!==false){counts[1]++;if(field.correct)counts[0]++;}
    }
  });
  return topics;
}
function reviewableTranslationField(answer, index) {
  const field=answer.fields?.[index];
  return answer.item?.type==='translation_ru_en' && !!field && !field.skipped &&
    (answer.item.grading_mode==='teacher' || field.verified===false || !!field.manual_review);
}
function reportSummary(attempt) {
  const answers=attempt.answers||[], fields=answers.flatMap(a=>a.fields||[]);
  const correct=fields.filter(f=>f.correct&&f.verified!==false).length;
  const pending=fields.filter(f=>f.verified===false).length, checked=fields.length-pending, topics=new Map();
  for(const answer of answers) (answer.fields||[]).forEach((f,index)=>{
    for(const id of reportFieldTopics(answer.item,index)) {
      if(!topics.has(id))topics.set(id,{id,label:PRACTICE_TENSES.find(t=>t.id===id)?.label||id,correct:0,checked:0,pending:0,refs:new Set()});
      const topic=topics.get(id);
      if(f.verified===false)topic.pending++;else {topic.checked++;if(f.correct)topic.correct++;}
      if(!f.correct&&f.verified!==false)for(const ref of refsFor(answer.item))topic.refs.add(ref);
    }
  });
  return {correct,checked,pending,wrong:checked-correct,percent:checked?Math.round(correct/checked*100):null,answers,topics:[...topics.values()]};
}
function reportRuleLinks(refs, className='report-rule', prefix='') {
  const links=new Map([...refs].map(ref=>[ruleLink(ref),ref]));
  return [...links].map(([href,ref])=>{
    const route=href.slice(1).split('/')[1], title=state.theory.find(t=>t.id===route)?.title || 'Открыть правило';
    return `<a class="${className}" data-rule-prefix="${escapeHtml(prefix)}" data-rule-ref="${escapeHtml(ref)}" href="${escapeHtml(href)}">${escapeHtml(prefix+title)}</a>`;
  }).join('');
}
function reportBackLink(studentId) {
  const fallback='#student/'+encodeURIComponent(studentId);
  return `<a class="button" data-report-back href="${escapeHtml(fallback)}">← Назад</a>`;
}
function prepareReportPrint(report) {
  if(!report)return;
  document.getElementById('print-report')?.remove();
  const copy=report.cloneNode(true);copy.id='print-report';
  copy.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));
  copy.querySelectorAll('details').forEach(n=>n.open=true);
  copy.querySelectorAll('[hidden]').forEach(n=>n.hidden=false);
  document.body.append(copy);
}
function printReport(report) { prepareReportPrint(report); window.print(); }
function reviewQueueEntry(summary) {
  return `<section class="today-section review-queue-entry"><h2>Ожидают моей проверки</h2><p>${summary?`Переводов: <strong>${Number(summary.totalFields)}</strong> · Работ: ${Number(summary.total)}.`:'Переводы учеников, которым нужна ваша оценка.'}</p><a class="button primary" href="#review-queue">Открыть очередь проверки →</a></section>`;
}
async function renderReviewQueue() {
  if(account.user?.role!=='teacher'){location.hash='profile';return;}
  syncRouteNav();const owner=account.user.id,route=location.hash;
  app.innerHTML='<h1>Ожидают моей проверки</h1><p role="status">Собираем переводы…</p>';
  let cursor=null,generation=0;
  const active=()=>account.user?.id===owner&&account.user?.role==='teacher'&&location.hash===route;
  const card=w=>`<article class="review-queue-card"><p class="eyebrow">${escapeHtml(w.studentName)}</p><h2>${escapeHtml(w.title)}</h2><p>Переводов на проверку: ${Number(w.pending)}</p><p class="subtle">Работа завершена: ${escapeHtml(new Date(w.completed*1000).toLocaleString('ru-RU'))}${w.source==='self'?' · самостоятельная практика':''}</p><a class="button primary" href="#report/${encodeURIComponent(w.studentId)}/${encodeURIComponent(w.practiceId)}">Открыть проверку →</a></article>`;
  async function load(more=false){
    const requestGeneration=++generation;
    const data=await accountRequest('teacher/reviews'+(more&&cursor?'?cursor='+encodeURIComponent(cursor):''));
    if(!active()||requestGeneration!==generation)return;
    if(!more){
      app.innerHTML='<h1>Ожидают моей проверки</h1><p>Здесь переводы из завершённых работ ваших активных учеников. Откройте работу, прочитайте условие и ответ, затем выберите решение и при желании добавьте комментарий.</p><p id="review-queue-total" role="status"></p><button class="button" id="review-queue-refresh" type="button">Обновить очередь</button><div id="review-queue-items"></div><button class="button" id="review-queue-more" type="button" hidden>Показать ещё</button><p id="review-queue-error" role="alert"></p>';
      app.querySelector('#review-queue-refresh').addEventListener('click',event=>update(event,false));
      app.querySelector('#review-queue-more').addEventListener('click',event=>update(event,true));
    }
    cursor=data.nextCursor;
    app.querySelector('#review-queue-total').textContent=`Переводов: ${data.totalFields} · Работ: ${data.total}`;
    const list=app.querySelector('#review-queue-items');
    const markup=data.items.map(card).join('');
    if(more)list.insertAdjacentHTML('beforeend',markup);else list.innerHTML=markup||'<p class="review-queue-empty">Сейчас нет переводов, ожидающих вашей проверки.</p>';
    app.querySelector('#review-queue-more').hidden=!cursor;
    app.querySelector('#review-queue-error').textContent='';
  }
  async function update(event,more){
    const button=event.currentTarget;button.disabled=true;
    try{await load(more);}catch(error){if(active())app.querySelector('#review-queue-error').textContent=error.message;}
    finally{if(active())button.disabled=false;}
  }
  await load();
}
function translationReviewControls(answer,answerIndex,enabled) {
  if(!enabled)return '';
  return (answer.fields||[]).map((field,index)=>reviewableTranslationField(answer,index)?`<section class="manual-review" data-review-answer="${answerIndex}" data-review-field="${index}"><h3>${answer.fields.length>1?`Поле ${index+1}: `:''}${field.verified===false?'Проверить перевод':'Изменить решение'}</h3><label for="review-note-${answerIndex}-${index}">Комментарий ученику <span class="subtle">(необязательно)</span></label><textarea class="answer-area" id="review-note-${answerIndex}-${index}" rows="2" maxlength="2000" placeholder="Что получилось или что нужно исправить">${escapeHtml(field.manual_review?.note||'')}</textarea><div class="actions"><button class="button primary" type="button" data-review-decision="correct">Зачесть</button><button class="button" type="button" data-review-decision="incorrect">Не зачесть</button></div><p role="status" class="manual-review-status"></p><button class="button" type="button" data-review-refresh hidden>Обновить работу</button></section>`:'').join('');
}
function reportSubmittedField(item,field,index,teacherView) {
  const e=escapeHtml,review=field.manual_review;
  const status=field.verified===false?'Требует проверки преподавателем':review?`Преподаватель: ${field.correct?'зачтено':'не зачтено'}`:field.correct?'Верно':'Нужно исправить';
  return `<div class="report-submitted" data-field-index="${index}" tabindex="-1"><span>${index+1}. ${teacherView?'Ответ ученика':'Ваш ответ'}</span><strong lang="en">${e(submittedDisplay(item,field.submitted))}</strong><small>${status}</small>${review?`${Number.isFinite(review.at)?`<p class="manual-review-result">Проверено: ${e(new Date(review.at*1000).toLocaleString('ru-RU'))}</p>`:''}${review.note?`<p><strong>Комментарий преподавателя:</strong> ${e(review.note)}</p>`:''}`:''}</div>`;
}
function remediationActions(attempt,studentId='') {
  const eligible=attempt.status==='completed'&&(attempt.answers||[]).some(a=>(a.fields||[]).some(f=>!f.correct&&f.verified===true&&!f.skipped));
  if(!eligible)return '';
  return `<section class="remediation-actions" data-remediation-source="${escapeHtml(attempt.id||'')}" data-remediation-student="${escapeHtml(studentId)}"><h2>Закрепить ошибки</h2><p>Новые похожие задания проверяют понимание правила; повтор прежних помогает ещё раз разобрать знакомые примеры.</p><div class="actions"><button class="button primary" type="button" data-remediation-mode="new">Потренировать ошибки этой работы</button><button class="button" type="button" data-remediation-mode="repeat">Повторить прежние задания с ошибками</button></div><div class="remediation-preview" aria-live="polite"></div></section>`;
}
function bindRemediation() {
  app.querySelectorAll('[data-remediation-mode]').forEach(button=>button.addEventListener('click',async()=>{
    const section=button.closest('[data-remediation-source]'),panel=section.querySelector('.remediation-preview');
    const owner=account.user?.id,route=location.hash,teacher=!!section.dataset.remediationStudent,mode=button.dataset.remediationMode;
    const sequence=section.remediationSequence=(section.remediationSequence||0)+1;
    const active=()=>section.isConnected&&account.user?.id===owner&&location.hash===route&&sequence===section.remediationSequence;
    const endpoint=(teacher?'teacher/students/'+encodeURIComponent(section.dataset.remediationStudent)+'/':'')+'reports/'+encodeURIComponent(section.dataset.remediationSource)+'/remediation';
    panel.innerHTML='<p role="status">Подбираем задания…</p>';
    try{
      const plan=await accountRequest(endpoint+'?mode='+mode);if(!active())return;
      if(!plan.canStart){panel.innerHTML='<p>Свободная практика закрыта. Подобрать и назначить такую тренировку может преподаватель из отчёта о вашей работе.</p>';return;}
      if(!plan.items.length){panel.innerHTML=plan.wrongCount===0?'<p>В этой работе больше нет проверенных ошибок.</p>':mode==='repeat'?'<p>Эти старые задания не поддерживают точный повтор. Можно подобрать новые аналогичные упражнения.</p>':'<p>Новых подходящих заданий сейчас нет. Можно повторить прежние задания с ошибками.</p>';return;}
      panel.innerHTML=`${plan.omitted?'<p>Часть старых заданий не поддерживает точный повтор и не включена в подборку.</p>':''}<h3>${mode==='new'?'Новые аналогичные упражнения':'Те же задания с прежними ключами'}</h3><p>${mode==='new'?(teacher?'Подборка по темам ошибочных полей; уже выданные ученику предложения исключены.':'Подборка по темам ошибочных полей; уже выданные вам предложения исключены.'):'Повторяются только задания с проверенными ошибками. Это отдельная новая работа; исходный результат сохранится.'}</p>${plan.items.map((item,index)=>`<article><label><input type="checkbox" data-remediation-include="${index}" checked> Задание ${index+1}</label><p>${escapeHtml(item.prompt||'')}</p>${item.options?`<ol>${item.options.map(o=>`<li>${escapeHtml(o)}</li>`).join('')}</ol>`:''}${account.user.role==='teacher'?`<details><summary>Ответы для преподавателя</summary><p>${escapeHtml(correctAnswer(item))}</p></details>`:''}</article>`).join('')}<button class="button primary" type="button" data-remediation-start>${teacher?'Назначить ученику':'Начать тренировку'}</button><p class="remediation-status" role="status"></p>`;
      panel.querySelector('[data-remediation-start]').addEventListener('click',async event=>{
        const start=event.currentTarget,status=panel.querySelector('.remediation-status');start.disabled=true;
        try{
          const selected=[...panel.querySelectorAll('[data-remediation-include]:checked')].map(input=>plan.items[Number(input.dataset.remediationInclude)]),ids=selected.map(item=>item.id);
          if(!ids.length)throw new Error('Оставьте хотя бы одно задание.');
          const result=await accountRequest(endpoint,{mode,revision:plan.revision,requestId:plan.requestId,ids,itemVersions:selected.map(i=>i.content_version??null)});if(!active())return;
          if(teacher){toast('Тренировка назначена');location.hash='student/'+encodeURIComponent(section.dataset.remediationStudent);return;}
          const saved=await accountRequest('practice/'+encodeURIComponent(result.practiceId));if(!active())return;
          state.session={items:saved.items,index:saved.index,answers:saved.answers,correct:saved.correct,checked:false,draft:saved.draft,contentOutdated:saved.contentOutdated,remote:{id:saved.id,revision:saved.revision}};
          saveSession();location.hash='session';
        }catch(error){if(active()){status.textContent=error.message;start.disabled=false;}}
      });
    }catch(error){if(active())panel.innerHTML=`<p role="alert">${escapeHtml(error.message)}</p>`;}
  }));
}

function reportMarkup(attempt,title='Итоги тренировки',studentName='',showNavigation=true,reviewStudentId='') {
  const s=reportSummary(attempt), e=escapeHtml;
  const teacherView=!!studentName && account.user?.role==='teacher';
  const reviewEnabled=teacherView&&reviewStudentId&&attempt.status==='completed';
  const pendingTranslations=s.answers.reduce((n,a)=>n+(a.fields||[]).filter((f,i)=>f.verified===false&&reviewableTranslationField(a,i)).length,0);
  const unfinished=attempt.status&&attempt.status!=='completed';
  const headline=teacherView&&!unfinished?'Результат работы':unfinished?(attempt.status==='cancelled'?'Задание снято':'Работа в процессе'):s.percent===null?'Сохранённая работа':s.wrong===0?'Отличная работа!':s.percent>=70?'Хорошая основа — закрепим детали':'Есть над чем поработать';
  const date=new Date(attempt.date).toLocaleString('ru-RU');
  const footer=showNavigation?`<div class="report-footer"><a class="button" href="#results">Все результаты</a><a class="button primary" href="#practice">${account.user?.role==='student'?'Моя практика':'Новая тренировка →'}</a></div>`:'';
  return `<div class="practice-report"${reviewEnabled?` data-review-student="${e(reviewStudentId)}" data-review-work="${e(attempt.id)}" data-review-revision="${attempt.revision}"`:""}><div class="eyebrow">${teacherView?'Отчёт ученика · '+e(studentName):unfinished?'Задание':'Ваш маршрут обучения · отчёт'}</div><h1>${e(title)}</h1>${attempt.source==='self'?'<p class="subtle">самостоятельно</p>':''}<button class="button report-print" type="button">Печать / PDF</button><p class="subtle">${studentName?e(studentName)+' · ':''}${e(date)} · Выполнено: ${attempt.index??s.answers.length}/${attempt.total}</p>
    <section class="report-hero"><div class="report-orbit" style="--result:${s.percent||0}%" aria-label="Точность ${s.percent===null?'не определена':s.percent+'%'}"><span>${s.percent===null?'—':s.percent+'%'}<small>точность</small></span></div><div><h2>${headline}</h2>${teacherView?'':'<p>Это результат этой работы, а не оценка вашего общего уровня английского.</p>'}<div class="report-metrics"><div><strong>${attempt.assessmentId?'Баллов':'Полей верно'}: ${s.correct} из ${s.checked}</strong><span>Полей с ошибкой: ${s.wrong}</span></div><div><strong>Заданий: ${s.answers.length}</strong></div></div></div></section>
    ${attempt.id?remediationActions(attempt,teacherView?reviewStudentId:''):''}
    ${s.pending?`<p class="report-legacy" role="note">Полей, требующих проверки преподавателем: ${s.pending}. Они не включены в процент и не объявлены ошибками. Свободный перевод может иметь другие корректные формулировки.${unfinished?' Завершите работу, чтобы преподаватель получил переводы на проверку.':''}</p>`:''}
    ${reviewEnabled&&s.answers.some(a=>(a.fields||[]).some((_,i)=>reviewableTranslationField(a,i)))?`<section class="manual-review-overview"><h2>${pendingTranslations?`Переводов на проверку: ${pendingTranslations}`:'Все переводы проверены'}</h2><p>Условие и ответ ученика — ниже. После сохранения решения ученик увидит оценку и комментарий в уведомлении и отчёте.</p><a class="button" href="#review-queue">← К очереди проверки</a></section>`:''}
    <section class="report-topics"><h2>Карта результата</h2><p class="subtle">Только темы этой работы. Один ответ может содержать несколько полей.</p><div class="report-topic-grid">${s.topics.map(t=>`<article class="report-topic"><h3>${e(t.label)}</h3><div class="report-topic-score"><strong>${t.correct} / ${t.checked}</strong><span>${t.checked?Math.round(t.correct/t.checked*100)+'%':'без оценки'}</span></div><progress max="${t.checked||1}" value="${t.correct}" aria-label="${e(t.label)}: ${t.correct} из ${t.checked}"></progress>${t.refs.size?`<p>${t.checked>t.correct?'Повторить правило:':'Справочные правила:'}</p>${reportRuleLinks(t.refs)}`:`<p class="subtle">${t.pending&&!t.checked?'Ожидает проверки преподавателем.':'В проверенных ответах ошибок нет.'}</p>`}</article>`).join('')}</div></section>
    <details class="report-review"${reviewEnabled&&pendingTranslations?' open':''}><summary class="report-review-toggle">Задания и ответы (${s.answers.length})</summary><div class="account-title"><h2>Разбор ответов</h2><div class="report-filters" role="group" aria-label="Какие ответы показать"><button class="button" data-report-filter="all" aria-pressed="true">Все (${s.answers.length})</button><button class="button" data-report-filter="mistakes" aria-pressed="false">С ошибками (${s.answers.filter(a=>(a.fields||[]).some(f=>!f.correct&&f.verified!==false)).length})</button>${pendingTranslations?`<button class="button" data-report-filter="pending" aria-pressed="false">Ожидают проверки (${pendingTranslations})</button>`:''}</div></div><p class="report-filter-empty" hidden>В этой работе нет автоматически выявленных ошибок.</p>${s.answers.map((a,n)=>{
      const wrong=(a.fields||[]).some(f=>!f.correct&&f.verified!==false),pending=(a.fields||[]).some(f=>f.verified===false);
      const manual=a.item.type==='translation_ru_en',hideModel=manual&&pending&&!teacherView;
      const controls=translationReviewControls(a,n,reviewEnabled);
      const sample=`<p>${manual?'Образец перевода':'Верный вариант'}: <strong lang="en">${e(correctAnswer(a.item))}</strong></p><div class="explanation">${explanations(a.item, a.fields)}</div>`;
      const reference=hideModel?'<p>Перевод ожидает проверки преподавателя.</p>':reviewEnabled&&manual?`<details class="translation-model"><summary>Образец и пояснение для преподавателя</summary>${sample}</details>`:sample;
      return `<details class="report-answer" data-answer-index="${n}" data-report-wrong="${wrong}" data-report-pending="${pending}"${reviewEnabled&&pending&&manual?' open':''}><summary><span class="report-answer-status ${wrong?'is-wrong':pending?'is-neutral':'is-correct'}">${wrong?'×':pending?'?':'✓'}</span><span>${e(displayPrompt(a.item))}</span></summary><div class="report-answer-body">${a.item.instruction_ru?`<p>${e(a.item.instruction_ru)}</p>`:''}${(a.fields?.length?a.fields:[{submitted:a.submitted,verified:false}]).map((f,i)=>reportSubmittedField(a.item,f,i,teacherView)).join('')}${controls}${reference}<div class="rule-links">${reportRuleLinks(refsFor(a.item),'button','Почему так? ')}</div></div></details>`;
    }).join('')}</details>${footer}</div>`;
}
function bindPracticeReport() {
  bindRemediation();
  app.querySelectorAll('[data-review-decision]').forEach(button=>button.addEventListener('click',async()=>{
    const card=button.closest('[data-review-answer]'),report=button.closest('.practice-report'),status=card.querySelector('.manual-review-status');
    const studentId=report.dataset.reviewStudent,workId=report.dataset.reviewWork,owner=account.user?.id,route=location.hash;
    const answerIndex=Number(card.dataset.reviewAnswer),fieldIndex=Number(card.dataset.reviewField);
    const active=()=>account.user?.id===owner&&location.hash===route;
    const drafts=[...report.querySelectorAll('.manual-review')].flatMap(node=>{
      const input=node.querySelector('textarea');
      return node!==card&&input.value!==input.defaultValue?[{answer:node.dataset.reviewAnswer,field:node.dataset.reviewField,value:input.value}]:[];
    });
    let saved=false;
    report.querySelectorAll('[data-review-decision], .manual-review textarea').forEach(b=>b.disabled=true);status.textContent='Сохраняем проверку…';
    const reload=async()=>{if(route.startsWith('#report/'))await renderAssignmentReport(studentId,workId);else await renderWorkDetails(workId,studentId);};
    try{
      const result=await accountRequest(`teacher/students/${encodeURIComponent(studentId)}/reports/${encodeURIComponent(workId)}/review`,{revision:Number(report.dataset.reviewRevision),answerIndex,fieldIndex,correct:button.dataset.reviewDecision==='correct',note:card.querySelector('textarea').value});
      saved=true;
      if(!active())return;
      await reload();if(!active())return;
      for(const draft of drafts){const input=app.querySelector(`[data-review-answer="${draft.answer}"][data-review-field="${draft.field}"] textarea`);if(input)input.value=draft.value;}
      const fresh=app.querySelector(`[data-review-answer="${answerIndex}"][data-review-field="${fieldIndex}"]`);
      if(fresh){for(let d=fresh.closest('details');d;d=d.parentElement?.closest('details'))d.open=true;fresh.querySelector('.manual-review-status').textContent=result.unchanged?'Это решение уже сохранено.':'Решение сохранено. Ученик увидит уведомление.';}
      toast('Проверка сохранена');
    }catch(error){if(active()){
      status.textContent=saved?'Решение сохранено, но не удалось обновить отчёт. Обновите работу.':error.message;report.querySelectorAll('[data-review-decision], .manual-review textarea').forEach(b=>b.disabled=false);
      const refresh=card.querySelector('[data-review-refresh]');refresh.hidden=error.status!==409&&!saved;
      refresh.onclick=async()=>{refresh.disabled=true;try{await reload();}catch(e){if(active())status.textContent=e.message;}finally{refresh.disabled=false;}};
    }}
  }));
  const titles=new Map();
  app.querySelectorAll('[data-rule-ref]').forEach(link=>{
    const ref=link.dataset.ruleRef;
    if(!titles.has(ref))titles.set(ref,ruleTitle(ref));
    void titles.get(ref).then(title=>{if(link.isConnected)link.textContent=(link.dataset.rulePrefix||'')+title;});
  });
  app.querySelectorAll('.report-print:not([data-print-bound])').forEach(button=>{button.dataset.printBound='yes';button.addEventListener('click',()=>printReport(button.closest('.practice-report')));});
  app.querySelectorAll('[data-report-back]:not([data-back-bound])').forEach(link=>{
    link.dataset.backBound='yes';const previous=previousAppRoute;
    link.addEventListener('click',event=>{restoreScrollOnRoute=true;if(previous && history.length>1){event.preventDefault();history.back();}});
  });
  app.querySelectorAll('[data-report-filter]').forEach(button=>button.addEventListener('click',()=>{
    const scope=button.closest('.practice-report'),filter=button.dataset.reportFilter;let visible=0;
    scope.querySelectorAll('[data-report-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    scope.querySelectorAll('[data-report-wrong]').forEach(row=>{row.hidden=filter==='mistakes'?row.dataset.reportWrong!=='true':filter==='pending'?row.dataset.reportPending!=='true':false;if(!row.hidden)visible++;});
    scope.querySelector('.report-filter-empty').hidden=visible!==0;
    scope.querySelector('.report-filter-empty').textContent=filter==='pending'?'Все переводы уже проверены.':'В этой работе нет автоматически выявленных ошибок.';
  }));
}
async function renderOwnReport(id) {
  if(!account.user){location.hash='profile';return;}
  syncRouteNav();const owner=account.user.id,routeAtStart=location.hash;
  app.innerHTML='<p role="status">Собираем ваш отчёт…</p>';
  const data=await accountRequest('reports/'+encodeURIComponent(id));
  if(account.user?.id!==owner||location.hash!==routeAtStart)return;
  document.title = `Отчёт: ${data.title} — Grammar NOEON`;
  app.innerHTML=reportMarkup(data.attempt,data.title);bindPracticeReport();focusReportAnswer();
}
function focusReportAnswer() {
  const match=location.hash.match(/\/answer\/(\d+)(?:\/field\/(\d+))?$/);
  if(!match)return;
  const card=app.querySelector(`[data-answer-index="${Number(match[1])}"]`);
  if(!card)return;
  for(let detail=card;detail;detail=detail.parentElement?.closest('details'))detail.open=true;
  const field=card.querySelector(`[data-field-index="${Number(match[2]||0)}"]`)||card;
  field.classList.add('review-focus');
  requestAnimationFrame(()=>{if(field.isConnected){field.scrollIntoView({block:'center'});field.focus({preventScroll:true});}});
}
function focusPendingTranslation() {
  const card=[...app.querySelectorAll('.report-answer[data-report-pending="true"]')].find(node=>node.querySelector('.manual-review'));
  if(!card)return;
  requestAnimationFrame(()=>{if(card.isConnected){card.scrollIntoView({block:'start'});card.querySelector('summary').focus({preventScroll:true});}});
}
async function renderWorkDetails(id,studentId='') {
  if(!account.user||(studentId&&account.user.role!=='teacher')){location.hash='profile';return;}
  syncRouteNav();
  const owner=account.user.id,routeAtStart=location.hash;
  app.innerHTML='<p role="status">Загружаем задание…</p>';
  const endpoint=studentId?`teacher/students/${encodeURIComponent(studentId)}/attempts/${encodeURIComponent(id)}`:`attempts/${encodeURIComponent(id)}`;
  const data=await accountRequest(endpoint);
  if(account.user?.id!==owner||location.hash!==routeAtStart)return;
  document.title = `Задание: ${data.title} — Grammar NOEON`;
  const back=studentId?'#student/'+encodeURIComponent(studentId):account.user.role==='student'?'#practice':'#results';
  const a=data.assignment;
  const overview=data.attempt.answers.length?reportMarkup(data.attempt,data.title,data.student?.name||'',false,studentId):`<h1>${escapeHtml(data.title)}</h1><p>${data.student?escapeHtml(data.student.name)+' · ':''}${data.attempt.status==='cancelled'?'Задание снято':'Ещё не начато'} · Заданий: ${data.attempt.total}</p>`;
  app.innerHTML=`${studentId?reportBackLink(studentId):`<a class="button" href="${back}">← К заданиям</a>`}${data.canResume?`<p><button class="button primary" data-resume="${escapeHtml(id)}">${data.attempt.index?'Продолжить':'Начать задание'}</button></p>`:''}${overview}${a?`<details class="work-management"><summary>Управление заданием</summary><div class="assignment-actions">${data.attempt.assessmentId?'':`<a class="button" href="#edit/${encodeURIComponent(studentId)}/${encodeURIComponent(a.id)}">Редактировать</a>`}<button class="button" data-assignment-manage="${a.cancelled?'restore':'cancel'}" data-student="${escapeHtml(studentId)}" data-assignment="${escapeHtml(a.id)}" data-version="${a.version}">${a.cancelled?'Восстановить':'Снять задание'}</button><p class="assignment-message" role="status"></p></div></details>`:''}`;
  bindPracticeReport();bindAccountHistory();bindAssignmentManagement();if(studentId)focusPendingTranslation();
}
function renderAutomaticUpgrade(session) {
  app.innerHTML='<div class="reading"><div class="eyebrow">Обновление заданий</div><h1>Перейдём на точный формат</h1><p>В этой старой подборке есть ещё не выполненные задания со свободным ответом. Они заменятся актуальными вариантами с автоматической проверкой. Уже проверенные ответы и баллы останутся прежними. Текущий черновик будет сохранён в архиве, но не перенесён в новый формат.</p><button class="button primary" id="upgrade-automatic">Обновить формат и продолжить</button><p id="upgrade-error" role="alert"></p></div>';
  app.querySelector('#upgrade-automatic').addEventListener('click',async event=>{
    const owner=account.user?.id,routeAtStart=location.hash;
    event.currentTarget.disabled=true;
    try {
      await flushAccountDraft(session);
      await accountRequest(`practice/${session.remote.id}/automatic`,{revision:session.remote.revision});
      const saved=await accountRequest(`practice/${session.remote.id}`);
      if(account.user?.id!==owner||location.hash!==routeAtStart)return;
      state.session={items:saved.items,index:saved.index,answers:saved.answers,correct:saved.correct,checked:false,draft:saved.draft,remote:{id:saved.id,revision:saved.revision}};
      saveSession();renderSession();
    } catch(error){if(account.user?.id===owner&&location.hash===routeAtStart){app.querySelector('#upgrade-error').textContent=error.message;app.querySelector('#upgrade-automatic').disabled=false;}}
  });
}

let resultTopicState = null;
function initialiseResultTopics(attempts, hasMore, studentId='') {
  const current=resultTopicState={owner:account.user?.id,route:location.hash,studentId,selected:null,kind:'practice',errors:[],errorCursor:null,errorLoaded:false,errorLoading:false,errorGeneration:0,expanded:new Set(),loading:true,statistics:null};
  renderResultTopics();
  if(document.getElementById('all-time-topics'))void loadResultStatistics(current);
}
// Loading another history page must never alter the all-history aggregate.
function appendResultTopics() {}
async function loadResultStatistics(current) {
  current.loading=true;current.message='';renderResultTopics();
  try {
    const prefix=current.studentId?`teacher/students/${encodeURIComponent(current.studentId)}/`:'';
    const data=await accountRequest(prefix+'statistics');
    if(resultTopicState!==current||account.user?.id!==current.owner||location.hash!==current.route)return;
    current.statistics=data;
  } catch(error) {
    if(resultTopicState===current&&account.user?.id===current.owner&&location.hash===current.route)current.message=error.message;
  } finally {
    if(resultTopicState===current&&account.user?.id===current.owner&&location.hash===current.route){current.loading=false;renderResultTopics();}
  }
}
function statisticsMetrics(value) {
  const checked=Number(value?.checked)||0,correct=Number(value?.correct)||0;
  return `<span class="statistics-metrics"><strong>${checked?Math.round(correct/checked*100)+'%':'Нет проверенных ответов'}</strong><span>Проверено ответов: ${checked}${value?.pending?` · Ожидают проверки: ${Number(value.pending)}`:''}</span><small>Последняя работа: ${value?.lastWork?escapeHtml(new Date(value.lastWork).toLocaleDateString('ru-RU')):'пока нет'}</small></span>`;
}
function renderResultTopics() {
  const state=resultTopicState, container=document.getElementById('all-time-topics');
  if(!container||!state||state.owner!==account.user?.id||state.route!==location.hash)return;
  if(state.loading){container.innerHTML='<h2>Статистика</h2><p role="status">Собираем статистику по всем завершённым работам…</p>';return;}
  if(!state.statistics){container.innerHTML=`<h2>Статистика</h2><p role="alert">${escapeHtml(state.message||'Не удалось загрузить статистику.')}</p><button type="button" class="button" data-statistics-retry>Повторить загрузку</button>`;container.querySelector('[data-statistics-retry]')?.addEventListener('click',()=>loadResultStatistics(state));return;}
  const labels={practice:'Тренировки',assessment:'Проверочные тесты'},kinds=state.statistics.kinds;
  const topicLabel=id=>PRACTICE_TENSES.find(t=>t.id===id)?.label||id;
  const emptyAction=state.studentId?`<a class="button" href="#assign/${encodeURIComponent(state.studentId)}">Назначить первую работу</a>`:'<a class="button" href="#practice">Открыть задания и практику</a>';
  container.innerHTML=`<h2>Статистика</h2><p class="subtle">Учитываются завершённые работы. Ответы, ожидающие проверки, не влияют на точность.</p><details class="statistics-explanation"><summary>Как считается статистика</summary><p>По всей истории, независимо от загруженных страниц. Один ответ на несколько тем учитывается в каждой подтеме, а в итоге раздела — один раз.</p></details><div class="statistics-kinds">${Object.entries(labels).map(([key,label])=>`<section class="statistics-kind"><h3>${label}</h3><p>Завершено работ: ${Number(kinds[key].sessions)}</p>${statisticsMetrics(kinds[key])}</section>`).join('')}</div>${['tenses','comparison','passive','modals','reported'].map(section=>{
    const title={tenses:'Tenses',comparison:'Comparison',passive:'Passive',modals:'Modal Verbs',reported:'Reported Speech',nouns:'Nouns',speaking:'Say · Tell · Speak · Talk'}[section];
    const parts=Object.keys(labels).map(kind=>({kind,data:kinds[kind].sections.find(value=>value.id===section)||{correct:0,checked:0,pending:0,lastWork:null,topics:[]}}));
    return `<details class="statistics-section" data-statistics-section="${section}" ${state.expanded.has(section)?'open':''}><summary><strong>${title}</strong>${parts.map(({kind,data})=>`<span>${labels[kind]}: ${data.checked?Math.round(data.correct/data.checked*100)+'%':'—'} · Проверено: ${Number(data.checked)} · ${data.lastWork?escapeHtml(new Date(data.lastWork).toLocaleDateString('ru-RU')):'работ пока нет'}</span>`).join('')}</summary><div class="statistics-kinds">${parts.map(({kind,data})=>`<section class="statistics-kind"><h3>${labels[kind]}</h3>${statisticsMetrics(data)}${data.topics.length?`<div class="statistics-topic-list">${data.topics.map(topic=>`<button type="button" class="topic-cell" data-topic-id="${escapeHtml(topic.id)}" data-statistics-kind="${kind}" aria-pressed="${state.selected===topic.id&&state.kind===kind}"><strong>${escapeHtml(topicLabel(topic.id))}</strong>${statisticsMetrics(topic)}</button>`).join('')}</div>`:'<p class="subtle">Завершённых работ по этому разделу пока нет.</p>'}</section>`).join('')}</div></details>`;
  }).join('')}${!kinds.practice.sessions&&!kinds.assessment.sessions?`<p>Статистика появится после первой завершённой работы.</p>${emptyAction}`:''}<div id="topic-errors"></div>`;
  container.querySelectorAll('[data-statistics-section]').forEach(details=>details.addEventListener('toggle',()=>{if(details.open)state.expanded.add(details.dataset.statisticsSection);else state.expanded.delete(details.dataset.statisticsSection);}));
  container.querySelectorAll('[data-topic-id]').forEach(button=>button.addEventListener('click',()=>{state.selected=button.dataset.topicId;state.kind=button.dataset.statisticsKind;state.errorGeneration++;state.errorMessage='';state.errors=[];state.errorCursor=null;state.errorLoaded=false;state.errorLoading=false;renderResultTopics();loadTopicMistakes(state);container.querySelector(`[data-topic-id="${state.selected}"][data-statistics-kind="${state.kind}"]`)?.focus({preventScroll:true});}));
  if(!state.selected)return;
  container.querySelector('#topic-errors').innerHTML=`<h3>${escapeHtml(topicLabel(state.selected))} · ${labels[state.kind]} · ошибки</h3>${state.errors.map(({attemptId,item,field,index})=>`<article class="topic-error"><p>${escapeHtml(displayPrompt(item))}</p><p>Ваш ответ: <strong>${escapeHtml(submittedDisplay(item,field.submitted))}</strong> · Верная форма: <strong>${escapeHtml(stripSourceNumber(item.blanks?.[index]?.answer||correctAnswer(item)))}</strong></p><a class="button" href="${state.studentId?'#student-work/'+encodeURIComponent(state.studentId)+'/':'#work/'}${encodeURIComponent(attemptId)}">Отчёт</a></article>`).join('')}${state.errorMessage?`<p role="alert">${escapeHtml(state.errorMessage)}</p>`:''}${state.errorLoading?'<p role="status">Загружаем ошибки…</p>':state.errorLoaded&&!state.errors.length?'<p>Проверенных ошибок по этой теме пока не найдено.</p>':''}${!state.errorLoading&&(!state.errorLoaded||state.errorCursor)?'<button type="button" class="button" id="topic-errors-more">'+(state.errorLoaded?'Показать ещё ошибки':'Загрузить ошибки')+'</button>':''}`;
  container.querySelector('#topic-errors-more')?.addEventListener('click',()=>loadTopicMistakes(state));
}
async function loadTopicMistakes(state) {
  if(state.errorLoading)return;
  const selected=state.selected,cursor=state.errorCursor,generation=state.errorGeneration;
  state.errorLoading=true;state.errorMessage='';renderResultTopics();
  try {
    const prefix=state.studentId?`teacher/students/${encodeURIComponent(state.studentId)}/`:'';
    const data=await accountRequest(`${prefix}mistakes?topic=${encodeURIComponent(selected)}&kind=${encodeURIComponent(state.kind||'practice')}${cursor?'&cursor='+encodeURIComponent(cursor):''}`);
    if(resultTopicState!==state||account.user?.id!==state.owner||location.hash!==state.route||state.selected!==selected||state.errorGeneration!==generation)return;
    state.errors.push(...data.errors);state.errorCursor=data.nextCursor;state.errorLoaded=true;
  }catch(error){if(resultTopicState===state&&state.selected===selected&&state.errorGeneration===generation&&account.user?.id===state.owner&&location.hash===state.route)state.errorMessage=error.message;}
  finally{if(resultTopicState===state&&state.selected===selected&&state.errorGeneration===generation&&account.user?.id===state.owner&&location.hash===state.route){state.errorLoading=false;renderResultTopics();}}
}
