"use strict";

async function accountRequest(path, data) {
  const response = await fetch(`/api/${path}`, {
    method: data === undefined ? "GET" : "POST",
    headers: data === undefined ? {} : { "Content-Type": "application/json", "X-CSRF-Token": account.csrf || "" },
    body: data === undefined ? undefined : JSON.stringify(data),
  });
  let result;
  try { result = await response.json(); } catch { throw new Error("Сервер кабинетов недоступен. Попробуйте позже."); }
  if (!response.ok) { const error = new Error(result.error || "Не удалось выполнить действие."); error.status = response.status; error.code = result.code; throw error; }
  return result;
}
function showAccountMessage(selector, message, neutral = false) {
  const output=document.querySelector(selector);
  if(!output)return;
  output.textContent=message;
  output.setAttribute('role',neutral?'status':'alert');
}
function showAccountError(selector, error) { showAccountMessage(selector,error.message,error.code==='VERIFY_EMAIL'); }
async function initialiseAccount() {
  try {
    const info = await accountRequest("auth/info");
    account.available = true; account.demo = info.demo; account.local = info.local; account.ready = info.ready; account.authProvider = info.authProvider; account.setupAvailable = info.setupAvailable !== false;
    try { const me = await accountRequest("auth/me"); account.user = me.user; account.csrf = me.csrf; }
    catch(error) { if(error.status !== 401) throw error; }
    if(account.user?.role!=='teacher')state.exercises=null;
    state.session = restoreSession();
  } catch { account.available = false; }
}
function accountNotice() { return account.demo ? '<p class="account-demo">Тестовая среда Grammar NOEON · вымышленные аккаунты и отдельная база</p>' : account.local ? '<p class="account-demo">Локальная версия Grammar NOEON · отдельная база</p>' : ''; }
function teacherWorkspaceEntry() { return '<section class="account-section teacher-tools"><h2>Инструменты учителя</h2><div class="actions"><a class="button" href="#teacher-library">Библиотека наборов</a><a class="button" href="#task-issues">Сообщения о заданиях</a></div></section>'; }
function accountStats(stats) {
  const percent = stats.maxScore ? `${Math.round(stats.score / stats.maxScore * 100)}%` : "—";
  return `<div class="account-stats"><div><span>Завершено работ</span><strong>${stats.sessions}</strong></div><div><span>Точность по проверенным полям</span><strong>${percent}</strong></div><div><span>Работ в процессе</span><strong>${stats.drafts}</strong></div></div>${stats.pending ? `<p>Ответов без автоматической оценки: ${stats.pending}</p>` : ""}`;
}
function assignmentList(assignments = [], owner = false, studentId = "") {
  if (!assignments.length) return '<p class="subtle">Назначенных заданий пока нет.</p>';
  return assignments.map(item=>compactWorkCard({...item,date:item.created},studentId?`#student-work/${encodeURIComponent(studentId)}/${encodeURIComponent(item.practiceId)}`:`#work/${encodeURIComponent(item.practiceId)}`,item.title)).join('');
}
function workCardTitle(attempt,title) {
  if(title&&title!=='Тренировка')return title;
  const entries=Object.entries(attempt.topic_summary||{}).sort((x,y)=>y[1][1]-x[1][1]);
  if(!entries.length)return 'Тренировка без ответов';
  const label=id=>(typeof PRACTICE_TENSES!=='undefined'&&PRACTICE_TENSES.find(t=>t.id===id)?.label)||id;
  return entries.slice(0,2).map(([id])=>label(id)).join(' · ')+(entries.length>2?` +${entries.length-2}`:'');
}
function compactWorkCard(attempt,href,title='Тренировка',deletable=false) {
  const labels={assigned:'Назначено',started:'В процессе',draft:'Не завершена',completed:'Завершена',cancelled:'Снято'};
  const when=new Date(attempt.date),status=labels[attempt.status]||'Не завершена';
  const date=when.toLocaleDateString('ru-RU',{day:'numeric',month:'short'})+', '+when.toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'});
  const percent=attempt.maxScore?Math.round(attempt.score/attempt.maxScore*100):null,tone=percent===null?'':percent>=85?'ok':percent>=65?'warn':'bad';
  const kind=attempt.status==='completed'?'done':'open';
  const card=`<a class="work-card" href="${escapeHtml(href)}"><div class="work-card-main"><strong>${escapeHtml(workCardTitle(attempt,title))}</strong>${attempt.source==='self'?'<span class="work-card-origin">самостоятельно</span>':''}<span class="work-card-meta"><span>${escapeHtml(date)}</span><span>Выполнено: ${attempt.index}/${attempt.total}</span></span></div>${percent===null?'':`<span class="wc-score ${tone}">${percent}%</span>`}<span class="work-card-status">${status}</span><span class="work-card-arrow">${attempt.status==='completed'?'Отчёт':'Открыть'}</span></a>`;
  return `<div class="wc-wrap" data-wc-kind="${kind}">${card}${deletable&&attempt.source==='self'?`<button type="button" class="wc-del" data-wc-delete="${escapeHtml(attempt.id)}" aria-label="Удалить тренировку" title="Удалить">✕</button>`:''}</div>`;
}
async function renderStudentPractice(topic) {
  syncRouteNav();
  const owner=account.user?.id, routeAtStart=location.hash;
  app.innerHTML='<p role="status">Загружаем задания учителя…</p>';
  const data=await accountRequest('account');
  if(account.user?.id!==owner || location.hash!==routeAtStart)return;
  if(data.freePracticeAllowed && GRAMMAR_SECTIONS[topic]) return renderPractice(null,topic,true);
  app.innerHTML=`<h1>Практика</h1><section class="account-section"><h2>Свободная тренировка</h2>${data.freePracticeAllowed?'<p>Выберите раздел и настройте тренировку.</p><a class="button primary" href="#practice/tenses">Времена</a> <a class="button" href="#practice/comparison">Степени сравнения</a> <a class="button" href="#practice/passive">Пассивный залог</a> <a class="button" href="#practice/reported">Косвенная речь</a> <a class="button" href="#practice/modals">Модальные глаголы</a>':'<p>Учитель пока не разрешил свободную тренировку. Назначенные задания доступны ниже.</p>'}</section><section class="account-section"><h2>Задания от учителя</h2>${assignmentList(data.assignments,true)}</section>${separateHistorySection(data)}<a class="button" href="#theory/foundations">Изучить теорию</a>`;
  bindAccountHistory();
}
// Reconcile only the same unanswered question. Server grades and navigation win.
function reconcileStudentSession(saved, previous) {
  const checked=!!previous?.checked && previous.index===saved.index-1;
  const session={items:saved.items,...(typeof saved.contentOutdated==="boolean"?{contentOutdated:saved.contentOutdated}:{}),index:checked?previous.index:saved.index,answers:saved.answers,correct:saved.correct,checked,draft:saved.draft,remote:{id:saved.id,revision:saved.revision},draftSequence:previous?.draftSequence||0,draftTracked:true};
  if(previous?.remote?.id!==saved.id || checked || previous.checked || previous.index!==saved.index)return session;
  const item=saved.items[saved.index];
  const valid=value=>item?.options ? value===null || Number.isInteger(value)&&value>=0&&value<item.options.length
    : item?.blanks?.length && Array.isArray(value)&&value.length===item.blanks.length&&value.every(v=>typeof v==='string'&&v.length<=10000);
  const pending=previous.draftPending?.index===saved.index ? previous.draftPending
    : previous.draftConflict?.index===saved.index ? previous.draftConflict
    : !previous.draftTracked&&previous.draft!==undefined&&previous.draft!==null ? {index:previous.index,submitted:previous.draft} : null;
  if(!pending || !valid(pending.submitted) || JSON.stringify(pending.submitted)===JSON.stringify(saved.draft))return session;
  if(previous.remote.revision===saved.revision && !previous.draftConflict) {
    session.draft=pending.submitted;
    session.draftPending={...pending,index:saved.index};
  } else {
    // Keep the remote draft visible, retaining local input until an explicit choice.
    session.draftConflict={index:saved.index,submitted:pending.submitted};
  }
  return session;
}
function rememberAccountDraft(session, submitted) {
  session.draftTracked=true;
  session.draft=Array.isArray(submitted)?submitted.slice():submitted;
  session.draftSequence=(session.draftSequence||0)+1;
  session.draftPending={index:session.index,sequence:session.draftSequence,submitted:session.draft};
}
async function renderStudentSession() {
  const id=state.session?.remote?.id;
  if(!id){location.hash='practice';return;}
  const owner=account.user.id, previous=state.session;
  try {
    if(account.draftTimer){clearTimeout(account.draftTimer);account.draftTimer=null;}
    await account.pending.catch(()=>{});
    if(account.user?.id!==owner || location.hash!=='#session')return;
    account.pending=Promise.resolve();
    const saved=await accountRequest('practice/'+encodeURIComponent(id));
    if(account.user?.id!==owner || location.hash!=='#session')return;
    if(saved.assessmentId){location.hash='test-attempt/'+encodeURIComponent(id);return;}
    const restored=reconcileStudentSession(saved,previous),checked=restored.checked;
    if(saved.index===saved.items.length && !checked){location.hash='results/'+encodeURIComponent(saved.id);return;}
    state.session=restored;
    saveSession();renderSession();
  } catch(error) {
    if(account.user?.id!==owner || location.hash!=='#session')return;
    app.innerHTML=`<h1>Тренировка недоступна</h1><p>${escapeHtml(error.message)}</p><a class="button primary" href="#practice">Задания от учителя</a>`;
  }
}
async function renderAssignmentForm(id, topic) {
  if (account.user?.role !== "teacher") { location.hash = "profile"; return; }
  const routeAtStart = location.hash, owner = account.user.id;
  app.innerHTML = '<p role="status">Загружаем ученика…</p>';
  const [data, pool] = await Promise.all([accountRequest("teacher/students/" + encodeURIComponent(id)), accountRequest("teacher/students/" + encodeURIComponent(id) + "/assignment-pool")]);
  data.user.availableIds = pool.availableIds;
  if (location.hash === routeAtStart && account.user?.id === owner) renderPractice(data.user, topic);
}
function bindAssignmentManagement() {
  app.querySelectorAll('[data-assignment-manage]').forEach(button=>button.addEventListener('click',async()=>{
    const owner=account.user?.id, routeAtStart=location.hash;
    const output=button.closest('.assignment-actions').querySelector('.assignment-message');
    button.disabled=true; toast('Сохраняем…');
    try {
      await accountRequest(`teacher/students/${button.dataset.student}/assignments/${button.dataset.assignment}/${button.dataset.assignmentManage}`,{version:Number(button.dataset.version)});
      if(account.user?.id===owner&&location.hash===routeAtStart){const target='#student/'+encodeURIComponent(button.dataset.student);if(location.hash===target)await renderStudentAccount(button.dataset.student);else location.hash=target;}
    } catch(error) {button.disabled=false;output.textContent=error.message;}
  }));
}

async function renderAssignmentEditor(studentId, assignmentId) {
  if(account.user?.role!=='teacher'){location.hash='profile';return;}
  const owner=account.user.id,routeAtStart=location.hash;
  app.innerHTML='<p role="status">Загружаем назначение…</p>';
  const endpoint=`teacher/students/${encodeURIComponent(studentId)}/assignments/${encodeURIComponent(assignmentId)}`;
  const [edit,data]=await Promise.all([accountRequest(endpoint),accountRequest(`teacher/students/${encodeURIComponent(studentId)}`)]);
  if(account.user?.id!==owner||location.hash!==routeAtStart)return;
  if(edit.assessmentId){app.innerHTML=`<h1>Проверочный тест</h1><p>Состав теста фиксирован.</p><a class="button" href="#student/${encodeURIComponent(studentId)}">К ученику</a>`;return;}
  syncRouteNav();
  app.innerHTML=`<a class="button" href="#student/${escapeHtml(studentId)}">← К ученику</a><h1>Редактировать задание</h1><p>Ученик: <strong>${escapeHtml(data.user.name)}</strong></p>
    <form id="assignment-edit-form" class="account-section"><div class="field"><label for="edit-title">Название задания</label><input id="edit-title" name="title" required maxlength="160" value="${escapeHtml(edit.title)}"></div>
    ${edit.editableContent ? `<p>Можно убрать отдельные упражнения или подобрать другой набор времён и уровней. Прежние ответы не затрагиваются.</p><details><summary>Упражнений в задании: ${edit.items.length}</summary><fieldset class="assignment-items"><legend>Оставьте нужные упражнения</legend>${edit.items.map((item,index)=>`<label><input type="checkbox" name="exercise" value="${escapeHtml(item.id)}" checked><span>${index+1}. ${escapeHtml(displayPrompt(item))}</span></label>`).join('')}</fieldset></details><button class="button" type="button" id="replace-assignment">Изменить подборку</button>` : '<p>Состав доступен для изменения только до начала работы. Ответы и прогресс сохраняются. Название можно изменить.</p>'}
    <div class="assignment-actions"><button class="button primary" type="submit">Сохранить изменения</button><a class="button" href="#student/${escapeHtml(studentId)}">Отмена</a></div><p id="edit-error" role="alert"></p></form>`;
  const form=app.querySelector('#assignment-edit-form');
  app.querySelector('#replace-assignment')?.addEventListener('click',()=>{
    edit.title=form.elements.title.value;
    renderPractice({...data.user,availableIds:edit.availableIds,assignmentEdit:edit});
  });
  form.addEventListener('submit',async event=>{
    event.preventDefault();const button=form.querySelector('[type=submit]');button.disabled=true;
    const payload={version:edit.version,title:form.elements.title.value};
    if(edit.editableContent){
      const ids=[...form.querySelectorAll('[name=exercise]:checked')].map(input=>input.value);
      if(!ids.length){showAccountMessage('#edit-error','Оставьте хотя бы одно упражнение.');button.disabled=false;return;}
      if(ids.length!==edit.items.length)payload.ids=ids;
    }
    try {await accountRequest(endpoint+'/edit',payload);if(account.user?.id===owner&&location.hash===routeAtStart)location.hash=`student/${studentId}`;}
    catch(error){button.disabled=false;showAccountError('#edit-error',error);}
  });
}

function accountHistory(history, owner = true, endpoint = 'account', assignments = []) {
  if (!history.length) return '<p class="subtle">Тренировок пока нет.</p>';
  const studentId=endpoint.split('/')[2];
  return history.map(a=>{
    const assigned=assignments.find(s=>s.practiceId===a.id),title=assigned?.title||a.title||'Тренировка';
    const card=compactWorkCard(a,owner?`#work/${encodeURIComponent(a.id)}`:`#student-work/${encodeURIComponent(studentId)}/${encodeURIComponent(a.id)}`,title,owner);
    return card;
  }).join('');
}
function unassignedHistory(data) {
  const assigned=new Set((data.assignments||[]).map(a=>a.practiceId));
  return data.history.filter(a=>!assigned.has(a.id));
}
function accountHistoryPages(data, owner = true, endpoint = "account", unassignedOnly = false) {
  const history=unassignedOnly?unassignedHistory(data):data.history;
  return `<div class="account-history-pages">${owner&&endpoint==='account'?historyToolbar(history):''}<div class="account-history-list">${accountHistory(history,owner,endpoint,data.assignments)}</div>${data.nextCursor ? `<button class="button" data-history-more data-history-unassigned="${unassignedOnly?'yes':'no'}" data-history-owner="${owner ? "yes" : "no"}" data-history-endpoint="${escapeHtml(endpoint)}" data-history-cursor="${escapeHtml(data.nextCursor)}">Показать ещё</button>` : ""}</div>`;
}
function separateHistorySection(data,owner=true,endpoint='account') {
  if(!unassignedHistory(data).length&&!data.nextCursor)return '';
  return `<section class="account-section"><h2>${data.assignments?.length?'Другие тренировки':'История тренировок'}</h2>${accountHistoryPages(data,owner,endpoint,true)}</section>`;
}
function bindAccountHistoryPages() {
  app.querySelectorAll("[data-history-more]").forEach(button => {
    if(button.dataset.historyBound)return; button.dataset.historyBound="yes";
    button.addEventListener("click", async()=>{
      const owner=account.user?.id, routeAtStart=location.hash;
      button.disabled=true;
      try {
        const data=await accountRequest(button.dataset.historyEndpoint+"?cursor="+encodeURIComponent(button.dataset.historyCursor));
        if(account.user?.id!==owner || location.hash!==routeAtStart || !button.isConnected)return;
        const history=button.dataset.historyUnassigned==='yes'?unassignedHistory(data):data.history;
        button.closest(".account-history-pages").querySelector(".account-history-list").insertAdjacentHTML("beforeend",accountHistory(history,button.dataset.historyOwner==="yes",button.dataset.historyEndpoint,data.assignments));
        if(data.nextCursor){button.dataset.historyCursor=data.nextCursor;button.disabled=false;}else button.remove();
        if (resultTopicState?.owner === owner && resultTopicState.route === routeAtStart) appendResultTopics(data.history, !!data.nextCursor);
        bindAccountHistory();
      } catch(error){button.disabled=false;toast(error.message);}
    });
  });
}
function historyToolbar(history) {
  const open=history.filter(a=>a.source==='self'&&a.status!=='completed').length;
  return `<div class="wc-toolbar"><div class="wc-chips" role="group" aria-label="Фильтр"><button type="button" class="wc-chip on" data-wc-filter="all">Все</button><button type="button" class="wc-chip" data-wc-filter="done">Завершённые</button><button type="button" class="wc-chip" data-wc-filter="open">Не завершённые</button></div>${open?`<button type="button" class="button wc-clean" data-wc-cleanup>Убрать незавершённые самостоятельные (${open})</button>`:''}</div>`;
}
function bindHistoryTools() {
  app.querySelectorAll('[data-wc-filter]:not([data-bound])').forEach(chip=>{chip.dataset.bound='yes';chip.addEventListener('click',()=>{
    const scope=chip.closest('.account-history-pages');scope.dataset.wcShow=chip.dataset.wcFilter;
    scope.querySelectorAll('[data-wc-filter]').forEach(c=>c.classList.toggle('on',c===chip));
  });});
  app.querySelectorAll('[data-wc-delete]:not([data-bound])').forEach(button=>{button.dataset.bound='yes';button.addEventListener('click',async()=>{
    if(!button.dataset.armed){button.dataset.armed='yes';button.textContent='Удалить?';button.classList.add('armed');setTimeout(()=>{if(button.isConnected){delete button.dataset.armed;button.textContent='✕';button.classList.remove('armed');}},3500);return;}
    button.disabled=true;
    try{await accountRequest(`practice/${encodeURIComponent(button.dataset.wcDelete)}/delete`,{});button.closest('.wc-wrap').remove();toast('Тренировка удалена.');}
    catch(error){button.disabled=false;toast(error.message);}
  });});
  app.querySelectorAll('[data-wc-cleanup]:not([data-bound])').forEach(button=>{button.dataset.bound='yes';button.addEventListener('click',async()=>{
    if(!button.dataset.armed){button.dataset.armed='yes';button.textContent='Точно удалить? Нажмите ещё раз';return;}
    button.disabled=true;
    try{const result=await accountRequest('practice/cleanup',{});toast(`Удалено тренировок: ${result.removed}.`);renderAccountResults();}
    catch(error){button.disabled=false;toast(error.message);}
  });});
}
function bindAccountHistory() {
  bindAccountHistoryPages();bindHistoryTools();
  app.querySelectorAll("[data-resume]:not([data-resume-bound])").forEach(button=>{button.dataset.resumeBound="yes";button.addEventListener("click", async()=>{
    if (!navigator.onLine) { toast(OFFLINE_PRACTICE_MESSAGE); return; }
    button.disabled=true;
    try {
      const owner=account.user?.id, routeAtStart=location.hash;
      await account.pending.catch(()=>{});
      const saved=await accountRequest(`practice/${button.dataset.resume}`);
      if(account.user?.id!==owner || location.hash!==routeAtStart)return;
      if(saved.assessmentId){location.hash='test-attempt/'+encodeURIComponent(saved.id);return;}
      state.session={items:saved.items,...(typeof saved.contentOutdated==="boolean"?{contentOutdated:saved.contentOutdated}:{}),index:saved.index,answers:saved.answers,correct:saved.correct,checked:false,draft:saved.draft,remote:{id:saved.id,revision:saved.revision}};
      saveSession();location.hash="session";
    } catch(error) { button.disabled=false; toast(error.message); }
  });});
}
async function accountSignedIn(result) {
  account.user=result.user;state.exercises=null;account.csrf=result.csrf;account.ready=true;account.pending=Promise.resolve();
  state.session=restoreSession();
  // Drop invitation tokens from browser history after successful acceptance.
  history.replaceState(null,"","#profile");
  localStorage.setItem("noeon-auth-event", String(Date.now()));
  await renderAccount();
}
async function renderAccount() {
  syncRouteNav();
  if(typeof refreshNotifications==='function')void refreshNotifications();
  if(!account.user){renderAccountLogin();return;}
  const routeAtStart=location.hash, ownerAtStart=account.user.id;
  app.innerHTML='<p role="status">Загружаем кабинет…</p>';
  try {
    const data=await accountRequest("account");
    if(location.hash!==routeAtStart || account.user?.id!==ownerAtStart)return;
    if(account.user?.id !== data.user.id) {
      const me=await accountRequest('auth/me');account.user=me.user;account.csrf=me.csrf;state.session=restoreSession();
    }
    const user=data.user;
    const displayOwner=account.user.id;

    if(location.hash!==routeAtStart || account.user?.id!==displayOwner)return;
    app.innerHTML=`${accountNotice()}<div class="eyebrow">${user.role==="teacher"?"Кабинет учителя":"Кабинет ученика"}</div><div class="account-title"><div><h1>${escapeHtml(user.name)}</h1><p>${escapeHtml(user.email)}</p></div><button class="button" id="account-logout">Выйти</button></div>${user.role==="student"?`<section class="account-section"><h2>Задания от учителя</h2>${assignmentList(data.assignments,true)}</section>`:""}${user.role!=="teacher"?`<section class="account-section"><div id="all-time-topics"></div><a class="button primary" href="#practice">${user.role==="student"?"Задания и практика":"Начать тренировку"}</a></section>${separateHistorySection(data)}`:""}`;
    if(user.role==='teacher')app.insertAdjacentHTML('beforeend',reviewQueueEntry()+teacherWorkspaceEntry());
    if(user.role==='student')initialiseResultTopics([],false);
    if(user.role!=='teacher'&&typeof notificationEntry==='function')app.insertAdjacentHTML('afterbegin',notificationEntry());
    document.querySelector('#account-logout').addEventListener('click',async()=>{
      if(account.draftTimer){clearTimeout(account.draftTimer);account.draftTimer=null;}
      try { await account.pending.catch(()=>{}); try { await accountRequest('auth/logout',{}); } catch(error) { if(error.status!==401)throw error; } account.user=null;account.csrf=null;state.exercises=null;state.session=restoreSession();localStorage.setItem('noeon-auth-event',String(Date.now()));await renderAccount(); }
      catch(error){toast(error.message);}
    });
    bindAccountHistory();
  } catch(error){if(error.status===401){account.user=null;account.csrf=null;state.session=restoreSession();renderAccountLogin();return;}app.innerHTML=`<div class="error-card"><p>${escapeHtml(error.message)}</p><a class="button" href="#profile">Вернуться в профиль</a></div>`;}
}
function renderAccountLogin() {
  const setup=!account.ready;
  if(setup && account.setupAvailable===false){app.innerHTML='<h1>Личный кабинет</h1><p>Настройка входа ещё завершается. Практикой уже можно пользоваться без входа.</p><a class="button" href="#practice">Открыть практику</a>';return;}
  app.innerHTML=`${accountNotice()}<div class="reading account-login"><div class="eyebrow">Личный кабинет Grammar NOEON</div><h1>${setup?"Создать кабинет учителя":"Войти"}</h1><p>${setup?"Первый кабинет принадлежит учителю. Для учеников вы сможете создавать приглашения.":"Войдите по своей почте и паролю. Ученики создают аккаунт по приглашению учителя."}</p><form id="account-login-form">${setup?'<div class="field"><label for="account-name">Ваше имя</label><input id="account-name" name="name" required autocomplete="name"></div><div class="field"><label for="account-code">Код создания кабинета</label><input id="account-code" name="code" required autocomplete="off"><small>Используйте код, выданный вам при подготовке приложения.</small></div>':""}<div class="field"><label for="account-email">Почта</label><input id="account-email" name="email" type="email" required autocomplete="username"></div><div class="field"><label for="account-password">${setup ? "Пароль — не менее 12 символов" : "Пароль"}</label><input id="account-password" name="password" type="password" required minlength="12" maxlength="256" autocomplete="${setup?"new-password":"current-password"}"></div><p id="account-error" role="alert"></p><button class="button primary">${setup?"Создать кабинет":"Войти"}</button></form>${account.demo?'<div class="demo-accounts"><p>Посмотреть вымышленные кабинеты:</p><button class="button" data-demo-role="teacher">Войти как учитель</button><button class="button" data-demo-role="student">Войти как Анна</button><button class="button" data-demo-role="other">Войти как Миша</button></div>':""}<p><a href="#theory/foundations">Изучать теорию без входа</a></p></div>`;
  document.querySelector('#account-login-form').addEventListener('submit',async event=>{
    event.preventDefault();const form=event.currentTarget;const button=form.querySelector('button');button.disabled=true;
    try{await accountSignedIn(await accountRequest(setup?'auth/setup':'auth/login',{name:form.elements.name?.value,code:form.elements.code?.value,email:form.elements.email.value,password:form.elements.password.value}));}
    catch(error){showAccountError('#account-error',error);button.disabled=false;}
  });
  if(account.authProvider==='firebase') {
    const reset=document.createElement('button');reset.type='button';reset.className='button';reset.textContent='Забыли пароль?';
    document.querySelector('#account-login-form').append(reset);
    reset.addEventListener('click',async()=>{
      const email=document.querySelector('#account-email');
      if(!email.reportValidity() || !email.value.trim())return;
      reset.disabled=true;
      try {const result=await accountRequest('auth/reset',{email:email.value});showAccountMessage('#account-error',result.message,true);}
      catch(error){showAccountError('#account-error',error);}
      finally{reset.disabled=false;}
    });
  }
  app.querySelectorAll('[data-demo-role]').forEach(button=>button.addEventListener('click',async()=>{
    button.disabled=true;try{await accountSignedIn(await accountRequest('auth/demo',{role:button.dataset.demoRole}));}catch(error){showAccountError('#account-error',error);button.disabled=false;}
  }));
}
async function renderJoin(token) {
  syncRouteNav();
  if(!account.available){app.innerHTML='<p>Для принятия приглашения откройте приложение с сервером кабинетов.</p>';return;}
  if(account.user){app.innerHTML='<h1>Приглашение ученика</h1><p>Вы уже вошли в аккаунт. Выйдите из него, чтобы принять приглашение для другого ученика.</p><a class="button" href="#profile">Открыть кабинет</a>';return;}
  app.innerHTML=`${accountNotice()}<div class="reading account-login"><h1>Кабинет ученика</h1><p>Введите своё имя, почту и придумайте пароль. После регистрации вы появитесь в кабинете пригласившего вас учителя.</p><form id="join-form"><div class="field"><label for="join-name">Ваше имя</label><input id="join-name" name="name" required maxlength="200" autocomplete="name"></div><div class="field"><label for="join-email">Ваша почта</label><input id="join-email" name="email" type="email" required maxlength="254" autocomplete="email"></div><div class="field"><label for="join-password">Новый пароль — не менее 12 символов</label><input id="join-password" name="password" type="password" required minlength="12" maxlength="256" autocomplete="new-password"></div><p id="join-error" role="alert"></p><button class="button primary">Создать аккаунт</button></form></div>`;
  document.querySelector('#join-form').addEventListener('submit',async event=>{
    event.preventDefault();const form=event.currentTarget;const button=form.querySelector('button');button.disabled=true;
    try{await accountSignedIn(await accountRequest('auth/join',{token,name:form.elements.name.value,email:form.elements.email.value,password:form.elements.password.value}));}
    catch(error){showAccountError('#join-error',error);button.disabled=false;}
  });
}
async function renderStudentAccount(id) {
  syncRouteNav();
  if(account.user?.role!=='teacher'){location.hash='profile';return;}
  const routeAtStart=location.hash, ownerAtStart=account.user.id;
  app.innerHTML='<p role="status">Загружаем прогресс ученика…</p>';
  try{const data=await accountRequest('teacher/students/'+encodeURIComponent(id));if(location.hash!==routeAtStart || account.user?.id!==ownerAtStart)return;document.title = `Ученик: ${data.user.name} — Grammar NOEON`;app.innerHTML=`${accountNotice()}<a class="button" href="#students">← Мои ученики</a><h1>${escapeHtml(data.user.name)}</h1><p>${escapeHtml(data.user.email)}</p><section id="all-time-topics" class="account-section"></section>${studentManagement(data.user)}<section class="account-section"><label><input id="free-practice-toggle" type="checkbox" ${data.user.active===false?'disabled':''} ${data.freePracticeAllowed?'checked':''}> Разрешить свободную тренировку</label><p class="subtle">Выключение запрещает новые тренировки. Начатые работы можно завершить.</p><p id="free-practice-status" role="status"></p></section><section class="account-section"><div class="account-title"><h2>Назначенные задания</h2>${data.user.active===false?'<span class="subtle">Кабинет отключён</span>':`<a class="button primary" href="#assign/${escapeHtml(id)}">Назначить задание</a>`}</div>${assignmentList(data.assignments,false,id)}</section>${separateHistorySection(data,false,"teacher/students/"+encodeURIComponent(id))}`;bindAccountHistory();bindAssignmentManagement();bindStudentManagement(data.user);initialiseResultTopics(data.history,!!data.nextCursor,id);
    const toggle=app.querySelector('#free-practice-toggle');
    toggle.addEventListener('change',async()=>{
      const allowed=toggle.checked;toggle.disabled=true;
      try {await accountRequest(`teacher/students/${encodeURIComponent(id)}/free-practice`,{allowed});if(toggle.isConnected&&account.user?.id===ownerAtStart){data.freePracticeAllowed=allowed;app.querySelector('#free-practice-status').textContent=allowed?'Свободная тренировка разрешена':'Новые свободные тренировки запрещены';}}
      catch(error){if(toggle.isConnected&&account.user?.id===ownerAtStart){toggle.checked=!!data.freePracticeAllowed;app.querySelector('#free-practice-status').textContent=error.message;}}
      finally{if(toggle.isConnected)toggle.disabled=false;}
    });
  }
  catch(error){app.innerHTML=`<p>${escapeHtml(error.message)}</p><a class="button" href="#profile">Вернуться в кабинет</a>`;}
}
async function renderAccountResults() {
  const routeAtStart=location.hash, ownerAtStart=account.user?.id;
  syncRouteNav();
  app.innerHTML='<p role="status">Загружаем результаты…</p>';
  const [data,summary]=await Promise.all([accountRequest('account'),accountRequest('results').catch(()=>null)]);
  if(location.hash!==routeAtStart || account.user?.id!==ownerAtStart)return;
  const dashboard=summary&&typeof resultsDashboard==='function'?resultsDashboard(summary,account.user?.role!=='student'||!!data.freePracticeAllowed):'';
  app.innerHTML=`<h1>Мои результаты</h1>${dashboard}<details class="rd-more"><summary>Подробно по темам и вся история</summary><section id="all-time-topics" class="account-section"></section></details><a class="button primary" href="#practice">${account.user?.role==="student"?"Задания от учителя":"Новая тренировка"}</a>${accountHistoryPages(data)}</details>`;
  initialiseResultTopics(data.history, !!data.nextCursor);
  if(typeof notificationEntry==='function')app.insertAdjacentHTML('afterbegin',notificationEntry());
  bindAccountHistory();
}
function queueAccountDraft(session, submitted) {
  const owner=account.user?.id,index=session.index,sequence=session.draftPending?.sequence;
  account.pending=account.pending.catch(()=>{}).then(async()=>{
    if(account.user?.id!==owner)throw new Error('Аккаунт изменён. Обновите страницу.');
    const result=await accountRequest(`practice/${session.remote.id}/draft`,{index,revision:session.remote.revision,submitted});
    session.remote.revision=result.revision;
    if(session.draftPending?.index===index && session.draftPending.sequence===sequence && JSON.stringify(session.draftPending.submitted)===JSON.stringify(submitted))delete session.draftPending;
    if(state.session===session){saveSession();const status=document.querySelector('#save-status');if(status)status.textContent='';}
  });
  account.pending.catch(error=>{if(state.session===session){const status=document.querySelector('#save-status');if(status)status.textContent='Не сохранено на сервере: '+error.message;}});
  return account.pending;
}
function scheduleAccountDraft(session,item,form) {
  clearTimeout(account.draftTimer);
  const submitted=getSubmitted(item,form);
  rememberAccountDraft(session,submitted);delete session.draftConflict;saveSession();
  const status=document.querySelector('#save-status');if(status)status.textContent='';
  account.draftTimer=setTimeout(()=>{account.draftTimer=null;queueAccountDraft(session,submitted);},350);
}
async function flushAccountDraft(session) {
  if(account.draftTimer){clearTimeout(account.draftTimer);account.draftTimer=null;}
  if(session.draftPending?.index===session.index)await queueAccountDraft(session,session.draft);
  else await account.pending;
}

let studentListSort='name';
function sortedStudents(students,sort=studentListSort) {
  return [...students].sort((a,b)=>{
    let difference=sort==='activity'?(Date.parse(b.lastActive)||0)-(Date.parse(a.lastActive)||0):sort==='accuracy'?(b.stats.maxScore?b.stats.score/b.stats.maxScore:-1)-(a.stats.maxScore?a.stats.score/a.stats.maxScore:-1):0;
    return difference||a.name.localeCompare(b.name,'ru')||a.id.localeCompare(b.id);
  });
}
function studentCards(students) {
  return sortedStudents(students).map(student=>`<a class="student-card" href="#student/${escapeHtml(student.id)}"><div><strong>${escapeHtml(student.name)}</strong><small>${escapeHtml(student.email)}</small></div><div><span>Завершено работ: ${Number(student.stats.sessions)} · ${student.stats.maxScore?Math.round(student.stats.score/student.stats.maxScore*100)+'%':'нет проверенных ответов'} · Проверено ответов: ${Number(student.stats.maxScore)||0}</span><small>Последняя активность: ${student.lastActive?escapeHtml(new Date(student.lastActive).toLocaleString('ru-RU')):'пока нет'}</small><small>Невыполненных назначений: ${Number(student.unfinished)}</small><span>Открыть прогресс →</span></div></a>`).join('');
}
async function renderStudents() {
  syncRouteNav();
  if(account.user?.role!=='teacher'){location.hash='profile';return;}
  const owner=account.user.id, routeAtStart=location.hash;
  app.innerHTML='<p role="status">Загружаем учеников…</p>';
  const data=await accountRequest('teacher/students');
  if(account.user?.id!==owner || location.hash!==routeAtStart)return;
  app.innerHTML=`<h1>Ученики</h1><p class="td-quick"><a class="button primary" href="#review-queue">Ожидают моей проверки →</a> <a class="button" href="#teacher-library">Библиотека наборов</a> <a class="button" href="#task-issues">Сообщения о заданиях</a></p><section class="account-section"><div class="account-title"><h2>Мои ученики</h2><label for="student-sort">Сортировка <select id="student-sort"><option value="name">По имени</option><option value="activity">По активности</option><option value="accuracy">По точности</option></select></label></div><div id="active-students"></div><details class="student-archive"><summary>Архив</summary><div id="archived-students"></div></details><details class="invite-panel"><summary>Пригласить ученика</summary><form id="invite-form"><p>Создайте ссылку и отправьте ученику. Имя, почту и пароль он введёт сам. Одна ссылка — один ученик, срок действия — 7 дней.</p><button class="button primary">Создать ссылку приглашения</button><div id="invite-result" role="status"></div></form></details><section><h2>Действующие приглашения</h2><div id="active-invites" role="status">Загружаем приглашения…</div></section></section>`;
  const render=()=>{app.querySelector('#active-students').innerHTML=studentCards(data.students.filter(s=>s.active))||'<p>Пригласите первого ученика.</p>';app.querySelector('#archived-students').innerHTML=studentCards(data.students.filter(s=>!s.active))||'<p>В архиве пока нет учеников.</p>';};
  const sort=app.querySelector('#student-sort');sort.value=studentListSort;sort.addEventListener('change',()=>{studentListSort=sort.value;render();});render();bindInviteForm();await renderActiveInvites();
}
async function renderActiveInvites() {
  const owner=account.user?.id,routeAtStart=location.hash,container=app.querySelector('#active-invites');
  if(!container)return;
  try {
    const data=await accountRequest('teacher/invites');
    if(account.user?.id!==owner||location.hash!==routeAtStart||!container.isConnected)return;
    container.innerHTML=data.invites.length?data.invites.map(i=>`<div class="active-invite"><span>Создано: ${escapeHtml(new Date(i.created*1000).toLocaleString('ru-RU'))}<small>Действует до: ${escapeHtml(new Date(i.expires*1000).toLocaleString('ru-RU'))}</small></span><button class="button" type="button" data-revoke-invite="${escapeHtml(i.id)}">Отозвать</button></div>`).join(''):'<p>Действующих приглашений нет.</p>';
    container.querySelectorAll('[data-revoke-invite]').forEach(button=>button.addEventListener('click',async()=>{button.disabled=true;try{await accountRequest(`teacher/invites/${encodeURIComponent(button.dataset.revokeInvite)}/revoke`,{});if(account.user?.id===owner&&location.hash===routeAtStart)await renderActiveInvites();}catch(error){if(button.isConnected){button.disabled=false;toast(error.message);}}}));
  }catch(error){if(container.isConnected&&account.user?.id===owner)container.textContent=error.message;}
}
function studentManagement(student) {
  return `<details class="student-management"><summary>Управление учеником</summary><form id="student-rename"><label for="student-display-name">Имя, видимое учителю</label><input id="student-display-name" name="name" maxlength="200" required value="${escapeHtml(student.name)}"><button class="button" type="submit">Сохранить имя</button></form><button class="button" type="button" id="student-active">${student.active===false?'Включить ученика':'Отключить ученика'}</button><p id="student-manage-message" role="status"></p></details>`;
}
function confirmStudentDisable(name) {
  return new Promise(resolve=>{
    const dialog=document.createElement('dialog');dialog.className='student-manage-dialog';dialog.setAttribute('aria-labelledby','student-disable-title');
    dialog.innerHTML=`<form method="dialog"><h2 id="student-disable-title">Отключить ученика?</h2><p>${escapeHtml(name)} потеряет доступ к кабинету. История и оценки сохранятся. Позже ученика можно включить.</p><div class="assignment-actions"><button class="button" value="cancel">Отмена</button><button class="button primary" value="disable">Отключить</button></div></form>`;
    app.append(dialog);dialog.addEventListener('close',()=>{const result=dialog.returnValue==='disable';dialog.remove();resolve(result);},{once:true});dialog.showModal();dialog.querySelector('[value="cancel"]').focus();
  });
}
function bindStudentManagement(student) {
  const owner=account.user?.id,routeAtStart=location.hash,prefix=`teacher/students/${encodeURIComponent(student.id)}`;
  app.querySelector('#student-rename').addEventListener('submit',async event=>{
    event.preventDefault();const button=event.currentTarget.querySelector('button');button.disabled=true;
    try{await accountRequest(prefix+'/rename',{name:new FormData(event.currentTarget).get('name')});if(account.user?.id===owner&&location.hash===routeAtStart)await renderStudentAccount(student.id);}
    catch(error){if(button.isConnected){button.disabled=false;app.querySelector('#student-manage-message').textContent=error.message;}}
  });
  app.querySelector('#student-active').addEventListener('click',async event=>{
    const button=event.currentTarget,active=student.active===false;button.disabled=true;
    if(!active&&!await confirmStudentDisable(student.name)){if(button.isConnected)button.disabled=false;return;}
    if(account.user?.id!==owner||location.hash!==routeAtStart)return;
    try{await accountRequest(prefix+'/active',{active});if(account.user?.id===owner&&location.hash===routeAtStart)await renderStudentAccount(student.id);}
    catch(error){if(button.isConnected){button.disabled=false;app.querySelector('#student-manage-message').textContent=error.message;}}
  });
}
function bindInviteForm() {
    document.querySelector('#invite-form')?.addEventListener('submit',async event=>{
      event.preventDefault();const form=event.currentTarget;const output=document.querySelector('#invite-result');const button=form.querySelector('button');button.disabled=true;
      try {const invite=await accountRequest('teacher/invite',{});const url=location.origin+'/#join/'+invite.token;output.innerHTML=`<p>Ссылка готова. Отправьте её одному ученику. После регистрации она перестанет действовать.</p><label for="invite-link">Ссылка приглашения</label><input id="invite-link" class="invite-link" readonly value="${escapeHtml(url)}"><button class="button" type="button" id="copy-invite">Скопировать ссылку</button><p id="copy-invite-status"></p>`;
        button.textContent='Создать ещё ссылку';await renderActiveInvites();
        output.querySelector('#copy-invite').addEventListener('click',async()=>{
          try {await navigator.clipboard.writeText(url);toast('Ссылка скопирована');}
          catch {const input=output.querySelector('#invite-link');input.focus();input.select();toast('Ссылка выделена. Скопируйте её через меню браузера.');}
        });}
      catch(error){output.textContent=error.message;}finally{button.disabled=false;}
    });

}

if(typeof module!=="undefined")Object.assign(module.exports,{reconcileStudentSession,rememberAccountDraft});

function assignmentPreviewCandidates(pool, selected, replaceIndex = null) {
  const used = new Set(selected.filter((_,index)=>index!==replaceIndex).flatMap(assignmentSentenceKeys));
  const current = new Set(selected.map(item=>item.id));
  return pool.filter(item=>!current.has(item.id)&&assignmentSentenceKeys(item).every(key=>!used.has(key)));
}
function assignmentRandomCandidate(pool, selected, index, seen = new Set(), random = Math.random) {
  const available=assignmentPreviewCandidates(pool,selected,index);
  const unseen=available.filter(item=>!seen.has(item.id));
  const choices=unseen.length?unseen:available;
  return choices.length?choices[Math.floor(random()*choices.length)]:null;
}
function assignmentPreviewCard(item, index, candidate = false) {
  const prompt=String(item.prompt||'').replace(/\{\{\d+:([^}]+)\}\}/g,(_,base)=>`(${base})`);
  const answers=item.options?[item.options[item.correct_option_index]]:item.blanks?.map(b=>(b.accepted_answers||[b.answer]).join(' / '))||[item.answer];
  return `<article class="assignment-preview-card" data-preview-id="${escapeHtml(item.id)}"><div class="assignment-preview-meta">${candidate?'':`<strong>Задание ${index+1}</strong> · `}${escapeHtml(TYPE_LABELS[item.type]||item.type)} · ${escapeHtml(levelLabel(item.level))}</div>${item.title||item.instruction_ru?`<p class="assignment-preview-instruction">${escapeHtml(item.title||item.instruction_ru)}</p>`:''}<p class="assignment-preview-prompt">${escapeHtml(prompt)}</p>${item.prefix?`<p class="rewrite-prefix">${escapeHtml(item.prefix)} …</p>`:""}${item.blocks?`<p>${item.blocks.map(escapeHtml).join(" · ")}</p>`:""}${item.options?`<ol>${item.options.map(option=>`<li>${escapeHtml(option)}</li>`).join('')}</ol>`:''}<details><summary>Ответы и объяснение для учителя</summary><ol>${answers.map(a=>`<li>${escapeHtml(a||'—')}</li>`).join('')}</ol><p>${escapeHtml(item.explanation_ru||'')}</p></details><div class="assignment-actions">${candidate?`<button type="button" class="button" data-preview-pick="${escapeHtml(item.id)}">Выбрать это задание</button>`:`<button type="button" class="button" data-preview-random="${index}" aria-label="Случайная замена задания ${index+1}">Случайная замена</button><button type="button" class="button" data-preview-replace="${index}" aria-label="Заменить задание ${index+1}">Заменить</button><button type="button" class="button" data-preview-remove="${index}" aria-label="Убрать задание ${index+1}">Убрать</button>`}</div>${candidate?'':'<p class="random-replacement-status" role="status"></p>'}</article>`;
}
function renderAssignmentPreview(form, selected) {
  if(account.user?.role!=='teacher'||!form.isConnected)return;
  const owner=account.user.id, route=location.hash;
  const studentId=form.dataset.assignmentStudent, edit=form.assignmentEdit;
  const preview=document.createElement('section');preview.id='assignment-preview';preview.className='assignment-preview';
  form.after(preview);form.hidden=true;
  const introduction=[...form.parentElement.children].filter(node=>node!==form&&node!==preview&&!node.hidden);
  introduction.forEach(node=>node.hidden=true);
  let items=selected.map(item=>edit?.items.find(old=>old.id===item.id)||item),sending=false,search='',page=0,target=null,choosing=false,acrossSection=false;
  const originalPool=filteredExercises(form).slice(), tried=items.map(item=>new Set([item.id]));
  const active=()=>account.user?.id===owner&&account.user?.role==='teacher'&&location.hash===route&&preview.isConnected;
  const focus=selector=>preview.querySelector(selector)?.focus();
  const candidatePool=()=>acrossSection?uniqueAssignmentPool((state.exercises||[]).filter(i=>form.assignmentAvailableIds.has(i.id)&&exerciseTenses(i).length&&exerciseSection(i)===form.elements.topic.value)):filteredExercises(form);
  const candidates=()=>assignmentPreviewCandidates(candidatePool(),items,target).filter(i=>(i.prompt+' '+(i.title||'')+' '+i.id).toLocaleLowerCase().includes(search.toLocaleLowerCase()));
  const valid=()=>items.length>0&&items.length<=50&&items.every(i=>form.assignmentAvailableIds.has(i.id));
  function renderChooser(){
    const box=preview.querySelector('#assignment-choices');if(!box)return;
    box.hidden=!choosing;if(!choosing)return;
    const available=candidates();page=Math.min(page,Math.max(0,Math.ceil(available.length/10)-1));
    box.querySelector('#assignment-choice-count').textContent=`Найдено: ${available.length}. Страница ${page+1} из ${Math.max(1,Math.ceil(available.length/10))}.`;
    box.querySelector('#assignment-choice-list').innerHTML=available.slice(page*10,page*10+10).map(item=>assignmentPreviewCard(item,0,true)).join('')||'<p>Подходящих заданий нет. Измените поиск или настройки набора.</p>';
    box.querySelector('[data-choice-prev]').disabled=page===0;box.querySelector('[data-choice-next]').disabled=(page+1)*10>=available.length;
  }
  function render(focusSelector){
    preview.innerHTML=`<h1 tabindex="-1" id="assignment-preview-heading">Проверить набор</h1><p>${edit?'Изменения ещё не сохранены.':'Задания ещё не отправлены.'} Заменяйте и добавляйте упражнения из выбранных тем, уровней и форматов. Изменение настроек создаст новый набор.</p><div class="field"><label for="preview-title">Название задания</label><input id="preview-title" maxlength="160" required value="${escapeHtml(form.elements.title.value)}"></div><p id="assignment-preview-count" role="status">В наборе: ${items.length} из 50. Проверяемых полей: ${items.reduce((n,i)=>n+(i.blanks?.length||1),0)}.</p><div class="assignment-actions"><button type="button" class="button" id="preview-settings">Изменить настройки</button><button type="button" class="button" id="preview-add" ${items.length>=50?'disabled':''}>Добавить задание</button><button type="button" class="button primary" id="preview-send" ${!valid()?'disabled':''}>${edit?'Сохранить проверенный набор':'Отправить ученику'}</button></div><p id="assignment-preview-error" role="alert"></p><section id="assignment-choices" class="account-section" hidden aria-labelledby="assignment-choice-heading"><h3 id="assignment-choice-heading">${target===null?'Добавить задание':`Заменить задание ${target+1}`}</h3><div class="field"><label for="assignment-search">Поиск по тексту или номеру задания</label><input id="assignment-search" type="search" value="${escapeHtml(search)}"></div><label><input type="checkbox" id="assignment-search-section" ${acrossSection?'checked':''}> Искать по всему разделу, включая другие темы, уровни и форматы</label><p id="assignment-choice-count" role="status"></p><div id="assignment-choice-list"></div><div class="assignment-actions"><button type="button" class="button" data-choice-prev>Назад по списку</button><button type="button" class="button" data-choice-next>Далее по списку</button><button type="button" class="button" id="preview-close-choices">Закрыть выбор</button></div></section><div id="assignment-preview-items">${items.map((item,n)=>`${!form.assignmentAvailableIds.has(item.id)?`<p role="alert">Задание ${n+1} уже недоступно. Замените или уберите его.</p>`:''}${assignmentPreviewCard(item,n)}`).join('')||'<p>Набор пуст. Добавьте хотя бы одно задание.</p>'}</div><div class="assignment-actions"><button type="button" class="button primary" data-preview-submit ${!valid()?'disabled':''}>${edit?'Сохранить этот набор':'Отправить этот набор ученику'}</button></div>`;
    preview.querySelector('#preview-title').addEventListener('input',e=>{form.elements.title.value=e.target.value;});
    preview.querySelector('#assignment-search').addEventListener('input',e=>{search=e.target.value;page=0;renderChooser();});
    preview.querySelector('#assignment-search-section').addEventListener('change',e=>{acrossSection=e.target.checked;page=0;renderChooser();});
    renderChooser();if(typeof mountTeacherLibrary==='function')mountTeacherLibrary(form,items,preview);if(focusSelector)focus(focusSelector);
  }
  preview.addEventListener('click',async event=>{
    const button=event.target.closest('button');if(!button||sending||!active())return;
    form.elements.title.value=preview.querySelector('#preview-title').value;
    if(button.id==='preview-settings'){
      form.hidden=false;introduction.forEach(node=>node.hidden=false);preview.remove();form.querySelector('[type=submit]').disabled=false;form.querySelector('[type=submit]').textContent='Проверить набор';updateAvailable();form.querySelector('[type=submit]').focus();return;
    }
    if(button.hasAttribute('data-preview-random')){
      const index=Number(button.dataset.previewRandom);
      const pool=originalPool.filter(item=>form.assignmentAvailableIds.has(item.id));
      const item=assignmentRandomCandidate(pool,items,index,tried[index]);
      if(!item){button.closest('article').querySelector('.random-replacement-status').textContent='Других доступных заданий в исходных фильтрах нет.';return;}
      const fresh=assignmentPreviewCandidates(pool,items,index).some(candidate=>!tried[index].has(candidate.id));
      if(!fresh){tried[index].clear();tried[index].add(items[index].id);}
      items[index]=edit?.items.find(old=>old.id===item.id)||item;tried[index].add(item.id);choosing=false;
      render(`[data-preview-random="${index}"]`);
      preview.querySelector(`[data-preview-random="${index}"]`).closest('article').querySelector('.random-replacement-status').textContent='Подобрано другое задание по исходным фильтрам.';
      return;
    }
    if(button.id==='preview-add'||button.hasAttribute('data-preview-replace')){
      if(button.id==='preview-add'&&items.length>=50)return;
      target=button.hasAttribute('data-preview-replace')?Number(button.dataset.previewReplace):null;choosing=true;search='';page=0;render('#assignment-search');return;
    }
    if(button.hasAttribute('data-preview-remove')){items.splice(Number(button.dataset.previewRemove),1);tried.splice(Number(button.dataset.previewRemove),1);choosing=false;render('#preview-add');return;}
    if(button.id==='preview-close-choices'){choosing=false;render('#preview-add');return;}
    if(button.hasAttribute('data-choice-prev')||button.hasAttribute('data-choice-next')){page+=button.hasAttribute('data-choice-next')?1:-1;renderChooser();return;}
    if(button.hasAttribute('data-preview-pick')){
      const item=candidates().find(i=>i.id===button.dataset.previewPick);if(!item)return;
      if(target===null){if(items.length>=50)return;items.push(item);tried.push(new Set([item.id]));}else {items[target]=edit?.items.find(old=>old.id===item.id)||item;tried[target].add(item.id);}
      choosing=false;render('#assignment-preview-heading');return;
    }
    if((button.id!=='preview-send'&&!button.hasAttribute('data-preview-submit'))||!valid()||!preview.querySelector('#preview-title').reportValidity())return;
    if(!form.elements.title.value.trim()){preview.querySelector('#assignment-preview-error').textContent='Введите название задания.';focus('#preview-title');return;}
    sending=true;preview.querySelectorAll('button,input').forEach(node=>node.disabled=true);
    const ids=items.map(i=>i.id),endpoint=`teacher/students/${encodeURIComponent(studentId)}/assignments`;
    try{
      await accountRequest(edit?`${endpoint}/${encodeURIComponent(edit.id)}/edit`:endpoint,{title:form.elements.title.value,ids,itemVersions:items.map(i=>i.content_version),...(edit?{version:edit.version}:{})});
      if(typeof clearTeacherLibraryDraft==='function')await clearTeacherLibraryDraft(form).catch(()=>{});
      if(active())location.hash=`student/${encodeURIComponent(studentId)}`;
    }catch(error){
      if(!active())return;
      if(error.status===409&&!edit){
        try{const pool=await accountRequest(`teacher/students/${encodeURIComponent(studentId)}/assignment-pool`);if(!active())return;form.assignmentAvailableIds=new Set(pool.availableIds);}catch{}
      }
      sending=false;render();preview.querySelector('#assignment-preview-error').textContent=error.message+(!valid()?' Уберите или замените задания, уже назначенные в другой вкладке.':'');
    }
  });
  render('#assignment-preview-heading');syncScreenChrome();window.scrollTo({top:0,behavior:'instant'});
}
if(typeof module!=="undefined")Object.assign(module.exports,{assignmentPreviewCandidates,assignmentRandomCandidate,assignmentPreviewCard,renderAssignmentPreview});
