'use strict';

function mountTaskIssueButton(container, context) {
  if(!container||!context?.practiceId||!Number.isInteger(context.index)||!account.user)return;
  const button=document.createElement('button');
  button.type='button';button.className='button task-issue-trigger';button.textContent='Сообщить о проблеме в задании';
  container.append(button);
  button.addEventListener('click',()=>{
    if(document.querySelector('#task-issue-dialog'))return;
    const owner=account.user?.id,route=location.hash,requestId=crypto.randomUUID();
    const dialog=document.createElement('dialog');dialog.id='task-issue-dialog';dialog.className='task-issue-dialog';dialog.setAttribute('aria-labelledby','task-issue-title');
    dialog.innerHTML='<h2 id="task-issue-title">Сообщить преподавателю</h2><p>Опишите, что вызывает сомнение. Номер и версия задания добавятся автоматически. Ответ и прогресс сохранятся.</p><form><label for="task-issue-comment">Комментарий</label><textarea id="task-issue-comment" rows="4" maxlength="2000" required></textarea><p class="subtle">До 2000 символов.</p><div class="actions"><button class="button primary" type="submit">Отправить</button><button class="button" type="button" data-issue-close>Отмена</button></div><p id="task-issue-status" role="status" aria-live="polite"></p></form>';
    document.body.append(dialog);
    const closeOnRoute=()=>dialog.close();window.addEventListener('hashchange',closeOnRoute);
    dialog.addEventListener('close',()=>{window.removeEventListener('hashchange',closeOnRoute);dialog.remove();button.focus({preventScroll:true});},{once:true});
    dialog.querySelector('[data-issue-close]').addEventListener('click',()=>dialog.close());
    dialog.querySelector('form').addEventListener('submit',async event=>{
      event.preventDefault();
      if(account.user?.id!==owner||location.hash!==route){dialog.close();return;}
      const submit=dialog.querySelector('[type=submit]'),output=dialog.querySelector('#task-issue-status');
      if(submit.disabled)return;
      const comment=dialog.querySelector('textarea').value.trim();if(!comment)return;
      submit.disabled=true;output.textContent='Отправляем…';
      try {
        await accountRequest('task-issues',{practiceId:context.practiceId,index:context.index,comment,requestId});
        if(account.user?.id!==owner||!dialog.isConnected)return;
        dialog.querySelector('textarea').disabled=true;submit.hidden=true;
        output.textContent='Сообщение передано преподавателю.';
        dialog.querySelector('[data-issue-close]').textContent='Закрыть';
      }catch(error){if(dialog.isConnected){submit.disabled=false;output.setAttribute('role','alert');output.textContent=error.message;}}
    });
    dialog.showModal();dialog.querySelector('textarea').focus();
  });
}

function taskIssueCard(issue, resolved=false) {
  return `<article class="task-issue-card"><div class="exercise-meta"><span class="pill">${escapeHtml(issue.itemId)}</span><span class="subtle">Версия: ${escapeHtml(issue.version)}</span></div><p class="subtle">${escapeHtml(issue.reporter)} · ${escapeHtml(new Date(issue.created*1000).toLocaleString('ru-RU'))}</p>${issue.instruction?`<p>${escapeHtml(issue.instruction)}</p>`:''}<blockquote lang="en">${escapeHtml(issue.prompt)}</blockquote>${issue.options?.length?`<ol>${issue.options.map(option=>`<li>${escapeHtml(option)}</li>`).join('')}</ol>`:''}<p class="task-issue-comment">${escapeHtml(issue.comment)}</p>${resolved?'<p class="subtle">Разобрано</p>':`<button type="button" class="button" data-resolve-task-issue="${escapeHtml(issue.id)}">Отметить разобранным</button>`}</article>`;
}
async function renderTaskIssues() {
  syncRouteNav();
  if(account.user?.role!=='teacher'){location.hash='profile';return;}
  const owner=account.user.id,route=location.hash;
  app.innerHTML='<h1>Проблемы в заданиях</h1><p role="status">Загружаем сообщения…</p>';
  try {
    const data=await accountRequest('teacher/task-issues');
    if(account.user?.id!==owner||location.hash!==route)return;
    app.innerHTML=`<div class="reading"><h1>Проблемы в заданиях</h1><p>Не разобрано: ${data.totalOpen}. Сообщения содержат условие и версию, которые получил ученик.</p>${data.totalOpen>100?'<p>Показаны 100 самых ранних сообщений. После разбора появятся следующие.</p>':''}<div class="task-issue-list">${data.items.map(issue=>taskIssueCard(issue)).join('')||'<section class="account-section"><h2>Новых сообщений нет</h2><p>Ученики могут сообщить о сомнительном условии из упражнения или проверочного теста.</p><a class="button primary" href="#grammar">Открыть грамматику</a></section>'}</div><p id="task-issue-queue-status" role="status"></p>${data.recent.length?`<details><summary>Недавно разобранные (${data.recent.length})</summary>${data.recent.map(issue=>taskIssueCard(issue,true)).join('')}</details>`:''}</div>`;
    app.querySelectorAll('[data-resolve-task-issue]').forEach(button=>button.addEventListener('click',async()=>{
      button.disabled=true;
      try {await accountRequest('teacher/task-issues/'+encodeURIComponent(button.dataset.resolveTaskIssue)+'/resolve',{});if(account.user?.id===owner&&location.hash===route)await renderTaskIssues();}
      catch(error){if(button.isConnected){button.disabled=false;app.querySelector('#task-issue-queue-status').textContent=error.message;}}
    }));
  }catch(error){if(account.user?.id===owner&&location.hash===route)app.innerHTML=`<h1>Проблемы в заданиях</h1><p role="alert">${escapeHtml(error.message)}</p><a class="button" href="#profile">В кабинет</a>`;}
}
