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
/* Warm-up: 5 quick questions a day, picked from weak tenses first. Local only, never graded. */
const WARMUP_BANK=[
['present_simple','Water ___ at 100 °C.',['boils','is boiling','has boiled'],0,'Общеизвестный факт → Present Simple.'],
['present_simple','She usually ___ to work by bus.',['is going','goes','has gone'],1,'usually — регулярное действие → Present Simple.'],
['present_simple','Trains to Oxford ___ every hour.',['leave','are leaving','have left'],0,'Расписание и регулярность → Present Simple.'],
['present_continuous','Be quiet! The baby ___.',['sleeps','is sleeping','has slept'],1,'Происходит прямо сейчас → Present Continuous.'],
['present_continuous','I ___ with my aunt this week while my flat is being painted.',['stay','am staying','have stayed'],1,'Временная ситуация → Present Continuous.'],
['present_continuous','We ___ dinner with the Smiths tomorrow. It’s all arranged.',['have','are having','will have had'],1,'Договорённость на будущее → Present Continuous.'],
['present_perfect','We ___ each other since 2019.',['know','knew','have known'],2,'since + период до сих пор; know не употребляется в Continuous.'],
['present_perfect','I ___ my keys, so I can’t get in!',['lost','have lost','was losing'],1,'Результат важен сейчас → Present Perfect.'],
['present_perfect','___ you ever ___ sushi?',['Did / try','Have / tried','Are / trying'],1,'ever — опыт за всю жизнь → Present Perfect.'],
['present_perfect_continuous','I’m tired because I ___ all morning.',['have been cleaning','cleaned','am cleaning'],0,'Процесс до настоящего момента с видимым результатом.'],
['present_perfect_continuous','How long ___ you ___ for the bus?',['have / been waiting','did / wait','are / waiting'],0,'How long + процесс, который ещё идёт.'],
['present_perfect_continuous','It ___ for three hours and it still hasn’t stopped.',['rains','rained','has been raining'],2,'Длится до сих пор → Present Perfect Continuous.'],
['past_simple','I ___ him last Monday.',['have seen','saw','had seen'],1,'last Monday — законченное время в прошлом.'],
['past_simple','Shakespeare ___ Hamlet around 1600.',['wrote','has written','was writing'],0,'Законченное событие в прошлом → Past Simple.'],
['past_simple','When ___ you ___ to London?',['did / move','have / moved','had / moved'],0,'Вопрос When о точном времени → Past Simple.'],
['past_continuous','I ___ TV when you called.',['watched','was watching','have watched'],1,'Процесс, который прервало другое действие.'],
['past_continuous','At 8 pm yesterday we ___ dinner.',['had','were having','have had'],1,'Процесс в конкретный момент прошлого.'],
['past_continuous','While she ___, he was cooking.',['was reading','read','has read'],0,'Два параллельных процесса в прошлом.'],
['past_perfect','When we arrived, the film ___.',['already started','had already started','has already started'],1,'Действие раньше другого прошлого → Past Perfect.'],
['past_perfect','She ___ never ___ snow before she moved to Canada.',['had / seen','has / seen','did / see'],0,'Опыт до момента в прошлом → Past Perfect.'],
['past_perfect','After he ___ his homework, he went out.',['had finished','has finished','was finishing'],0,'Сначала закончил, потом ушёл → Past Perfect.'],
['past_perfect_continuous','Her eyes were red. She ___.',['had been crying','has cried','cried'],0,'Процесс до момента в прошлом, виден результат.'],
['past_perfect_continuous','We ___ for an hour when the bus finally came.',['waited','had been waiting','have been waiting'],1,'Длительность до момента в прошлом.'],
['past_perfect_continuous','He was out of breath because he ___.',['had been running','has been running','ran'],0,'Процесс до момента в прошлом объясняет результат.'],
['future_simple','I think it ___ tomorrow.',['will rain','is raining','rains'],0,'Мнение о будущем: I think + will.'],
['future_simple','The phone’s ringing. I ___ it!',['answer','will answer','am answering'],1,'Решение в момент речи → will.'],
['future_simple','Don’t worry, I ___ anyone your secret.',['won’t tell','don’t tell','am not telling'],0,'Обещание → will.'],
['future_continuous','This time tomorrow I ___ on a beach.',['will lie','will be lying','will have lain'],1,'Процесс в конкретный момент будущего.'],
['future_continuous','Don’t call at 9: we ___ dinner.',['will have','will be having','have'],1,'В 9 будем в процессе → Future Continuous.'],
['future_continuous','At noon on Friday she ___ over the Alps.',['will be flying','will have flown','flies'],0,'Процесс в конкретный момент будущего.'],
['future_perfect','By 2030 they ___ the new bridge.',['will build','will have built','are building'],1,'by + момент в будущем → результат к нему.'],
['future_perfect','Call me at 6. I ___ work by then.',['will have finished','finish','am finishing'],0,'by then → действие завершится к моменту.'],
['future_perfect','By the time you arrive, we ___ dinner.',['will have eaten','eat','are eating'],0,'Завершится до другого события в будущем.'],
['future_perfect_continuous','By 2030 she ___ here for ten years.',['will work','will have been working','works'],1,'Длительность до момента в будущем.'],
['future_perfect_continuous','By June I ___ English for five years.',['will have been studying','will study','am studying'],0,'for + период до момента в будущем.'],
['future_perfect_continuous','Next month he ___ at the company for a decade.',['will have been working','works','will be worked'],0,'Длительность к моменту в будущем.']];
const TD_FORMS={present_simple:'V / V+s',present_continuous:'am/is/are + V-ing',present_perfect:'have/has + V3',present_perfect_continuous:'have/has been + V-ing',past_simple:'V2 / V-ed',past_continuous:'was/were + V-ing',past_perfect:'had + V3',past_perfect_continuous:'had been + V-ing',future_simple:'will + V',future_continuous:'will be + V-ing',future_perfect:'will have + V3',future_perfect_continuous:'will have been + V-ing'};
function wuKey() { const d = new Date(); return 'noeon-warmup:' + (account.user?.id || 'guest') + ':' + tdDayKey(d); }
function wuLoad() { try { return JSON.parse(localStorage.getItem(wuKey())) || null; } catch { return null; } }
function wuSave(value) { try { localStorage.setItem(wuKey(), JSON.stringify(value)); } catch {} }
function wuPick(weakIds) {
  const seed = Math.floor(Date.now() / 864e5), order = WARMUP_BANK.map((q, i) => i).sort((x, y) => ((x * 7919 + seed * 104729) % 997) - ((y * 7919 + seed * 104729) % 997));
  const picked = [];
  weakIds.forEach(id => order.filter(i => WARMUP_BANK[i][0] === id).slice(0, 2).forEach(i => picked.length < 5 && !picked.includes(i) && picked.push(i)));
  for (const i of order) { if (picked.length >= 5) break; if (!picked.includes(i)) picked.push(i); }
  return picked;
}
function wuView(index) {
  const [topic, text, raw, rawAnswer, why] = WARMUP_BANK[index], r = (index + Math.floor(Date.now() / 864e5)) % raw.length;
  return [topic, text, raw.map((_, j) => raw[(j + r) % raw.length]), (rawAnswer - r + raw.length) % raw.length, why];
}
function wuQuestion(state) {
  const [topic, text, options, answer, why] = wuView(state.ids[state.i]), label = PRACTICE_TENSES.find(t => t.id === topic)?.label || topic;
  const chosen = state.answer, answered = chosen !== undefined && chosen !== null;
  const fills = options[answer].split(' / '), parts = text.split('___');
  const sentence = parts.map((part, n) => escapeHtml(part) + (n < parts.length - 1 ? (answered ? `<span class="wu-blank ${chosen === answer ? 'ok' : 'bad'}">${escapeHtml(fills[n] || '')}</span>` : '<span class="wu-blank">&nbsp;</span>') : '')).join('');
  const opts = options.map((o, j) => `<button type="button" class="wu-opt${answered && j === answer ? ' ok' : answered && j === chosen ? ' bad' : ''}" data-wu-opt="${j}"${answered ? ' disabled' : ''}>${escapeHtml(o)}</button>`).join('');
  const dots = state.ids.map((_, n) => `<i class="${n < state.i ? 'done' : n === state.i ? 'now' : ''}"></i>`).join('');
  return `<div class="wu-top"><span>Вопрос ${state.i + 1} из ${state.ids.length} · ${escapeHtml(label)}</span><span class="wu-dots" aria-hidden="true">${dots}</span></div>
  <p class="wu-q">${sentence}</p><div class="wu-opts">${opts}</div>
  ${answered ? `<p class="wu-why ${chosen === answer ? 'ok' : 'bad'}">${chosen === answer ? 'Верно.' : 'Не совсем.'} ${escapeHtml(why)}</p><div class="wu-next"><button type="button" class="td-go" data-wu-next>${state.i + 1 < state.ids.length ? 'Дальше' : 'Готово'}</button></div>` : ''}`;
}
function wuState(data) {
  return wuLoad() || { ids: wuPick((data.weakTopics || []).map(t => t.topicId)), i: 0, score: 0, answer: null, done: false };
}
if (document.addEventListener) document.addEventListener('click', event => {
  const box = event.target.closest('.wu'); if (!box) return;
  const state = wuLoad() || JSON.parse(box.dataset.wuInit);
  if (event.target.closest('[data-wu-start]')) { box.classList.add('open'); box.querySelector('.wu-body').innerHTML = wuQuestion(state); wuSave(state); box.querySelector('.wu-opt')?.focus(); return; }
  const opt = event.target.closest('[data-wu-opt]');
  if (opt && (state.answer === null || state.answer === undefined)) { state.answer = Number(opt.dataset.wuOpt); if (state.answer === wuView(state.ids[state.i])[3]) state.score++; wuSave(state); box.querySelector('.wu-body').innerHTML = wuQuestion(state); box.querySelector('[data-wu-next]')?.focus(); return; }
  if (event.target.closest('[data-wu-next]')) {
    if (state.i + 1 < state.ids.length) { state.i++; state.answer = null; wuSave(state); box.querySelector('.wu-body').innerHTML = wuQuestion(state); box.querySelector('.wu-opt')?.focus(); }
    else { state.done = true; wuSave(state); if (typeof renderHome === 'function') renderHome(); }
  }
});
function todayStudentMarkup(data) {
  const weakItems = (data.weakTopics || []).map(topic => ({
    id: topic.topicId, label: PRACTICE_TENSES.find(t => t.id === topic.topicId)?.label || topic.topicId,
    percent: Math.round(topic.correct / topic.checked * 100), checked: Number(topic.checked), section: targetSection(topic.topicId)
  }));
  const next = data.newAssignments.items[0], weak = weakItems[0], warm = wuState(data);
  const name = account.user?.name ? ', ' + escapeHtml(account.user.name) : '';
  const date = new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
  const accuracy = data.week.maxScore ? Math.round(data.week.score / data.week.maxScore * 100) : null;
  const streak = tdStreak(data.days);
  const days = (n) => n === 1 ? 'день' : n > 1 && n < 5 ? 'дня' : 'дней';
  const steps = [];
  steps.push(warm.done
    ? { done: true, kind: 'Разминка', title: 'Разминка дня', meta: `${warm.score} из ${warm.ids.length} верно` }
    : { kind: 'Разминка', title: 'Разминка дня', meta: '5 коротких вопросов по вашим темам · около 2 минут · без оценки', warm: true });
  if (data.resume) steps.push({ kind: 'Продолжить', title: data.resume.title, meta: `<span class="today-resume-progress">Выполнено: ${Number(data.resume.index)} из ${Number(data.resume.total)}</span>`, action: `<button class="td-go" type="button" data-resume="${escapeHtml(data.resume.id)}">Продолжить</button>` });
  else if (next) steps.push({ kind: 'Задание учителя', title: next.title, meta: `Заданий: ${Number(next.total)} · ${escapeHtml(new Date(next.created * 1000).toLocaleDateString('ru-RU'))}`, action: `<a class="td-go" href="${escapeHtml('#work/' + encodeURIComponent(next.practiceId))}">Начать</a>` });
  else steps.push({ done: true, kind: 'Задание учителя', title: 'Новых заданий от учителя нет', meta: 'Когда учитель что-то назначит, оно появится здесь' });
  if (weak) steps.push({ kind: 'Слабая тема', bad: true, title: 'Повторить ' + weak.label, meta: `Точность ${weak.percent}% · проверено полей: ${weak.checked}`, action: `<a class="button" href="${escapeHtml(todayRuleLink(weak.id))}">Правило</a>${data.freePracticeAllowed ? `<a class="td-go" href="${escapeHtml('#practice/' + weak.section + '/' + encodeURIComponent(weak.id))}">Тренировать тему</a>` : ''}` });
  else steps.push({ done: true, kind: 'Повторение', title: 'Слабых тем пока нет', meta: 'Тема попадает сюда, если точность ниже 70% на 5 и более полях' });
  const active = steps.findIndex(step => !step.done), doneCount = steps.filter(step => step.done).length;
  const minutes = steps.reduce((sum, step, n) => sum + (step.done ? 0 : n === 0 ? 2 : n === 1 ? 8 : 5), 0);
  const stepHtml = steps.map((step, n) => {
    const state = step.done ? 'done' : n === active ? 'now' : 'later';
    const warmBox = step.warm ? `<div class="wu${n === active && !data.resume ? ' open' : ''}" data-wu-init="${escapeHtml(JSON.stringify(warm))}"><div class="wu-body">${n === active && !data.resume ? wuQuestion(warm) : '<button type="button" class="td-go" data-wu-start>Начать разминку</button>'}</div></div>` : '';
    return `<li class="td-step ${state}"><span class="td-num" aria-hidden="true">${step.done ? '✓' : n + 1}</span><div class="td-step-main"><span class="td-kind${step.bad ? ' bad' : ''}">${escapeHtml(step.kind)}</span><strong>${escapeHtml(step.title)}</strong><span class="td-meta">${step.meta}</span></div>${step.action && !step.done ? `<div class="td-step-act">${step.action}</div>` : ''}${warmBox}</li>`;
  }).join('');
  const segs = steps.map((step, n) => `<i class="${step.done ? 'done' : n === active ? 'now' : ''}"></i>`).join('');
  const dayDots = (() => { const set = new Set((data.days || []).map(t => tdDayKey(new Date(t * 1000)))), cur = new Date(); cur.setDate(cur.getDate() - 6); let html = ''; for (let n = 0; n < 7; n++) { const today = n === 6, on = set.has(tdDayKey(cur)); html += `<span class="td-dot${on ? ' on' : ''}${today && !on ? ' today' : ''}"><i></i>${escapeHtml(cur.toLocaleDateString('ru-RU', { weekday: 'short' }))}</span>`; cur.setDate(cur.getDate() + 1); } return html; })();
  const trainedToday = (data.days || []).some(t => tdDayKey(new Date(t * 1000)) === tdDayKey(new Date()));
  const more = data.newAssignments.items.slice(data.resume ? 0 : 1);
  const ruleId = weak?.id || PRACTICE_TENSES[Math.floor(Date.now() / 864e5) % 12].id, ruleLabel = PRACTICE_TENSES.find(t => t.id === ruleId)?.label || ruleId;
  return `<section class="td2-head"><div><p class="td-eyebrow td-plain">${escapeHtml(date)}</p><h2>Привет${name}!</h2></div><div class="td2-chips"><span>${streak} ${days(streak)} подряд</span><span>${accuracy === null ? 'Неделя без оценок' : accuracy + '% верно за неделю'}</span></div></section>
  <div class="td2-grid"><section class="today-section td-plan" aria-labelledby="td-plan-title"><div class="td-plan-head"><h2 id="td-plan-title">План на сегодня</h2><span>${doneCount} из ${steps.length}${minutes ? ` · около ${minutes} минут` : ' · всё сделано'}</span></div><div class="td-segs" aria-hidden="true">${segs}</div><ol class="td-steps">${stepHtml}</ol>${!data.freePracticeAllowed ? '<p class="subtle">Свободную тренировку включает учитель. Правила доступны всегда.</p>' : ''}</section>
  <aside class="td2-side"><section class="today-section td-week2"><h2>Неделя</h2><div class="td-dots">${dayDots}</div><p>${trainedToday ? `Сегодня уже есть тренировка. Серия: <strong>${streak} ${days(streak)}</strong>.` : `Сделайте тренировку сегодня, и серия станет <strong>${streak + 1} ${days(streak + 1)}</strong>.`}</p>
    <div class="today-stats"><div><strong data-today-stat="week-sessions">${Number(data.week.sessions)}</strong><span>тренировок</span></div><div><strong data-today-stat="week-checked">${Number(data.week.maxScore)}</strong><span>полей</span></div><div><strong>${accuracy === null ? '—' : accuracy + '%'}</strong><span>точность</span></div></div>${data.week.pending ? `<p class="subtle">Без автоматической оценки: ${Number(data.week.pending)}.</p>` : ''}<p class="subtle">За всё время: <span data-today-stat="all-checked">${Number(data.stats.maxScore)}</span> полей, <span data-today-stat="all-score">${Number(data.stats.score)}</span> верно. <a href="#results">Все результаты</a></p></section>
    ${more.length ? `<section class="today-section"><h2>Ещё от учителя</h2>${more.map(a => `<a class="work-card" href="${escapeHtml('#work/' + encodeURIComponent(a.practiceId))}"><span class="work-card-main"><strong>${escapeHtml(a.title)}</strong><span class="work-card-meta">Заданий: ${Number(a.total)}</span></span><span class="work-card-arrow">Открыть</span></a>`).join('')}${data.newAssignments.total > data.newAssignments.items.length ? `<p class="subtle">Всего новых: ${Number(data.newAssignments.total)}.</p>` : ''}</section>` : ''}
    <section class="today-section td-rule"><span class="td-kind">Правило дня</span><strong>${escapeHtml(ruleLabel)}</strong>${TD_FORMS[ruleId] ? `<span class="td-formula">${escapeHtml(TD_FORMS[ruleId])}</span>` : ''}<a href="${escapeHtml(todayRuleLink(ruleId))}">Открыть правило</a></section></aside></div>`;
}
function todayTeacherMarkup(data) {
  const date = new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
  const name = account.user?.name ? ', ' + escapeHtml(account.user.name) : '';
  const hour = new Date().getHours(), hello = hour < 12 ? 'Доброе утро' : hour < 18 ? 'Добрый день' : 'Добрый вечер';
  const plural = (n, one, few, many) => n % 10 === 1 && n % 100 !== 11 ? one : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? few : many;
  const fmt = time => escapeHtml(new Date(time * 1000).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }));
  const reviews = data.reviews || { total: 0, totalFields: 0 }, fields = Number(reviews.totalFields || 0), works = Number(reviews.total || 0);
  const completed = data.completed, inactive = data.inactiveStudents, stale = data.staleAssignments;
  const peopleMap = new Map();
  inactive.items.forEach(u => peopleMap.set(u.id, { id: u.id, name: u.name, inactive: true, lastActive: u.lastActive, stale: [] }));
  stale.items.forEach(a => { if (!peopleMap.has(a.studentId)) peopleMap.set(a.studentId, { id: a.studentId, name: a.studentName, inactive: false, stale: [] }); peopleMap.get(a.studentId).stale.push(a); });
  const people = [...peopleMap.values()], attention = people.length;
  const row = (href, title, meta, chip, attrs = '') => `<a class="tt-row" ${attrs} href="${escapeHtml(href)}"><span class="tt-row-main"><strong>${escapeHtml(title)}</strong><span>${meta}</span></span>${chip}</a>`;
  const tone = p => p >= 85 ? 'ok' : p >= 65 ? 'warn' : 'bad';
  const steps = [
    fields ? { cls: 'review-queue-entry', kind: 'Проверка', title: `Проверить ${fields} ${plural(fields, 'перевод', 'перевода', 'переводов')}`, meta: `В ${works} ${plural(works, 'работе', 'работах', 'работах')} ждут вашей оценки`, action: '<a class="td-go" href="#review-queue">Открыть очередь</a>' }
      : { cls: 'review-queue-entry', done: true, kind: 'Проверка', title: 'Очередь проверки пуста', meta: '<a href="#review-queue">Открыть очередь проверки</a>' },
    completed.total ? { kind: 'Новые работы', title: `${completed.total} ${plural(completed.total, 'работа выполнена', 'работы выполнены', 'работ выполнено')}`, meta: 'Откройте отчёт, чтобы отметить работу просмотренной',
      body: completed.items.map(a => { const p = a.maxScore ? Math.round(a.score / a.maxScore * 100) : null; return row('#report/' + encodeURIComponent(a.studentId) + '/' + encodeURIComponent(a.practiceId), a.studentName, escapeHtml(a.title) + ' · ' + Number(a.score) + '/' + Number(a.maxScore), p === null ? '<span class="wc-score">отчёт</span>' : `<span class="wc-score ${tone(p)}">${p}%</span>`, `data-today-completed="${escapeHtml(a.id)}"`); }).join('') + (completed.total > completed.items.length ? `<p class="subtle">Показано ${completed.items.length} из ${completed.total}.</p>` : '') }
      : { done: true, kind: 'Новые работы', title: 'Новых выполненных работ нет', meta: 'Здесь появятся работы, которые ученики сдали после вашего последнего просмотра' },
    people.length ? { kind: 'Ученики', bad: true, title: `Стоит связаться: ${people.length} ${plural(people.length, 'ученик', 'ученика', 'учеников')}`, meta: 'Давно не заходили или не начали назначенные задания',
      body: people.map(p => `<div class="tt-row tt-person"><span class="tt-row-main"><a class="tt-name" href="${escapeHtml('#student/' + encodeURIComponent(p.id))}">${escapeHtml(p.name)}</a>${p.inactive ? `<span>${p.lastActive ? 'Не заходил с ' + fmt(p.lastActive) : 'Ещё не заходил в кабинет'}</span>` : ''}${p.stale.length ? `<span>Не начато: ${p.stale.map(a => `<a href="${escapeHtml('#student-work/' + encodeURIComponent(a.studentId) + '/' + encodeURIComponent(a.practiceId))}">${escapeHtml(a.title)}</a> (${fmt(a.created)})`).join(', ')}</span>` : ''}</span><span class="tt-chips">${p.inactive ? '<span class="wc-score bad">неактивен</span>' : ''}${p.stale.length ? `<span class="wc-score warn">не начато${p.stale.length > 1 ? ': ' + p.stale.length : ''}</span>` : ''}</span></div>`).join('')
        + (inactive.total + stale.total > inactive.items.length + stale.items.length ? '<p class="subtle"><a href="#students">Все ученики</a></p>' : '') }
      : { done: true, kind: 'Ученики', title: 'Все ученики в работе', meta: 'Никто не пропадал неделю, все задания начаты' }
  ];
  const active = steps.findIndex(step => !step.done), doneCount = steps.filter(step => step.done).length;
  const stepHtml = steps.map((step, n) => `<li class="td-step ${step.done ? 'done' : n === active ? 'now' : 'later'} ${step.cls || ''}"><span class="td-num" aria-hidden="true">${step.done ? '✓' : n + 1}</span><div class="td-step-main"><span class="td-kind${step.bad ? ' bad' : ''}">${escapeHtml(step.kind)}</span><strong>${escapeHtml(step.title)}</strong><span class="td-meta">${step.meta}</span></div>${step.action ? `<div class="td-step-act">${step.action}</div>` : ''}${step.body ? `<div class="tt-list">${step.body}</div>` : ''}</li>`).join('');
  const segs = steps.map((step, n) => `<i class="${step.done ? 'done' : n === active ? 'now' : ''}"></i>`).join('');
  const resume = data.resume ? `<section class="today-section td-week2"><h2>Моя тренировка</h2><p><strong>${escapeHtml(data.resume.title)}</strong></p><p class="subtle today-resume-progress">Выполнено: ${Number(data.resume.index)} из ${Number(data.resume.total)}</p><button class="td-go" type="button" data-resume="${escapeHtml(data.resume.id)}">Продолжить</button></section>` : '';
  return `<section class="td2-head"><div><p class="td-eyebrow td-plain">${escapeHtml(date)} · кабинет учителя</p><h2>${hello}${name}!</h2></div><div class="td2-chips"><span>На проверке: ${fields}</span><span>Новых работ: ${completed.total}</span><span>Стоит связаться: ${attention}</span></div></section>
  <div class="td2-grid"><section class="today-section td-plan" aria-labelledby="tt-title"><div class="td-plan-head"><h2 id="tt-title">Сегодня в классе</h2><span>${doneCount === steps.length ? 'всё разобрано' : `${doneCount} из ${steps.length} разобрано`}</span></div><div class="td-segs" aria-hidden="true">${segs}</div><ol class="td-steps">${stepHtml}</ol></section>
  <aside class="td2-side">${resume}<section class="today-section td-week2 tt-links"><h2>Быстрые действия</h2><a href="#students">Ученики и назначения</a><a href="#teacher-library">Библиотека наборов</a><a href="#task-issues">Сообщения о заданиях</a><a href="#grammar">Темы и правила</a></section></aside></div>`;
}
