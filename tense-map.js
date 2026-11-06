"use strict";
/* Карта 12 времён: карточки, поиск по маркерам, фильтры, диаграммы и сравнение.
   Данные TENSE_MAP лежат в app.js; здесь — дополнения и отрисовка. */
const TENSE_ASPECTS = [
  { key: 'Simple', label: 'Simple', look: 'Факт или целое событие' },
  { key: 'Continuous', label: 'Continuous', look: 'Процесс в моменте' },
  { key: 'Perfect', label: 'Perfect', look: 'Результат и связь с моментом' },
  { key: 'Perfect Continuous', label: 'Perfect Continuous', look: 'Длительность до момента' },
];
const TENSE_TIME_LABEL = { Present: 'настоящее', Past: 'прошлое', Future: 'будущее' };
/* Формы и дополнительные примеры. Ключ — name из TENSE_MAP. vs — с чем чаще всего путают. */
const TENSE_EXTRA = {
  'Present Simple': { aff: 'I work · she works', neg: 'I don’t work · she doesn’t work', q: 'Do you work? · Does she work?', ru: ['Я работаю из дома каждую пятницу.', 'Вода кипит при 100 °C.', 'Поезд отправляется завтра в 6:40.'], more: ['Water boils at 100°C.'], vs: ['Present Continuous', 'Simple — привычка и факт, Continuous — то, что идёт сейчас или временно: I work in a bank (постоянно) / I’m working in a bank this month (временно).'] },
  'Present Continuous': { aff: 'I am working · she is working', neg: 'I’m not working · she isn’t working', q: 'Are you working? · Is she working?', ru: ['Я работаю из дома на этой неделе.', 'Смотри! Идёт дождь.', 'Мы встречаемся с дизайнером в три.'], more: ['Look! It’s raining.'], vs: ['Present Simple', 'Continuous показывает процесс вокруг момента речи. Для регулярности нужен Simple: She works on Fridays.'] },
  'Present Perfect': { aff: 'I have finished · she has finished', neg: 'I haven’t finished · she hasn’t finished', q: 'Have you finished? · Has she finished?', ru: ['Я закончил отчёт (он готов).', 'Вы когда-нибудь были в Риме?', 'Она знает Еву с 2019 года.'], more: ['Have you ever been to Rome?'], vs: ['Past Simple', 'Present Perfect связывает прошлое с настоящим и не называет время: I have lost my key. Past Simple называет завершённое время: I lost my key yesterday.'] },
  'Present Perfect Continuous': { aff: 'I have been working · she has been working', neg: 'I haven’t been working', q: 'Have you been working?', ru: ['Я работаю уже два часа.', 'Шёл дождь, дорога мокрая.', 'Как давно вы учите английский?'], more: ['How long have you been learning English?'], vs: ['Present Perfect', 'Continuous подчёркивает саму деятельность и её длительность, Perfect Simple — результат или количество: I’ve been writing (процесс) / I’ve written three pages (итог).'] },
  'Past Simple': { aff: 'I worked · she went', neg: 'I didn’t work · she didn’t go', q: 'Did you work? · Did she go?', ru: ['Я работал вчера.', 'Она открыла дверь и вошла.', 'Мы жили в Риме в 2019 году.'], more: ['We lived in Rome in 2019.'], vs: ['Present Perfect', 'Past Simple — завершённое время (yesterday, in 2019). Если время не названо и важна связь с настоящим, нужен Present Perfect.'] },
  'Past Continuous': { aff: 'I was working · they were working', neg: 'I wasn’t working · they weren’t working', q: 'Were you working? · Was she working?', ru: ['В шесть я работал.', 'Она готовила, когда я позвонил.', 'Пока он читал, я писал.'], more: ['While he was reading, I was writing.'], vs: ['Past Simple', 'Continuous — фон, процесс; Simple — событие на этом фоне: She was cooking (фон) when I called (событие).'] },
  'Past Perfect': { aff: 'I had finished · she had left', neg: 'I hadn’t finished', q: 'Had you finished?', ru: ['Я закончил до шести.', 'Поезд уже ушёл, когда мы приехали.', 'Она устала, потому что не спала.'], more: ['She was tired because she hadn’t slept.'], vs: ['Past Simple', 'Past Perfect нужен, когда важно показать, что одно прошлое событие было раньше другого. Если порядок ясен из рассказа, часто хватает Past Simple.'] },
  'Past Perfect Continuous': { aff: 'I had been working · she had been waiting', neg: 'I hadn’t been working', q: 'Had you been working?', ru: ['К тому моменту я уже два часа работал.', 'Дорога была мокрой: шёл дождь.', 'Он запыхался: он бежал.'], more: ['He was out of breath; he had been running.'], vs: ['Past Perfect', 'Continuous — длительность или причина состояния; Perfect Simple — результат или завершённость: I had been painting (руки в краске) / I had painted the room (комната готова).'] },
  'Future Simple': { aff: 'I will work · she will work', neg: 'I won’t work', q: 'Will you work?', ru: ['Думаю, будет дождь.', 'Я помогу тебе с этим.', 'Я позвоню тебе позже.'], more: ['I’ll call you later.'], vs: ['Present Continuous', 'Заранее принятый план обычно выражают Present Continuous или be going to: We are meeting at three. Will — решение в момент речи, прогноз, обещание.'] },
  'Future Continuous': { aff: 'I will be working · she will be working', neg: 'I won’t be working', q: 'Will you be working?', ru: ['В шесть я буду работать.', 'Вы будете пользоваться машиной вечером?', 'Завтра в это время мы будем лететь в Рим.'], more: ['This time tomorrow we’ll be flying to Rome.'], vs: ['Future Simple', 'Future Continuous — процесс в точке будущего: I’ll be working at six. Future Simple — решение или факт: I’ll work on Saturday.'] },
  'Future Perfect': { aff: 'I will have finished · she will have left', neg: 'I won’t have finished', q: 'Will you have finished?', ru: ['К шести я закончу.', 'К июню она проживёт здесь десять лет.', 'Они приедут к полудню?'], more: ['Will they have arrived by noon?'], vs: ['Future Simple', 'Future Perfect — к определённому сроку действие уже завершится: by six, by June. Future Simple просто сообщает о будущем действии.'] },
  'Future Perfect Continuous': { aff: 'I will have been working · she will have been driving', neg: 'I won’t have been working', q: 'Will you have been working?', ru: ['К этому моменту я буду работать уже два часа.', 'К полудню она будет за рулём всё утро.', 'В мае мы будем жить здесь уже год.'], more: ['In May we will have been living here for a year.'], vs: ['Future Perfect', 'Continuous подчёркивает длительность к сроку, Perfect Simple — результат или количество. Форма редкая: часто хватает Future Perfect.'] },
};

/* Примеры строго по пунктам «Когда используем» (порядок = порядок uses в TENSE_MAP). */
const TENSE_EX = {
  'Present Simple': { ex: ['I work from home every Friday.', 'Water boils at 100°C.', 'The train leaves at 6:40 tomorrow.'], ru: ['Я работаю из дома каждую пятницу.', 'Вода кипит при 100 °C.', 'Поезд отправляется завтра в 6:40.'], more: [] },
  'Present Continuous': { ex: ['Look! It’s raining.', 'I am working from home this week.', 'We are meeting the designer at three.'], ru: ['Смотри! Идёт дождь.', 'Я работаю из дома на этой неделе.', 'Мы встречаемся с дизайнером в три.'], more: [] },
  'Present Perfect': { ex: ['I have finished the report.', 'Have you ever been to Rome?', 'She has known Eva since 2019.'], ru: ['Я закончил отчёт (он готов).', 'Вы когда-нибудь были в Риме?', 'Она знает Еву с 2019 года.'], more: [] },
  'Present Perfect Continuous': { ex: ['I have been working for two hours.', 'He has been going to the gym a lot lately.', 'It has been raining; the road is wet.'], ru: ['Я работаю уже два часа.', 'Он в последнее время много ходит в спортзал.', 'Шёл дождь, дорога мокрая.'], more: ['How long have you been learning English?'] },
  'Past Simple': { ex: ['I worked yesterday.', 'She opened the door and walked in.', 'We lived in Rome in 2019.'], ru: ['Вчера я работал.', 'Она открыла дверь и вошла.', 'Мы жили в Риме в 2019 году.'], more: [] },
  'Past Continuous': { ex: ['I was working at six.', 'She was cooking when I called.', 'While he was reading, I was writing.'], ru: ['В шесть я работал.', 'Она готовила, когда я позвонил.', 'Пока он читал, я писал.'], more: [] },
  'Past Perfect': { ex: ['The train had left when we arrived.', 'I had finished before six.', 'She was tired because she hadn’t slept.'], ru: ['Поезд уже ушёл, когда мы приехали.', 'Я закончил до шести.', 'Она устала, потому что не спала.'], more: [] },
  'Past Perfect Continuous': { ex: ['I had been working for two hours.', 'He had been trying to call her all week.', 'The road was wet because it had been raining.'], ru: ['К тому моменту я уже два часа работал.', 'Он всю неделю пытался ей дозвониться.', 'Дорога была мокрой: шёл дождь.'], more: ['He was out of breath; he had been running.'] },
  'Future Simple': { ex: ['I think it will rain.', 'The phone is ringing. I’ll get it.', 'I will help you with that.'], ru: ['Думаю, будет дождь.', 'Звонит телефон. Я подойду.', 'Я помогу тебе с этим.'], more: [] },
  'Future Continuous': { ex: ['I will be working at six.', 'We’ll be landing in ten minutes.', 'Will you be using the car tonight?'], ru: ['В шесть я буду работать.', 'Мы приземлимся через десять минут.', 'Вы будете пользоваться машиной вечером?'], more: ['This time tomorrow we’ll be flying to Rome.'] },
  'Future Perfect': { ex: ['I will have finished by six.', 'By Friday she will have written ten pages.', 'By June, she will have lived here for ten years.'], ru: ['К шести я закончу.', 'К пятнице она напишет десять страниц.', 'К июню она проживёт здесь десять лет.'], more: ['Will they have arrived by noon?'] },
  'Future Perfect Continuous': { ex: ['I will have been working for two hours.', 'In May we will have been living here for a year.', 'By noon, she will have been driving all morning.'], ru: ['К этому моменту я буду работать уже два часа.', 'В мае мы будем жить здесь уже год.', 'К полудню она будет за рулём всё утро.'], more: [] },
};
for (const [name, extra] of Object.entries(TENSE_EX)) Object.assign(TENSE_EXTRA[name], extra);
const tmKey = name => name.toLowerCase().replaceAll(' ', '_');
const tmNorm = value => String(value || '').toLowerCase().replace(/ё/g, 'е');

/* Временна́я диаграмма. big=true — с подписями. */
function tenseTimelineSvg(time, aspect, big = false) {
  const W = big ? 440 : 220, H = big ? 104 : 56, k = W / 220, y = big ? 58 : 32;
  const NOW = 110 * k, R = (time === 'Present' ? 110 : time === 'Past' ? 80 : 158) * k;
  const bar = (a, b, arrow) => `<rect x="${a}" y="${y - 6 * k}" width="${b - a}" height="${12 * k}" rx="${6 * k}" class="tl-ev"/>${arrow ? `<path d="M${b - 1} ${y - 7 * k} l${7 * k} ${7 * k} l-${7 * k} ${7 * k}z" class="tl-ev tl-fill"/>` : ''}`;
  let shape = '', ref = '';
  const refMark = `<path d="M${R} ${y - 20 * k} v${40 * k}" class="tl-ref"/><path d="M${R} ${y - 22 * k} l${5 * k} ${5 * k} l-${5 * k} ${5 * k} l-${5 * k} -${5 * k}z" class="tl-refdot"/>`;
  if (aspect === 'Simple') shape = `<circle cx="${R}" cy="${y}" r="${6 * k}" class="tl-ev tl-fill"/>`;
  if (aspect === 'Continuous') { shape = bar(R - 30 * k, R + 30 * k, false); ref = refMark; }
  if (aspect === 'Perfect') { shape = `<circle cx="${R - 46 * k}" cy="${y}" r="${6 * k}" class="tl-ev tl-fill"/><path d="M${R - 38 * k} ${y} H${R - 8 * k}" class="tl-arrow"/>`; ref = refMark; }
  if (aspect === 'Perfect Continuous') { shape = bar(R - 64 * k, R - 6 * k, true); ref = refMark; }
  const labels = big ? `<text x="${14}" y="${H - 8}" class="tl-t">прошлое</text><text x="${W - 14}" y="${H - 8}" text-anchor="end" class="tl-t">будущее</text>${ref ? `<text x="${R}" y="${y - 26 * k}" text-anchor="${R > W - 60 ? 'end' : R < 60 ? 'start' : 'middle'}" class="tl-t tl-tr">${time === 'Present' ? 'сейчас = точка отсчёта' : 'точка отсчёта'}</text>` : ''}` : '';
  const nowLabel = `<text x="${NOW}" y="${y + (big ? 36 : 22)}" text-anchor="middle" class="tl-t">сейчас</text>`;
  return `<svg class="tl" viewBox="0 0 ${W} ${H}" role="img" aria-label="Диаграмма на оси времени" focusable="false"><path d="M8 ${y} H${W - 14}" class="tl-axis"/><path d="M${W - 14} ${y - 5} l9 5 l-9 5" class="tl-axis tl-nofill"/><path d="M${NOW} ${y - 7 * k} v${14 * k}" class="tl-now"/>${ref}${shape}${nowLabel}${labels}</svg>`;
}

function tenseMapHtml() {
  const aspectChip = a => `<button type="button" class="tm-chip" data-tm-aspect="${a.key}" aria-pressed="false" title="${a.look}">${a.label}</button>`;
  const timeChip = r => `<button type="button" class="tm-chip" data-tm-time="${r.time}" aria-pressed="false">${r.time}<small>${TENSE_TIME_LABEL[r.time]}</small></button>`;
  const rows = TENSE_MAP.map(row => `<section class="tm-row" data-tm-row="${row.time}" aria-labelledby="tm-row-${row.time}">
      <h3 class="tm-row-head" id="tm-row-${row.time}"><span>${row.time}</span><small>${TENSE_TIME_LABEL[row.time]}</small></h3>
      <div class="tm-cards">${row.items.map((item, i) => {
        const asp = TENSE_ASPECTS[i];
        return `<button class="tm-card tm-${row.time.toLowerCase()}" type="button" data-tense="${escapeHtml(item.name)}" data-tm-time="${row.time}" data-tm-aspect="${asp.key}">
          <span class="tm-card-top"><span class="tm-aspect">${asp.label}</span><code>${escapeHtml(item.formula)}</code></span>
          <strong>${escapeHtml(item.name)}</strong>
          <span class="tm-focus">${escapeHtml(item.focus)}</span>
          ${tenseTimelineSvg(row.time, asp.key)}
          <em lang="en">${escapeHtml(item.examples[0])}</em>
        </button>`;
      }).join('')}</div></section>`).join('');
  return `<section class="tense-map tm" id="tenses-map" aria-labelledby="tense-map-title">
    <header class="tm-head">
      <div><span class="eyebrow">Наглядная схема</span><h2 id="tense-map-title">Карта 12 времён</h2></div>
      <p>Строки — когда происходит действие, столбцы — как мы на него смотрим. Нажмите на карточку, чтобы увидеть формы, диаграмму, примеры и сравнение с похожим временем.</p>
    </header>
    <div class="tm-bar" role="group" aria-label="Фильтры карты">
      <label class="tm-search"><span class="tm-sr">Найти время по слову-маркеру</span><input type="search" class="tm-q" placeholder="Слово-маркер: yesterday, already, for, by…" autocomplete="off" spellcheck="false"></label>
      <div class="tm-filters">
        <div class="tm-group" aria-label="Когда"><span class="tm-label">Когда</span>${TENSE_MAP.map(timeChip).join('')}</div>
        <div class="tm-group" aria-label="Как смотрим"><span class="tm-label">Как смотрим</span>${TENSE_ASPECTS.map(aspectChip).join('')}</div>
        <button type="button" class="tm-reset" hidden>Сбросить</button>
      </div>
      <p class="tm-status" aria-live="polite"></p>
    </div>
    <div class="tm-aspects" aria-hidden="true">${TENSE_ASPECTS.map(a => `<div><b>${a.label}</b><span>${a.look}</span></div>`).join('')}</div>
    <div class="tm-grid">${rows}</div>
    <div class="tm-backdrop" hidden></div>
    <aside class="tm-sheet" role="dialog" aria-modal="true" aria-label="Подробности времени" hidden tabindex="-1"></aside>
  </section>`;
}

function tenseSheetHtml(row, item, mode = 'card') {
  const extra = TENSE_EXTRA[item.name] || {}, asp = TENSE_ASPECTS[row.items.indexOf(item)];
  const all = TENSE_MAP.flatMap(r => r.items.map(i => ({ r, i })));
  const idx = all.findIndex(x => x.i === item);
  const nav = `<div class="tm-sheet-nav"><button type="button" class="tm-nav-btn" data-tm-step="-1" aria-label="Предыдущее время">←</button><span>${idx + 1} из 12</span><button type="button" class="tm-nav-btn" data-tm-step="1" aria-label="Следующее время">→</button><button type="button" class="tm-close" aria-label="Закрыть">×</button></div>`;
  if (mode === 'compare' && extra.vs) {
    const other = all.find(x => x.i.name === extra.vs[0]);
    if (other) {
      const cols = [{ r: row, i: item }, other];
      return `${nav}<span class="eyebrow">Сравнение</span><h3>${escapeHtml(item.name)} или ${escapeHtml(other.i.name)}?</h3>
        <p class="tm-vs-note">${escapeHtml(extra.vs[1])}</p>
        <div class="tm-compare">${cols.map(c => `<div class="tm-col"><h4>${escapeHtml(c.i.name)}</h4><code>${escapeHtml(c.i.formula)}</code>
          ${tenseTimelineSvg(c.r.time, TENSE_ASPECTS[c.r.items.indexOf(c.i)].key)}
          <h5>Смысл</h5><p>${escapeHtml(c.i.focus)}</p>
          <h5>Используем</h5><ul>${c.i.uses.map(u => `<li>${escapeHtml(u)}</li>`).join('')}</ul>
          <h5>Маркеры</h5><p class="tm-markers">${c.i.markers.map(m => `<span>${escapeHtml(m)}</span>`).join('')}</p>
          <h5>Пример</h5><p class="tm-ex" lang="en">${escapeHtml(c.i.examples[0])}</p></div>`).join('')}</div>
        <div class="tm-actions"><button type="button" class="button" data-tm-back>← К карточке</button></div>`;
    }
  }
  const forms = [['Утверждение', extra.aff], ['Отрицание', extra.neg], ['Вопрос', extra.q]].filter(f => f[1]);
  return `${nav}<span class="eyebrow">${escapeHtml(row.time)} · ${escapeHtml(asp.label)}</span>
    <h3>${escapeHtml(item.name)}</h3>
    <code class="tm-formula">${escapeHtml(item.formula)}</code>
    <p class="tm-lead">${escapeHtml(item.focus)}</p>
    <div class="tm-diagram">${tenseTimelineSvg(row.time, asp.key, true)}</div>
    ${forms.length ? `<div class="tm-forms" role="tablist" aria-label="Формы">${forms.map((f, n) => `<button type="button" role="tab" class="tm-form-tab" data-tm-form="${n}" aria-selected="${n === 0}">${f[0]}</button>`).join('')}</div>
      ${forms.map((f, n) => `<p class="tm-form" role="tabpanel" data-tm-form-panel="${n}" lang="en" ${n ? 'hidden' : ''}>${escapeHtml(f[1])}</p>`).join('')}` : ''}
    <h4>Когда используем</h4>
    <ul class="tm-uses">${item.uses.map((u, n) => `<li><span>${escapeHtml(u)}</span>${extra.ru && extra.ru[n] ? `<small>${escapeHtml(extra.ru[n])}</small>` : ''}${(extra.ex || item.examples)[n] ? `<em lang="en">${escapeHtml((extra.ex || item.examples)[n])}</em>` : ''}</li>`).join('')}</ul>
    ${extra.more && extra.more.length ? `<h4>Ещё пример</h4>${extra.more.map(m => `<p class="tm-ex" lang="en">${escapeHtml(m)}</p>`).join('')}` : ''}
    <h4>Слова-маркеры</h4>
    <p class="tm-markers">${item.markers.map(m => `<span>${escapeHtml(m)}</span>`).join('')}</p>
    <p class="tm-trap"><strong>Обратите внимание.</strong> ${escapeHtml(item.trap)}</p>
    <div class="tm-actions">
      ${extra.vs ? `<button type="button" class="button" data-tm-compare>Сравнить с ${escapeHtml(extra.vs[0])}</button>` : ''}
      <a class="button" href="#theory/${row.route}/${item.anchor}" data-tm-link>Полное правило →</a>
      <a class="button primary" href="#practice/tenses" data-tm-link>Практика →</a>
    </div>`;
}

function initialiseTenseMap() {
  if (typeof disposeAssessment !== 'undefined') { disposeAssessment?.(); disposeAssessment = null; }
  disposeTenseMap?.();
  const roots = [...document.querySelectorAll('#tenses-map')], root = roots[roots.length - 1];
  if (!root) return;
  const all = TENSE_MAP.flatMap(row => row.items.map(item => ({ row, item })));
  const cards = [...root.querySelectorAll('.tm-card')];
  const sheet = root.querySelector('.tm-sheet'), backdrop = root.querySelector('.tm-backdrop');
  const status = root.querySelector('.tm-status'), reset = root.querySelector('.tm-reset'), input = root.querySelector('.tm-q');
  const controller = new AbortController(), signal = controller.signal;
  const state = { time: null, aspect: null, q: '', open: -1, mode: 'card' };
  let opener = null;
  const hay = all.map(({ item }) => tmNorm([item.name, item.formula, item.focus, ...item.uses, ...item.markers, ...item.examples].join(' ')));
  const matches = index => {
    const { row } = all[index], asp = TENSE_ASPECTS[all[index].row.items.indexOf(all[index].item)].key;
    if (state.time && row.time !== state.time) return false;
    if (state.aspect && asp !== state.aspect) return false;
    if (state.q && !tmNorm(state.q).split(/\s+/).filter(Boolean).every(t => hay[index].includes(t))) return false;
    return true;
  };
  const update = () => {
    let shown = 0, firstHit = -1;
    cards.forEach((card, i) => { const ok = matches(i); card.classList.toggle('is-dim', !ok); card.setAttribute('aria-disabled', ok ? 'false' : 'true'); if (ok) { shown++; if (firstHit < 0) firstHit = i; } });
    root.querySelectorAll('.tm-row').forEach(row => row.classList.toggle('is-empty', ![...row.querySelectorAll('.tm-card')].some(c => !c.classList.contains('is-dim'))));
    root.querySelectorAll('[data-tm-time].tm-chip').forEach(b => b.setAttribute('aria-pressed', String(state.time === b.dataset.tmTime)));
    root.querySelectorAll('[data-tm-aspect].tm-chip').forEach(b => b.setAttribute('aria-pressed', String(state.aspect === b.dataset.tmAspect)));
    const active = state.time || state.aspect || state.q;
    reset.hidden = !active;
    status.textContent = !active ? '' : shown ? `Подходит: ${shown} из 12${state.q ? ` · «${state.q}»` : ''}` : 'Ничего не найдено. Попробуйте другое слово.';
    status.classList.toggle('is-empty', Boolean(active) && !shown);
    return { shown, firstHit };
  };
  const draw = (mode = 'card') => {
    const { row, item } = all[state.open]; state.mode = mode;
    sheet.innerHTML = tenseSheetHtml(row, item, mode); sheet.scrollTop = 0;
  };
  const open = (index, from) => {
    state.open = index; if (from) opener = from;
    draw('card'); sheet.hidden = false; backdrop.hidden = false; root.classList.add('has-sheet');
    cards.forEach((c, i) => c.classList.toggle('is-active', i === index));
    requestAnimationFrame(() => sheet.classList.add('is-in'));
    sheet.focus({ preventScroll: true });
  };
  const close = () => {
    if (sheet.hidden) return;
    sheet.classList.remove('is-in'); sheet.hidden = true; backdrop.hidden = true; root.classList.remove('has-sheet');
    cards.forEach(c => c.classList.remove('is-active')); state.open = -1;
    (opener && document.contains(opener) ? opener : cards[0])?.focus({ preventScroll: true });
  };
  root.addEventListener('click', event => {
    const t = event.target;
    const card = t.closest('.tm-card'); if (card) { if (card.classList.contains('is-dim')) return; open(cards.indexOf(card), card); return; }
    const time = t.closest('.tm-chip[data-tm-time]'); if (time) { state.time = state.time === time.dataset.tmTime ? null : time.dataset.tmTime; autoOpen(); return; }
    const aspect = t.closest('.tm-chip[data-tm-aspect]'); if (aspect) { state.aspect = state.aspect === aspect.dataset.tmAspect ? null : aspect.dataset.tmAspect; autoOpen(); return; }
    if (t.closest('.tm-reset')) { state.time = state.aspect = null; state.q = ''; input.value = ''; update(); return; }
    if (t.closest('.tm-close') || t.closest('.tm-backdrop')) { close(); return; }
    const step = t.closest('[data-tm-step]'); if (step) { state.open = (state.open + Number(step.dataset.tmStep) + 12) % 12; draw('card'); cards.forEach((c, i) => c.classList.toggle('is-active', i === state.open)); cards[state.open].scrollIntoView({ block: 'nearest', behavior: 'smooth' }); return; }
    if (t.closest('[data-tm-compare]')) { draw('compare'); return; }
    if (t.closest('[data-tm-back]')) { draw('card'); return; }
    const tab = t.closest('[data-tm-form]'); if (tab) { sheet.querySelectorAll('.tm-form-tab').forEach(b => b.setAttribute('aria-selected', String(b === tab))); sheet.querySelectorAll('[data-tm-form-panel]').forEach(p => { p.hidden = p.dataset.tmFormPanel !== tab.dataset.tmForm; }); return; }
    const marker = t.closest('.tm-markers span'); if (marker && !sheet.hidden) { state.q = marker.textContent.trim(); input.value = state.q; update(); }
  }, { signal });
  const autoOpen = () => { const { shown, firstHit } = update(); if (state.time && state.aspect && shown === 1 && firstHit >= 0) open(firstHit, cards[firstHit]); };
  input.addEventListener('input', () => { state.q = input.value.trim(); update(); }, { signal });
  input.addEventListener('keydown', event => { if (event.key === 'Enter') { const { shown, firstHit } = update(); if (shown === 1) open(firstHit, cards[firstHit]); } }, { signal });
  document.addEventListener('keydown', event => {
    if (sheet.hidden || !root.isConnected) return;
    if (event.key === 'Escape') { event.stopPropagation(); close(); }
    if (event.key === 'ArrowRight' && !event.target.closest('input')) { sheet.querySelector('[data-tm-step="1"]')?.click(); }
    if (event.key === 'ArrowLeft' && !event.target.closest('input')) { sheet.querySelector('[data-tm-step="-1"]')?.click(); }
    if (event.key === 'Tab') {
      const f = [...sheet.querySelectorAll('button,a[href]')].filter(n => !n.disabled && n.offsetParent !== null);
      if (!f.length) return; const first = f[0], last = f[f.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === sheet)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  }, { signal, capture: true });
  window.addEventListener('hashchange', () => { if (!sheet.hidden) close(); }, { signal });
  disposeTenseMap = () => { controller.abort(); disposeTenseMap = null; };
  update();
}
