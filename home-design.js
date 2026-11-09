"use strict";
/* Главная для гостей и страница «Грамматика»: карточки разделов и мини-демо карты времён. */
const SECTION_ORDER = ['tenses', 'passive', 'modals', 'reported', 'comparison', 'nouns', 'speaking'];
const SECTION_META = {
  tenses: { mono: 'T', hue: 'green', facts: ['12 времён', 'интерактивная карта', 'практика A1–C2'] },
  passive: { mono: 'P', hue: 'blue', facts: ['формы пассива', 'выбор фокуса', 'особые конструкции'] },
  modals: { mono: 'M', hue: 'violet', facts: ['31 подтема', 'мини-тексты'] },
  reported: { mono: 'R', hue: 'amber', facts: ['20 подтем', 'reporting verbs'] },
  comparison: { mono: 'C', hue: 'rose', facts: ['образование форм', 'равенство и разница'] },
  speaking: { mono: 'S', hue: 'indigo', facts: ['say · tell · speak · talk', 'мини-тексты'] },
  nouns: { mono: 'N', hue: 'teal', facts: ['число и артикли', 'мини-тексты'] },
};
function grammarSectionCardHtml(id, section, { practice = false, student = null, compact = false } = {}) {
  const meta = SECTION_META[id] || { mono: id[0].toUpperCase(), hue: 'green', facts: [] };
  const theory = practice ? '' : `<a class="button" href="#theory/${section.theory}">Теория${id === 'tenses' ? ' и карта времён' : ''} →</a>`;
  const target = student ? `#assign/${encodeURIComponent(student.id)}/${id}` : `#practice/${id}`;
  const tests = account.user?.role === 'teacher' && typeof ASSESSMENT_SECTIONS !== 'undefined' && ASSESSMENT_SECTIONS[id] ? `<a class="button" href="#tests/${id}">Проверочные тесты →</a>` : '';
  return `<article class="card grammar-section gs gs-${meta.hue}${compact ? ' gs-compact' : ''}" data-grammar-section="${id}">
    <div class="gs-top"><span class="gs-tile" aria-hidden="true">${meta.mono}</span><span class="eyebrow">${escapeHtml(section.subtitle)}</span></div>
    <h2>${escapeHtml(section.title)}</h2>
    <p>${escapeHtml(section.description)}</p>
    ${meta.facts.length ? `<ul class="gs-facts">${meta.facts.map(f => `<li>${escapeHtml(f)}</li>`).join('')}</ul>` : ''}
    <div class="comparison-shortcuts">${theory}<a class="button primary" href="${target}">${student ? 'Настроить задание' : 'Практика'} →</a>${tests}</div>
  </article>`;
}
function grammarSectionsHtml(sections, opts) {
  const order = new Map(SECTION_ORDER.map((id, i) => [id, i]));
  return [...sections].sort((a, b) => (order.get(a[0]) ?? 99) - (order.get(b[0]) ?? 99)).map(([id, section]) => grammarSectionCardHtml(id, section, opts)).join('');
}

/* Гостевая главная */
function guestHomeHtml() {
  const steps = [
    ['1', 'Теория', 'Короткие правила со схемами и примерами. Подробности открываются по нажатию.'],
    ['2', 'Практика', 'Упражнения по уровням A1–C2 с объяснением ошибок. Доступны после входа.'],
    ['3', 'Результаты', 'Статистика по темам показывает, что стоит повторить. Ученики выполняют назначения учителя.'],
  ];
  return `<div class="home-guest">
    <section class="hg-hero">
      <div class="hg-copy">
        <p class="eyebrow">Grammar NOEON · A1–C2</p>
        <h1>Английская грамматика — шаг за шагом</h1>
        <p class="hg-lead">Правила, понятные объяснения и практика, которая помогает замечать смысл за формой. Учебные примеры — British English.</p>
        <div class="today-actions"><a class="button primary library-link today-theory-link" href="#grammar">Открыть теорию</a><a class="button" href="#theory/foundations">Карта времён</a><a class="button" href="#profile">Войти</a></div>
        <p class="subtle">Практика доступна после входа. Ученики выполняют назначения; свободную тренировку разрешает учитель.</p>
      </div>
      <div class="hg-demo" id="home-demo" aria-label="Мини-карта времён">
        <p class="hg-demo-title"><b>Попробуйте</b><span>выберите время и взгляд на действие</span></p>
        <div class="hg-chips" role="group" aria-label="Когда"></div>
        <div class="hg-chips hg-aspects" role="group" aria-label="Как смотрим"></div>
        <div class="hg-card" aria-live="polite"></div>
      </div>
    </section>
    <section class="hg-sections" aria-labelledby="hg-sections-title">
      <h2 id="hg-sections-title">Разделы грамматики</h2>
      <div class="grammar-sections hg-grid">${grammarSectionsHtml(Object.entries(GRAMMAR_SECTIONS), { compact: true })}</div>
    </section>
    <section class="hg-steps" aria-labelledby="hg-steps-title">
      <h2 id="hg-steps-title">Как это работает</h2>
      <ol>${steps.map(([n, t, d]) => `<li><span class="hg-n">${n}</span><div><strong>${t}</strong><p>${d}</p></div></li>`).join('')}</ol>
    </section>
  </div>`;
}
function initialiseHomeDemo() {
  const root = document.querySelector('#home-demo'); if (!root || typeof TENSE_MAP === 'undefined' || typeof tenseTimelineSvg !== 'function') return;
  const timeBox = root.querySelectorAll('.hg-chips')[0], aspBox = root.querySelector('.hg-aspects'), card = root.querySelector('.hg-card');
  const times = TENSE_MAP.map(r => r.time);
  const state = { time: 'Present', aspect: 0 };
  timeBox.innerHTML = times.map(t => `<button type="button" class="tm-chip" data-t="${t}" aria-pressed="false">${t}</button>`).join('');
  aspBox.innerHTML = TENSE_ASPECTS.map((a, i) => `<button type="button" class="tm-chip" data-a="${i}" aria-pressed="false" title="${a.look}">${a.label}</button>`).join('');
  const draw = () => {
    const row = TENSE_MAP.find(r => r.time === state.time), item = row.items[state.aspect], asp = TENSE_ASPECTS[state.aspect];
    timeBox.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.t === state.time)));
    aspBox.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.a) === state.aspect)));
    card.innerHTML = `<div class="hg-card-top"><strong>${escapeHtml(item.name)}</strong><code>${escapeHtml(item.formula)}</code></div>${tenseTimelineSvg(row.time, asp.key)}<p class="hg-look">${escapeHtml(asp.look)}</p><p class="hg-ex" lang="en">${escapeHtml(item.examples[0])}</p><a class="hg-more" href="#theory/${row.route}/${item.anchor}">Правило →</a>`;
  };
  root.addEventListener('click', e => {
    const t = e.target.closest('[data-t]'), a = e.target.closest('[data-a]');
    if (t) state.time = t.dataset.t; else if (a) state.aspect = Number(a.dataset.a); else return;
    draw();
  });
  draw();
}
