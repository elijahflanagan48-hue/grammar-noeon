'use strict';

function teacherDraftKey(form) { return `noeon-teacher-draft:${account.user?.id}:${form.dataset.assignmentStudent}`; }
function teacherDraftPayload(form, items) {
  return {title:form.elements.title.value.trim()||'Новая подборка',ids:items.map(item=>item.id),itemVersions:items.map(item=>item.content_version??null),filters:practiceFilterPayload(form)};
}
function teacherDraftSignature(payload) {return JSON.stringify([payload.title,payload.ids,payload.itemVersions,payload.filters]);}
function teacherDraftStatus(form,text,error=false) {
  const node=form.parentElement?.querySelector('#library-draft-status');
  if(node){node.textContent=text;node.setAttribute('role',error?'alert':'status');}
}
function rememberTeacherDraft(form,items) {
  if(form.assignmentEdit||account.user?.role!=='teacher')return;
  const draft=form.libraryDraftState ||= {revision:form.libraryDraftRevision||0,pending:Promise.resolve(),owner:account.user.id};
  draft.latest=teacherDraftPayload(form,items);
  const intent={...draft.latest,baseRevision:draft.revision,updated:Date.now()};
  try{localStorage.setItem(teacherDraftKey(form),JSON.stringify(intent));draft.localAvailable=true;}catch{draft.localAvailable=false;}
  teacherDraftStatus(form,'Сохраняем черновик…');
  draft.pending=draft.pending.catch(()=>{}).then(async()=>{
    if(draft.blocked||account.user?.id!==draft.owner)return;
    const payload=draft.latest,signature=teacherDraftSignature(payload);
    if(signature===draft.savedSignature){teacherDraftStatus(form,'Черновик сохранён');return;}
    try{
      const response=await fetch(`/api/teacher/library-drafts/${encodeURIComponent(form.dataset.assignmentStudent)}`,{method:'POST',keepalive:true,headers:{'Content-Type':'application/json','X-CSRF-Token':account.csrf||''},body:JSON.stringify({...payload,revision:draft.revision})});
      const result=await response.json();if(!response.ok){const error=Error(result.error||'Не удалось сохранить черновик.');error.status=response.status;throw error;}
      draft.revision=result.revision;form.libraryDraftRevision=result.revision;draft.savedSignature=signature;
      const latestSignature=teacherDraftSignature(draft.latest);
      if(latestSignature===signature){try{localStorage.removeItem(teacherDraftKey(form));}catch{}teacherDraftStatus(form,'Черновик сохранён');}
      else try{localStorage.setItem(teacherDraftKey(form),JSON.stringify({...draft.latest,baseRevision:draft.revision,updated:Date.now()}));draft.localAvailable=true;}catch{draft.localAvailable=false;}
    }catch(error){if(error.status===409)draft.blocked=true;teacherDraftStatus(form,error.message+(draft.localAvailable?' Несохранённые изменения есть на этом устройстве.':' Резервная копия на устройстве недоступна; не закрывайте страницу до сохранения.'),true);}
  });
}
function mountTeacherLibrary(form,items,preview) {
  if(account.user?.role!=='teacher')return;
  const toolbar=document.createElement('section');toolbar.className='library-preview-tools';
  toolbar.innerHTML='<p id="library-draft-status" role="status"></p><div class="assignment-actions"><button type="button" class="button" data-library-save>Сохранить как шаблон</button><a class="button" href="#teacher-library">Мои наборы</a></div><p data-library-save-status role="status"></p>';
  preview.querySelector('#assignment-preview-count').after(toolbar);
  toolbar.querySelector('[data-library-save]').addEventListener('click',async event=>{
    const button=event.currentTarget,output=toolbar.querySelector('[data-library-save-status]'),owner=account.user.id;
    button.disabled=true;output.textContent='Сохраняем шаблон…';
    try{
      if(!items.length)throw Error('Добавьте хотя бы одно упражнение.');
      if(!form.assignmentEdit){rememberTeacherDraft(form,items);await form.libraryDraftState.pending;if(form.libraryDraftState.blocked)throw Error('Сначала восстановите актуальный черновик.');}
      const result=await accountRequest('teacher/library',{...teacherDraftPayload(form,items),...(!form.assignmentEdit?{draftStudentId:form.dataset.assignmentStudent}:{})});
      if(account.user?.id===owner&&toolbar.isConnected)output.innerHTML=`Шаблон сохранён. <a href="#teacher-library/${encodeURIComponent(result.id)}">Открыть и назначить ученикам</a>`;
    }catch(error){if(toolbar.isConnected)output.textContent=error.message;}
    finally{button.disabled=false;}
  });
  if(form.assignmentEdit)toolbar.querySelector('#library-draft-status').textContent='Редактирование существующего назначения: изменения сохраняются кнопкой «Сохранить проверенный набор».';
  else{
    rememberTeacherDraft(form,items);
    preview.querySelector('#preview-title').addEventListener('input',()=>rememberTeacherDraft(form,items));
  }
}
function applyTeacherDraftFilters(form,filters) {
  if(filters.topic!==form.elements.topic.value)return false;
  for(const [name,values] of [['tense',filters.tenses],['level',filters.levels]])if(Array.isArray(values))form.querySelectorAll(`input[name="${name}"]`).forEach(input=>input.checked=values.includes(input.value));
  setPracticeFormats(form,filters.types||filters.type||'all');
  const count=Number(filters.count);if(Number.isInteger(count)&&count>=1&&count<=50)form.elements.count.value=String(count);
  return true;
}
async function restoreTeacherLibraryDraft(form) {
  if(form.assignmentEdit||!form.dataset.assignmentStudent||account.user?.role!=='teacher')return false;
  const owner=account.user.id,route=location.hash;
  const presets=form.parentElement?.querySelector('.practice-presets');
  form.inert=true;if(presets)presets.inert=true;
  try{
    const response=await accountRequest('teacher/library-drafts/'+encodeURIComponent(form.dataset.assignmentStudent));
    if(!form.isConnected||account.user?.id!==owner||location.hash!==route||form.parentElement.querySelector('#assignment-preview'))return false;
    const saved=response.draft;form.libraryDraftRevision=saved?.revision||0;
    let local;try{local=JSON.parse(localStorage.getItem(teacherDraftKey(form))||'null');}catch{}
    const serverPayload=saved?{title:saved.title,ids:saved.items.map(item=>item.id),itemVersions:saved.items.map(item=>item.content_version??null),filters:saved.filters}:null;
    let payload=serverPayload;
    if(local&&(!saved||local.baseRevision===saved.revision||teacherDraftSignature(local)===teacherDraftSignature(serverPayload)))payload=local;
    if(!payload)return false;
    if(payload.filters.topic!==form.elements.topic.value){
      const notice=document.createElement('p');notice.className='account-section';notice.innerHTML=`Есть сохранённый черновик в другом разделе. <a href="#assign/${encodeURIComponent(form.dataset.assignmentStudent)}/${encodeURIComponent(payload.filters.topic)}">Восстановить подборку</a>`;form.before(notice);return false;
    }
    const usePayload=(candidate)=>{
      const snapshots=new Map((saved?.items||[]).map(item=>[item.id,item]));
      const restored=candidate.ids.map((id,n)=>{const old=snapshots.get(id),current=state.exercises?.find(item=>item.id===id);const item=old&&(old.content_version??null)===candidate.itemVersions[n]?old:current;return item&&(item.content_version??null)===candidate.itemVersions[n]?item:null;});
      if(restored.some(item=>!item))throw Error('Часть несохранённых упражнений изменилась. Серверный черновик сохранён; откройте его и замените недоступные упражнения.');
      applyTeacherDraftFilters(form,candidate.filters);form.elements.title.value=candidate.title;
      renderAssignmentPreview(form,restored);
    };
    if(local&&saved&&local.baseRevision!==saved.revision&&teacherDraftSignature(local)!==teacherDraftSignature(serverPayload)){
      const notice=document.createElement('section');notice.className='account-section';notice.innerHTML='<p>На этом устройстве есть несохранённые изменения, а серверный черновик изменён в другой вкладке. Выберите версию для продолжения.</p><button type="button" class="button" data-restore-server>Серверный черновик</button> <button type="button" class="button" data-restore-local>Мои несохранённые изменения</button><p role="alert"></p>';
      form.before(notice);for(const [selector,value] of [['[data-restore-server]',serverPayload],['[data-restore-local]',local]])notice.querySelector(selector).addEventListener('click',()=>{try{if(!form.isConnected||account.user?.id!==owner)return;usePayload(value);notice.remove();}catch(error){notice.querySelector('[role=alert]').textContent=error.message;}});return false;
    }
    usePayload(payload);return true;
  }catch(error){if(form.isConnected&&account.user?.id===owner){const output=document.createElement('p');output.setAttribute('role','alert');output.textContent='Не удалось восстановить черновик: '+error.message;form.before(output);}return false;}
  finally{form.inert=false;if(presets)presets.inert=false;}
}
async function clearTeacherLibraryDraft(form) {
  if(form.assignmentEdit||!form.dataset.assignmentStudent)return;
  const owner=account.user?.id,draft=form.libraryDraftState;
  if(draft)await draft.pending.catch(()=>{});
  if(account.user?.id!==owner)return;
  await accountRequest('teacher/library-drafts/'+encodeURIComponent(form.dataset.assignmentStudent),{revision:draft?.revision||form.libraryDraftRevision||0,discard:true});
  localStorage.removeItem(teacherDraftKey(form));
}

async function renderTeacherLibrary(id=location.hash.split('/')[1]) {
  syncRouteNav();
  if(account.user?.role!=='teacher'){app.innerHTML='<h1>Мои наборы</h1><p>Библиотека доступна преподавателю.</p><a class="button primary" href="#profile">Войти</a>';return;}
  const owner=account.user.id,route=location.hash,active=()=>account.user?.id===owner&&location.hash===route;
  app.innerHTML='<p role="status">Загружаем библиотеку…</p>';
  try{
    if(!id){
      const data=await accountRequest('teacher/library');if(!active())return;
      app.innerHTML=`<h1>Мои наборы</h1><p>Сохраняйте удачные подборки и назначайте их нескольким ученикам. Каждый получит отдельную работу и результат.</p>${data.sets.length?data.sets.map(set=>`<a class="work-card" href="#teacher-library/${encodeURIComponent(set.id)}"><div><strong>${escapeHtml(set.title)}</strong><p>${set.count} заданий · ${escapeHtml(new Date(set.created).toLocaleDateString('ru-RU'))}</p></div><span>Открыть →</span></a>`).join(''):'<section class="account-section"><h2>Сохранённых наборов пока нет</h2><p>Выберите ученика, подготовьте подборку и нажмите «Сохранить как шаблон» в предпросмотре.</p><a class="button primary" href="#students">Выбрать ученика</a></section>'}`;return;
    }
    const [set,roster]=await Promise.all([accountRequest('teacher/library/'+encodeURIComponent(id)),accountRequest('teacher/students')]);if(!active())return;
    const pupils=roster.students.filter(pupil=>pupil.active);
    app.innerHTML=`<a class="button" href="#teacher-library">← Мои наборы</a><h1>${escapeHtml(set.title)}</h1><p>${set.count} заданий. Сохранённые редакции упражнений используются без изменения. Результаты учеников не влияют на шаблон.</p><form id="library-assign-form"><div class="field"><label for="library-title">Название назначения</label><input id="library-title" name="title" required maxlength="160" value="${escapeHtml(set.title)}"></div><fieldset><legend>Кому назначить</legend>${pupils.length?`<div class="level-options">${pupils.map(pupil=>`<label><input type="checkbox" name="student" value="${escapeHtml(pupil.id)}"><span>${escapeHtml(pupil.name)}</span></label>`).join('')}</div>`:'<p>Активных учеников пока нет. <a href="#students">Добавить ученика</a></p>'}</fieldset><label><input type="checkbox" name="repeat"> Разрешить повтор предложений, уже назначенных выбранным ученикам</label><p>Без этого разрешения повторное назначение блокируется. Каждое новое назначение имеет отдельный результат.</p><button type="submit" class="button primary" ${pupils.length?'':'disabled'}>Назначить выбранным ученикам</button><p id="library-assign-status" role="status"></p></form><details class="account-section"><summary>Упражнения и ответы для преподавателя</summary>${set.items.map((item,index)=>`<article><h3>Задание ${index+1} · ${escapeHtml(item.id)}</h3><p>${escapeHtml(item.prompt)}</p><p>Версия: ${escapeHtml(item.content_version||'архивная')}</p><details><summary>Ответы</summary><p>${escapeHtml(item.options?item.options[item.correct_option_index]:(item.blanks||[]).map(blank=>blank.answer).join(' / ')||item.answer||item.answer_text||'См. условие')}</p></details></article>`).join('')}</details>`;
    const form=document.querySelector('#library-assign-form');let requestId=crypto.randomUUID();
    form.addEventListener('change',()=>requestId=crypto.randomUUID());
    form.addEventListener('input',()=>requestId=crypto.randomUUID());
    form.addEventListener('submit',async event=>{
      event.preventDefault();const output=form.querySelector('#library-assign-status'),button=form.querySelector('[type=submit]');
      const studentIds=[...form.querySelectorAll('[name=student]:checked')].map(input=>input.value);if(!studentIds.length){output.textContent='Выберите хотя бы одного ученика.';return;}
      button.disabled=true;form.querySelectorAll('input').forEach(input=>input.disabled=true);output.textContent='Назначаем набор…';
      try{const result=await accountRequest('teacher/library/'+encodeURIComponent(id)+'/assign',{title:form.elements.title.value,studentIds,allowRepeat:form.elements.repeat.checked,requestId});if(active()){output.textContent=`Набор назначен: ${result.deliveries.length}. У каждого ученика отдельная работа.`;form.querySelectorAll('input').forEach(input=>input.disabled=true);button.textContent='Назначено';}}
      catch(error){if(active()){output.textContent=error.message;button.disabled=false;form.querySelectorAll('input').forEach(input=>input.disabled=false);}}
    });
  }catch(error){if(active())app.innerHTML=`<h1>Мои наборы</h1><p role="alert">${escapeHtml(error.message)}</p><a class="button primary" href="#teacher-library">Попробовать снова</a>`;}
}
if(typeof module!=='undefined')Object.assign(module.exports,{teacherDraftPayload,teacherDraftSignature,applyTeacherDraftFilters});
