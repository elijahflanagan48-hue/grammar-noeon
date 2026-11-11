/* "Сегодня": one main step first, then the details. Replaces the old list-style markup. */
function tdDayKey(date) { return date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate(); }
function tdStreak(days) {
  const set = new Set((days || []).map(time => tdDayKey(new Date(time * 1000))));
  const cursor = new Date(); let count = 0;
  if (!set.has(tdDayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (set.has(tdDayKey(cursor))) { count++; cursor.setDate(cursor.getDate() - 1); }
  return count;
}
function tdWeekBars(days) {
  const counts = new Map(); (days || []).forEach(time => { const key = tdDayKey(new Date(time * 1000)); counts.set(key, (counts.get(key) || 0) + 1); });
  const cursor = new Date(); cursor.setDate(cursor.getDate() - 6); const bars = [];
  for (let n = 0; n < 7; n++) { bars.push({ label: cursor.toLocaleDateString('ru-RU', { weekday: 'short' }), count: counts.get(tdDayKey(cursor)) || 0 }); cursor.setDate(cursor.getDate() + 1); }
  const top = Math.max(1, ...bars.map(bar => bar.count));
  return bars.map(bar => `<div class="td-day"><i><u style="height:${Math.round(bar.count / top * 100)}%"></u></i><span>${escapeHtml(bar.label)}</span></div>`).join('');
}
function tdRing(percent, label) {
  const value = Math.max(0, Math.min(100, percent || 0)), length = 100.5;
  return `<div class="td-ring" role="img" aria-label="${escapeHtml(label)}"><svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="16"/><circle class="fg" cx="20" cy="20" r="16" stroke-dasharray="${(value / 100 * length).toFixed(1)} ${length}"/></svg><b>${percent === null ? '—' : value + '%'}<small>${escapeHtml(label)}</small></b></div>`;
}
function todayStudentMarkup(data) {
  const weakItems = data.weakTopics.map(topic => ({
    id: topic.topicId, label: PRACTICE_TENSES.find(t => t.id === topic.topicId)?.label || topic.topicId,
    percent: Math.round(topic.correct / topic.checked * 100), checked: Number(topic.checked), section: targetSection(topic.topicId)
  }));
  const next = data.newAssignments.items[0], weak = weakItems[0];
  let headline, action;
  if (data.resume) {
    headline = `Вы остановились на «${escapeHtml(data.resume.title)}»`;
    action = `<button class="td-btn" type="button" data-resume="${escapeHtml(data.resume.id)}">Продолжить: ${Number(data.resume.index)} из ${Number(data.resume.total)}</button>`;
  } else if (next) {
    headline = `Новое от учителя: «${escapeHtml(next.title)}»`;
    action = `<a class="td-btn" href="${escapeHtml('#work/' + encodeURIComponent(next.practiceId))}">Начать · ${Number(next.total)} заданий</a>`;
  } else if (weak && data.freePracticeAllowed) {
    headline = `Сегодня повторяем: ${escapeHtml(weak.label)}`;
    action = `<a class="td-btn" href="${escapeHtml('#practice/' + weak.section + '/' + encodeURIComponent(weak.id))}">Тренировать тему</a>`;
  } else {
    headline = 'Заданий на сегодня нет';
    action = '<a class="td-btn" href="#grammar">Открыть темы</a>';
  }
  const name = account.user?.name ? ', ' + escapeHtml(account.user.name) : '';
  const date = new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
  const accuracy = data.week.maxScore ? Math.round(data.week.score / data.week.maxScore * 100) : null;
  const streak = tdStreak(data.days);
  const pills = [`<span>Заданий от учителя: ${Number(data.newAssignments.total)}</span>`, `<span>Тем для повторения: ${weakItems.length}</span>`, `<span>Серия: ${streak} ${streak === 1 ? 'день' : streak > 1 && streak < 5 ? 'дня' : 'дней'}</span>`].join('');
  const weakHtml = weakItems.map(topic => `<article class="today-topic td-topic"><div class="td-topic-head"><h3>${escapeHtml(topic.label)}</h3><b>${topic.percent}%</b></div><div class="td-bar"><i style="width:${topic.percent}%" class="${topic.percent < 55 ? 'bad' : 'warn'}"></i></div><p>Проверено полей: ${topic.checked}</p><div class="today-actions"><a class="button" href="${escapeHtml(todayRuleLink(topic.id))}">Правило</a>${data.freePracticeAllowed ? `<a class="button" href="${escapeHtml('#practice/' + topic.section + '/' + encodeURIComponent(topic.id))}">Тренировать тему</a>` : ''}</div></article>`).join('');
  return `<section class="td-hero"><p class="td-eyebrow">${escapeHtml(date)}</p><h2>Привет${name}!</h2><p class="td-headline">${headline}</p><div class="td-pills">${pills}</div><div class="td-hero-action">${action}</div></section>
  <div class="td-grid"><div class="td-col">${todayList('Новые задания учителя', data.newAssignments, a => `<a class="work-card" href="${escapeHtml('#work/' + encodeURIComponent(a.practiceId))}"><span class="work-card-main"><strong>${escapeHtml(a.title)}</strong><span class="work-card-meta">Заданий: ${Number(a.total)} · ${escapeHtml(new Date(a.created * 1000).toLocaleDateString('ru-RU'))}</span></span><span class="work-card-arrow">Открыть</span></a>`, 'Новых назначений пока нет.')}
    <section class="today-section"><h2>Что стоит повторить</h2>${weakHtml || '<p class="subtle">Тем с точностью ниже 70% пока нет. Для рекомендации нужно хотя бы 5 проверенных полей по теме.</p>'}${!data.freePracticeAllowed ? '<p class="subtle">Свободную тренировку включает учитель. Правила доступны всегда.</p>' : ''}</section></div>
  <section class="today-section td-week"><h2>За последние 7 дней</h2>${tdRing(accuracy, 'точность')}<div class="td-days" aria-label="Тренировки по дням">${tdWeekBars(data.days)}</div>
    <div class="today-stats"><div><strong data-today-stat="week-sessions">${Number(data.week.sessions)}</strong><span>завершено тренировок</span></div><div><strong data-today-stat="week-checked">${Number(data.week.maxScore)}</strong><span>проверено полей</span></div><div><strong>${accuracy === null ? '—' : accuracy + '%'}</strong><span>точность</span></div></div>${data.week.pending ? `<p class="subtle">Без автоматической оценки: ${Number(data.week.pending)}.</p>` : ''}<p class="subtle">За всё время: <span data-today-stat="all-checked">${Number(data.stats.maxScore)}</span> проверенных полей, <span data-today-stat="all-score">${Number(data.stats.score)}</span> верно. <a href="#results">Все результаты</a></p></section></div>`;
}
function todayTeacherMarkup(data) {
  const row = (href, title, meta, action, attrs = '') => `<a class="work-card" ${attrs} href="${escapeHtml(href)}"><span class="work-card-main"><strong>${escapeHtml(title)}</strong><span class="work-card-meta">${meta}</span></span><span class="work-card-arrow">${action}</span></a>`;
  const date = new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
  const attention = data.inactiveStudents.total + data.staleAssignments.total;
  return `<p class="td-eyebrow td-plain">${escapeHtml(date)} · Кабинет учителя${attention ? ` · требует внимания: ${attention}` : ''}</p>${todayResume(data.resume)}<div class="td-review">${reviewQueueEntry(data.reviews)}</div>
  <div class="td-grid"><div class="td-col">${todayList('Новые выполненные работы', data.completed, a => row('#report/' + encodeURIComponent(a.studentId) + '/' + encodeURIComponent(a.practiceId), a.studentName, escapeHtml(a.title) + ' · ' + Number(a.score) + '/' + Number(a.maxScore), 'Отчёт', `data-today-completed="${escapeHtml(a.id)}"`), 'Новых выполненных работ пока нет.')}</div>
  <div class="td-col">${todayList('Без активности 7 дней и больше', data.inactiveStudents, u => row('#student/' + encodeURIComponent(u.id), u.name, u.lastActive ? 'Последняя активность: ' + escapeHtml(new Date(u.lastActive * 1000).toLocaleDateString('ru-RU')) : 'Ещё не заходил в кабинет', 'Открыть'), 'Все активные ученики заходили недавно.')}
  ${todayList('Не начаты больше 3 дней', data.staleAssignments, a => row('#student-work/' + encodeURIComponent(a.studentId) + '/' + encodeURIComponent(a.practiceId), a.studentName, escapeHtml(a.title) + ' · ' + escapeHtml(new Date(a.created * 1000).toLocaleDateString('ru-RU')), 'Открыть'), 'Залежавшихся назначений нет.')}</div></div><p><a class="button" href="#students">Все ученики</a> <a class="button" href="#teacher-library">Библиотека наборов</a> <a class="button" href="#task-issues">Сообщения о заданиях</a></p>`;
}
