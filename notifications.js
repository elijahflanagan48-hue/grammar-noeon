"use strict";

// Counts are private server state. Never persist one account's notices locally.
let notificationOwner=null, notificationData={items:[],unreadCount:0}, notificationFlight=null;
let appBadgeWork=Promise.resolve();
function syncAppBadge(count=0) {
  const value=Number.isSafeInteger(count)&&count>0?count:0;
  // Serialise writes so a late set cannot undo clearing on logout/read-all.
  appBadgeWork=appBadgeWork.catch(()=>{}).then(async()=>{
    if(typeof navigator==='undefined'||typeof navigator.setAppBadge!=='function')return;
    if(value)await navigator.setAppBadge(value);
    else if(typeof navigator.clearAppBadge==='function')await navigator.clearAppBadge();
    else await navigator.setAppBadge(0);
  }).catch(()=>{}); // Unsupported/denied/inactive platform must not break practice.
  return appBadgeWork;
}
function appBadgeHint() {
  if(typeof navigator==='undefined'||typeof navigator.setAppBadge!=='function')return '<p class="subtle">Цифра на иконке доступна не во всех браузерах. На iPhone добавьте сайт на экран «Домой» и откройте его с этой иконки.</p>';
  const permission=typeof Notification==='undefined'?null:Notification.permission;
  return `<div class="app-badge-settings"><p class="subtle">На иконке установленного приложения показывается число непрочитанных. На iPhone для этого нужно разрешить уведомления и значки. Пока приложение закрыто, число автоматически не обновляется: фоновая push-доставка ещё не подключена.</p>${permission==='default'?'<button class="button" id="enable-app-badge">Включить цифру на иконке</button>':permission==='denied'?'<p>Разрешение отключено. Включите уведомления и значки для приложения в настройках устройства.</p>':''}<p id="app-badge-status" role="status"></p></div>`;
}
function updateNotificationBadges(count=0) {
  void syncAppBadge(account.user?count:0);
  const bell=document.querySelector('#notification-link');
  if(bell){bell.hidden=!account.user;bell.setAttribute('aria-label','Уведомления');bell.removeAttribute('aria-description');}
  document.querySelectorAll('[data-notification-badge]').forEach(node=>node.remove());
  document.querySelectorAll('[data-nav]').forEach(node=>{node.removeAttribute('aria-label');node.removeAttribute('aria-description');});
  if(!account.user||!count)return;
  const section=account.user.role==='teacher'?'results':'profile';
  const targets=[bell,document.querySelector(`[data-nav="${section}"]`)];
  targets.filter(Boolean).forEach(node=>{
    const badge=document.createElement('span');badge.dataset.notificationBadge='';badge.className='notification-badge';badge.textContent=count>99?'99+':String(count);badge.setAttribute('aria-hidden','true');node.append(badge);
    node.setAttribute('aria-label',node.id==='notification-link'?`Уведомления ${badge.textContent}`:node.textContent.trim());
    node.setAttribute('aria-description',`Непрочитанных: ${count}`);
  });
}
async function refreshNotifications() {
  const owner=account.user?.id||null;
  if(notificationOwner!==owner){notificationOwner=owner;notificationData={items:[],unreadCount:0};updateNotificationBadges();}
  if(!owner){updateNotificationBadges();return;}
  if(notificationFlight?.owner===owner)return notificationFlight.promise;
  const flight={owner};
  flight.promise=(async()=>{
    try {
      const data=await accountRequest('notifications');
      if(account.user?.id!==owner)return;
      notificationData=data;updateNotificationBadges(data.unreadCount);
      if(location.hash==='#notifications')drawNotifications(data);
    } catch(error) {
      if(account.user?.id!==owner)return;
      if(error.status===401)updateNotificationBadges();
      if(location.hash==='#notifications')app.innerHTML=`<h1>Уведомления</h1><p role="alert">${escapeHtml(error.message)}</p><button class="button" id="retry-notifications">Повторить</button>`;
      document.querySelector('#retry-notifications')?.addEventListener('click',()=>renderNotifications());
    } finally {if(notificationFlight===flight)notificationFlight=null;}
  })();
  notificationFlight=flight;
  return flight.promise;
}
function drawNotifications(data) {
  syncRouteNav();
  const cards=data.items.map(notificationCard).join('');
  app.innerHTML=`<div class="account-title"><div><div class="eyebrow">Личный кабинет</div><h1>Уведомления</h1><p>Непрочитанных: ${data.unreadCount}</p></div>${data.unreadCount?'<button class="button" id="read-notifications">Прочитать все</button>':''}</div><details class="notification-settings"><summary>Настройки уведомлений и значка</summary>${appBadgeHint()}</details><p class="subtle">Непрочитанные — сначала. Здесь показаны до 50 уведомлений; предыдущие задания и отчёты остаются в кабинете.</p><div class="notification-list">${cards||'<p>Уведомлений пока нет.</p>'}</div><p id="notification-error" role="alert"></p>`;
  const owner=account.user.id;
  document.querySelector('#enable-app-badge')?.addEventListener('click',async event=>{
    event.currentTarget.disabled=true;
    try {
      // Only the user's explicit button click can open the system permission prompt.
      const permission=await Notification.requestPermission();
      if(account.user?.id!==owner||location.hash!=='#notifications')return;
      await refreshNotifications();
      if(account.user?.id!==owner||location.hash!=='#notifications')return;
      await syncAppBadge(notificationData.unreadCount);
      toast(permission==='granted'?'Разрешение получено. Отображение значка зависит от настроек устройства.':'Разрешение не получено. Уведомления внутри приложения продолжат работать.');
    } catch {if(account.user?.id===owner)toast('Не удалось запросить разрешение. Проверьте настройки приложения на устройстве.');}
  });
  document.querySelector('#read-notifications')?.addEventListener('click',async event=>{
    event.currentTarget.disabled=true;
    try{await accountRequest('notifications/read',{all:true});if(account.user?.id===owner)await refreshNotifications();}
    catch(error){if(account.user?.id===owner)showAccountError('#notification-error',error);}
  });
  app.querySelectorAll('[data-open-notification]').forEach(button=>button.addEventListener('click',async()=>{
    const n=data.items.find(n=>n.id===button.dataset.openNotification);button.disabled=true;
    try {
      await accountRequest('notifications/read',{id:n.id});
      if(account.user?.id!==owner||location.hash!=='#notifications')return;
      if(n.kind==='completed')location.hash=`report/${encodeURIComponent(n.studentId)}/${encodeURIComponent(n.practiceId)}`;
      else if(n.kind==='reviewed')location.hash=`results/${encodeURIComponent(n.practiceId)}/answer/${Number(n.answerIndex)}/field/${Number(n.fieldIndex)}`;
      else {
        await account.pending.catch(()=>{});
        const saved=await accountRequest('practice/'+encodeURIComponent(n.practiceId));
        if(account.user?.id!==owner||location.hash!=='#notifications')return;
        state.session={items:saved.items,index:saved.index,answers:saved.answers,correct:saved.correct,checked:false,draft:saved.draft,remote:{id:saved.id,revision:saved.revision}};
        saveSession();location.hash=saved.index===saved.items.length?'results/'+encodeURIComponent(saved.id):'session';
      }
      void refreshNotifications();
    } catch(error){if(account.user?.id===owner&&location.hash==='#notifications'){button.disabled=false;showAccountError('#notification-error',error);}}
  }));
}
function notificationCard(n) {
  const e=escapeHtml,reviewed=n.kind==='reviewed';
  const label=reviewed?(n.updated?'Решение по переводу обновлено':'Перевод проверен'):n.kind==='completed'?'Задание выполнено':'Назначено задание';
  const body=reviewed?`<p><strong>Преподаватель ${n.correct?'зачёл':'не зачёл'} ваш перевод.</strong></p><p>Задание ${Number(n.answerIndex)+1}${n.fieldIndex?` · поле ${Number(n.fieldIndex)+1}`:''}</p>${n.note?`<p><strong>Комментарий преподавателя:</strong> ${e(n.note)}</p>`:'<p>Комментарий не добавлен. Подробности — в отчёте.</p>'}`:n.kind==='completed'?`<p>${e(n.studentName)} · выполнено упражнений: ${Number(n.total)}</p><p>Баллы: ${Number(n.score)}/${Number(n.maxScore)}${n.maxScore?` · ${Math.round(n.score/n.maxScore*100)}%`:''}${n.pending?` · без автоматической оценки: ${Number(n.pending)}`:''}</p>`:`<p>Вам назначена новая подборка. Упражнений: ${Number(n.total)}.</p>`;
  return `<article class="notification-card ${n.read?'':'unread'}" data-notification-kind="${e(n.kind)}"><div class="eyebrow">${n.read?'Прочитано':'Новое'} · ${label}</div><h2>${e(n.title)}</h2>${body}<time>${new Date(n.created*1000).toLocaleString('ru-RU')}</time><p><button class="button primary" data-open-notification="${e(n.id)}">${reviewed?'Посмотреть проверку':n.kind==='completed'?'Открыть отчёт':'Открыть задание'}</button></p></article>`;
}
async function renderNotifications() {
  if(!account.user){location.hash='profile';return;}
  app.innerHTML='<h1>Уведомления</h1><p role="status">Загружаем…</p>';
  await refreshNotifications();
}
function notificationEntry() {
  return '<p><a class="button" href="#notifications">Уведомления: задания и отчёты →</a></p>';
}
async function renderAssignmentReport(studentId,practiceId) {
  if(account.user?.role!=='teacher'){location.hash='profile';return;}
  syncRouteNav();
  const owner=account.user.id,routeAtStart=location.hash;
  app.innerHTML='<h1>Отчёт о задании</h1><p role="status">Загружаем…</p>';
  const data=await accountRequest(`teacher/students/${encodeURIComponent(studentId)}/reports/${encodeURIComponent(practiceId)}`);
  if(account.user?.id!==owner||location.hash!==routeAtStart)return;
  document.title = `Отчёт: ${data.title} — Grammar NOEON`;
  app.innerHTML=`${reportBackLink(studentId)}${reportMarkup(data.attempt,data.title,data.student.name,false,studentId)}<a class="button" href="#student/${encodeURIComponent(studentId)}">Все задания и прогресс ученика</a>`;
  bindPracticeReport();focusPendingTranslation();
}
function initialiseNotifications() {
  const refresh=()=>{if(!document.hidden)void refreshNotifications();};
  window.setInterval(refresh,30000);
  window.addEventListener('focus',refresh);
  document.addEventListener('visibilitychange',refresh);
  refresh();
}
