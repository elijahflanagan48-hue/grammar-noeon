"use strict";

const TYPE_LABELS = {
  modal_gap: "Вставить форму",
  modal_fix: "Исправить ошибку",
  modal_meaning: "Выбрать значение",
  open_brackets: "Раскрыть скобки",
  translation_ru_en: "Перевод с русского",
  multiple_choice: "Выбор формы",
  meaning_choice: "Выбор значения",
  discourse_choice: "Связность текста",
  error_correction: "Исправление ошибки",
  transformation: "Трансформация",
  direct_to_reported: "Direct → Reported",
  active_to_passive: "Active → Passive",
  passive_to_active: "Passive → Active",
  word_order: "Собрать цепочку",
  context_cloze: "Контекстный текст",
};

const THEORY_ROUTE_BY_FILE = {
  "06-comparison.md": "comparison",
  "07-passive.md": "passive",
  "08-reported.md": "reported",
  "08-modals.html": "modals",
  "01-foundations.md": "foundations",
  "02-present.md": "present",
  "03-past.md": "past",
  "04-future.md": "future",
  "05-contrasts-and-pitfalls.md": "contrasts",
};

const LEVEL_LABELS = { basic: "Базовый", medium: "Средний", advanced: "Продвинутый" };
function levelLabel(value) { return LEVEL_LABELS[value] || "Архивное задание"; }

const TENSE_MAP = [
  { time: "Present", route: "present", items: [
    { name: "Present Simple", formula: "V1 / V-s", focus: "факт, привычка или состояние", uses: ["привычки и повторяемость", "состояния и общие истины", "расписания и придаточные будущего"], examples: ["I work from home every Friday.", "The train leaves at 6:40 tomorrow."], markers: ["usually", "often", "every day", "never", "on Fridays"], trap: "Now не всегда требует Continuous: I now understand.", anchor: "present-simple" },
    { name: "Present Continuous", formula: "am/is/are + V-ing", focus: "процесс или временная ситуация", uses: ["действие прямо сейчас", "временная ситуация вокруг настоящего", "изменение и личная договорённость"], examples: ["I am working from home this week.", "We are meeting the designer at three."], markers: ["now", "right now", "at the moment", "currently", "this week"], trap: "Глаголы состояния обычно не употребляются в Continuous.", anchor: "present-continuous" },
    { name: "Present Perfect", formula: "have/has + V3", focus: "прошлое, связанное с настоящим", uses: ["текущий результат", "опыт и количество до настоящего", "состояние в незавершённый период"], examples: ["I have finished the report.", "She has known Eva since 2019."], markers: ["already", "yet", "just", "ever", "never", "so far", "since", "for"], trap: "Обычно не сочетается с законченным временем: yesterday, last year, in 2020.", anchor: "present-perfect-simple" },
    { name: "Present Perfect Continuous", formula: "have/has been + V-ing", focus: "деятельность и длительность до сейчас", uses: ["продолжающаяся деятельность", "повторяемость до настоящего", "недавняя причина видимого результата"], examples: ["I have been working for two hours.", "It has been raining; the road is wet."], markers: ["for", "since", "all day", "lately", "recently", "how long"], trap: "Continuous не гарантирует, что действие всё ещё продолжается.", anchor: "present-perfect-continuous" },
  ]},
  { time: "Past", route: "past", items: [
    { name: "Past Simple", formula: "V2", focus: "событие в завершённом прошлом", uses: ["одиночное законченное событие", "последовательность событий", "прошлые привычки и состояния"], examples: ["I worked yesterday.", "She opened the door and walked in."], markers: ["yesterday", "ago", "last week", "in 2019", "then"], trap: "После did используется V1: Did she go?, не Did she went?", anchor: "past-simple" },
    { name: "Past Continuous", formula: "was/were + V-ing", focus: "процесс в прошлый момент", uses: ["процесс в конкретный момент", "фон для короткого события", "два одновременных процесса"], examples: ["I was working at six.", "She was cooking when I called."], markers: ["while", "as", "at five yesterday", "all evening"], trap: "When не выбирает форму автоматически: важна роль события в рассказе.", anchor: "past-continuous" },
    { name: "Past Perfect", formula: "had + V3", focus: "более раннее прошлое", uses: ["действие до другого прошлого события", "результат к прошлому моменту", "причина прошлого состояния"], examples: ["I had finished before six.", "The train had left when we arrived."], markers: ["before", "after", "by the time", "already", "never"], trap: "После установки временной рамки рассказ обычно возвращается к Past Simple.", anchor: "past-perfect-simple" },
    { name: "Past Perfect Continuous", formula: "had been + V-ing", focus: "деятельность до прошлой точки", uses: ["длительность до прошлого момента", "повторяемая деятельность", "причина заметного прошлого результата"], examples: ["I had been working for two hours.", "The road was wet because it had been raining."], markers: ["for", "since", "all day", "before", "until then"], trap: "Со stative verbs обычно нужен Past Perfect Simple.", anchor: "past-perfect-continuous" },
  ]},
  { time: "Future", route: "future", items: [
    { name: "Future Simple", formula: "will + V1", focus: "прогноз, решение или обещание", uses: ["мнение и нейтральный прогноз", "решение в момент речи", "обещание, готовность или отказ"], examples: ["I think it will rain.", "I will help you with that."], markers: ["probably", "I think", "one day", "soon", "perhaps"], trap: "Will — не универсальный знак будущего: планы, расписания и признаки требуют других конструкций.", anchor: "future-simple-will-v1" },
    { name: "Future Continuous", formula: "will be + V-ing", focus: "процесс в будущий момент", uses: ["действие в определённый будущий момент", "естественный ход событий", "нейтральный вопрос о планах"], examples: ["I will be working at six.", "Will you be using the car tonight?"], markers: ["this time tomorrow", "at five tomorrow", "all day"], trap: "Форма не означает автоматически, что действие будет долгим.", anchor: "future-continuous-will-be-v-ing" },
    { name: "Future Perfect", formula: "will have + V3", focus: "результат к будущей точке", uses: ["завершение к сроку", "количество к будущему моменту", "опыт или длительность состояния к сроку"], examples: ["I will have finished by six.", "By June, she will have lived here for ten years."], markers: ["by", "by then", "by the time", "before", "by the end of"], trap: "By задаёт крайний срок; until подчёркивает продолжение до границы.", anchor: "future-perfect-simple-will-have-v3" },
    { name: "Future Perfect Continuous", formula: "will have been + V-ing", focus: "длительность к будущей точке", uses: ["продолжительность деятельности к сроку", "продолжающаяся серия", "процесс как причина будущего результата"], examples: ["I will have been working for two hours.", "By noon, she will have been driving all morning."], markers: ["for", "since", "by the time", "how long", "all morning"], trap: "Форма редкая и тяжеловесная; если важен результат, чаще нужен Future Perfect Simple.", anchor: "future-perfect-continuous-will-have-been-v-ing" },
  ]},
];

const account = { user: null, csrf: null, available: false, demo: false, ready: true, pending: Promise.resolve(), draftTimer: null };
function storageKey(kind) { return `noeon-${kind}${account.user ? ":" + account.user.id : ""}`; }
const app = typeof document === "undefined" ? null : document.querySelector("#app");
const state = {
  manifest: null,
  theory: [],
  exercises: null,
  session: restoreSession(),
};

const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const slugify = (text) => text.toLowerCase()
  .trim()
  .replace(/[«»“”"'!?.,:;()[\]{}]/g, "")
  .replace(/[^\p{L}\p{N}]+/gu, "-")
  .replace(/^-+|-+$/g, "");

function decodeAnchor(anchor = "") {
  try { return decodeURIComponent(anchor); } catch { return anchor; }
}

// Compute IDs before rendering so every repeated heading, including the first,
// uses its h2 parent. The same index drives rule excerpts.
function markdownHeadings(markdown) {
  let inCode = false;
  const headings = [];
  markdown.replaceAll("\r\n", "\n").split("\n").forEach((line, index) => {
    if (line.startsWith("```")) { inCode = !inCode; return; }
    const match = !inCode && line.match(/^(#{1,4})\s+(.+)$/);
    if (match) headings.push({ index, level: match[1].length, base: slugify(match[2].replace(/\s+#+$/, "")) });
  });
  const counts = new Map(), used = new Set();
  for (const h of headings) counts.set(h.base, (counts.get(h.base) || 0) + 1);
  let parent = "";
  for (const h of headings) {
    let id = counts.get(h.base) > 1 && h.level > 2 && parent ? `${parent}--${h.base}` : h.base;
    const base = id;
    let n = 2;
    while (used.has(id)) id = `${base}--${n++}`;
    h.id = id; used.add(id);
    if (h.level === 2) parent = id;
    if (h.level === 1) parent = "";
  }
  return headings;
}

const normalise = (value) => String(value ?? "")
  .normalize("NFKC")
  .trim()
  .toLocaleLowerCase("en")
  .replace(/[’‘]/g, "'")
  .replace(/[“”]/g, '"')
  .replace(/\s+[–—-]\s+/g, " — ")
  .replace(/\s+/g, " ")
  .replace(/[.!?]+$/g, "");

function modalAnswerNormal(value) {
  return String(value ?? '').replace(/[’‘ʼ]/g,"'").trim().toLowerCase().replace(/\s+/g,' ').replace(/[.!?]+$/,'').trim();
}

function inlineMarkdown(text) {
  let output = escapeHtml(text);
  output = output.replace(/`([^`]+)`/g, "<code>$1</code>");
  output = output.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  output = output.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  output = output.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1 ↗</a>');
  output = output.replace(/\[([^\]]+)\]\((?:content\/tenses\/)?([^#/)]+\.md)(?:#([^)]+))?\)/g, (_, label, file, anchor) => {
    const route = THEORY_ROUTE_BY_FILE[file] || "foundations";
    return `<a href="#theory/${route}${anchor ? `/${anchor}` : ""}">${label}</a>`;
  });
  return output;
}

function markdownToHtml(markdown) {
  const lines = markdown.replaceAll("\r\n", "\n").split("\n");
  const headingIds = markdownHeadings(markdown).map(h => h.id);
  const output = [];
  let paragraph = [];
  let list = null;
  let table = [];
  let quote = [];
  let code = [];
  let inCode = false;

  const flushParagraph = () => {
    if (paragraph.length) output.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (list) output.push(`<${list.type}>${list.items.map((item) => `<li>${inlineMarkdown(item)}</li>`).join("")}</${list.type}>`);
    list = null;
  };
  const flushTable = () => {
    if (!table.length) return;
    const rows = table.filter((row) => !/^\s*\|?\s*:?-+/.test(row));
    if (rows.length) {
      const cells = rows.map((row) => row.replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim()));
      output.push(`<div class="table-wrap"><table><thead><tr>${cells[0].map((cell) => `<th>${inlineMarkdown(cell)}</th>`).join("")}</tr></thead><tbody>${cells.slice(1).map((row) => `<tr>${row.map((cell) => `<td>${inlineMarkdown(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);
    }
    table = [];
  };
  const flushQuote = () => {
    if (quote.length) output.push(`<blockquote>${inlineMarkdown(quote.join(" "))}</blockquote>`);
    quote = [];
  };
  const flushAll = () => { flushParagraph(); flushList(); flushTable(); flushQuote(); };

  for (const line of lines) {
    if (line.startsWith("```")) {
      flushAll();
      if (inCode) { output.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`); code = []; }
      inCode = !inCode;
      continue;
    }
    if (inCode) { code.push(line); continue; }
    if (/^\s*\|.+\|\s*$/.test(line)) { flushParagraph(); flushList(); flushQuote(); table.push(line); continue; }
    flushTable();
    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      flushAll();
      const level = heading[1].length;
      const title = heading[2].replace(/\s+#+$/, "");
      output.push(`<h${level} id="${headingIds.shift()}">${inlineMarkdown(title)}</h${level}>`);
      continue;
    }
    const unordered = line.match(/^\s*[-*+]\s+(.+)$/);
    const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (unordered || ordered) {
      flushParagraph(); flushQuote();
      const type = ordered ? "ol" : "ul";
      if (!list || list.type !== type) { flushList(); list = { type, items: [] }; }
      list.items.push((unordered || ordered)[1]);
      continue;
    }
    const quoteLine = line.match(/^>\s?(.*)$/);
    if (quoteLine) { flushParagraph(); flushList(); quote.push(quoteLine[1]); continue; }
    if (!line.trim()) { flushAll(); continue; }
    flushList(); flushQuote();
    paragraph.push(line.trim());
  }
  flushAll();
  return output.join("\n");
}

// Comparison keeps the same anchors in the page, modal and practice reference.
function comparisonRuleHtml(markdown) {
  const notes=[];
  const source=markdown.replace(/:::note ([^\n]+)\n([\s\S]*?)\n:::/g,(_,title,body)=>{
    const token='COMPARISONNOTE'+notes.length;
    notes.push(`<details class="comparison-note"><summary>${escapeHtml(title)}</summary>${markdownToHtml(body)}</details>`);
    return token;
  });
  let html=markdownToHtml(source).replaceAll('<div class="table-wrap">', '<div class="table-wrap" tabindex="0" role="region" aria-label="Таблица сравнения">');
  notes.forEach((note,index)=>{html=html.replace(`<p>COMPARISONNOTE${index}</p>`,note);});
  const sections=html.split(/(?=<h2 id=")/).map(part=>part.startsWith('<h2 ')?`<section class="comparison-rule-block">${part}</section>`:part).join('');
  return `<div class="comparison-rule">${sections}</div>`;
}


function reportedRuleHtml(markdown) {
  const fragments=[];
  const hold=value=>{const token='REPORTEDFRAGMENT'+fragments.length+'END';fragments.push(value);return token;};
  let source=markdown.replace(/<a\s+id="([a-z0-9_-]+)"\s*><\/a>/g,(_,id)=>hold('<span id="'+id+'" class="reported-anchor"></span>'));
  source=source.replace(/\[([^\]]+)\]\(#(practice\/(?:RS\d{2}|MIX)|rs[a-z0-9-]*)\)/g,(_,label,route)=>{
    const target=route.startsWith('practice/')?'#practice/reported/'+(route.endsWith('MIX')?'rs_mixed':route.split('/')[1].toLowerCase()):'#theory/reported/'+route;
    return hold('<a href="'+target+'">'+escapeHtml(label)+'</a>');
  });
  source=source.replace(/\[([^\]]+)\]\(full-theory\.html(?:#([^)]*))?\)/g,(_,label,anchor)=>hold('<a class="reported-more" href="content/theory/reported-full.html'+(anchor?'#'+anchor:'')+'">'+escapeHtml(label)+'</a>'));
  source=source.replace(/<details[^>]*>\s*<summary>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g,(_,title,body)=>hold('<details class="comparison-note"><summary>'+escapeHtml(title.trim())+'</summary>'+markdownToHtml(body.trim())+'</details>'));
  let html=markdownToHtml(source).replaceAll('<div class="table-wrap">','<div class="table-wrap" tabindex="0" role="region" aria-label="Таблица косвенной речи">');
  html=html.replace(/<table>[\s\S]*?<\/table>/g,table=>{
    const heads=[...table.matchAll(/<th>([\s\S]*?)<\/th>/g)].map(m=>m[1].replace(/<[^>]+>/g,'').trim());
    return table.replace(/<tr>[\s\S]*?<\/tr>/g,row=>{let i=0;return row.replace(/<td>/g,()=>'<td data-label="'+escapeHtml(heads[i++]||'')+'">');});
  });
  for(let pass=0;pass<4&&html.includes('REPORTEDFRAGMENT');pass++)fragments.forEach((value,i)=>{const token='REPORTEDFRAGMENT'+i+'END';html=html.replace('<p>'+token+'</p>',value).replaceAll(token,value);});
  return '<div class="reported-rule comparison-rule">'+html+'</div>';
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Не удалось загрузить ${url}`);
  return response.json();
}

function setNav(section) {
  document.querySelectorAll("[data-nav]").forEach((link) => {
    const current = link.dataset.nav === section;
    link.classList.toggle("current", current);
    if (current) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}

const ROUTE_NAV = {
  students: "students", home: "home", grammar: "theory", theory: "theory", practice: "theory",
  tests:"theory", "test-preview":"theory", "test-attempt":"theory", session: "theory", assign: "theory", edit: "theory", results: "results",
  report: "results", profile: "profile", student: "profile", join: "profile",
  "teacher-library":"profile", "task-issues":"profile", notifications: "profile", work: "results", "student-work": "profile", "review-queue":"students",
};
function syncRouteNav() {
  syncRoleNav();
  const route=location.hash.slice(1).split("/")[0] || "home";
  setNav(account.user?.role==='teacher' && ['students','student','student-work'].includes(route) ? 'students' : ROUTE_NAV[route] || "home");
}
let openedTheory = null;
function scrollTheory(parts) {
  const anchor = decodeAnchor(parts.slice(2).join("/"));
  const target = anchor ? document.getElementById(anchor) : document.querySelector(".theory-content");
  target?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
}

const GRAMMAR_SECTIONS = {
  reported: { title: "Reported Speech", subtitle: "Косвенная речь", description: "Сообщения, вопросы, просьбы и reporting verbs: отдельные подтемы и смешанная практика.", theory: "reported" },
  modals: { title: "Modal Verbs", subtitle: "Модальные глаголы", description: "Значения и формы модальных глаголов: 31 подтема, упражнения и мини-тексты.", theory: "modals" },
  tenses: { title: "Tenses", subtitle: "Временные формы", description: "12 временных форм, карта системы, употребление и сложные сопоставления.", theory: "foundations" },
  comparison: { title: "Degrees of Comparison", subtitle: "Степени сравнения прилагательных", description: "Образование форм, сравнение, равенство и точные смысловые различия.", theory: "comparison" },
  passive: { title: "Passive Voice", subtitle: "Пассивный залог", description: "Формы пассива, выбор фокуса и особые конструкции. Предложения, мини-тексты и преобразования.", theory: "passive" },
};
function grammarSectionForTheory(id) { return ["comparison","passive","modals","reported"].includes(id) ? id : "tenses"; }
function renderGrammar(topic = "", practice = false, student = null) {
  syncRouteNav();
  const sections = GRAMMAR_SECTIONS[topic] ? [[topic, GRAMMAR_SECTIONS[topic]]] : Object.entries(GRAMMAR_SECTIONS);
  app.innerHTML = `<div class="reading"><div class="eyebrow">${practice ? "Выберите раздел практики" : "Самостоятельные разделы"}</div><h1>${GRAMMAR_SECTIONS[topic]?.title || (practice ? "Практика" : "Грамматика")}</h1><p class="lead">${student ? "Выберите раздел для назначения ученику " + escapeHtml(student.name) + "." : "У каждого раздела — своя теория, темы и отдельные настройки практики."}</p><div class="grammar-sections">${sections.map(([id, section]) => `<article class="card grammar-section" data-grammar-section="${id}"><span class="eyebrow">${escapeHtml(section.subtitle)}</span><h2>${section.title}</h2><p>${section.description}</p><div class="comparison-shortcuts">${practice ? "" : `<a class="button" href="#theory/${section.theory}">Теория${id === "tenses" ? " и карта времён" : ""} →</a>`}<a class="button primary" href="${student ? "#assign/" + encodeURIComponent(student.id) + "/" + id : "#practice/" + id}">${student ? "Настроить задание" : "Практика"} →</a>${account.user?.role==="teacher"&&typeof ASSESSMENT_SECTIONS!=="undefined"&&ASSESSMENT_SECTIONS[id]?`<a class="button" href="#tests/${id}">Проверочные тесты →</a>`:""}</div></article>`).join("")}</div></div>`;
  document.title = `${student ? "Назначить задание" : practice ? "Практика" : GRAMMAR_SECTIONS[topic]?.title || "Грамматика"} — Grammar NOEON`;
}
function theoryCards() {
  return state.theory.map((entry, index) => `
    <a class="card" href="#theory/${entry.id}">
      <span class="eyebrow">Раздел ${String(index + 1).padStart(2, "0")}</span>
      <h3>${escapeHtml(entry.title)}</h3>
      <p>${escapeHtml(entry.description)}</p>
    </a>`).join("");
}

function todayRuleLink(topicId) {
  for(const row of TENSE_MAP)for(const item of row.items)if(item.name.toLowerCase().replaceAll(' ','_')===topicId)return '#theory/'+row.route+'/'+item.anchor;
  const comparisons={cmp_forms:'формы-и-орфография',cmp_superlatives:'превосходная-степень-и-группа',cmp_equality:'равенство-и-неравенство',cmp_development:'насколько-велика-разница',cmp_precision:'точность-сравнения-и-пропуски'};
  if(topicId.startsWith('mv_'))return '#theory/modals';
  if(/^rs(?:\d|_)/.test(topicId))return '#theory/reported/'+(topicId==='rs_mixed'?'rs-check':topicId);
  if(topicId.startsWith('pv_'))return '#theory/passive';
  return topicId.startsWith('cmp_')?'#theory/comparison/'+(comparisons[topicId]||'карта-раздела'):'#theory/contrasts';
}
function todayList(title,page,render,empty) {
  return `<section class="today-section"><h2>${escapeHtml(title)}</h2>${page.items.length?page.items.map(render).join(''):`<p class="subtle">${escapeHtml(empty)}</p>`}${page.total>page.items.length?`<p class="subtle">Показано ${page.items.length} из ${page.total}.</p>`:''}</section>`;
}
function todayResume(work) {
  return work?`<section class="today-resume"><p class="eyebrow">Можно продолжить</p><h2>${escapeHtml(work.title)}</h2><p class="today-resume-progress">Выполнено: ${Number(work.index)} из ${Number(work.total)}</p><button class="button primary" type="button" data-resume="${escapeHtml(work.id)}">Продолжить</button></section>`:'';
}
function todayStudentMarkup(data) {
  const weak=data.weakTopics.map(topic=>{
    const label=PRACTICE_TENSES.find(t=>t.id===topic.topicId)?.label||topic.topicId;
    const section=targetSection(topic.topicId);
    return `<article class="today-topic"><h3>${escapeHtml(label)}</h3><p>${Math.round(topic.correct/topic.checked*100)}% · Проверено полей: ${Number(topic.checked)}</p><div class="today-actions"><a class="button" href="${escapeHtml(todayRuleLink(topic.topicId))}">Правило</a>${data.freePracticeAllowed?`<a class="button" href="${escapeHtml('#practice/'+section+'/'+encodeURIComponent(topic.topicId))}">Тренировать тему</a>`:''}</div></article>`;
  }).join('');
  return todayResume(data.resume)+todayList('Новые задания учителя',data.newAssignments,a=>`<a class="work-card" href="${escapeHtml('#work/'+encodeURIComponent(a.practiceId))}"><span class="work-card-main"><strong>${escapeHtml(a.title)}</strong><span class="work-card-meta">Заданий: ${Number(a.total)} · ${escapeHtml(new Date(a.created*1000).toLocaleDateString('ru-RU'))}</span></span><span class="work-card-arrow">Открыть</span></a>`,'Новых назначений пока нет.')+
    `<section class="today-section"><h2>За последние 7 дней</h2><p class="subtle">По завершённым тренировкам.</p><div class="today-stats"><div><strong data-today-stat="week-sessions">${Number(data.week.sessions)}</strong><span>завершено тренировок</span></div><div><strong data-today-stat="week-checked">${Number(data.week.maxScore)}</strong><span>проверено полей</span></div><div><strong>${data.week.maxScore?Math.round(data.week.score/data.week.maxScore*100)+'%':'—'}</strong><span>точность</span></div></div>${data.week.pending?`<p class="subtle">Без автоматической оценки: ${Number(data.week.pending)}.</p>`:''}<p class="subtle">За всё время: <span data-today-stat="all-checked">${Number(data.stats.maxScore)}</span> проверенных полей, <span data-today-stat="all-score">${Number(data.stats.score)}</span> верно. <a href="#results">Все результаты</a></p></section>`+
    `<section class="today-section"><h2>Что стоит повторить</h2>${weak||'<p class="subtle">Тем с точностью ниже 70% пока нет. Для рекомендации нужно хотя бы 5 проверенных полей по теме.</p>'}${!data.freePracticeAllowed?'<p class="subtle">Свободную тренировку включает учитель. Правила доступны всегда.</p>':''}</section>`;
}
function todayTeacherMarkup(data) {
  return todayResume(data.resume)+reviewQueueEntry(data.reviews)+todayList('Новые выполненные работы',data.completed,a=>`<a class="work-card" data-today-completed="${escapeHtml(a.id)}" href="${escapeHtml('#report/'+encodeURIComponent(a.studentId)+'/'+encodeURIComponent(a.practiceId))}"><span class="work-card-main"><strong>${escapeHtml(a.studentName)}</strong><span class="work-card-meta">${escapeHtml(a.title)} · ${Number(a.score)}/${Number(a.maxScore)}</span></span><span class="work-card-arrow">Отчёт</span></a>`,'Новых выполненных работ пока нет.')+
    todayList('Без активности 7 дней и больше',data.inactiveStudents,u=>`<a class="work-card" href="${escapeHtml('#student/'+encodeURIComponent(u.id))}"><span class="work-card-main"><strong>${escapeHtml(u.name)}</strong><span class="work-card-meta">${u.lastActive?'Последняя активность: '+escapeHtml(new Date(u.lastActive*1000).toLocaleDateString('ru-RU')):'Ещё не заходил в кабинет'}</span></span><span class="work-card-arrow">Открыть</span></a>`,'Все активные ученики заходили недавно.')+
    todayList('Не начаты больше 3 дней',data.staleAssignments,a=>`<a class="work-card" href="${escapeHtml('#student-work/'+encodeURIComponent(a.studentId)+'/'+encodeURIComponent(a.practiceId))}"><span class="work-card-main"><strong>${escapeHtml(a.studentName)}</strong><span class="work-card-meta">${escapeHtml(a.title)} · ${escapeHtml(new Date(a.created*1000).toLocaleDateString('ru-RU'))}</span></span><span class="work-card-arrow">Открыть</span></a>`,'Залежавшихся назначений нет.')+'<p><a class="button" href="#students">Все ученики</a></p>';
}
async function renderHome() {
  syncRouteNav();
  if(!account.user) {
    app.innerHTML=`<section class="today-guest"><p class="eyebrow">Grammar NOEON · A1–C2</p><h1>Английская грамматика — шаг за шагом</h1><p>Правила, понятные объяснения и практика, которая помогает замечать смысл за формой. Учебные примеры — British English.</p><div class="today-actions"><a class="button primary library-link today-theory-link" href="#grammar">Теория</a><a class="button" href="#theory/foundations">Карта времён</a><a class="button" href="#profile">Войти</a></div><p class="subtle">Практика доступна после входа. Ученики выполняют назначения; свободную тренировку разрешает учитель.</p></section>`;
    return;
  }
  const owner=account.user.id,routeAtStart=location.hash;
  app.innerHTML='<h1 class="sr-only">Сегодня</h1><p role="status">Загружаем ваш день…</p>';
  try {
    const data=await accountRequest('today');
    if(account.user?.id!==owner||location.hash!==routeAtStart)return;
    app.innerHTML='<h1 class="sr-only">Сегодня</h1><div class="today-account">'+(data.role==='student'?todayStudentMarkup(data):todayTeacherMarkup(data))+'</div>';
    bindAccountHistory();
    app.querySelectorAll('[data-today-completed]').forEach(link=>link.addEventListener('click',async event=>{
      event.preventDefault();const href=link.getAttribute('href');
      try{await accountRequest('notifications/read',{id:'completed:'+link.dataset.todayCompleted});}catch{toast('Не удалось отметить уведомление прочитанным');}
      if(account.user?.id===owner&&location.hash===routeAtStart)location.hash=href;
    }));
  }catch(error){
    if(account.user?.id!==owner||location.hash!==routeAtStart)return;
    if(error.status===401){account.user=null;account.csrf=null;state.exercises=null;state.session=restoreSession();await renderHome();syncScreenChrome();return;}
    app.innerHTML='<h1 class="sr-only">Сегодня</h1><p role="status">Не удалось загрузить данные аккаунта. Проверьте соединение и повторите.</p><button class="button" id="retry-today">Повторить</button> <a class="button" href="#grammar">Изучить теорию</a>';
    app.querySelector('#retry-today').addEventListener('click',()=>renderHome());
  }
}

function renderProfile() {
  if (account.available) return renderAccount();
  syncRouteNav();
  const history = readHistory();
  const answered = history.reduce((sum, attempt) => sum + attempt.total, 0);
  const correct = history.reduce((sum, attempt) => sum + attempt.correct, 0);
  app.innerHTML = `<div class="reading profile-page">
    <span class="eyebrow">Личное пространство</span><h1>Профиль обучения</h1>
    <article class="profile-card">
      <div class="profile-avatar">N</div><div><h2>Локальный профиль</h2><p>Без регистрации и передачи персональных данных.</p></div>
      <div class="profile-row"><strong>Доступные материалы</strong><p>Времена и степени сравнения: теория, интерактивная карта и практика A1–C2.</p><a href="#grammar">Открыть грамматику →</a></div>
      <div class="profile-row"><strong>Учебная история</strong><p>${history.length} завершённых сессий · ${answered} ответов · ${correct} верных.</p><a href="#results">Посмотреть результаты →</a></div>
      <p class="subtle">Прогресс хранится только в этом браузере. Для входа откройте версию приложения с сервером личных кабинетов.</p>
    </article>
  </div>`;
}

const THEORY_SECTION_LINKS = {
  reported: [["Основа", "reported", "rs01"], ["Вопросы", "reported", "rs09"], ["Просьбы и команды", "reported", "rs11"], ["Reporting verbs", "reported", "rs14"], ["Сложные случаи", "reported", "rs20"]],
  modals: [['Обзор','modals','mv-r1'],['Значения','modals','mv-r3'],['Обязанность','modals','mv-r7'],['Конструкции','modals','mv-r8']],
  comparison: [
    ['Формы','comparison','формы-и-орфография'],
    ['Группа и артикли','comparison','превосходная-степень-и-группа'],
    ['Конструкции','comparison','равенство-и-неравенство'],
    ['Точность','comparison','точность-сравнения-и-пропуски']
  ],
  passive: [
    ['Формы','passive','pv-table'],
    ['Зачем пассив','passive','pv-focus'],
    ['Особые конструкции','passive','pv-modals']
  ]
};
function theorySectionLinks(active) {
  const section=grammarSectionForTheory(active);
  if(THEORY_SECTION_LINKS[section])return THEORY_SECTION_LINKS[section];
  const names={foundations:'Основы',present:'Present',past:'Past',future:'Future',contrasts:'Сопоставления'};
  return state.theory.filter(entry=>grammarSectionForTheory(entry.id)==='tenses').map(entry=>[names[entry.id]||entry.title,entry.id,'']);
}
function theorySectionIndex(active,anchor,links=theorySectionLinks(active)) {
  if(grammarSectionForTheory(active)==='tenses')return links.findIndex(link=>link[1]===active);
  if(active==='modals'){const n=Number(anchor.replace('mv-r',''));return n>=8?3:n===7?2:n>=3?1:0;}
  if(active==='reported'){const n=Number(anchor.slice(2));return !n||n<9?0:n<11?1:n<14?2:n<20?3:4;}
  if(active==='passive'){
    if(['pv-focus','pv-flow','pv-agent'].includes(anchor))return 1;
    return !anchor||['pv-table','pv-building','pv-aspect','pv-checklist','selected-form-title','selected-form-note','selected-form-example'].includes(anchor)?0:2;
  }
  if(['превосходная-степень-и-группа','артикли-и-определители'].includes(anchor))return 1;
  if(['равенство-и-неравенство','too-и-enough','less-и-least','насколько-велика-разница','модификаторы-равенства-и-кратность','постепенное-изменение','связанные-изменения'].includes(anchor))return 2;
  if(['точность-сравнения-и-пропуски','отрицание-и-логические-границы','пределы-шкалы-и-контекст','устойчивые-сравнения','проверка-перед-ответом'].includes(anchor))return 3;
  return 0;
}
function theoryNav(active,anchor='') {
  const section=grammarSectionForTheory(active),title=GRAMMAR_SECTIONS[section].title;
  const links=theorySectionLinks(active),selected=theorySectionIndex(active,anchor,links);
  const label=links[selected]?.[0]||'Обзор';
  return `<div class="theory-section-nav"><nav class="grammar-breadcrumb" aria-label="Путь в грамматике"><a href="#grammar">Грамматика</a><span aria-hidden="true">›</span><a href="#theory/${GRAMMAR_SECTIONS[section].theory}">${escapeHtml(title)}</a><span aria-hidden="true">›</span><span aria-current="location">${escapeHtml(label)}</span></nav><nav class="theory-nav" aria-label="Темы раздела ${escapeHtml(title)}">${links.map(([name,slug,id],index)=>`<a class="${index===selected?'active':''}"${index===selected?' aria-current="location"':''} href="#theory/${slug}${id?'/'+id:''}">${escapeHtml(name)}</a>`).join('')}<a href="#practice/${section}">Практика →</a></nav></div>`;
}
function syncTheoryNavigation(parts) {
  const node=document.querySelector('.theory-section-nav');
  if(node)node.outerHTML=theoryNav(parts[1],decodeAnchor(parts.slice(2).join('/')));
}

function tenseMapHtml() {
  const aspectNames = ["Simple", "Continuous", "Perfect", "Perfect Continuous"];
  return `<section class="tense-map" aria-labelledby="tense-map-title">
    <div class="tense-map-intro">
      <div><span class="eyebrow">Наглядная схема</span><h2 id="tense-map-title">Карта 12 времён</h2></div>
      <p>Читайте по строкам — время, по столбцам — способ взглянуть на действие. Откройте на весь экран, выберите время или нажмите на карточку. Карту можно двигать и приближать двумя пальцами.</p>
    </div>
    <div class="map-shell" id="tenses-map">
      <div class="map-toolbar" aria-label="Управление картой">
        <button class="button primary" type="button" data-map-action="fullscreen">На весь экран</button>
        <div class="map-zoom-group">
          <button class="button map-icon-button" type="button" data-map-action="out" aria-label="Уменьшить карту">−</button>
          <output class="map-scale" aria-live="polite">70%</output>
          <button class="button map-icon-button" type="button" data-map-action="in" aria-label="Увеличить карту">+</button>
        </div>
        <button class="button" type="button" data-map-action="fit">Показать целиком</button>

        <span class="map-toolbar-hint">Тяните карту · щипок или Ctrl + колесо — масштаб</span>
      </div>
      <nav class="map-navigator" aria-label="Быстрая навигация по временам">
        <div class="map-time-tabs"><button type="button" data-map-row="all" aria-pressed="true">Все</button>${TENSE_MAP.map(row => `<button type="button" data-map-row="${row.time}" aria-pressed="false">${row.time}</button>`).join("")}</div>
        <label class="map-jump-label">Перейти к времени<select class="map-jump" aria-label="Перейти к времени"><option value="">Выберите время…</option>${TENSE_MAP.map(row => `<optgroup label="${row.time}">${row.items.map(item => `<option>${item.name}</option>`).join("")}</optgroup>`).join("")}</select></label>
      </nav>
      <div class="map-workspace">
      <div class="map-viewport" tabindex="0" aria-label="Карта времён. Стрелки — перемещение, плюс и минус — масштаб, Home — вся карта.">
        <div class="tense-map-grid map-canvas">
          <div class="map-corner"><span>Время ↓</span><strong>Аспект →</strong></div>
          ${aspectNames.map((name) => `<div class="aspect-head">${name}</div>`).join("")}
          ${TENSE_MAP.map((row) => `<div class="time-head">${row.time}</div>${row.items.map((item) => `<button class="tense-cell ${row.time.toLowerCase()}" type="button" data-tense="${escapeHtml(item.name)}"><span class="tense-cell-top"><strong>${escapeHtml(item.name)}</strong><code>${escapeHtml(item.formula)}</code></span><span class="tense-focus">${escapeHtml(item.focus)}</span><span class="tense-uses"><b>Основные случаи</b>${item.uses.map((use) => `<span>• ${escapeHtml(use)}</span>`).join("")}</span><span class="tense-markers"><b>Маркеры:</b> ${item.markers.map(escapeHtml).join(" · ")}</span><em>${escapeHtml(item.examples[0])}</em></button>`).join("")}`).join("")}
        </div>
      </div>
      <aside class="map-detail" aria-label="Подробности времени" hidden></aside></div>
    </div>
    <p class="map-note"><strong>Как пользоваться:</strong> Simple представляет ситуацию как факт или целое; Continuous — изнутри процесса; Perfect связывает её с более поздней точкой; Perfect Continuous подчёркивает деятельность и длительность.</p>
  </section>`;
}

function tenseDetailHtml(row, item) {
  return `<button class="map-detail-close" type="button" aria-label="Закрыть подробности">×</button>
    <span class="eyebrow">${escapeHtml(row.time)} · подробная карточка</span>
    <h3>${escapeHtml(item.name)}</h3>
    <code class="map-detail-formula">${escapeHtml(item.formula)}</code>
    <p class="map-detail-focus">${escapeHtml(item.focus)}</p>
    <h4>Основные случаи использования</h4>
    <ul>${item.uses.map((use) => `<li>${escapeHtml(use)}</li>`).join("")}</ul>
    <h4>Примеры</h4>
    ${item.examples.map((example) => `<p class="map-detail-example" lang="en">${escapeHtml(example)}</p>`).join("")}
    <h4>Характерные маркеры</h4>
    <p class="map-detail-markers">${item.markers.map((marker) => `<span>${escapeHtml(marker)}</span>`).join("")}</p>
    <p class="map-detail-trap"><strong>Обратите внимание:</strong> ${escapeHtml(item.trap)}</p>
    <a class="button primary" href="#theory/${row.route}/${item.anchor}">Открыть полное правило →</a>`;
}

let disposeTenseMap = null;

function initialiseTenseMap() {
  if(typeof disposeAssessment!=="undefined"){disposeAssessment?.();disposeAssessment=null;}
  disposeTenseMap?.();
  const shell = document.querySelector("#tenses-map");
  if (!shell) return;
  const viewport = shell.querySelector(".map-viewport"), canvas = shell.querySelector(".map-canvas");
  const detail = shell.querySelector(".map-detail"), output = shell.querySelector(".map-scale");
  const jump = shell.querySelector(".map-jump"), fullButton = shell.querySelector('[data-map-action="fullscreen"]');
  const allItems = TENSE_MAP.flatMap(row => row.items.map(item => ({row, item})));
  const controller = new AbortController(), signal = controller.signal;
  const view = {x: 0, y: 0, scale: 1}, pointers = new Map();
  let dialog = null, placeholder = null, oldOverflow = "", savedView = null, selected = -1;
  let gesture = null, dragged = false, suppressClick = false, activeRow = window.innerWidth <= 600 ? "Present" : "all", autoFit = true;
  const apply = () => {
    const w = viewport.clientWidth, h = viewport.clientHeight;
    const cw = canvas.offsetWidth * view.scale, ch = canvas.offsetHeight * view.scale;
    view.x = cw < w ? (w-cw)/2 : Math.min(24, Math.max(w-cw-24, view.x));
    view.y = ch < h ? (h-ch)/2 : Math.min(24, Math.max(h-ch-24, view.y));
    canvas.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.scale})`;
    output.value = output.textContent = `${Math.round(view.scale*100)}%`;
  };
  const zoom = (scale, x = viewport.clientWidth/2, y = viewport.clientHeight/2) => {
    const next = Math.max(.12, Math.min(2, scale));
    view.x = x - (x-view.x)*next/view.scale;
    view.y = y - (y-view.y)*next/view.scale;
    view.scale = next; autoFit = false; apply();
  };
  const fit = () => {
    if (!viewport.clientWidth || !viewport.clientHeight) return;
    const rowIndex = TENSE_MAP.findIndex(row => row.time === activeRow);
    const top = rowIndex < 0 ? 0 : 102 + rowIndex*320;
    const height = rowIndex < 0 ? canvas.offsetHeight : 310;
    const readingRow = window.innerWidth <= 600 && rowIndex >= 0;
    view.scale = Math.max(.12, Math.min(1, (viewport.clientWidth-24)/(readingRow ? 390 : canvas.offsetWidth), (viewport.clientHeight-24)/height));
    view.x = readingRow ? 12-148*view.scale : (viewport.clientWidth-canvas.offsetWidth*view.scale)/2;
    view.y = (viewport.clientHeight-height*view.scale)/2-top*view.scale;
    autoFit = true; apply();
  };
  const closeDetail = (focus = true) => {
    detail.hidden = true; shell.classList.remove("has-detail"); jump.value = "";
    shell.querySelectorAll('[data-tense]').forEach(cell => cell.removeAttribute('aria-current'));
    if (focus && selected >= 0) shell.querySelectorAll('[data-tense]')[selected]?.focus({preventScroll:true});
  };
  const showDetail = index => {
    selected = (index+allItems.length)%allItems.length;
    const {row,item} = allItems[selected];
    detail.innerHTML = `<div class="map-detail-nav"><button type="button" class="button" data-map-action="previous" aria-label="Предыдущее время">←</button><span>${selected+1} / 12</span><button type="button" class="button" data-map-action="next" aria-label="Следующее время">→</button></div>`+tenseDetailHtml(row,item);
    detail.hidden = false; shell.classList.add("has-detail"); jump.value = item.name;
    detail.scrollTop = 0;
    shell.querySelectorAll('[data-tense]').forEach(cell => {
      if (cell.dataset.tense===item.name) cell.setAttribute('aria-current','true');
      else cell.removeAttribute('aria-current');
    });
    detail.querySelector('.map-detail-close').focus({preventScroll:true});
  };
  const closeFull = (focus = true) => {
    if (!dialog) return;
    const previous = dialog; dialog = null;
    if (document.fullscreenElement === previous) document.exitFullscreen().catch(()=>{});
    placeholder.replaceWith(shell); placeholder = null;
    previous.close(); previous.remove();
    shell.classList.remove('is-expanded'); fullButton.textContent = 'На весь экран';
    document.body.style.overflow = oldOverflow;
    if (savedView) Object.assign(view,savedView);
    savedView = null; autoFit = false; requestAnimationFrame(apply);
    if (focus) fullButton.focus({preventScroll:true});
  };
  const openFull = () => {
    savedView = {...view}; placeholder = document.createComment('map-position');
    shell.before(placeholder); dialog = document.createElement('dialog');
    dialog.className = 'map-fullscreen-dialog'; dialog.setAttribute('aria-label','Карта 12 времён — полный экран');
    document.body.append(dialog); dialog.append(shell);
    shell.classList.add('is-expanded'); oldOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden';
    fullButton.textContent = 'Закрыть ×'; dialog.showModal();
    dialog.addEventListener('cancel',event=>{event.preventDefault();closeFull();},{signal});
    // iPhone keeps a full-viewport dialog when native fullscreen is unavailable.
    dialog.requestFullscreen?.().catch(()=>{});
    requestAnimationFrame(fit); fullButton.focus({preventScroll:true});
  };
  shell.addEventListener('click',event=>{
    const action = event.target.closest('[data-map-action]')?.dataset.mapAction;
    if (action==='fullscreen') dialog ? closeFull() : openFull();
    if (action==='in') zoom(view.scale*1.25);
    if (action==='out') zoom(view.scale/1.25);
    if (action==='fit') { closeDetail(false); activeRow='all'; updateTabs(); fit(); }
    if (action==='previous') showDetail(selected-1);
    if (action==='next') showDetail(selected+1);
    if (event.target.closest('.map-detail-close')) closeDetail();
    const row = event.target.closest('[data-map-row]')?.dataset.mapRow;
    if (row) { closeDetail(false); activeRow=row; updateTabs(); fit(); }
    const cell = event.target.closest('[data-tense]');
    if (cell && !(suppressClick && event.detail > 0)) showDetail(allItems.findIndex(({item})=>item.name===cell.dataset.tense));
  },{signal});
  const updateTabs = () => shell.querySelectorAll('[data-map-row]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.mapRow===activeRow)));
  jump.addEventListener('change',()=>{if(jump.value) showDetail(allItems.findIndex(({item})=>item.name===jump.value));},{signal});
  viewport.addEventListener('wheel',event=>{
    event.preventDefault(); const rect=viewport.getBoundingClientRect();
    if (event.ctrlKey || event.metaKey) zoom(view.scale*Math.exp(-event.deltaY*.008),event.clientX-rect.left,event.clientY-rect.top);
    else {view.x-=event.deltaX;view.y-=event.deltaY;autoFit=false;apply();}
  },{passive:false,signal});
  const baseline = () => {
    const points=[...pointers.values()];
    if(!points.length) {gesture=null;return;}
    const a=points[0],b=points[1]||a;
    gesture={x:(a.x+b.x)/2,y:(a.y+b.y)/2,d:Math.hypot(a.x-b.x,a.y-b.y),view:{...view}};
  };
  viewport.addEventListener('pointerdown',event=>{
    if(event.button!==0)return;
    if(!pointers.size){dragged=false;suppressClick=false;}
    pointers.set(event.pointerId,{x:event.clientX,y:event.clientY}); baseline();
    // Capture only after movement so ordinary taps still reach the card.
  },{signal});
  viewport.addEventListener('pointermove',event=>{
    if(!pointers.has(event.pointerId)||!gesture)return;
    pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
    const points=[...pointers.values()],a=points[0],b=points[1]||a;
    const x=(a.x+b.x)/2,y=(a.y+b.y)/2,dx=x-gesture.x,dy=y-gesture.y;
    if(Math.abs(dx)+Math.abs(dy)>5||points.length>1)dragged=true;
    if(!dragged)return;
    viewport.setPointerCapture(event.pointerId);viewport.classList.add('is-panning');autoFit=false;
    const next=points.length>1&&gesture.d ? Math.max(.12,Math.min(2,gesture.view.scale*Math.hypot(a.x-b.x,a.y-b.y)/gesture.d)) : gesture.view.scale;
    const rect=viewport.getBoundingClientRect(),ratio=next/gesture.view.scale;
    view.x=x-rect.left-(gesture.x-rect.left-gesture.view.x)*ratio;
    view.y=y-rect.top-(gesture.y-rect.top-gesture.view.y)*ratio;view.scale=next;apply();
  },{signal});
  const stop = event=>{
    if(!pointers.has(event.pointerId))return;
    pointers.delete(event.pointerId); suppressClick=dragged;
    if(viewport.hasPointerCapture(event.pointerId))viewport.releasePointerCapture(event.pointerId);
    baseline(); if(!pointers.size)viewport.classList.remove('is-panning');
  };
  window.addEventListener('pointerup',stop,{signal}); window.addEventListener('pointercancel',stop,{signal});
  shell.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&!detail.hidden){event.preventDefault();event.stopPropagation();closeDetail();return;}
    if(event.target!==viewport)return;
    const moves={ArrowLeft:[60,0],ArrowRight:[-60,0],ArrowUp:[0,60],ArrowDown:[0,-60]};
    if(moves[event.key]){event.preventDefault();view.x+=moves[event.key][0];view.y+=moves[event.key][1];autoFit=false;apply();}
    if(event.key==='+'||event.key==='='){event.preventDefault();zoom(view.scale*1.25);}
    if(event.key==='-'){event.preventDefault();zoom(view.scale/1.25);}
    if(event.key==='Home'){event.preventDefault();activeRow='all';updateTabs();fit();}
  },{signal});
  const observer=new ResizeObserver(()=>{if(autoFit)fit();else apply();});observer.observe(viewport);
  document.addEventListener('fullscreenchange',()=>{if(dialog&&!document.fullscreenElement)closeFull();},{signal});
  disposeTenseMap=()=>{closeFull(false);controller.abort();observer.disconnect();disposeTenseMap=null;};
  updateTabs(); requestAnimationFrame(fit);
}

async function renderTheory(parts) {
  syncRouteNav();
  const slug = state.theory.some((x) => x.id === parts[1]) ? parts[1] : "foundations";
  const entry = state.theory.find((x) => x.id === slug);
  if(slug==='modals') {
    app.innerHTML=`<div class="theory-layout">${theoryNav(slug,decodeAnchor(parts.slice(2).join('/')))}<section class="theory-content">${modalRuleHtml()}<a class="button primary theory-practice" href="#practice/modals">Перейти к практике →</a></section></div>`;
    initialiseModalRule(document.querySelector('.theory-content'));
    document.title='Modal Verbs — Grammar NOEON';openedTheory=slug;
    if(parts[2])requestAnimationFrame(()=>revealModalAnchor(document.querySelector('.theory-content'),decodeAnchor(parts.slice(2).join('/'))));
    return;
  }
  if(slug==='passive') {
    app.innerHTML=`<div class="theory-layout">${theoryNav(slug,decodeAnchor(parts.slice(2).join('/')))}<section class="theory-content"><h1>Passive Voice</h1>${passiveRuleHtml()}<a class="button primary theory-practice" href="#practice/passive">Перейти к практике →</a></section></div>`;
    initialisePassiveRule(document.querySelector('.theory-content'));
    document.title='Passive Voice — Grammar NOEON';openedTheory=slug;
    if(parts[2])requestAnimationFrame(()=>revealPassiveAnchor(document.querySelector('.theory-content'),decodeAnchor(parts.slice(2).join('/'))));
    return;
  }

  app.innerHTML = `<div class="theory-layout">${theoryNav(slug,decodeAnchor(parts.slice(2).join('/')))}<section class="theory-content"><div class="loading-card">Загружаем раздел…</div></section></div>`;
  const response = await fetch(entry.file);
  if (!response.ok) throw new Error("Не удалось загрузить теорию");
  const markdown = await response.text();
  document.querySelector(".theory-content").innerHTML = `${slug === "foundations" ? tenseMapHtml() : ""}<article>${slug === "reported" ? reportedRuleHtml(markdown) : slug === "comparison" ? comparisonRuleHtml(markdown) : markdownToHtml(markdown)}</article><a class="button theory-practice" href="#practice/${grammarSectionForTheory(slug)}">Перейти к практике →</a>`;
  if (slug === "foundations") initialiseTenseMap();
  document.title = `${entry.title} — Grammar NOEON`;
  openedTheory = slug;
  if (parts[2]) requestAnimationFrame(() => scrollTheory(parts));
}

let ruleModal = null;
const ruleMarkdownCache = new Map();

function ruleSection(markdown, anchor) {
  if (!anchor) return markdown;
  anchor = decodeAnchor(anchor);
  const lines = markdown.replaceAll("\r\n", "\n").split("\n");
  const headings = markdownHeadings(markdown);
  const start = headings.find(heading => heading.id === anchor);
  if (!start) return markdown;
  const end = headings.find(heading => heading.index > start.index && heading.level <= start.level);
  return lines.slice(start.index, end?.index ?? lines.length).join("\n");
}

async function openRule(ref) {
  const parts = (ref.startsWith("#theory/") ? ref : ruleLink(ref)).slice(1).split("/");
  const entry = state.theory.find(section => section.id === parts[1]);
  if (!entry) return;
  if (!ruleModal) {
    const dialog = document.createElement("dialog");
    dialog.id = "rule-dialog";
    dialog.className = "rule-dialog";
    dialog.setAttribute("aria-labelledby", "rule-dialog-title");
    dialog.innerHTML = `<header class="rule-dialog-header"><h2 id="rule-dialog-title">Правило</h2><button type="button" class="button" aria-label="Закрыть правило">Закрыть</button></header><div class="rule-dialog-content theory-content" tabindex="0"></div>`;
    const previousOverflow = document.body.style.overflow;
    const returnFocus = document.activeElement;
    const modal = { dialog, controller: null };
    ruleModal = modal;
    document.body.append(dialog);
    document.body.style.overflow = "hidden";
    dialog.querySelector("button").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", event => {
      if (event.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
    });
    dialog.querySelector(".rule-dialog-content").addEventListener("click", event => {
      const link = event.target.closest('a[href^="#theory/"]');
      if (link) { event.preventDefault(); openRule(link.getAttribute("href")); }
    });
    dialog.addEventListener("close", () => {
      modal.controller?.abort();
      document.body.style.overflow = previousOverflow;
      if (ruleModal === modal) ruleModal = null;
      dialog.remove();
      if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
    }, { once: true });
    dialog.showModal();
  }
  const modal = ruleModal;
  modal.controller?.abort();
  const controller = new AbortController();
  modal.controller = controller;
  const content = modal.dialog.querySelector(".rule-dialog-content");
  content.innerHTML = '<p role="status">Загружаем правило…</p>';
  try {
    let markdown = ruleMarkdownCache.get(entry.file);
    if (!markdown) {
      const response = await fetch(entry.file, { signal: controller.signal });
      if (!response.ok) throw new Error("Не удалось загрузить правило");
      markdown = await response.text();
      ruleMarkdownCache.set(entry.file, markdown);
    }
    if (controller.signal.aborted || !modal.dialog.open) return;
    if(entry.id==='modals') {
      content.innerHTML=modalRuleHtml('modal-modals-');initialiseModalRule(content);content.scrollTop=0;
      revealModalAnchor(content,decodeAnchor(parts.slice(2).join('/')));return;
    }
    if(entry.id==='passive') {
      content.innerHTML=passiveRuleHtml('modal-passive-');initialisePassiveRule(content);content.scrollTop=0;
      revealPassiveAnchor(content,decodeAnchor(parts.slice(2).join('/')));return;
    }
    content.innerHTML = `<article>${entry.id === "reported" ? reportedRuleHtml(markdown) : entry.id === "comparison" ? comparisonRuleHtml(ruleSection(markdown, decodeAnchor(parts.slice(2).join("/")))) : markdownToHtml(ruleSection(markdown, decodeAnchor(parts.slice(2).join("/"))))}</article>`;
    content.scrollTop = 0;
  } catch (error) {
    if (controller.signal.aborted) return;
    content.innerHTML = '<p>Не удалось загрузить правило.</p><button type="button" class="button">Повторить</button>';
    content.querySelector("button").addEventListener("click", () => openRule(ref));
  }
}

// General reference only: never use answer-specific rule_refs before checking.
let practiceReference = null;
function disposePracticeReference() {
  practiceReference?.dispose();
  practiceReference = null;
}
function mountPracticeReference(session) {
  const button = document.querySelector('#practice-rule');
  if (!button) return;
  const key = account.user.id + ':' + (session.remote?.id || session.items.map(item => item.id).join('|'));
  if (practiceReference?.key !== key) disposePracticeReference();
  if (!practiceReference) {
    const dialog = document.createElement('dialog');
    dialog.id = 'practice-reference';
    dialog.className = 'practice-reference';
    dialog.setAttribute('aria-labelledby', 'practice-reference-title');
    const initial = exerciseSection(session.items[0]);
    dialog.innerHTML = `<header class="reference-header"><h2 id="practice-reference-title">Правило</h2><button class="button" type="button" data-reference-close><span class="reference-desktop-label">Свернуть</span><span class="reference-mobile-label">К заданию</span></button></header><div class="reference-picker"><label for="reference-section">Тема</label><select id="reference-section"><option value="tenses">Tenses</option><option value="comparison">Adjectives (Degrees of Comparison)</option><option value="passive">Passive Voice</option><option value="reported">Reported Speech</option><option value="modals">Modal Verbs</option></select></div><div class="reference-reader theory-content" tabindex="0" role="region" aria-label="Текст правила"></div>`;
    document.body.append(dialog);
    const reader = dialog.querySelector('.reference-reader');
    const select = dialog.querySelector('select');
    select.value = initial;
    const wide = matchMedia('(min-width: 1200px)');
    const positions = new Map();
    let current = '', controller, expanded = false, previousOverflow = null, readerTop = 0, mapShell = null;
    const syncButton = () => {
      const toggle = document.querySelector('#practice-rule');
      toggle?.setAttribute('aria-expanded', String(expanded));
      if (toggle) toggle.textContent = expanded ? 'Скрыть правило' : 'Правило';
    };
    const unlock = () => {
      if (previousOverflow !== null) { document.body.style.overflow = previousOverflow; previousOverflow = null; }
    };
    const layout = () => {
      if (dialog.open) readerTop = reader.scrollTop;
      if (dialog.open) dialog.close();
      document.body.classList.toggle('practice-reference-open', expanded && wide.matches);
      unlock();
      if (expanded) {
        if (wide.matches) dialog.show();
        else { previousOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; dialog.showModal(); }
        reader.scrollTop = readerTop;
      }
      syncButton();
    };
    const collapse = () => {
      expanded = false;
      layout();
      document.querySelector('#practice-rule')?.focus({preventScroll:true});
    };
    const scrollToAnchor = anchor => {
      const target = [...reader.querySelectorAll('[id]')].find(node => node.id === decodeAnchor(anchor));
      if (target) reader.scrollTop += target.getBoundingClientRect().top - reader.getBoundingClientRect().top - 12;
    };
    const load = async (id, anchor = '') => {
      if (!GRAMMAR_SECTIONS[id]) return;
      const entries = state.theory.filter(row => grammarSectionForTheory(row.id)===id);
      if (!entries.length) return;
      positions.set(current, reader.scrollTop);
      current = id;
      select.value = id;
      controller?.abort();
      if (mapShell) { disposeTenseMap?.(); mapShell = null; }
      const request = new AbortController(); controller = request;
      reader.innerHTML = '<p role="status">Загружаем правило…</p>';
      if(id==='modals') {
        reader.innerHTML='<article data-reference-chapter="modals">'+modalRuleHtml('reference-modals-')+'</article>';
        initialiseModalRule(reader);reader.scrollTop=positions.get(id)||0;
        if(anchor)revealModalAnchor(reader,anchor);return;
      }
      if(id==='passive') {
        reader.innerHTML='<article data-reference-chapter="passive">'+passiveRuleHtml('reference-passive-')+'</article>';
        initialisePassiveRule(reader);reader.scrollTop=positions.get(id)||0;
        if(anchor)scrollToAnchor(anchor);return;
      }

      try {
        const chapters = await Promise.all(entries.map(async entry => {
          let markdown = ruleMarkdownCache.get(entry.file);
          if (!markdown) {
            const response = await fetch(entry.file, {signal:request.signal});
            if (!response.ok) throw Error('reference');
            markdown = await response.text(); ruleMarkdownCache.set(entry.file, markdown);
          }
          return {entry, markdown};
        }));
        if (request.signal.aborted || !dialog.isConnected) return;
        const contents = chapters.map(({entry, markdown}) => `<strong>${escapeHtml(entry.title)}</strong>${markdownHeadings(markdown).filter(h => h.level === 2).map(h => {
          const target = `reference-${entry.id}-${h.id}`;
          return `<a href="#${escapeHtml(target)}" data-reference-anchor="${escapeHtml(target)}">${escapeHtml(markdown.split(/\r?\n/)[h.index].replace(/^#+\s+/, ''))}</a>`;
        }).join('')}`).join('');
        reader.innerHTML = `<details class="reference-contents"><summary>Содержание темы</summary><nav aria-label="Содержание правила">${id === 'tenses' ? '<a href="#reference-map" data-reference-anchor="reference-map">Карта 12 времён</a>' : ''}${contents}</nav></details>${id === 'tenses' ? `<div id="reference-map">${tenseMapHtml()}</div>` : ''}${chapters.map(({entry,markdown}) => `<article data-reference-chapter="${escapeHtml(entry.id)}">${entry.id === "reported" ? reportedRuleHtml(markdown) : entry.id === "comparison" ? comparisonRuleHtml(markdown) : markdownToHtml(markdown)}</article>`).join('')}`;
        reader.querySelectorAll('[data-reference-chapter]').forEach(chapter => {
          chapter.querySelectorAll('[id]').forEach(node => { node.id = `reference-${chapter.dataset.referenceChapter}-${node.id}`; });
        });
        reader.querySelectorAll('.table-wrap').forEach(table => { table.tabIndex = 0; table.setAttribute('role', 'region'); table.setAttribute('aria-label', 'Таблица правила'); });
        mapShell = reader.querySelector('#tenses-map');
        if (mapShell) initialiseTenseMap();
        reader.scrollTop = positions.get(id) || 0;
        if (anchor) scrollToAnchor(anchor);
      } catch (error) {
        if (request.signal.aborted || !dialog.isConnected) return;
        reader.innerHTML = '<p role="status">Не удалось загрузить правило.</p><button type="button" class="button">Повторить</button>';
        reader.querySelector('button').addEventListener('click', () => load(id, anchor));
      }
    };
    select.addEventListener('change', () => load(select.value));
    const followReference = event => {
      if (!dialog.contains(event.target) && !mapShell?.contains(event.target)) return;
      const anchor = event.target.closest('[data-reference-anchor]');
      if (anchor) { event.preventDefault(); scrollToAnchor(anchor.dataset.referenceAnchor); return; }
      const link = event.target.closest('a[href^="#theory/"]');
      if (link) {
        event.preventDefault();
        const [,chapter,...parts] = link.getAttribute('href').slice(1).split('/');
        const topic = grammarSectionForTheory(chapter);
        const target = parts.length ? `reference-${chapter}-${decodeAnchor(parts.join('/'))}` : '';
        // Fullscreen moves the map outside the reader. Close it before following
        // its theory link, keeping the exercise and its draft on this route.
        if (mapShell) { disposeTenseMap?.(); mapShell = null; }
        void load(topic, target);
      }
    };
    document.addEventListener('click', followReference);
    dialog.querySelector('[data-reference-close]').addEventListener('click', collapse);
    dialog.addEventListener('cancel', event => { event.preventDefault(); collapse(); });
    dialog.addEventListener('close', () => { if (!dialog.open && expanded) collapse(); });
    const escape = event => {
      if (event.key === 'Escape' && expanded && wide.matches && !document.querySelector('dialog:modal')) { event.preventDefault(); collapse(); }
    };
    document.addEventListener('keydown', escape);
    wide.addEventListener('change', layout);
    practiceReference = {key, syncButton, toggle() {
      if (expanded) collapse();
      else { expanded = true; layout(); if (!current) void load(initial); dialog.querySelector('[data-reference-close]').focus({preventScroll:true}); }
    }, dispose() {
      controller?.abort(); expanded = false;
      if (mapShell) { disposeTenseMap?.(); mapShell = null; }
      unlock();
      wide.removeEventListener('change', layout); document.removeEventListener('keydown', escape);
      document.removeEventListener('click', followReference);
      dialog.remove(); document.body.classList.remove('practice-reference-open');
    }};
  }
  practiceReference.syncButton();
  button.addEventListener('click', () => practiceReference?.toggle());
}

async function loadExercises() {
  if (account.user?.role !== "teacher") throw new Error("Банк упражнений доступен только учителю.");
  const bankOwner = account.user.id;
  if (state.exercises) return state.exercises;
  const chunks = await Promise.all(state.manifest.parts.map((part) => fetchJson(part.file)));
  if (account.user?.role !== "teacher" || account.user.id !== bankOwner) throw new Error("Сеанс учителя изменился. Откройте практику заново.");
  state.exercises = chunks.flat();
  return state.exercises;
}

const COMPARISON_TARGETS = [
  { id: "cmp_forms", label: "Формы, орфография и исключения" },
  { id: "cmp_superlatives", label: "Превосходная степень и группа" },
  { id: "cmp_equality", label: "Сравнение, равенство и меньшая степень" },
  { id: "cmp_development", label: "Усилители, кратность и изменение" },
  { id: "cmp_precision", label: "Точность, контекст и смысловые ограничения" },
];
const MODAL_TARGETS = [{"id": "mv_S00", "label": "Смешанный выбор: все модальные", "rule": "R11"}, {"id": "mv_S01", "label": "Форма: без -s, без to", "rule": "R1"}, {"id": "mv_S02", "label": "Вопрос и отрицание без do", "rule": "R2"}, {"id": "mv_S03", "label": "Два модальных подряд нельзя", "rule": "R1"}, {"id": "mv_S04", "label": "Умение сейчас: can / be able to", "rule": "R3"}, {"id": "mv_S05", "label": "Разрешение: can / could / may", "rule": "R3"}, {"id": "mv_S06", "label": "Просьбы и предложения", "rule": "R3"}, {"id": "mv_S07", "label": "Предложение-идея: could / might", "rule": "R3"}, {"id": "mv_S08", "label": "Совет: should / ought to", "rule": "R3"}, {"id": "mv_S09", "label": "Вывод о настоящем", "rule": "R4"}, {"id": "mv_S10", "label": "Вывод о прошлом: modal + have V3", "rule": "R4"}, {"id": "mv_S11", "label": "Умение в прошлом", "rule": "R5"}, {"id": "mv_S12", "label": "Обязанность и умение в прошлом и будущем", "rule": "R5"}, {"id": "mv_S13", "label": "Упрёк и сожаление: should have V3", "rule": "R5"}, {"id": "mv_S14", "label": "Needn't have и didn't need to", "rule": "R5"}, {"id": "mv_S15", "label": "Не использованная возможность: could have V3", "rule": "R5"}, {"id": "mv_S16", "label": "Нереальное прошлое: would have V3", "rule": "R5"}, {"id": "mv_S17", "label": "Must и have to", "rule": "R6"}, {"id": "mv_S18", "label": "Сила обязанности: must / need to / should / ought to", "rule": "R6"}, {"id": "mv_S19", "label": "Mustn't и don't have to", "rule": "R7"}, {"id": "mv_S20", "label": "Needn't и don't need to", "rule": "R7"}, {"id": "mv_S21", "label": "Запрет: can't / mustn't / not allowed", "rule": "R7"}, {"id": "mv_S22", "label": "Have to и need to как обычные глаголы", "rule": "R8"}, {"id": "mv_S23", "label": "Be allowed to", "rule": "R8"}, {"id": "mv_S24", "label": "Be supposed to", "rule": "R8"}, {"id": "mv_S25", "label": "Had better", "rule": "R8"}, {"id": "mv_S26", "label": "Would rather", "rule": "R8"}, {"id": "mv_S27", "label": "Will: прогноз и решение", "rule": "R9"}, {"id": "mv_S28", "label": "Won't / wouldn't: отказ", "rule": "R9"}, {"id": "mv_S29", "label": "Would: вежливость и гипотеза", "rule": "R9"}, {"id": "mv_S30", "label": "Shall: предложения с I / we", "rule": "R9"}];
const PASSIVE_LEGACY_TARGETS = [{"id": "pv_simple", "label": "Основные формы"}, {"id": "pv_process", "label": "Действие в процессе"}, {"id": "pv_perfect", "label": "Завершённость и предшествование"}, {"id": "pv_modals", "label": "Модальные и going to"}, {"id": "pv_questions", "label": "Вопросы и отрицания"}, {"id": "pv_patterns", "label": "Особые конструкции"}, {"id": "pv_nonfinite", "label": "Инфинитив, -ing и reporting passive"}];
const PASSIVE_TARGETS = [{"id": "pv_present_simple", "label": "Present Simple"}, {"id": "pv_past_simple", "label": "Past Simple"}, {"id": "pv_future_simple", "label": "Future Simple"}, {"id": "pv_present_continuous", "label": "Present Continuous"}, {"id": "pv_present_perfect", "label": "Present Perfect"}, {"id": "pv_past_continuous", "label": "Past Continuous"}, {"id": "pv_past_perfect", "label": "Past Perfect"}, {"id": "pv_future_perfect", "label": "Future Perfect"}];
const REPORTED_TARGETS = [{"id": "rs01", "label": "Say / tell / ask"}, {"id": "rs02", "label": "Statements: Simple"}, {"id": "rs03", "label": "Statements: Continuous / Perfect"}, {"id": "rs04", "label": "Сохранение времени"}, {"id": "rs05", "label": "Местоимения и принадлежность"}, {"id": "rs06", "label": "Указатели времени"}, {"id": "rs07", "label": "Место и указательные слова"}, {"id": "rs08", "label": "Модальные значения"}, {"id": "rs09", "label": "Общие вопросы"}, {"id": "rs10", "label": "Специальные вопросы"}, {"id": "rs11", "label": "Утвердительные команды"}, {"id": "rs12", "label": "Запреты"}, {"id": "rs13", "label": "Просьбы"}, {"id": "rs14", "label": "Reporting verb + to"}, {"id": "rs15", "label": "Reporting verb + object + to"}, {"id": "rs16", "label": "Reporting verb + -ing"}, {"id": "rs17", "label": "Reporting verb + предлог + -ing"}, {"id": "rs18", "label": "Reporting verb + придаточная часть"}, {"id": "rs19", "label": "Выбор модели reporting verb"}, {"id": "rs20", "label": "Условные и продвинутые формы"}, {"id": "rs_mixed", "label": "Смешанные задания"}];
function exerciseSection(item) {
  if(item?.topic==='reported'||item?.id?.startsWith('rs-'))return 'reported';
  if(item?.topic==='modals'||item?.id?.startsWith('MV-'))return 'modals';
  if(item?.topic==='passive'||/^pv\d?-/.test(item?.id||''))return 'passive';
  return item?.id?.startsWith('cmp-')?'comparison':'tenses';
}
function targetSection(id) { return /^rs(?:\d|_)/.test(id)?'reported':id.startsWith('mv_')?'modals':id.startsWith('pv_')?'passive':id.startsWith('cmp_')?'comparison':'tenses'; }
function supportedResponseContract(item) {return item.response_contract==='bounded-v1'||(['equivalents-review-v1','manual-review-v1'].includes(item.response_contract)&&item.type==='translation_ru_en'&&item.blanks?.length===1);}
const PRACTICE_TENSES = TENSE_MAP.flatMap(row => row.items.map(item => ({
  id: item.name.toLowerCase().replaceAll(" ", "_"), label: item.name,
}))).concat({ id: "other_constructions", label: "Другие конструкции" }, COMPARISON_TARGETS, PASSIVE_LEGACY_TARGETS, PASSIVE_TARGETS, MODAL_TARGETS, REPORTED_TARGETS);

function exerciseTenses(item) {
  const targets = item.practice_tenses || (item.blanks?.length
    ? item.blanks.map(blank => blank.tense_or_construction) : item.tags || []);
  return [...new Set(targets.filter(target=>typeof target!=='string'||!target.startsWith('mv_R')).map(target => target === "future_time_clause" ? "present_simple"
    : PRACTICE_TENSES.some(tense => tense.id === target) ? target : "other_constructions"))];
}

function shuffled(values, random = Math.random) {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Least-covered targets get the next turn. Multi-tense exercises count towards
// every tested tense; exhausted pools never force repeats or unrelated tenses.
function balancedPractice(pool, count, random = Math.random) {
  if(pool.length&&pool.every(i=>i.practice_group&&Number.isFinite(i.practice_weight)&&i.practice_weight>0)){
    const groups=[...new Set(pool.map(i=>i.practice_group))].map(key=>({key,pool:pool.filter(i=>i.practice_group===key),quota:0}));
    if(groups.length>1){
      const size=Math.min(count,pool.length),weight=groups.reduce((n,g)=>n+g.pool[0].practice_weight,0);
      for(const g of groups){g.ideal=size*g.pool[0].practice_weight/weight;g.quota=Math.min(g.pool.length,Math.floor(g.ideal));}
      let assigned=groups.reduce((n,g)=>n+g.quota,0);
      while(assigned<size){const available=groups.filter(g=>g.quota<g.pool.length);available.sort((a,b)=>(b.ideal-b.quota)-(a.ideal-a.quota));available[0].quota++;assigned++;}
      return shuffled(groups.flatMap(g=>balancedPractice(g.pool,g.quota,random)),random);
    }
  }
  const remaining = shuffled(pool, random).map(item => ({ item, targets: exerciseTenses(item) }));
  const coverage = Object.fromEntries(remaining.flatMap(entry => entry.targets).map(target => [target, 0]));
  const types = {}, result = [];
  let previous = [];
  while (result.length < count && remaining.length) {
    const available = shuffled([...new Set(remaining.flatMap(entry => entry.targets))], random);
    available.sort((a, b) => coverage[a] - coverage[b] || Number(previous.includes(a)) - Number(previous.includes(b)));
    const target = available[0];
    let bestIndex = -1, bestScore = Infinity;
    remaining.forEach((entry, index) => {
      if (!entry.targets.includes(target)) return;
      const others = entry.targets.filter(value => value !== target);
      const score = others.reduce((sum, value) => sum + coverage[value] + 1, 0) * 1000
        + (types[entry.item.type] || 0) * 2 + Number(result.at(-1)?.type === entry.item.type);
      if (score < bestScore) { bestScore = score; bestIndex = index; }
    });
    if (bestIndex < 0) break;
    const [{ item, targets }] = remaining.splice(bestIndex, 1);
    result.push(item);
    targets.forEach(value => coverage[value]++);
    types[item.type] = (types[item.type] || 0) + 1;
    previous = targets;
  }
  return result;
}

function updatedPracticeSettings(saved,topic){
  if(topic!=='passive')return saved;
  const oldToNew={pv_simple:['pv_present_simple','pv_past_simple','pv_future_simple'],pv_process:['pv_present_continuous','pv_past_continuous'],pv_perfect:['pv_present_perfect','pv_past_perfect','pv_future_perfect']};
  const copy={...saved};if(Array.isArray(copy.tenses)&&copy.tenses.some(t=>PASSIVE_LEGACY_TARGETS.some(x=>x.id===t)))copy.tenses=[...new Set(copy.tenses.flatMap(t=>oldToNew[t]||(PASSIVE_LEGACY_TARGETS.some(x=>x.id===t)?PASSIVE_TARGETS.map(x=>x.id):[t])))];
  if(copy.type&&!['all','open_brackets','translation_ru_en','active_to_passive'].includes(copy.type))copy.type='all';
  return copy;
}
function practiceSettings(topic = "tenses") {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey("practice-settings:" + topic)));
    if (saved) return updatedPracticeSettings(saved,topic);
    const legacy = JSON.parse(localStorage.getItem(storageKey("practice-settings"))) || {};
    return (legacy.topic || "tenses") === topic ? updatedPracticeSettings(legacy,topic) : {};
  }
  catch { return {}; }
}

function selectedTenses(form) {
  const selected = [...form.querySelectorAll('input[name="tense"]:checked')].map(input => input.value);
  if (!form.elements.topic) return selected;
  return selected.filter(id => targetSection(id) === form.elements.topic.value);
}
function selectedFormats(form) {
  return [...form.querySelectorAll('input[name="format"]:checked')].filter(input=>!input.disabled).map(input=>input.value);
}
function setPracticeFormats(form, formats) {
  form.querySelectorAll('input[name="format"]').forEach(input=>{input.checked=!input.disabled&&(formats==='all'||formats.includes(input.value));});
}

function selectedLevels(form) {
  return [...form.querySelectorAll('input[name="level"]:checked')].map(input => input.value);
}

function assignmentSentenceKeys(item) {
  const prompt = item.prompt || "", options = item.options || [], texts = [];
  const gaps = prompt.match(/_{2,}/g) || [];
  texts.push(options.length && !gaps.length && item.type !== "meaning_choice" ? [prompt,...options].join("\n") : prompt);
  const completed = [];
  if (item.answer_text) completed.push(item.answer_text);
  if (options.length && item.type !== "meaning_choice") {
    for (const index of item.accepted_option_indices || [item.correct_option_index]) {
      const answer = options[index];
      if (typeof answer !== "string") continue;
      if (gaps.length) {
        const pieces = answer.split(/\s*\/\s*/); let n = 0;
        completed.push(prompt.replace(/_{2,}/g, () => pieces.length === gaps.length ? pieces[n++] : answer));
      } else if (answer.trim().split(/\s+/).length >= 4) completed.push(answer);
    }
  } else if (!item.blanks?.length && !options.length) {
    completed.push(item.answer, ...(item.accepted_answers || []));
  }
  texts.push(...completed);
  for (const text of completed) if (typeof text === "string") {
    texts.push(...text.split(/[.!?]+\s+/).filter(part => part.trim().split(/\s+/).length >= 4));
  }
  const normaliseSentence = text => String(text).normalize("NFKC").toLowerCase().replace(/^\s*\d+\s*[.)]\s*/, "").replace(/[^\p{L}\p{N}]+/gu," ").trim();
  return [...new Set([`id:${item.id}`, ...texts.filter(text => typeof text === "string" && text.trim()).map(text => `sentence:${normaliseSentence(text)}`)])];
}

function uniqueAssignmentPool(pool) {
  const used = new Set();
  return pool.filter(item => {
    const keys = assignmentSentenceKeys(item);
    if (keys.some(key => used.has(key))) return false;
    keys.forEach(key => used.add(key)); return true;
  });
}

// Ready selections use the same filters and permission checks as custom practice.
function practicePresets(topic) {
  if(topic==='modals')return [{id:'modals-short',title:'Смешанная тренировка',description:'Пять заданий на разные значения модальных глаголов.',tenses:MODAL_TARGETS.map(x=>x.id),levels:['basic','medium'],type:'modal_gap',count:5}];
  const common = {type:'open_brackets', levels:['basic','medium'], count:10};
  const simplePassive = ['pv_present_simple','pv_past_simple','pv_future_simple'];
  const shortTopics = {tenses:['present_simple','past_simple','future_simple'], passive:simplePassive, comparison:['cmp_forms','cmp_superlatives']};
  if (!shortTopics[topic]) return [];
  const presets = topic === 'tenses' ? [
    {...common,id:'present-pair',title:'Present Simple vs Present Continuous',description:'Привычки и факты или действие сейчас.',tenses:['present_simple','present_continuous']},
    {...common,id:'past-pair',title:'Past Simple vs Present Perfect',description:'Завершённое прошлое или связь с настоящим.',tenses:['past_simple','present_perfect']},
  ] : topic === 'passive' ? [
    {...common,id:'passive-core',title:'Основные формы пассива',description:'Present, Past и Future Simple в пассиве.',tenses:simplePassive},
  ] : [];
  return presets.concat({id:'short',title:'Короткая тренировка',description:'Пять заданий на базовые формы.',tenses:shortTopics[topic],levels:['basic'],type:'open_brackets',count:5});
}
function practicePresetsMarkup(topic, assigning) {
  if(topic==='reported')return '<details class="practice-presets"><summary>Практика по подтемам · 20 блоков</summary><div class="comparison-shortcuts">'+REPORTED_TARGETS.map(t=>'<a class="button" href="#practice/reported/'+t.id+'">'+escapeHtml(t.label)+'</a>').join('')+'</div></details>';
  return `<section class="practice-presets" aria-labelledby="practice-presets-title"><h2 id="practice-presets-title">Готовые тренировки</h2><div class="practice-preset-grid">${practicePresets(topic).map(preset=>`<article class="practice-preset"><h3>${escapeHtml(preset.title)}</h3><p>${escapeHtml(preset.description)}</p><p class="preset-topics">${preset.tenses.map(id=>escapeHtml(PRACTICE_TENSES.find(t=>t.id===id)?.label||id)).join(' · ')}</p><p class="subtle">${preset.count} заданий · ${preset.levels.map(level=>escapeHtml(levelLabel(level))).join(', ')} · ${escapeHtml(TYPE_LABELS[preset.type])}</p><div class="preset-actions"><button type="button" class="button primary" data-practice-preset="${preset.id}" data-preset-action="start">${assigning?'Подготовить набор':`Начать ${preset.count} заданий`}</button><button type="button" class="button" data-practice-preset="${preset.id}" data-preset-action="customize">Настроить<span class="sr-only">: ${escapeHtml(preset.title)}</span></button></div></article>`).join('')}</div><p id="preset-status" role="status" aria-live="polite"></p></section>`;
}
function applyPracticePreset(form, preset) {
  for (const name of ['tense','level']) {
    const values = name === 'tense' ? preset.tenses : preset.levels;
    form.querySelectorAll(`input[name="${name}"]`).forEach(input=>{input.checked=values.includes(input.value);});
  }
  setPracticeFormats(form,[preset.type]);
  form.elements.count.value=String(preset.count);
  if(form.elements.title)form.elements.title.value=preset.title;
}
function bindPracticePresets(form, topic) {
  const container=document.querySelector('.practice-presets');
  if(!container)return;
  container.addEventListener('click',async event=>{
    const button=event.target.closest('[data-practice-preset]');
    if(!button||form.dataset.presetBusy)return;
    const preset=practicePresets(topic).find(item=>item.id===button.dataset.practicePreset);
    if(!preset)return;
    const owner=account.user?.id, route=location.hash, output=container.querySelector('#preset-status');
    const active=()=>form.isConnected&&account.user?.id===owner&&location.hash===route;
    form.dataset.presetBusy='true';form.inert=true;
    container.querySelectorAll('button').forEach(item=>item.disabled=true);
    output.textContent='Подбираем задания…';
    try {
      applyPracticePreset(form,preset);
      let size;
      if(account.user?.role==='student')size=(await previewStudentPractice(form))?.size;
      else {await loadExercises();if(!active())return;updateAvailable();size=Math.min(filteredExercises(form).length,preset.count);}
      if(!active())return;
      if(size!==preset.count||form.querySelector('[type=submit]').disabled){
        output.textContent=`Подборка пока недоступна целиком. Проверьте доступность и измените фильтры ниже.`;
        return;
      }
      output.textContent=`Выбрано: ${preset.title}. ${preset.count} заданий.`;
      form.inert=false;
      if(button.dataset.presetAction==='start')await startSession({preventDefault(){},currentTarget:form});
      else {form.scrollIntoView({behavior:'smooth',block:'start'});form.querySelector('[name="format"]:checked')?.focus({preventScroll:true});}
    } catch(error){if(active())output.textContent=error.message;}
    finally {form.inert=false;delete form.dataset.presetBusy;container.querySelectorAll('button').forEach(item=>item.disabled=false);}
  });
}

const OFFLINE_PRACTICE_MESSAGE = 'Нет соединения. Тренировка откроется, когда появится интернет';
function renderPractice(student = null, topic = location.hash.split("/")[1], studentAllowed = false) {
  if (!navigator.onLine) { syncRouteNav(); app.innerHTML = `<h1>Практика</h1><p role="status">${escapeHtml(OFFLINE_PRACTICE_MESSAGE)}</p><a class="button" href="#grammar">Изучить теорию</a>`; return; }
  if (student?.assignmentEdit) topic = exerciseSection(student.assignmentEdit.items[0]);
  if (!account.user) { syncRouteNav(); app.innerHTML='<h1>Практика</h1><p>Ученикам доступны задания, назначенные учителем. Войдите в свой кабинет.</p><a class="button primary" href="#profile">Войти в кабинет</a> <a class="button" href="#theory/foundations">Изучить теорию</a>'; return; }
  if (account.user.role === "student" && !studentAllowed) return renderStudentPractice(topic);
  if (!GRAMMAR_SECTIONS[topic]) return renderGrammar("", true, student);
  syncRouteNav();
  const section = GRAMMAR_SECTIONS[topic];
  document.title = `${student?.assignmentEdit ? "Редактировать задание" : student ? "Назначить задание" : "Практика"}: ${section.title} — Grammar NOEON`;
  const levels = Object.keys(LEVEL_LABELS).filter(level => state.manifest.levels3?.[level] > 0);
  app.innerHTML = `
    <div class="eyebrow">Практика · ${section.title}</div>
    ${student ? `<a class="button" href="#student/${escapeHtml(student.id)}">← К ученику</a>` : ""}
    <h1>${student?.assignmentEdit ? "Изменить подборку" : student ? "Назначить задание" : section.title}</h1>
    ${student ? `<p>Ученик: <strong>${escapeHtml(student.name)}</strong>. ${student.assignmentEdit ? "Можно сохранить текущие упражнения или выбрать новые. Предложения из других назначений исключены." : "Только новые предложения: всё, что вы уже назначали этому ученику, исключено."}</p>` : ""}
    <p class="lead">Выберите готовую тренировку или задайте свои фильтры ниже.</p>
    ${student?.assignmentEdit ? "" : practicePresetsMarkup(topic, !!student)}
    <form id="practice-form" class="filters">
      <input type="hidden" name="topic" value="${topic}">
      ${student ? '<div class="assignment-title field"><label for="assignment-title">Название задания</label><input id="assignment-title" name="title" required maxlength="160" value="Практика времён"></div>' : ""}
      <fieldset class="practice-tenses" data-section="tenses"><legend>Какие времена тренировать</legend>
        <div class="tense-actions"><button class="button" type="button" data-tense-action="all">Выбрать все</button><button class="button" type="button" data-tense-action="none">Снять выбор</button></div>
        <div class="tense-options">${TENSE_MAP.map(row => `<fieldset class="tense-group"><legend>${row.time}</legend>${row.items.map(item => `<label><input type="checkbox" name="tense" value="${item.name.toLowerCase().replaceAll(" ", "_")}" checked><span>${item.name}</span></label>`).join("")}</fieldset>`).join("")}</div>
        <label class="tense-extra"><input type="checkbox" name="tense" value="other_constructions" checked><span>Другие конструкции: going to, future in the past и used to</span></label>
        <p class="subtle">Задания на несколько времён появятся только тогда, когда выбраны все нужные для них времена. Без повторов внутри тренировки.</p>
      </fieldset>
      <fieldset class="practice-tenses" data-section="passive"><legend>Какие формы тренировать</legend><div class="tense-actions"><button class="button" type="button" data-tense-action="all">Выбрать все темы</button><button class="button" type="button" data-tense-action="none">Снять выбор</button></div><div class="level-options">${PASSIVE_TARGETS.map(target=>`<label><input type="checkbox" name="tense" value="${target.id}" checked><span>${target.label}</span></label>`).join('')}</div><p>При выборе всех форматов: скобки — 80%, перевод — 10%, Active → Passive — 10%. Все переводы проверяет преподаватель.</p><a href="#theory/passive">Открыть правило Passive Voice →</a></fieldset>
      <fieldset class="practice-tenses" data-section="comparison" hidden><legend>Какие сравнения тренировать</legend><div class="tense-actions"><button class="button" type="button" data-tense-action="all">Выбрать все темы</button><button class="button" type="button" data-tense-action="none">Снять выбор</button></div><div class="level-options">${COMPARISON_TARGETS.map(target => `<label><input type="checkbox" name="tense" value="${target.id}" checked><span>${target.label}</span></label>`).join("")}</div><p>В заданиях со скобками вводите форму или сравнительное сочетание по условию задания. Уровни — учебные ориентиры. Все задания проверяются автоматически: конкретные пропуски и выбор вариантов.</p><a href="#theory/comparison">Открыть справочник по сравнениям →</a></fieldset>
      <fieldset class="practice-tenses" data-section="modals"><legend>Какие модальные глаголы тренировать</legend><p>Выберите весь раздел, группу правил или отдельные подтемы. Можно сочетать несколько подтем.</p><div class="tense-actions"><button class="button" type="button" data-tense-action="all">Весь раздел</button><button class="button" type="button" data-tense-action="none">Снять выбор</button></div><div class="modal-targets">${[...new Set(MODAL_TARGETS.map(t=>t.rule))].sort((a,b)=>Number(a.slice(1))-Number(b.slice(1))).map(rule=>`<details><summary>${escapeHtml(typeof MODAL_RULE_TITLES!=='undefined'?MODAL_RULE_TITLES['mv-'+rule.toLowerCase()]||rule:rule)}</summary><button class="button" type="button" data-modal-rule="${rule}">Выбрать эту группу</button>${MODAL_TARGETS.filter(t=>t.rule===rule).map(target=>`<label><input type="checkbox" name="tense" value="${target.id}" checked><span>${escapeHtml(target.label)}</span></label>`).join('')}</details>`).join('')}</div><a href="#theory/modals">Открыть правило Modal Verbs →</a></fieldset>
      <fieldset class="practice-tenses" data-section="reported"><legend>Какие подтемы тренировать</legend><div class="tense-actions"><button class="button" type="button" data-tense-action="all">Выбрать все подтемы</button><button class="button" type="button" data-tense-action="none">Снять выбор</button></div><div class="level-options">${REPORTED_TARGETS.map(target=>`<label><input type="checkbox" name="tense" value="${target.id}" checked><span>${escapeHtml(target.label)}</span></label>`).join('')}</div><p>Общие и специальные вопросы, модели reporting verbs выбираются отдельно. «Смешанные задания» — комплексные упражнения; при выборе всех подтем используется общий банк.</p><a href="#theory/reported">Открыть правило Reported Speech →</a></fieldset>
      <fieldset class="practice-levels"><legend>Уровни сложности</legend><div class="tense-actions"><button class="button" type="button" data-level-action="all">Все уровни</button><button class="button" type="button" data-level-action="none">Снять выбор уровней</button></div><div class="level-options">${levels.map(level => `<label><input type="checkbox" name="level" value="${escapeHtml(level)}" checked><span>${escapeHtml(levelLabel(level))}</span></label>`).join("")}</div></fieldset>
      <fieldset class="practice-formats"><legend>Форматы заданий</legend><p>Можно выбрать несколько.</p><div class="tense-actions"><button class="button" type="button" data-format-action="all">Все форматы</button><button class="button" type="button" data-format-action="none">Снять выбор форматов</button></div><div class="level-options">${Object.entries(state.manifest.section_types?.[topic] || state.manifest.types).map(([type,count])=>`<label><input type="checkbox" name="format" value="${escapeHtml(type)}" checked><span>${escapeHtml(TYPE_LABELS[type])}${account.user.role === "teacher" ? ` · ${count}` : ""}</span></label>`).join('')}</div></fieldset>
      <div class="field"><label for="count">Количество заданий</label><input id="count" name="count" type="number" inputmode="numeric" min="1" max="50" step="1" value="20" required aria-describedby="count-hint"><small id="count-hint">Введите число от 1 до 50.</small></div>
      <div class="filter-summary"><div id="available" role="status" aria-live="polite">Загружаем задания…</div><button class="button primary" type="submit" disabled>${student ? "Проверить набор" : "Начать тренировку →"}</button></div>
      <p id="practice-error" class="assignment-title" role="alert"></p>
    </form>
    `;

  const form = document.querySelector("#practice-form");
  if (student) form.dataset.assignmentStudent = student.id;
  if(student&&!student.assignmentEdit&&typeof restoreTeacherLibraryDraft==='function'){form.inert=true;const presets=app.querySelector('.practice-presets');if(presets)presets.inert=true;}
  if (student?.assignmentEdit) form.assignmentEdit = student.assignmentEdit;
  if (student) form.assignmentAvailableIds = new Set(student.availableIds);
  form.querySelectorAll("[data-section]").forEach(fieldset => { if (fieldset.dataset.section !== topic) fieldset.remove(); });
  form.querySelectorAll('[data-modal-rule]').forEach(button=>button.addEventListener('click',()=>{
    const ids=MODAL_TARGETS.filter(t=>t.rule===button.dataset.modalRule).map(t=>t.id);
    form.querySelectorAll('[name="tense"]').forEach(input=>input.checked=ids.includes(input.value));
    updateAvailable();
  }));
  const saved = practiceSettings(topic);
  if(Number.isInteger(Number(saved.count))&&Number(saved.count)>=1&&Number(saved.count)<=50)form.elements.count.value=String(saved.count);
  const savedFormats=Array.isArray(saved.types)?saved.types:saved.type&&saved.type!=='all'?[saved.type]:null;
  if(savedFormats)setPracticeFormats(form,savedFormats);
  form.querySelectorAll('[data-format-action]').forEach(button=>button.addEventListener('click',()=>{
    setPracticeFormats(form,button.dataset.formatAction==='all'?'all':[]);updateAvailable();
  }));
  if (Array.isArray(saved.tenses)) form.querySelectorAll('input[name="tense"]').forEach(input => { if (targetSection(input.value) === topic) input.checked = saved.tenses.includes(input.value); });
  const savedLevels = Array.isArray(saved.levels) && saved.levels.every(level => levels.includes(level)) ? saved.levels : levels;
  form.querySelectorAll('input[name="level"]').forEach(input => { input.checked = savedLevels.includes(input.value); });
  form.querySelectorAll("[data-level-action]").forEach(button => button.addEventListener("click", () => {
    form.querySelectorAll('input[name="level"]').forEach(input => { input.checked = !input.disabled && button.dataset.levelAction === "all"; });
    updateAvailable();
  }));
  form.querySelectorAll("[data-tense-action]").forEach(button => button.addEventListener("click", () => {
    button.closest("fieldset").querySelectorAll('input[name="tense"]').forEach(input => { input.checked = button.dataset.tenseAction === "all"; });
    updateAvailable();
  }));
  if (student?.assignmentEdit) {
    const edit=student.assignmentEdit, tenses=[...new Set(edit.items.flatMap(exerciseTenses))], editLevels=new Set(edit.items.map(item=>item.level));
    form.elements.topic.value = exerciseSection(edit.items[0]);
    form.elements.title.value=edit.title;
    form.querySelectorAll('[name="tense"]').forEach(input=>input.checked=tenses.includes(input.value));
    form.querySelectorAll('[name="level"]').forEach(input=>input.checked=!levels.some(level=>editLevels.has(level))||editLevels.has(input.value));
    setPracticeFormats(form,[...new Set(edit.items.map(item=>item.type))]);
    form.elements.count.value=String(edit.items.length);
    form.querySelector('[type=submit]').textContent='Проверить набор';
  }
  bindPracticePresets(form, topic);
  form.addEventListener("change", event => { if(event.target !== form.elements.count) updateAvailable(); });
  form.elements.count.addEventListener('input',updateAvailable);
  form.addEventListener("submit", startSession);
  if (student && !student.assignmentEdit && form.elements.topic.value === "comparison") form.elements.title.value = "Практика сравнений";
  if(student&&!student.assignmentEdit&&topic==="passive")form.elements.title.value="Практика пассива";
  if(student&&!student.assignmentEdit&&topic==="reported")form.elements.title.value="Косвенная речь";
  if(student&&!student.assignmentEdit&&topic==="modals")form.elements.title.value="Практика модальных глаголов";
  const requested=decodeAnchor(location.hash.split('/')[2]||'');
  if(topic==='modals'&&/^mv_R(?:[1-9]|1[01])$/.test(requested)) {
    const ids=MODAL_TARGETS.filter(t=>'mv_'+t.rule===requested).map(t=>t.id);
    form.querySelectorAll('[name="tense"]').forEach(input=>input.checked=ids.includes(input.value));
    setPracticeFormats(form,'all');
  }
  if(PRACTICE_TENSES.some(t=>t.id===requested)&&targetSection(requested)===topic) {
    form.querySelectorAll('[name="tense"]').forEach(input=>input.checked=input.value===requested);
    form.querySelectorAll('[name="level"]').forEach(input=>input.checked=!input.disabled);
    setPracticeFormats(form,'all');
  }
  if (account.user.role === "student") updateAvailable();
  else loadExercises().then(async()=>{if(form.isConnected){updateAvailable();if(typeof restoreTeacherLibraryDraft==='function')await restoreTeacherLibraryDraft(form);}}).catch(error=>{if(form.isConnected&&account.user?.role==='teacher')showError(error);});
}

function filteredExercises(form) {
  if (!state.exercises) return [];
  const levels = selectedLevels(form);
  const formats = selectedFormats(form);
  const tenses = selectedTenses(form);
  const pool = state.exercises.filter((item) => {
    const targets = exerciseTenses(item);
    return targets.length && targets.every(target => tenses.includes(target))
      && levels.includes(item.level) && formats.includes(item.type)
      && (!form.assignmentAvailableIds || form.assignmentAvailableIds.has(item.id));
  });
  return form.assignmentAvailableIds ? uniqueAssignmentPool(pool) : pool;
}

function practiceCountError(form, minimum=Math.max(1,Number(form.elements.count.min)||1)) {
  const count=Number(form.elements.count.value);
  return Number.isInteger(count)&&count>=minimum&&count<=50?'':`Введите целое количество заданий от ${minimum} до 50.`;
}
function practiceFilterPayload(form) {
  return {topic:form.elements.topic.value,tenses:selectedTenses(form),levels:selectedLevels(form),types:selectedFormats(form),count:Number(form.elements.count.value)};
}
let previewSequence = 0;
async function previewStudentPractice(form) {
  const sequence=++previewSequence, owner=account.user?.id, filters=practiceFilterPayload(form);
  form.querySelector('[type=submit]').disabled=true;
  const output=form.querySelector('#available'), errorNode=form.querySelector('#practice-error');
  output.textContent='Подбираем задания…';errorNode.textContent='';
  localStorage.setItem(storageKey('practice-settings:'+filters.topic),JSON.stringify(filters));
  if(!filters.types.length){output.textContent='В тренировке: 0.';errorNode.textContent='Выберите хотя бы один формат.';return;}
  const countError=practiceCountError(form,1);
  if(countError){output.textContent='';errorNode.textContent=countError;return;}
  try {
    const result=await accountRequest('practice/preview',filters);
    if(sequence!==previewSequence||!form.isConnected||owner!==account.user?.id)return;
    output.textContent=`В тренировке: ${result.size}.`;
    const missing=result.missing.map(id=>PRACTICE_TENSES.find(t=>t.id===id)?.label||id);
    form.elements.count.min=String(filters.topic==='tenses'?Math.max(1,result.coverage):1);
    errorNode.textContent=practiceCountError(form)||(filters.topic==='tenses'&&missing.length?`Нет заданий для: ${missing.join(', ')}. Измените фильтры.`:'');
    let hint=form.querySelector('#count-hint');if(!hint){hint=document.createElement('small');hint.id='count-hint';form.elements.count.after(hint);}
    hint.textContent=filters.topic==='tenses'?`От ${Math.max(1,result.coverage)} до 50 — по заданию на каждое время. Итог: ${result.size}.`:`От 1 до 50. В наборе: ${result.size}.`;
    form.querySelector('[type=submit]').disabled=!result.canStart||!!errorNode.textContent;
    return result;
  } catch(error) {if(sequence===previewSequence&&form.isConnected&&owner===account.user?.id){output.textContent='';errorNode.textContent=error.message;}}
}
function updateAvailable() {
  const form = document.querySelector("#practice-form");
  if (!form) return;
  const topic = form.elements.topic?.value || "tenses";
  form.querySelectorAll("[data-section]").forEach(section => { section.hidden = section.dataset.section !== topic; });
  const tenses = selectedTenses(form);
  if(account.user?.role==='student') {void previewStudentPractice(form);return;}
  if (!state.exercises) return;
  const sectionPool = state.exercises.filter(item => exerciseSection(item) === topic);
  form.querySelectorAll('input[name="format"]').forEach(input=>{
    const total=sectionPool.filter(item=>item.type===input.value).length;
    input.disabled=!total;if(!total)input.checked=false;
    input.nextElementSibling.textContent=`${TYPE_LABELS[input.value]} · ${total}`;
  });
  form.querySelectorAll('[name="level"]').forEach(input=>{
    const total=sectionPool.filter(item=>item.level===input.value).length;
    input.disabled=!total;if(!total)input.checked=false;
    input.nextElementSibling.textContent=`${levelLabel(input.value)} · ${total.toLocaleString("ru-RU")}`;
  });
  const levels = selectedLevels(form);
  localStorage.setItem(storageKey("practice-settings:" + topic), JSON.stringify({ topic, tenses, levels, types: selectedFormats(form), count: form.elements.count.value }));
  const pool = filteredExercises(form), count = pool.length;
  const covered = new Set(pool.flatMap(exerciseTenses));
  const missing = PRACTICE_TENSES.filter(tense => tenses.includes(tense.id) && !covered.has(tense.id));
  const size = Math.min(count, topic !== "tenses" ? Number(form.elements.count.value) : Math.max(Number(form.elements.count.value), covered.size));
  form.elements.count.min=String(topic==='tenses'?Math.max(1,covered.size):1);
  const countError=practiceCountError(form);
  let hint=document.getElementById('count-hint');
  if(!hint){hint=document.createElement('small');hint.id='count-hint';form.elements.count.after(hint);}
  hint.textContent=countError?countError:topic==='tenses'?`От ${Math.max(1,covered.size)} до 50 — по заданию на каждое время. Итог: ${size}.`:`От 1 до 50. В наборе: ${size}.`;
  document.querySelector('#available').textContent=countError?`Доступно ${count.toLocaleString('ru-RU')}`:`Доступно ${count.toLocaleString('ru-RU')} · В тренировке ${size}`;
  document.querySelector('#practice-error').textContent=countError||(!levels.length?'Выберите хотя бы один уровень.':!tenses.length?'Выберите хотя бы одну тему.':!selectedFormats(form).length?'Выберите хотя бы один формат.':topic==='tenses'&&missing.length?`Нет заданий для: ${missing.map(t=>t.label).join(', ')}. Измените фильтры.`:'');
  form.querySelector("button[type=submit]").disabled = !!countError || count === 0 || (topic === "tenses" && missing.length > 0);
}

async function startSession(event) {
  event.preventDefault();
  if (!navigator.onLine) { toast(OFFLINE_PRACTICE_MESSAGE); return; }
  const form = event.currentTarget;
  const countError=practiceCountError(form);
  if(countError){form.querySelector('#practice-error').textContent=countError;return;}
  if(account.user?.role==='student') {
    const owner=account.user.id, originalRoute=location.hash,button=form.querySelector('[type=submit]');button.disabled=true;
    try {
      const started=await accountRequest('practice/start',practiceFilterPayload(form));
      if(account.user?.id!==owner||location.hash!==originalRoute)return;
      const saved=await accountRequest('practice/'+encodeURIComponent(started.id));
      if(account.user?.id!==owner||location.hash!==originalRoute)return;
      state.session={items:saved.items,...(typeof saved.contentOutdated==="boolean"?{contentOutdated:saved.contentOutdated}:{}),index:saved.index,answers:saved.answers,correct:saved.correct,checked:false,draft:saved.draft,remote:{id:saved.id,revision:saved.revision}};
      saveSession();location.hash='session';
    } catch(error){if(account.user?.id===owner&&form.isConnected){button.disabled=false;showAccountError('#practice-error',error);}}
    return;
  }
  if (account.user?.role !== "teacher") { location.hash="practice"; return; }
  const button = form.querySelector("button[type=submit]");
  const defaultLabel = form.dataset.assignmentStudent ? "Проверить набор" : "Начать тренировку →";
  const owner = account.user?.id, originalRoute = location.hash;
  button.disabled = true;
  button.textContent = "Готовим задания…";
  try { await loadExercises(); }
  catch (error) { if(account.user?.id!==owner||location.hash!==originalRoute)return; button.textContent = defaultLabel; updateAvailable(); showError(error); return; }
  if(account.user?.id!==owner||location.hash!==originalRoute)return;
  const pool = filteredExercises(form);
  const covered = new Set(pool.flatMap(exerciseTenses));
  const comparison = form.elements.topic?.value !== "tenses";
  if (!pool.length || (!comparison && selectedTenses(form).some(target => !covered.has(target)))) { button.textContent = defaultLabel; updateAvailable(); return; }
  const count = Math.min(comparison ? Number(form.elements.count.value) : Math.max(Number(form.elements.count.value), covered.size), pool.length);
  const selected = balancedPractice(pool, count);
  if (form.dataset.assignmentStudent) {
    renderAssignmentPreview(form, selected);
    return;
  }
  let remote = null;
  if (account.user) {
    try { remote = await accountRequest("practice/start", { ids: selected.map(item => item.id) }); }
    catch (error) { button.disabled = false; button.textContent = "Начать тренировку →"; toast(error.message); return; }
  }
  state.session = { items: selected, index: 0, correct: 0, answers: [], checked: false, ...(remote ? { remote } : {}) };
  saveSession();
  location.hash = "session";
}

const stripSourceNumber = (text = "") => String(text).replace(/^\s*\d+\s*[.)]\s+/, "");
function displayPrompt(item) {
  const generic = item?.type === "multiple_choice" && item.prompt === "Выберите грамматически корректное предложение.";
  const label = item?.summary || (generic ? item.options?.[item.correct_option_index] || item.answer : null);
  return stripSourceNumber(label || item?.prompt || "").replace(/\{\{(\d+):[^}]*}}/g, "___($1)");
}
function submittedDisplay(item, submitted) {
  if (Array.isArray(submitted)) return submitted.map(value=>submittedDisplay(item,value)).join(" · ");
  return stripSourceNumber(item?.options && Number.isInteger(Number(submitted)) && submitted !== "" && submitted !== null
    ? item.options[Number(submitted)] ?? submitted : submitted ?? "—");
}
let transientHistory = null;
function lightHistoryAttempt(attempt) {
  const pick = (value,keys) => Object.fromEntries(keys.filter(k=>value?.[k]!==undefined).map(k=>[k,value[k]]));
  return {...pick(attempt,['id','date','source','total','index','correct','score','maxScore','pending','levels','types','status']),answers:(attempt.answers||[]).map(answer=>({
    ...pick(answer,['id','correct','submitted']),
    fields:(answer.fields||[]).map(f=>pick(f,['submitted','correct','verified','diagnostic'])),
    item:{...pick(answer.item,['id','type','prompt','summary','correct_option_index','options','answer','answer_text','explanation_ru','rule_refs','practice_tenses','tags','level']),
      ...(answer.item?.blanks ? {blanks:answer.item.blanks.map(b=>pick(b,['answer','explanation_ru','rule_refs','tense_or_construction']))} : {})}
  }))};
}
let toastTimer;
function toast(message) {
  let node = document.getElementById("toast");
  if (!node) { node = document.createElement("div"); node.id = "toast"; node.setAttribute("role", "status"); document.body.append(node); }
  node.textContent = String(message); node.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { node.hidden = true; }, 2300);
}
function inlineAnswers(item) {
  if(exerciseSection(item)==='modals'&&item.type==='modal_gap')return true;
  return !item.options && item.blanks?.length && (item.type === "context_cloze" || (item.type === "open_brackets" && (item.blanks.length > 1 || ["passive","reported"].includes(exerciseSection(item)))));
}
function blankCue(item, index) {
  const blank = item.blanks[index];
  const marker = item.type === "context_cloze"
    ? [...item.prompt.matchAll(/\{\{(\d+):([^}]+)}}/g)].find(m => Number(m[1]) === index + 1)?.[2]
    : [...item.prompt.matchAll(/\(([^)]+)\)/g)][index]?.[1];
  const parts = (marker || "").split("/");
  const words = blank.supplied_words?.length ? blank.supplied_words : parts.length > 1 ? parts.slice(0,-1).map(w=>w.trim()).filter(Boolean) : [];
  const rawVerb=blank.base_adjective || blank.base_verb || parts.at(-1) || "Ответ";
  const verb = ["passive","reported"].includes(exerciseSection(item)) ? rawVerb.trim() : rawVerb.replace(/^to\s+/, "").trim();
  return { verb, words, display: [...words, verb].join(" / ") };
}
function blankControl(item, index, inline = false) {
  if(exerciseSection(item)==='modals'&&item.blanks[index]?.modal_options?.length) {
    const options=shuffled(item.blanks[index].modal_options);
    return `<span class="${inline?'inline-blank':'field'}"><label for="blank-${index}" class="${inline?'blank-number':''}">${index+1}</label><select class="modal-answer-select" id="blank-${index}" data-answer-index="${index}" aria-label="Пропуск ${index+1}" lang="en"><option value="">Выберите…</option>${options.map(option=>`<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`).join('')}</select><small class="field-correction" hidden></small></span>`;
  }
  const cue=blankCue(item,index), passive=['passive','reported'].includes(exerciseSection(item));
  const hint=passive&&inline?`<small class="passive-cue">(${escapeHtml(cue.display)})</small>`:cue.words.length?`<small class="supplied-note">В скобках: ${escapeHtml(cue.words.join(' / '))}. Используйте по инструкции задания.</small>`:'';
  return `<span class="${inline?'inline-blank':'field'}"><label for="blank-${index}" class="${inline?'blank-number':''}">${index+1}${inline?'':`. ${escapeHtml(cue.display)}`}</label><input class="answer-input" id="blank-${index}" data-answer-index="${index}" placeholder="${escapeHtml(cue.verb)}" aria-label="${index+1}. ${escapeHtml(cue.display)}" size="12" lang="en" autocomplete="off" spellcheck="false">${hint}<small class="field-correction" hidden></small></span>`;
}

function initialiseWordOrder(form,item) {
  if(item.type!=='word_order')return;
  const input=form.querySelector('[data-answer-index="0"]'),chosen=[];
  let remaining=input.value;
  for(let n=0;n<item.blocks.length&&remaining;n++){
    const ix=item.blocks.findIndex((b,i)=>!chosen.includes(i)&&(remaining===b||remaining.startsWith(b+' ')));
    if(ix<0)break;chosen.push(ix);remaining=remaining.slice(item.blocks[ix].length).trimStart();
  }
  const sync=()=>form.querySelectorAll('[data-word-block]').forEach(b=>b.disabled=!!state.session?.checked||chosen.includes(Number(b.dataset.wordBlock)));
  const update=()=>{input.value=chosen.map(i=>item.blocks[i]).join(' ');input.dispatchEvent(new Event('input',{bubbles:true}));sync();};
  sync();form.querySelectorAll('[data-word-block]').forEach(b=>b.addEventListener('click',()=>{if(state.session?.checked)return;chosen.push(Number(b.dataset.wordBlock));update();}));
  form.querySelector('[data-word-reset]').addEventListener('click',()=>{if(state.session?.checked)return;chosen.length=0;update();});
}

function resizeAnswerInput(input) {
  const size=Math.max(12,Array.from(input.value||'').length+2);
  input.size=size;
  if(!globalThis.CSS?.supports?.('field-sizing','content'))input.style.width=`${size}ch`;
}
function initialiseAnswerSizing(form) {
  form.querySelectorAll('.answer-input').forEach(input=>{
    resizeAnswerInput(input);
    input.addEventListener('input',()=>resizeAnswerInput(input));
  });
}
function renderPrompt(item) {
  if(exerciseSection(item)==='modals'&&['modal_gap','context_cloze'].includes(item.type)) {
    let index=0;return escapeHtml(item.prompt).replace(/___/g,()=>blankControl(item,index++,true));
  }
  const prompt = stripSourceNumber(item.prompt);
  if (item.type === "context_cloze") {
    return escapeHtml(prompt).replace(/\{\{(\d+):([^}]+)}}/g, (_, number) => blankControl(item,Number(number)-1,true));
  }
  if (item.type === "open_brackets" && item.blanks?.length && !item.options) {
    let index = 0;
    return escapeHtml(prompt).replace(/\(([^)]+)\)/g, () => {
      const n = index++;
      return inlineAnswers(item) ? blankControl(item,n,true) : `<span class="blank-token">[${escapeHtml(blankCue(item,n).display)}]</span>`;
    });
  }
  if(item.error_fragment)return escapeHtml(prompt).replace(escapeHtml(item.error_fragment),'<mark class="exercise-error">'+escapeHtml(item.error_fragment)+'</mark>');
  return escapeHtml(prompt);
}

function acceptedFor(item, blankIndex = null) {
  const source = blankIndex === null ? item : item.blanks[blankIndex];
  const answer = Array.isArray(source.answer) ? source.answer[blankIndex] : source.answer;
  return [...new Set([answer, ...(source.accepted_answers || [])].filter(Boolean))];
}

function answerControls(item) {
  if(item.type==='modal_fix')return '<div class="field"><label for="blank-0">Исправленное предложение</label><textarea class="answer-area" id="blank-0" data-answer-index="0" rows="3" lang="en" autocomplete="off" spellcheck="false"></textarea><small class="field-correction" hidden></small></div>';
  if((item.type==='active_to_passive'||item.type==='direct_to_reported')&&!item.prefix)return '<div class="field"><label for="blank-0">Ваше предложение</label><textarea class="answer-area" id="blank-0" data-answer-index="0" rows="3" lang="en" autocomplete="off" spellcheck="false"></textarea><small class="field-correction" hidden></small></div>';
  if(item.type==='word_order')return `<div class="field"><div class="word-blocks" role="group" aria-label="Слова для сборки">${item.blocks.map((b,n)=>`<button class="button" type="button" data-word-block="${n}">${escapeHtml(b)}</button>`).join('')}</div><label for="blank-0">Ваш порядок</label><input class="answer-input" id="blank-0" data-answer-index="0" readonly placeholder="Нажимайте слова по порядку" lang="en"><small class="field-correction" hidden></small><button class="button" type="button" data-word-reset>Сбросить</button></div>`;
  if(item.type==='translation_ru_en'&&item.blanks?.length)return '<div class="field"><label for="blank-0">Ваш перевод</label><textarea class="answer-area" id="blank-0" data-answer-index="0" rows="3" lang="en" autocomplete="off" spellcheck="false"></textarea><small class="field-correction" hidden></small></div>';

  if (item.options) {
    return `<fieldset class="choice-list"><legend>Выберите ответ</legend>${(exerciseSection(item)==='modals'?shuffled(item.options.map((option,index)=>({option,index}))):item.options.map((option,index)=>({option,index}))).map(({option,index}) => `<label><input type="radio" name="choice" value="${index}"> <span>${escapeHtml(stripSourceNumber(option))}</span></label>`).join("")}</fieldset>`;
  }
  if (inlineAnswers(item)) return "";
  if (item.blanks?.length) return `<div class="blank-list">${item.blanks.map((_,index)=>blankControl(item,index)).join("")}</div>`;
  return `<div class="field"><label for="answer">Ваш ответ</label><p class="subtle">Можно использовать полные и сокращённые формы. Сохраняйте смысл и ограничения задания. Вариант, который проверка не распознает, будет сохранён без автоматической оценки.</p><textarea class="answer-area" id="answer" rows="3" lang="en" autocomplete="off" spellcheck="false"></textarea></div>`;
}

function refsFor(item) {
  const refs = [...(item.rule_refs || []), ...(item.blanks || []).flatMap((blank) => blank.rule_refs || [])];
  return [...new Set(refs)];
}

function ruleLink(ref) {
  const aliases = { "future-simple-will--v1":"future-simple-will-v1", "future-continuous-will-be--v-ing":"future-continuous-will-be-v-ing", "future-perfect-simple-will-have--v3":"future-perfect-simple-will-have-v3", "future-perfect-continuous-will-have-been--v-ing":"future-perfect-continuous-will-have-been-v-ing", "инверсия-после-ограничительных-и-отрицательных-выражений":"18-маркированные-и-продвинутые-употребления", "7-by-и-untiltill":"7-by-и-until-till" };
  const [file, anchor] = ref.split("#");
  if (anchor && aliases[anchor]) ref = `${file}#${aliases[anchor]}`;
  const match = ref.match(/content\/(?:tenses|comparison|passive|modals|reported-speech)\/([^#]+?)(?:#(.+))?$/);
  if (!match) return "#theory/foundations";
  const route = THEORY_ROUTE_BY_FILE[match[1]] || "foundations";
  return `#theory/${route}${match[2] ? `/${match[2]}` : ""}`;
}

function restoreSession() {
  try { const s = JSON.parse(localStorage.getItem(storageKey("session"))); return s?.items?.length && s.index < s.items.length ? s : null; } catch { return null; }
}
function saveSession() {
  try { localStorage.setItem(storageKey("session"), JSON.stringify(state.session)); }
  catch { toast("Не удалось сохранить практику в браузере. Не закрывайте страницу."); }
}
// Expand contractions into complete grammatical forms; keep negation intact.
// Ambiguous 's / 'd are resolved only by matching an explicitly accepted answer.
function answerForms(value, ignoreCommas = false) {
  let text = normalise(value).replace(/\bcan not\b/g, "cannot");
  text = text.replace(/[‐‑]/g, "-").replace(/[\s.!?;]+$/g, "").trim();
  if (ignoreCommas && ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))))
    text = normalise(text.slice(1, -1)).replace(/[\s.!?;]+$/g, "").trim();
  if (ignoreCommas) text = text.replace(/,(?!\d)/g, " ").replace(/\s+/g, " ").trim();
  // Only reviewed spelling equivalents, never arbitrary word deletion or fuzzy similarity.
  const spellings = { cozy:"cosy", cozier:"cosier", coziest:"cosiest", color:"colour", colors:"colours", colored:"coloured", colorful:"colourful", neighborhood:"neighbourhood", neighborhoods:"neighbourhoods" };
  text = text.replace(/\b(?:cozy|cozier|coziest|color|colors|colored|colorful|neighborhood|neighborhoods)\b/g, word => spellings[word]);
  text = text.replace(/\b(well|better|best|good)-(informed|educated|designed|read|looking|off|known|lit)\b/g, "$1 $2")
    .replace(/\btime-consuming\b/g, "time consuming").replace(/\bcost-effective\b/g, "cost effective")
    .replace(/\bsecond-largest\b/g, "second largest");
  const negatives = { "won't": "will not", "can't": "cannot", "shan't": "shall not", "isn't": "is not", "aren't": "are not", "wasn't": "was not", "weren't": "were not", "haven't": "have not", "hasn't": "has not", "hadn't": "had not", "don't": "do not", "doesn't": "does not", "didn't": "did not", "wouldn't": "would not", "couldn't": "could not", "shouldn't": "should not", "mustn't": "must not", "needn't": "need not" };
  text = text.replace(/\b[a-z]+n't\b/g, word => negatives[word] || word);
  let forms = [text];
  const pattern = /\b(i|you|he|she|it|we|they|that|there|what|who|here)'(m|re|ve|ll|s|d)\b/;
  for (let pass = 0; pass < 16; pass++) {
    if (!forms.some(form => pattern.test(form))) break;
    forms = forms.flatMap(form => {
      const match = form.match(pattern);
      if (!match) return [form];
      const expansions = { m: ["am"], re: ["are"], ve: ["have"], ll: ["will"], s: ["is", "has"], d: ["had", "would"] }[match[2]];
      return expansions.map(aux => form.replace(pattern, `${match[1]} ${aux}`));
    });
    if (forms.length > 256) return []; // Bounded work on malformed/hostile input.
  }
  return [...new Set(forms.map(form => form.replace(/\b(would|could|should|must|might|may|will)'ve\b/g, "$1 have")))];
}
function standardAnswerNormal(s){const negatives={"isn't":"is not","aren't":"are not","wasn't":"was not","weren't":"were not","hasn't":"has not","haven't":"have not","hadn't":"had not","won't":"will not","can't":"cannot","couldn't":"could not","mustn't":"must not","shouldn't":"should not","wouldn't":"would not","mightn't":"might not","needn't":"need not","don't":"do not","doesn't":"does not","didn't":"did not","shan't":"shall not"};const spelling={"organizer":"organiser","organizers":"organisers","organized":"organised","organizing":"organising","labeler":"labeller","labelers":"labellers","labeled":"labelled","labeling":"labelling","cataloged":"catalogued","cataloging":"cataloguing","cataloger":"cataloguer","recognized":"recognised","digitized":"digitised","color":"colour","colored":"coloured","colors":"colours","center":"centre","centerpiece":"centrepiece","theater":"theatre","neighbor":"neighbour","neighbors":"neighbours","neighborhood":"neighbourhood","fiber":"fibre","fibers":"fibres","tire":"tyre","tires":"tyres","woolen":"woollen","molded":"moulded","artifact":"artefact","artifacts":"artefacts"};return s.normalize('NFKC').replace(/[’‘ʼ]/g,"'").toLowerCase().trim().replace(/\b(could|should|would|might|must|may)'ve\b/g,'$1 have').replace(/\b[a-z]+n't\b/g,x=>negatives[x]||x).replace(/\bcan not\b/g,'cannot').replace(/\b(dr|mr|mrs|ms|prof)\.(?=\s)/g,'$1').replace(/\b[a-z]+\b/g,x=>spelling[x]||x).replace(/[.!?\s]+$/,'').replace(/\s+/g,' ').trim()}
function matchesField(item, submitted, index = null) {
  if(item.answer_profile==='modal-exact-v1')return acceptedFor(item,index).some(a=>modalAnswerNormal(a)===modalAnswerNormal(submitted));
  if(item.answer_profile==='english-standard-v2')return acceptedFor(item,index).some(a=>standardAnswerNormal(a)===standardAnswerNormal(submitted));

  const ignoreCommas = ["translation_ru_en", "transformation", "error_correction"].includes(item.type);
  const forms = new Set(answerForms(submitted, ignoreCommas));
  return acceptedFor(item, index).some(answer => answerForms(answer, ignoreCommas).some(form => forms.has(form)));
}
function optionIsCorrect(item, submitted) {
  return (item.accepted_option_indices || [item.correct_option_index]).includes(submitted);
}
function needsReview(item) {
  return item.type === "translation_ru_en" || (!item.blanks?.length && !item.options && ["transformation", "error_correction"].includes(item.type));
}

// Feedback is separate from grading. Only a single, unambiguous local change
// against the snapshot's accepted answers receives a specific explanation.
function diagnosticForms(item, value) {
  const forms = item.answer_profile === 'modal-exact-v1' ? [modalAnswerNormal(value)] : item.answer_profile === 'english-standard-v2'
    ? [standardAnswerNormal(String(value))]
    : answerForms(value, ['translation_ru_en', 'transformation', 'error_correction'].includes(item.type));
  if (forms.length > 16) return [];
  return forms.map(form => form.match(/[a-z]+(?:'[a-z]+)?|[^a-z\s]+/g) || []);
}
function diagnosticContext(item, index) {
  if (index === null) return '';
  const markers = [...String(item.prompt || '').matchAll(/\{\{(\d+):[^}]+}}|\([^()]*\)/g)];
  const marker = item.type === 'context_cloze' ? markers.find(m => Number(m[1]) === index + 1) : markers[index];
  return marker ? item.prompt.slice(0, marker.index) : '';
}
function diagnosticSubject(prefix) {
  // Simple clauses only. Never infer the subject from the last noun in a
  // complex phrase ("the box of books", relative clauses, collectives, etc.).
  const clause = prefix.replace(/^\s*\d+[.)]\s*/, '').split(/[.!?;]/).at(-1).trim();
  const match = clause.match(/^(I|[Yy]ou|[Hh]e|[Ss]he|[Ii]t|[Ww]e|[Tt]hey|(?:[Tt]he|[Mm]y|[Yy]our|[Hh]is|[Hh]er|[Oo]ur|[Tt]heir|[Tt]hese|[Tt]hose) [a-z]+|[A-Z][a-z]+)(?:\s+(?:always|usually|often|sometimes|never|already|just|still|currently|now))*$/);
  if (!match) return '';
  const subject = match[1], word = subject.toLowerCase().split(' ').at(-1);
  if (/^(?:team|family|staff|government|company|class|committee|council|audience|crew|jury|group|board|news|series|species|means|physics|mathematics|james|charles|chris|thomas|lucas|lewis|frances)$/.test(word)) return '';
  return subject;
}
function diagnosticThirdPerson(base) {
  if (base === 'have') return 'has';
  if (/[^aeiou]y$/.test(base)) return base.slice(0, -1) + 'ies';
  return base + (/(?:s|sh|ch|x|z|o)$/.test(base) ? 'es' : 's');
}
function diagnosticPastForms(base) {
  const irregular = {be:['was','were','been'],go:['went','gone'],do:['did','done'],have:['had'],see:['saw','seen'],come:['came'],get:['got','gotten'],make:['made'],take:['took','taken'],give:['gave','given'],write:['wrote','written'],read:['read'],say:['said'],tell:['told'],think:['thought'],know:['knew','known'],find:['found'],buy:['bought'],bring:['brought'],teach:['taught'],catch:['caught'],eat:['ate','eaten'],drink:['drank','drunk'],run:['ran'],begin:['began','begun'],speak:['spoke','spoken'],break:['broke','broken'],choose:['chose','chosen'],leave:['left'],feel:['felt'],keep:['kept'],meet:['met'],send:['sent'],build:['built'],lose:['lost'],pay:['paid'],put:['put'],cut:['cut'],let:['let'],set:['set'],sit:['sat'],stand:['stood'],sleep:['slept'],swim:['swam','swum'],wear:['wore','worn'],win:['won'],understand:['understood'],hear:['heard'],hold:['held'],lead:['led'],fall:['fell','fallen'],fly:['flew','flown'],grow:['grew','grown'],show:['showed','shown'],bear:['bore','born','borne']};
  if (irregular[base]) return irregular[base];
  if (/e$/.test(base)) return [base + 'd'];
  if (/[^aeiou]y$/.test(base)) return [base.slice(0, -1) + 'ied'];
  return [base + 'ed', ...(/^[^aeiou]*[aeiou][^aeiouwxy]$/.test(base) ? [base + base.at(-1) + 'ed'] : [])];
}
function diagnosticChange(item, index, actual, expected, at, missing, correction) {
  const blank = index === null ? item : item.blanks[index];
  const prefix = diagnosticContext(item, index);
  const context = diagnosticForms(item, prefix).at(0) || [];
  const before = [...context, ...expected.slice(0, at)];
  const next = expected[at + 1];
  const wanted = expected[at], got = actual[at];
  const base = normalise(blank.base_verb || '').replace(/^(?:not\s+)?(?:to\s+)?/, '').split(' ')[0];
  const tense = blank.tense_or_construction || (item.practice_tenses || item.tags || []).join(' ');
  const subject = diagnosticSubject(prefix || expected.slice(0, at).join(' '));
  const result = (code, message) => ({version:1, code, message, correction});
  const example = `Правильно: ${correction}.`;
  if (!missing) {
    if ((wanted === 'been' && got === 'being') || (wanted === 'being' && got === 'been')) {
      const aux = before.filter(w => !/^(?:not|already|just|never|still|always|often)$/.test(w)).at(-1);
      if (wanted === 'been' && /^(?:have|has|had)$/.test(aux))
        return result('been-being', `После ${aux} в этой конструкции нужна третья форма be — been, а не being. ${example}`);
      if (wanted === 'being' && /^(?:am|is|are|was|were|be|been)$/.test(aux))
        return result('been-being', `В этой длительной конструкции после ${aux} нужна форма being, а не been. ${example}`);
    }
    const bridge = before.slice(before.lastIndexOf('did') + 1).filter(w => !/^(?:not|already|just|ever|never|really|usually|often)$/.test(w));
    const afterDid = before.slice(-6).includes('did') && (bridge.length === 0 ||
      bridge.length === 1 && /^(?:i|you|he|she|it|we|they)$/.test(bridge[0]) ||
      bridge.length === 2 && /^(?:the|a|an|my|your|his|her|our|their)$/.test(bridge[0]) && /^[a-z]+$/.test(bridge[1]));
    if (afterDid && (!base || wanted === base) && (diagnosticPastForms(wanted).includes(got) || diagnosticThirdPerson(wanted) === got))
      return result('after-did', `После did или did not используется начальная форма глагола: ${wanted}, а не ${got}. Прошедшее время уже выражено словом did. ${example}`);
    const agreementGroup = ['am is are', 'was were', 'has have', 'do does'].find(group => group.split(' ').includes(wanted) && group.split(' ').includes(got));
    if (agreementGroup) {
      if (agreementGroup === 'was were' && /\b(?:if|wish|as though)\b/.test(before.join(' '))) return null;
      const rule = {'am is are':'Am используется с I, is — с he/she/it, are — с you/we/they и подлежащим во множественном числе.',
        'was were':'Was используется с I/he/she/it, were — с you/we/they и подлежащим во множественном числе.',
        'has have':'Has используется с he/she/it, have — с I/you/we/they и подлежащим во множественном числе.',
        'do does':'Does используется с he/she/it, do — с I/you/we/they и подлежащим во множественном числе.'}[agreementGroup];
      return result('agreement', `Форма ${got} не согласуется с подлежащим${subject ? ` «${subject}»` : ''}. ${rule} Здесь нужна форма ${wanted}. ${example}`);
    }
    if (/(?:^|\s)present_simple(?:\s|$)/.test(tense) && base && base !== 'be' &&
        ((wanted === base && got === diagnosticThirdPerson(base)) || (wanted === diagnosticThirdPerson(base) && got === base))) {
      const plural = subject && (/^(?:we|they)$/i.test(subject) || /(?:s|children|people|men|women)$/i.test(subject));
      const reason = wanted === base
        ? `${plural ? `«${subject}» — множественное число. ` : ''}Окончание -s в Present Simple добавляется с he/she/it и подлежащим в третьем лице единственного числа; здесь оно не нужно.`
        : `В Present Simple с he/she/it и подлежащим в третьем лице единственного числа к глаголу добавляется -s или -es.`;
      return result('agreement', `${reason} Правильно: ${subject && expected.length === 1 ? subject + ' ' : ''}${correction}.`);
    }
    return null;
  }
  // A missing copula ("She happy") is not labelled a missing auxiliary.
  const participle = next && (next === 'been' || next === 'being' ||
    (base && (diagnosticPastForms(base).includes(next) || /ing$/.test(next))));
  const isAuxiliary = /^(?:am|is|are|was|were|be|been)$/.test(wanted) && participle ||
    /^(?:has|have|had)$/.test(wanted) && /perfect/.test(tense) && participle ||
    /^(?:do|does|did)$/.test(wanted) && (next === 'not' || base && expected.slice(at + 1).includes(base)) ||
    /^(?:will|would)$/.test(wanted) && /future/.test(tense) && (next === base || /^(?:be|have)$/.test(next));
  if (isAuxiliary)
    return result('missing-auxiliary', `Пропущен вспомогательный глагол ${wanted}. В этом предложении нужна полная глагольная форма. ${example}`);
  return null;
}
function diagnoseField(item, submitted, index = null) {
  if (item.grading_mode === 'teacher' || needsReview(item)) return null;
  const answers = item.options
    ? (item.accepted_option_indices || [item.correct_option_index]).map(n => item.options[n])
    : acceptedFor(item, index);
  const value = item.options ? item.options[submitted] : submitted;
  if (typeof value !== 'string' || value.length > 2000 || answers.length > 32) return null;
  const actualForms = diagnosticForms(item, value);
  const candidates = [];
  for (const correction of answers) for (const expected of diagnosticForms(item, correction)) for (const actual of actualForms) {
    if (Math.abs(expected.length - actual.length) > 1) continue;
    let at = 0;
    while (at < expected.length && expected[at] === actual[at]) at++;
    if (at === expected.length && at === actual.length) return null;
    const missing = expected.length === actual.length + 1;
    if (!missing && expected.length !== actual.length) continue;
    const remainder = actual.slice(at + (missing ? 0 : 1));
    if (expected.slice(at + 1).join(' ') !== remainder.join(' ')) continue;
    const diagnostic = diagnosticChange(item, index, actual, expected, at, missing, correction);
    const auxiliary = /^(?:am|is|are|was|were|be|been|being|has|have|had|do|does|did|will|would|can|could|shall|should|may|might|must)$/;
    // An unrelated alternative (e.g. "getting washed" beside "being washed")
    // does not contradict a precise morphology diagnosis. Competing auxiliary
    // changes or insertions do: "has" -> accepted "have" OR "had" is ambiguous.
    if (diagnostic || missing || auxiliary.test(expected[at]) && auxiliary.test(actual[at]))
      candidates.push({diagnostic, change:[missing, expected[at], missing ? '' : actual[at]].join('|')});
  }
  const first = candidates[0];
  return first?.diagnostic && candidates.every(d => d.diagnostic && d.change === first.change && d.diagnostic.code === first.diagnostic.code) ? first.diagnostic : null;
}
function fieldResults(item, submitted) {
  const values = Array.isArray(submitted) ? submitted : [submitted];
  if(item.grading_mode==='teacher')return values.map(value=>({submitted:value,correct:false,verified:false}));
  return values.map((value, i) => {
    const correct = item.options ? optionIsCorrect(item, value) : matchesField(item, value, item.blanks?.length ? i : null);
    const verified = correct || !needsReview(item);
    const diagnostic = !correct && verified ? diagnoseField(item, value, item.blanks?.length ? i : null) : null;
    return { submitted: value, correct, verified, ...(diagnostic ? {diagnostic} : {}) };
  });
}

function exerciseInstructionMarkup(item) {
  if(exerciseSection(item)==='reported')return '<p class="exercise-instruction">'+escapeHtml(item.instruction_ru||'Выполните задание.')+'</p>'+(item.context_ru?'<p class="reported-context" lang="ru">'+escapeHtml(item.context_ru)+'</p>':'');
  const instruction=(item.instruction_ru||({open_brackets:'Раскройте скобки.',translation_ru_en:'Переведите предложение на английский.',active_to_passive:'Преобразуйте предложение в пассив.'}[item.type])||'Впишите ответ или выберите вариант.').trim();
  const sentences=instruction.split(/(?<=[.!?])\s+/),main=sentences.shift();
  const extra=sentences.join(' ');
  const guidance=item.type==='open_brackets'&&exerciseSection(item)==='tenses'?'Если подлежащее дано внутри скобок, включите его в ответ. Не повторяйте подлежащее, уже напечатанное вне скобок. Отрицание сохраняйте; наречия используйте по инструкции задания.':'';
  return `<p class="exercise-instruction">${escapeHtml(main)}</p>${extra||guidance?`<details class="exercise-instruction-details"><summary>Подробности выполнения</summary>${extra?`<p>${escapeHtml(extra)}</p>`:''}${guidance?`<p>${escapeHtml(guidance)}</p>`:''}</details>`:''}`;
}
// Mark one unambiguous textual change from the server's concrete diagnosis.
function fieldErrorFragmentMarkup(field) {
  if(field.correct||field.verified===false||!field.diagnostic?.correction||typeof field.submitted!=='string')return '';
  const actual=field.submitted.trim().split(/\s+/).filter(Boolean),expected=field.diagnostic.correction.trim().split(/\s+/).filter(Boolean);
  let first=0,last=0;
  while(first<actual.length&&first<expected.length&&normalise(actual[first])===normalise(expected[first]))first++;
  while(last<actual.length-first&&last<expected.length-first&&normalise(actual.at(-1-last))===normalise(expected.at(-1-last)))last++;
  const different=actual.length-first-last,wanted=expected.length-first-last;
  if(!((different===1&&wanted===1)||(different===0&&wanted===1)))return '';
  const before=actual.slice(0,first).map(escapeHtml).join(' '),after=last?actual.slice(-last).map(escapeHtml).join(' '):'';
  return `<span class="field-error-fragment">Ваш ответ: <span lang="en">${before}${before?' ':''}<mark>${different?escapeHtml(actual[first]):'<span lang="ru">[пропуск]</span>'}</mark>${after?' ':''}${after}</span></span>`;
}

function renderSession() {
  if (!account.user || (account.user.role === "student" && !state.session?.remote)) { location.hash="practice"; return; }
  syncRouteNav();
  const session = state.session;
  if (!session?.items.length) { location.hash = "practice"; return; }
  if(!session.checked && session.remote && session.items.slice(session.index).some(item=>!item.options&&!item.blanks?.length)){renderAutomaticUpgrade(session);return;}
  const item = session.items[session.index];
  document.title = `Задание ${session.index + 1} из ${session.items.length} — Grammar NOEON`;
  app.innerHTML = `<section class="session">
    ${sessionContentOutdated(session, item) ? '<p class="verb-only-note">Эта тренировка сохранена до редакторских исправлений. <a href="#practice">Начните новую тренировку</a>, чтобы получить обновлённые задания. Старый результат сохранён.</p>' : ""}
    <div class="practice-rule-bar"><button class="button" type="button" id="practice-rule" aria-controls="practice-reference" aria-expanded="false">Правило</button></div>
    <div class="session-top"><h1 class="session-title">Задание ${session.index + 1} из ${session.items.length}</h1><span>Верно: ${session.correct}</span></div>
    <div class="progress" role="progressbar" aria-label="Прогресс тренировки" aria-valuemin="0" aria-valuemax="${session.items.length}" aria-valuenow="${session.index + (session.checked ? 1 : 0)}"><span style="width:${((session.index + (session.checked ? 1 : 0)) / session.items.length) * 100}%"></span></div>
    <article class="exercise-card">
      <div class="exercise-meta"><span class="pill">${escapeHtml(levelLabel(item.level))}</span><span class="pill">${escapeHtml(TYPE_LABELS[item.type] || item.type)}</span></div>
      ${item.title ? `<h2>${escapeHtml(item.title)}</h2>` : ""}
      ${session.draftConflict?.index===session.index?`<section class="draft-conflict" role="status"><p>Ответ в аккаунте изменился в другой вкладке или на другом устройстве. Ваш несохранённый ввод: <strong>${escapeHtml(submittedDisplay(item,session.draftConflict.submitted))}</strong></p><button class="button" type="button" id="restore-local-draft">Восстановить мой ввод</button> <button class="button" type="button" id="keep-server-draft">Оставить ответ из аккаунта</button></section>`:""}
      ${exerciseInstructionMarkup(item)}
      <form id="answer-form"><div class="prompt" lang="${item.type === "translation_ru_en" ? "ru" : "en"}">${renderPrompt(item)}</div>
      ${item.prefix&&item.type!=='word_order'?`<p class="rewrite-prefix" lang="en">${escapeHtml(item.prefix)} …</p>`:''}
      ${answerControls(item)}<div class="actions"><button class="button primary" type="submit">${item.grading_mode==='teacher'?'Отправить перевод':'Проверить ответ'}</button><button class="button" type="button" id="pause-session">Завершить</button></div></form>
      ${session.remote ? '<p id="save-status" class="subtle" role="status">Тренировка в вашем аккаунте</p>' : ""}<div id="feedback" aria-live="polite"></div>
    </article>
  </section>`;
  mountPracticeReference(session);
  if(typeof mountTaskIssueButton==='function')mountTaskIssueButton(document.querySelector('.exercise-card'),{practiceId:session.remote?.id,index:session.index});
  document.querySelector("#answer-form").addEventListener("submit", checkAnswer);
  const form = document.querySelector("#answer-form");
  const value = session.checked ? session.answers[session.index]?.submitted : session.draft;
  if (value !== undefined && value !== null) {
    if (item.options) { const c = form.querySelector(`input[value="${Number(value)}"]`); if(c) c.checked = true; }
    else if(item.blanks?.length) form.querySelectorAll("[data-answer-index]").forEach((c,i) => c.value = value[i] || "");
    else form.querySelector("#answer").value = value;
  }
  initialiseAnswerSizing(form);
  initialiseWordOrder(form,item);
  form.addEventListener("input", () => { session.draft = getSubmitted(item, form); if(session.remote) scheduleAccountDraft(session, item, form); else saveSession(); });
  document.getElementById('restore-local-draft')?.addEventListener('click',()=>{
    session.draft=session.draftConflict.submitted;delete session.draftConflict;saveSession();renderSession();
    scheduleAccountDraft(session,item,document.querySelector('#answer-form'));
  });
  document.getElementById('keep-server-draft')?.addEventListener('click',()=>{delete session.draftConflict;saveSession();renderSession();});
  if(session.checked) showFeedback(item, session.answers[session.index].correct);
  document.querySelector("#pause-session").addEventListener("click", pauseSession);
  form.addEventListener("keydown", event => {
    if (session.checked || event.isComposing || event.ctrlKey || event.metaKey || event.altKey) return;
    if (item.options && /^[1-4]$/.test(event.key)) {
      const radio = form.querySelector(`input[name="choice"][value="${Number(event.key)-1}"]`);
      if (radio) { event.preventDefault(); radio.checked = true; radio.dispatchEvent(new Event("input", {bubbles:true})); }
    }
    if (event.key === "Enter" && event.target.matches("input, textarea")) {
      event.preventDefault();
      const inputs = [...form.querySelectorAll("[data-answer-index], #answer")];
      const next = inputs[inputs.indexOf(event.target)+1];
      if (next) next.focus({preventScroll:true}); else form.requestSubmit();
    }
  });
  requestAnimationFrame(() => {
    if (state.session !== session || !form.isConnected) return;
    if (session.checked) { revealAnswerFeedback(session); return; }
    window.scrollTo({top:0,behavior:"instant"});
    if (!session.checked) form.querySelector("input, textarea, select")?.focus({preventScroll:true});
  });
}

function sessionContentOutdated(session, item) {
  if (typeof session.contentOutdated === "boolean") return session.contentOutdated;
  const current = state.exercises?.find(candidate => candidate.id === item.id);
  if (current) return current.content_version !== item.content_version;
  // Old cached sessions predate the level field. Fresh snapshots retain their
  // own version even when another record in the same section was edited.
  return !item.level;
}

function getSubmitted(item, form) {
  if (item.options) {
    const checked = form.elements.choice?.value;
    return checked === undefined || checked === "" ? null : Number(checked);
  }
  if (item.blanks?.length) return [...form.querySelectorAll("[data-answer-index]")].map((input) => input.value);
  return form.querySelector("#answer").value;
}

function evaluate(item, submitted) {
  if (submitted === null || (Array.isArray(submitted) ? submitted.some((x) => !x.trim()) : !String(submitted).trim())) return null;
  if(item.grading_mode==='teacher')return false;
  if (item.options) return optionIsCorrect(item, submitted);
  if (item.blanks?.length) return submitted.length === item.blanks.length && submitted.every((value, index) => matchesField(item, value, index));
  return matchesField(item, submitted);
}

function correctAnswer(item) {
  if (item.answer_text) return stripSourceNumber(item.answer_text);
  if (Array.isArray(item.answer)) return item.answer.map(stripSourceNumber).join(" · ");
  if (item.answer) return stripSourceNumber(item.answer);
  return item.blanks?.map((blank, index) => `${index + 1}. ${blank.answer}`).join(" · ") || "—";
}

function errorExplanations(fields = []) {
  // Render stored diagnostics only: opening a historical report must not run a
  // newer diagnosis against old grades. Unverified/manual/skipped fields stay neutral.
  const details = fields.flatMap((field, index) => !field.correct && field.verified === true && !field.skipped && !field.manual_review && field.diagnostic?.version === 1 && typeof field.diagnostic.message === 'string'
    ? [`<li${fields.length > 1 ? ` value="${index + 1}"` : ''}>${escapeHtml(field.diagnostic.message)}</li>`] : []);
  if (!details.length) return '';
  return `<div class="error-explanation"><p><strong>Что исправить</strong></p><${fields.length > 1 ? 'ol' : 'ul'}>${details.join('')}</${fields.length > 1 ? 'ol' : 'ul'}></div>`;
}
function explanations(item, fields = []) {
  const detailedBlanks = (item.blanks || []).filter((blank) => blank.explanation_ru);
  const details = detailedBlanks.map((blank, index) => `<li><strong>${index + 1}. ${escapeHtml(blank.answer)}</strong> — ${escapeHtml(blank.explanation_ru)}</li>`).join("");
  const general = `${escapeHtml(item.explanation_ru || "")}${details ? `<details><summary>Разбор каждого пропуска</summary><ul>${details}</ul></details>` : ""}`;
  const specific = errorExplanations(fields);
  return specific ? `${specific}<details><summary>Общее правило</summary>${general}</details>` : general;
}

async function checkAnswer(event) {
  event.preventDefault();
  if (!account.user || (account.user.role === "student" && !state.session?.remote)) { location.hash="practice"; return; }
  const session = state.session;
  if (session.checked) return;
  const item = session.items[session.index];
  const submitted = getSubmitted(item, event.currentTarget);
  let correct = session.remote ? ((Array.isArray(submitted) ? submitted : [submitted]).some(value => value === null || !String(value).trim()) ? null : false) : evaluate(item, submitted);
  const feedback = document.querySelector("#feedback");
  if (correct === null) { feedback.innerHTML = `<div class="feedback wrong"><h2 class="feedback-title">Нужен ответ</h2><p>Заполните все поля или выберите вариант.</p></div>`; return; }
  let serverAnswer = null;
  if (session.remote) {
    const button = document.querySelector('#answer-form button[type="submit"]');
    button.disabled = true;
    try {
      await flushAccountDraft(session);
      const result = await accountRequest(`practice/${session.remote.id}/check`, { index: session.index, revision: session.remote.revision, submitted });
      if (state.session !== session) return;
      serverAnswer = result.answer; correct = serverAnswer.correct; session.remote.revision = result.revision;
      const status = document.querySelector('#save-status');
      if(status)status.textContent='';
    } catch(error) { button.disabled = false; feedback.innerHTML = `<div class="feedback wrong"><p>${escapeHtml(error.message)}</p><p>Ответ остался в браузере. Проверьте соединение и повторите отправку.</p></div>`; return; }
  }
  session.checked = true;delete session.draftPending;delete session.draftConflict;
  if (correct) session.correct += 1;
  session.answers.push(serverAnswer || { id: item.id, correct, submitted, fields: fieldResults(item, submitted), item: JSON.parse(JSON.stringify(item)), checker: 3 });
  if (serverAnswer) session.items[session.index] = serverAnswer.item;
  saveSession();
  showFeedback(serverAnswer?.item || item, correct);
  document.querySelector("#next-question")?.focus({preventScroll:true});
  revealAnswerFeedback(session);
}

function revealAnswerFeedback(session) {
  const feedback = document.querySelector('#feedback');
  requestAnimationFrame(() => {
    if (state.session !== session || !session.checked || !feedback?.isConnected || document.querySelector('#feedback') !== feedback) return;
    const explanation = feedback.querySelector('.explanation');
    (explanation || feedback).scrollIntoView({
      block: 'start',
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
    });
  });
}

function pauseSession() {
  if (!state.session?.answers.length) { location.hash = "practice"; return; }
  saveSession();
  const dialog = document.createElement("dialog"); dialog.className = "pause-dialog";
  dialog.setAttribute("aria-labelledby","pause-title");
  dialog.innerHTML = '<h2 id="pause-title">Завершить сейчас?</h2><p>Тренировка сохранится. Вы сможете продолжить её с этого места.</p><div class="actions"><button class="button" data-stay>Продолжить тренировку</button><button class="button primary" data-leave>Сохранить и выйти</button></div>';
  document.body.append(dialog);
  dialog.querySelector('[data-stay]').addEventListener('click',()=>dialog.close());
  dialog.querySelector('[data-leave]').addEventListener('click',()=>{dialog.close();location.hash='practice';});
  dialog.addEventListener('close',()=>dialog.remove(),{once:true}); dialog.showModal();
}
async function ruleTitle(ref) {
  const modal=ruleLink(ref).match(/^#theory\/modals(?:\/(.*))?$/);
  if(modal)return MODAL_RULE_TITLES[decodeAnchor(modal[1]||'')]||'Modal Verbs';
  const passive=ruleLink(ref).match(/^#theory\/passive(?:\/(.*))?$/);
  if(passive)return PASSIVE_RULE_TITLES[decodeAnchor(passive[1]||'')]||'Passive Voice';

  const parts=ruleLink(ref).slice(1).split('/'), entry=state.theory.find(t=>t.id===parts[1]);
  let title=entry?.title || "Открыть правило";
  try {
    if(entry && parts[2]) {
      let md=ruleMarkdownCache.get(entry.file);
      if(!md) { const response=await fetch(entry.file);if(!response.ok)throw new Error();md=await response.text();ruleMarkdownCache.set(entry.file,md); }
      const h=markdownHeadings(md).find(h=>h.id===decodeAnchor(parts.slice(2).join('/')));
      if(h)title=md.split(/\r?\n/)[h.index].replace(/^#+\s+/, '').replace(/\s+#+$/, '');
    }
  } catch {}
  return title;
}
async function labelRuleLinks(container, item) {
  const links=new Map(refsFor(item).map(ref=>[ruleLink(ref),ref]));
  const labels=await Promise.all([...links].map(async([href,ref])=>`<a class="button" data-rule-ref="${escapeHtml(ref)}" href="${escapeHtml(href)}">${escapeHtml(await ruleTitle(ref))}</a>`));
  if(container.isConnected)container.innerHTML=labels.join('');
}
function showFeedback(item, correct) {
  const session=state.session, feedback=document.querySelector('#feedback'), form=document.querySelector('#answer-form');
  const answer=session.answers[session.index], fields=answer.fields;
  form.querySelectorAll('input, textarea, select, button[type="submit"], button[data-word-block], button[data-word-reset]').forEach(control=>control.disabled=true);
  form.querySelector('[type=submit]').hidden=true;
  fields.forEach((field,index)=>{
    if(item.options) {
      form.querySelectorAll('.choice-list label').forEach(label=>{
        const i=Number(label.querySelector('input').value);
        label.classList.toggle('answer-correct',optionIsCorrect(item,i));
        label.classList.toggle('answer-wrong',i===Number(field.submitted)&&!field.correct&&field.verified!==false);
      });
    } else {
      const control=form.querySelector(`[data-answer-index="${index}"]`) || form.querySelector('#answer');
      if(!control)return;
      control.classList.add(field.verified===false?'answer-pending':field.correct?'answer-correct':'answer-wrong');
      control.setAttribute('aria-invalid',String(!field.correct&&field.verified!==false));
      if(!field.correct&&field.verified!==false) {
        let note=control.parentElement.querySelector('.field-correction');
        if(!note){note=document.createElement('small');note.className='field-correction';control.after(note);}
        note.hidden=false;note.textContent='Верный вариант: '+stripSourceNumber(item.blanks?.[index]?.answer || correctAnswer(item));
        const fragment=fieldErrorFragmentMarkup(field);
        if(fragment&&!control.parentElement.querySelector('.field-error-fragment'))note.insertAdjacentHTML('beforebegin',fragment);
        note.id=`correction-${index}`;control.setAttribute('aria-describedby',note.id);
      }
    }
  });
  const pending=fields.some(f=>f.verified===false), right=fields.filter(f=>f.correct).length, partial=right>0&&right<fields.length;
  const progress=document.querySelector('.session .progress');
  if(progress){progress.setAttribute('aria-valuenow',String(session.index+1));progress.querySelector('span').style.width=`${(session.index+1)/session.items.length*100}%`;}
  document.querySelector('.session-top span:last-child').textContent=`Верно: ${session.correct}`;
  if(item.grading_mode==='teacher'){
    feedback.innerHTML='<div class="feedback pending"><h2>Перевод сохранён для проверки</h2><p>Оценка появится после проверки. Завершите тренировку — затем перевод появится в очереди преподавателя. До его решения ответ не влияет на процент.</p><button id="next-question" class="button primary" type="button">'+(session.index+1===session.items.length?'Завершить сессию →':'Далее')+'</button></div>';
    feedback.querySelector('#next-question').addEventListener('click',nextQuestion);feedback.querySelector('#next-question').focus({preventScroll:true});return;
  }
  const full=`<p>Один из верных вариантов: <strong lang="en">${escapeHtml(correctAnswer(item))}</strong></p>`;
  const detail=item.type==='context_cloze'?`<ol class="cloze-results">${fields.map((f,i)=>`<li value="${i+1}">${escapeHtml(stripSourceNumber(item.blanks[i].answer))}${!f.correct?` (ваш ответ: ${escapeHtml(f.submitted)})`:''}</li>`).join('')}</ol><details><summary>Полный текст</summary>${full}</details>`:!correct&&!item.options&&fields.length===1?'':full;
  feedback.innerHTML=`<div class="feedback ${pending||partial?'pending':correct?'':'wrong'}"><h2 class="feedback-title">${partial?`Верно ${right} из ${fields.length}`:correct?'✓ Верно':pending?'Ответ требует отдельной проверки':'× Ответ нужно исправить'}</h2>${detail}${pending?'<p>Ответ сохранён без автоматической оценки. Обсудите его с преподавателем.</p>':''}<div class="explanation">${explanations(item, fields)}</div>${item.review_note_ru?`<details><summary>Редакторская заметка</summary><p>${escapeHtml(item.review_note_ru)}</p></details>`:''}<div class="rule-links"></div><div class="actions"><button id="next-question" class="button primary" type="button">${session.index+1===session.items.length?'Завершить сессию →':'Далее'}</button></div></div>`;
  void labelRuleLinks(feedback.querySelector('.rule-links'),item);
  document.querySelector('#next-question').addEventListener('click',nextQuestion);
  document.querySelector('#next-question').focus({preventScroll:true});
}

function nextQuestion() {
  const session = state.session;
  if (!session?.checked) return;
  if (session.index + 1 < session.items.length) {
    session.index += 1;
    session.checked = false;
    delete session.draft;
    saveSession();
    renderSession();
    window.scrollTo({ top: 0, behavior: "instant" });
    return;
  }
  if(!session.remote) {
  const attempt = { answers: session.answers, score: session.answers.flatMap(a => a.fields).filter(f => f.correct).length, maxScore: session.answers.flatMap(a => a.fields).filter(f => f.verified !== false).length, pending: session.answers.flatMap(a => a.fields).filter(f => f.verified === false).length, date: new Date().toISOString(), total: session.items.length, correct: session.correct, levels: [...new Set(session.items.map((x) => x.level || "archive"))], types: [...new Set(session.items.map((x) => x.type))] };
  const history = readHistory();
  history.unshift(attempt);
  const entries = history.slice(0, 50).map(lightHistoryAttempt);
  try { localStorage.setItem(storageKey("history"), JSON.stringify(entries)); transientHistory = null; }
  catch { transientHistory = {key:storageKey("history"),entries}; toast("Не удалось сохранить историю в браузере. Результат доступен до закрытия страницы."); }
  }
  state.session = null;
  saveSession();
  location.hash = session.remote?.id ? "results/"+encodeURIComponent(session.remote.id) : "results";
}

function readHistory() {
  if (transientHistory?.key === storageKey("history")) return transientHistory.entries;
  try { return JSON.parse(localStorage.getItem(storageKey("history")) || "[]"); }
  catch { return []; }
}

function renderResults() {
  syncRouteNav();
  const history=readHistory();
  app.innerHTML=`<h1 class="sr-only">Результаты</h1>${history.length?'<p class="subtle">Нажмите на тренировку, чтобы открыть подробности.</p>':'<p>Пока нет завершённых тренировок.</p>'}${history.map((attempt,n)=>`<details class="legacy-work"><summary><strong>Тренировка ${history.length-n}</strong><span>${escapeHtml(new Date(attempt.date).toLocaleDateString('ru-RU'))} · ${attempt.score??attempt.correct}/${attempt.maxScore??attempt.total}</span></summary>${reportMarkup(attempt,'Тренировка')}</details>`).join('')}`;
  if(history.length)bindPracticeReport();
}

function showError(error) {
  console.error(error);
  app.innerHTML = `<div class="error-card"><h2>Не удалось загрузить страницу</h2><p>${escapeHtml(error.message)}</p><button id="retry-page" class="button" type="button">Повторить</button></div>`;
  document.querySelector("#retry-page").addEventListener("click", () => location.reload());
}

let currentAppRoute = typeof location !== "undefined" ? location.hash || "#home" : null;
let previousAppRoute = null;
async function route() {
  const nextRoute = location.hash || "#home";
  if (currentAppRoute !== nextRoute) { previousAppRoute = currentAppRoute; currentAppRoute = nextRoute; }
  syncScreenChrome();
  const restoreTop=restoreScrollOnRoute ? screenScrollPositions.get(nextRoute)||0 : null;
  restoreScrollOnRoute=false;
  const nextParts = location.hash.slice(1).split("/").filter(Boolean);
  syncRouteNav();
  if (nextParts[0] === "theory" && nextParts[1] === openedTheory && document.querySelector(".theory-content")) {
    syncTheoryNavigation(nextParts);
    if(restoreTop!==null)window.scrollTo({top:restoreTop,behavior:"instant"});else if(nextParts[1]==='modals')revealModalAnchor(document.querySelector('.theory-content'),decodeAnchor(nextParts.slice(2).join('/')));else if(nextParts[1]==='passive')revealPassiveAnchor(document.querySelector('.theory-content'),decodeAnchor(nextParts.slice(2).join('/')));else scrollTheory(nextParts);
    syncScreenChrome();return;
  }
  openedTheory = null;
  if(typeof disposeAssessment!=="undefined"){disposeAssessment?.();disposeAssessment=null;}
  disposeTenseMap?.();
  if (ruleModal?.dialog.open) ruleModal.dialog.close();
  disposePracticeReference();
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  const parts = location.hash.replace(/^#/, "").split("/").filter(Boolean);
  const section = parts[0] || "home";
  const titles = {"teacher-library":"Библиотека наборов","task-issues":"Сообщения о заданиях",tests:"Тесты","test-preview":"Просмотр теста","test-attempt":"Проверочный тест",home:"Сегодня",grammar:"Грамматика",practice:"Практика",session:"Задание",results:"Результаты",report:"Отчёт",student:"Ученик",notifications:"Уведомления","review-queue":"Проверка переводов",students:"Ученики",profile:"Профиль",join:"Приглашение",assign:"Назначить задание",edit:"Редактировать задание"};
  document.title = `${titles[section] || "Grammar NOEON"} — Grammar NOEON`;
  try {
    if (section === "home") await renderHome();
    else if (section === "students") await renderStudents();
    else if (section === "teacher-library") await renderTeacherLibrary();
    else if (section === "task-issues") await renderTaskIssues();
    else if (section === "notifications") await renderNotifications();
    else if (section === "review-queue") await renderReviewQueue();
    else if (section === "report") await renderAssignmentReport(parts[1] || "",parts[2] || "");
    else if (section === "work") await renderWorkDetails(parts[1] || "");
    else if (section === "student-work") await renderWorkDetails(parts[2] || "",parts[1] || "");
    else if (section === "grammar") renderGrammar(parts[1]);
    else if (section === "theory") await renderTheory(parts);
    else if (section === "practice") await renderPractice();
    else if (section === "tests") await renderAssessmentCatalog(ASSESSMENT_SECTIONS[parts[1]]?parts[1]:'comparison');
    else if (section === "test-preview") await renderAssessmentPreview(parts[1]);
    else if (section === "test-attempt") await renderAssessmentAttempt(parts[1]);
    else if (section === "session") { if(account.user?.role === "student") await renderStudentSession(); else renderSession(); }
    else if (section === "results") { if (account.user && parts[1]) await renderOwnReport(parts[1]); else if (account.user) await renderAccountResults(); else renderResults(); }
    else if (section === "profile") await renderProfile();
    else if (section === "join") await renderJoin(parts[1] || "");
    else if (section === "student") await renderStudentAccount(parts[1] || "");
    else if (section === "assign") await renderAssignmentForm(parts[1] || "", parts[2]);
    else if (section === "edit") await renderAssignmentEditor(parts[1] || "",parts[2] || "");
    else { location.hash = "home"; }
  } catch (error) { showError(error); }
  syncScreenChrome();
  app.classList.remove('viewin');void app.offsetWidth;app.classList.add('viewin');
  if(restoreTop!==null)requestAnimationFrame(()=>window.scrollTo({top:restoreTop,behavior:'instant'}));
  if(section!=='notifications'&&typeof refreshNotifications==='function')void refreshNotifications();
}

const screenScrollPositions = new Map();
let restoreScrollOnRoute = false;
function syncRoleNav() {
  if(typeof document.getElementById!=='function')return;
  const nav=document.getElementById('main-nav');if(!nav)return;
  let students=nav.querySelector('[data-nav="students"]');
  if(account.user?.role==='teacher'&&!students) {
    students=document.createElement('a');students.href='#students';students.dataset.nav='students';
    students.innerHTML='<svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 5"/></svg><span>Ученики</span>';
    nav.insertBefore(students,nav.querySelector('[data-nav="results"]'));
  } else if(account.user?.role!=='teacher')students?.remove();
}
function screenBackFallback() {
  const p=location.hash.slice(1).split('/');
  if(['student','assign','edit'].includes(p[0]))return p[0]==='student'?'#students':'#student/'+(p[1]||'');
  if(p[0]==='report'||p[0]==='student-work')return '#student/'+(p[1]||'');
  if(['teacher-library','task-issues'].includes(p[0]))return '#profile';
  if(p[0]==='theory')return '#grammar/'+grammarSectionForTheory(p[1]);
  if(p[0]==='session')return '#practice';
  if(p[0]==='practice')return '#grammar/'+(p[1]||'');
  if(p[0]==='grammar')return '#grammar';
  if(['tests','test-preview','test-attempt'].includes(p[0])){
    const topic=p[0]==='test-attempt'&&typeof assessmentTopic!=='undefined'?assessmentTopic:p[0]==='tests'?(p[1]||'comparison'):assessmentSection(p[1]);
    return account.user?.role==='teacher'?'#tests/'+topic:'#practice';
  }
  return '#'+(p[0]==='work'?'results':'profile');
}
function screenBack() {
  restoreScrollOnRoute=true;
  if(previousAppRoute && history.length>1)history.back();else location.hash=screenBackFallback();
}
function themeSettingsMarkup() {
  return '<section id="theme-settings" class="account-section"><h2>Оформление</h2><fieldset class="theme-options"><legend>Тема приложения</legend>'+[['auto','Авто'],['light','Светлая'],['dark','Тёмная']].map(([value,label])=>`<label><input type="radio" name="app-theme" value="${value}"><span>${label}</span></label>`).join('')+'</fieldset><p class="subtle">Авто — как в настройках устройства.</p></section>';
}
function syncScreenChrome() {
  if(typeof document.getElementById!=='function')return;
  const title=document.getElementById('screen-title');if(!title)return;
  const parts=location.hash.slice(1).split('/'), route=parts[0]||'home';
  document.body.dataset.screen=route;
  const roots=['home','grammar','results','profile','students'];
  const root=roots.includes(route)&&!parts[1];
  document.getElementById('screen-back').hidden=root;
  document.querySelector('.site-header .brand').hidden=route!=='home';
  title.hidden=route==='home';
  const names={'teacher-library':'Библиотека наборов','task-issues':'Сообщения о заданиях',tests:'Тесты','test-preview':'Просмотр теста','test-attempt':'Проверочный тест',home:'Сегодня',grammar:'Грамматика',results:'Результаты',profile:'Профиль',students:'Ученики',student:'Ученик',theory:'Теория',practice:'Практика',report:'Отчёт',work:'Работа','student-work':'Работа ученика',notifications:'Уведомления','review-queue':'Проверка переводов',assign:'Назначить задание',edit:'Изменить задание',join:'Приглашение'};
  const short={reported:'Косвенная речь',foundations:'Основы',present:'Present',past:'Past',future:'Future',contrasts:'Сопоставления',comparison:'Сравнения',passive:'Пассив',modals:'Модальные глаголы'};
  const text=route==='session'?document.title.replace(' — Grammar NOEON',''):route==='theory'?short[parts[1]]||'Теория':route==='results'&&parts[1]?'Отчёт':route==='grammar'&&parts[1]?GRAMMAR_SECTIONS[parts[1]]?.title||'Грамматика':names[route]||'Grammar NOEON';
  if(title.textContent!==text)title.textContent=text;
  if(route==='profile'&&!document.getElementById('theme-settings')) {
    app.insertAdjacentHTML('beforeend',themeSettingsMarkup());
    app.querySelectorAll('[name="app-theme"]').forEach(input=>input.addEventListener('change',()=>window.NoeonTheme.set(input.value)));
  }
  app.querySelectorAll('[name="app-theme"]').forEach(input=>input.checked=input.value===window.NoeonTheme.get());
  const theme=document.getElementById('theme-toggle'), dark=document.documentElement.dataset.theme==='dark';
  theme.textContent=dark?'☀':'☾';theme.setAttribute('aria-label',dark?'Включить светлую тему':'Включить тёмную тему');
  syncRoleNav();
}
function initialiseChrome() {
  history.scrollRestoration='manual';
  document.getElementById('screen-back').addEventListener('click',screenBack);
  document.getElementById('theme-toggle').addEventListener('click',()=>window.NoeonTheme.toggle());
  window.addEventListener('noeon-theme-change',syncScreenChrome);
  window.addEventListener('scroll',()=>screenScrollPositions.set(currentAppRoute,window.scrollY),{passive:true});
  let chromeFrame=0;
  new MutationObserver(()=>{if(!chromeFrame)chromeFrame=requestAnimationFrame(()=>{chromeFrame=0;syncScreenChrome();});}).observe(app,{childList:true});
  syncScreenChrome();
}

async function fetchBankManifest() {
  try { return await fetchJson("data/exercises/index.json"); }
  catch (error) {
    if (typeof caches !== "undefined") {
      const names = await caches.keys();
      // The service worker handles normal offline navigation; this also covers a failed fetch.
      for (const name of names.filter(name => name.startsWith("grammar-")).reverse()) {
        const response = await (await caches.open(name)).match("/data/exercises/index.json");
        if (response?.ok) return response.json();
      }
    }
    throw error;
  }
}

async function initialise() {
  try {
    [state.manifest, state.theory] = await Promise.all([
      fetchBankManifest(),
      fetchJson("data/theory.json"),
    ]);
    await initialiseAccount();
    initialiseChrome();
    if(typeof initialiseNotifications==='function')initialiseNotifications();
    window.addEventListener("storage", async event => {
      if (event.key !== "noeon-auth-event") return;
      clearTimeout(account.draftTimer); account.draftTimer = null;
      account.user = null; account.csrf = null; state.exercises = null;
      await initialiseAccount();
      location.hash = "profile";
      await route();
    });
    app.addEventListener("click", event => {
      const link = event.target.closest("[data-rule-ref]");
      if (!link) return;
      event.preventDefault();
      openRule(link.dataset.ruleRef);
    });
    window.addEventListener("hashchange", route);
    window.addEventListener("beforeprint", () => { if (!document.getElementById('print-report')) prepareReportPrint(document.querySelector('.practice-report')); });
    window.addEventListener("afterprint", () => document.getElementById('print-report')?.remove());
    await route();
  } catch (error) { showError(error); }
}

if (typeof module !== "undefined") module.exports = { normalise, slugify, TYPE_LABELS, THEORY_ROUTE_BY_FILE, evaluate, fieldResults, answerForms, markdownHeadings, ruleLink, displayPrompt, lightHistoryAttempt };
if (typeof module === "undefined") { initialise(); }
