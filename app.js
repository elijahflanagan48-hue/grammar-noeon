"use strict";

const TYPE_LABELS = {
  open_brackets: "Раскрыть скобки",
  translation_ru_en: "Перевод с русского",
  multiple_choice: "Выбор формы",
  meaning_choice: "Выбор значения",
  discourse_choice: "Связность текста",
  error_correction: "Исправление ошибки",
  transformation: "Трансформация",
  context_cloze: "Контекстный текст",
};

const THEORY_ROUTE_BY_FILE = {
  "01-foundations.md": "foundations",
  "02-present.md": "present",
  "03-past.md": "past",
  "04-future.md": "future",
  "05-contrasts-and-pitfalls.md": "contrasts",
};

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
    { name: "Future Simple", formula: "will + V1", focus: "прогноз, решение или обещание", uses: ["мнение и нейтральный прогноз", "решение в момент речи", "обещание, готовность или отказ"], examples: ["I think it will rain.", "I will help you with that."], markers: ["probably", "I think", "one day", "soon", "perhaps"], trap: "Will — не универсальный знак будущего: планы, расписания и признаки требуют других конструкций.", anchor: "future-simple-will--v1" },
    { name: "Future Continuous", formula: "will be + V-ing", focus: "процесс в будущий момент", uses: ["действие в определённый будущий момент", "естественный ход событий", "нейтральный вопрос о планах"], examples: ["I will be working at six.", "Will you be using the car tonight?"], markers: ["this time tomorrow", "at five tomorrow", "all day"], trap: "Форма не означает автоматически, что действие будет долгим.", anchor: "future-continuous-will-be--v-ing" },
    { name: "Future Perfect", formula: "will have + V3", focus: "результат к будущей точке", uses: ["завершение к сроку", "количество к будущему моменту", "опыт или длительность состояния к сроку"], examples: ["I will have finished by six.", "By June, she will have lived here for ten years."], markers: ["by", "by then", "by the time", "before", "by the end of"], trap: "By задаёт крайний срок; until подчёркивает продолжение до границы.", anchor: "future-perfect-simple-will-have--v3" },
    { name: "Future Perfect Continuous", formula: "will have been + V-ing", focus: "длительность к будущей точке", uses: ["продолжительность деятельности к сроку", "продолжающаяся серия", "процесс как причина будущего результата"], examples: ["I will have been working for two hours.", "By noon, she will have been driving all morning."], markers: ["for", "since", "by the time", "how long", "all morning"], trap: "Форма редкая и тяжеловесная; если важен результат, чаще нужен Future Perfect Simple.", anchor: "future-perfect-continuous-will-have-been--v-ing" },
  ]},
];

const app = document.querySelector("#app");
const state = {
  manifest: null,
  theory: [],
  exercises: null,
  session: null,
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

const normalise = (value) => String(value ?? "")
  .trim()
  .toLocaleLowerCase("en")
  .replace(/[’‘]/g, "'")
  .replace(/[“”]/g, '"')
  .replace(/\s+/g, " ")
  .replace(/[.!?]+$/g, "");

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
      output.push(`<h${level} id="${slugify(title)}">${inlineMarkdown(title)}</h${level}>`);
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

function theoryCards() {
  return state.theory.map((entry, index) => `
    <a class="card" href="#theory/${entry.id}">
      <span class="eyebrow">Раздел ${String(index + 1).padStart(2, "0")}</span>
      <h3>${escapeHtml(entry.title)}</h3>
      <p>${escapeHtml(entry.description)}</p>
    </a>`).join("");
}

function renderHome() {
  setNav("home");
  const history = readHistory();
  const completed = history.reduce((sum, attempt) => sum + attempt.total, 0);
  const latest = history[0];
  app.innerHTML = `
    <section class="direction-hero">
      <div class="hero-copy">
        <div class="chapter-label">01 / Ваш учебный маршрут</div>
        <h1>Всё складывается<br>в <em>смысл.</em></h1>
        <p>От точного правила — к уверенному выбору временной формы.</p>
      </div>
      <div class="grammar-art" aria-label="Структура английского предложения">
        <div class="art-caption">THE SHAPE OF LANGUAGE</div>
        <div class="word-pieces"><span class="piece subject-piece">I</span><span class="piece verb-piece">have</span><span class="piece ending-piece">learned</span><span class="period">.</span></div>
        <div class="art-lines"><span>кто</span><span>форма</span><span>действие</span><span></span></div>
        <div class="art-caption art-foot">Слова связаны. Смысл появляется.</div>
      </div>
    </section>
    <div class="section-heading"><h2>Следующий шаг</h2><span>В вашем темпе</span></div>
    <section class="today-grid">
      <div class="learning-session">
        <span class="eyebrow">Раздел полностью подготовлен</span>
        <div class="session-number">12</div>
        <h2>временных форм</h2>
        <p>От основ системы до сложных сопоставлений B2–C2</p>
        <a class="button session-button" href="#theory/foundations">Открыть карту и теорию →</a>
      </div>
      <div>
        <div class="day-progress">
          <div class="section-heading compact"><strong>Ваш прогресс</strong><span>${completed.toLocaleString("ru-RU")} ответов выполнено</span></div>
          <div class="progress"><span style="width:${latest ? Math.round(latest.correct / latest.total * 100) : 0}%"></span></div>
          <p class="subtle">${latest ? `Последняя сессия: ${latest.correct} из ${latest.total}.` : "Начните первую тренировку — результат сохранится на этом устройстве."}</p>
        </div>
        <div class="quick-grid">
          <a href="#theory/foundations"><span aria-hidden="true">Aa</span>Изучить теорию</a>
          <a href="#practice"><span aria-hidden="true">↗</span>Практика</a>
          <a href="#theory/foundations"><span aria-hidden="true">⌗</span>Карта времён</a>
          <a href="#results"><span aria-hidden="true">✓</span>Результаты</a>
        </div>
      </div>
    </section>
    <a class="library-link" href="#theory/foundations"><span><strong>Библиотека Tenses</strong><small>${state.manifest.total_items.toLocaleString("ru-RU")} упражнений · ${state.manifest.answer_slots.toLocaleString("ru-RU")} проверяемых ответов</small></span><span>→</span></a>`;
}

function renderProfile() {
  setNav("profile");
  const history = readHistory();
  const answered = history.reduce((sum, attempt) => sum + attempt.total, 0);
  const correct = history.reduce((sum, attempt) => sum + attempt.correct, 0);
  app.innerHTML = `<div class="reading profile-page">
    <span class="eyebrow">Личное пространство</span><h1>Профиль обучения</h1>
    <article class="profile-card">
      <div class="profile-avatar">N</div><div><h2>Локальный профиль</h2><p>Без регистрации и передачи персональных данных.</p></div>
      <div class="profile-row"><strong>Доступные материалы</strong><p>Полный раздел Tenses: теория, карта 12 форм и практика A2–C2.</p><a href="#theory/foundations">Открыть грамматику →</a></div>
      <div class="profile-row"><strong>Учебная история</strong><p>${history.length} завершённых сессий · ${answered} ответов · ${correct} верных.</p><a href="#results">Посмотреть результаты →</a></div>
      <p class="subtle">Прогресс хранится только в этом браузере.</p>
    </article>
  </div>`;
}

function theoryNav(active) {
  return `<nav class="theory-nav" aria-label="Разделы теории"><p>В этом справочнике</p>${state.theory.map((entry) => `<a class="${entry.id === active ? "active" : ""}" href="#theory/${entry.id}">${escapeHtml(entry.title)}</a>`).join("")}</nav>`;
}

function tenseMapHtml() {
  const aspectNames = ["Simple", "Continuous", "Perfect", "Perfect Continuous"];
  return `<section class="tense-map" aria-labelledby="tense-map-title">
    <div class="tense-map-intro">
      <div><span class="eyebrow">Наглядная схема</span><h2 id="tense-map-title">Карта 12 времён</h2></div>
      <p>Читайте по строкам — время, по столбцам — способ взглянуть на действие. Перетаскивайте карту, меняйте масштаб и раскрывайте каждую форму.</p>
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
        <button class="button" type="button" data-map-action="reset">Сбросить вид</button>
        <span class="map-toolbar-hint">Тяните карту мышью или пальцем · колесо меняет масштаб</span>
      </div>
      <div class="map-viewport" aria-label="Интерактивная карта двенадцати временных форм">
        <div class="tense-map-grid map-canvas">
          <div class="map-corner"><span>Время ↓</span><strong>Аспект →</strong></div>
          ${aspectNames.map((name) => `<div class="aspect-head">${name}</div>`).join("")}
          ${TENSE_MAP.map((row) => `<div class="time-head">${row.time}</div>${row.items.map((item) => `<button class="tense-cell ${row.time.toLowerCase()}" type="button" data-tense="${escapeHtml(item.name)}" aria-label="Открыть подробности: ${escapeHtml(item.name)}"><span class="tense-cell-top"><strong>${escapeHtml(item.name)}</strong><code>${escapeHtml(item.formula)}</code></span><span class="tense-focus">${escapeHtml(item.focus)}</span><span class="tense-uses"><b>Основные случаи</b>${item.uses.map((use) => `<span>• ${escapeHtml(use)}</span>`).join("")}</span><span class="tense-markers"><b>Маркеры:</b> ${item.markers.map(escapeHtml).join(" · ")}</span><em>${escapeHtml(item.examples[0])}</em></button>`).join("")}`).join("")}
        </div>
      </div>
      <aside class="map-detail" aria-live="polite" hidden></aside>
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

function initialiseTenseMap() {
  const shell = document.querySelector("#tenses-map");
  if (!shell) return;
  const viewport = shell.querySelector(".map-viewport");
  const canvas = shell.querySelector(".map-canvas");
  const detail = shell.querySelector(".map-detail");
  const scaleOutput = shell.querySelector(".map-scale");
  const allItems = TENSE_MAP.flatMap((row) => row.items.map((item) => ({ row, item })));
  const view = { x: 18, y: 18, scale: window.innerWidth < 700 ? .58 : .72 };
  let pointer = null;
  let dragged = false;
  let embeddedView = null;

  const applyView = () => {
    canvas.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.scale})`;
    scaleOutput.value = `${Math.round(view.scale * 100)}%`;
    scaleOutput.textContent = scaleOutput.value;
  };
  const zoom = (nextScale, centreX = viewport.clientWidth / 2, centreY = viewport.clientHeight / 2) => {
    const next = Math.min(1.65, Math.max(.16, nextScale));
    view.x = centreX - (centreX - view.x) * (next / view.scale);
    view.y = centreY - (centreY - view.y) * (next / view.scale);
    view.scale = next;
    applyView();
  };
  const fit = () => {
    const next = Math.min(1, (viewport.clientWidth - 28) / canvas.offsetWidth, (viewport.clientHeight - 28) / canvas.offsetHeight);
    view.scale = Math.max(.16, next);
    view.x = (viewport.clientWidth - canvas.offsetWidth * view.scale) / 2;
    view.y = (viewport.clientHeight - canvas.offsetHeight * view.scale) / 2;
    applyView();
  };
  const reset = () => {
    view.scale = window.innerWidth < 700 ? .58 : .72;
    view.x = 18;
    view.y = 18;
    applyView();
  };

  shell.addEventListener("click", async (event) => {
    const action = event.target.closest("[data-map-action]")?.dataset.mapAction;
    if (action === "in") zoom(view.scale + .12);
    if (action === "out") zoom(view.scale - .12);
    if (action === "fit") fit();
    if (action === "reset") reset();
    if (action === "fullscreen") {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (shell.requestFullscreen) {
        embeddedView = { ...view };
        await shell.requestFullscreen();
      }
    }
    const cell = event.target.closest("[data-tense]");
    if (cell && !dragged) {
      const found = allItems.find(({ item }) => item.name === cell.dataset.tense);
      if (found) {
        detail.innerHTML = tenseDetailHtml(found.row, found.item);
        detail.hidden = false;
        detail.querySelector(".map-detail-close").addEventListener("click", () => { detail.hidden = true; });
      }
    }
  });
  viewport.addEventListener("wheel", (event) => {
    event.preventDefault();
    const rect = viewport.getBoundingClientRect();
    zoom(view.scale * (event.deltaY > 0 ? .9 : 1.1), event.clientX - rect.left, event.clientY - rect.top);
  }, { passive: false });
  viewport.addEventListener("pointerdown", (event) => {
    if (event.target.closest("[data-tense]")) return;
    pointer = { id: event.pointerId, startX: event.clientX, startY: event.clientY, x: view.x, y: view.y };
    dragged = false;
    viewport.setPointerCapture(event.pointerId);
    viewport.classList.add("is-panning");
  });
  viewport.addEventListener("pointermove", (event) => {
    if (!pointer || event.pointerId !== pointer.id) return;
    const dx = event.clientX - pointer.startX;
    const dy = event.clientY - pointer.startY;
    if (Math.abs(dx) + Math.abs(dy) > 6) dragged = true;
    view.x = pointer.x + dx;
    view.y = pointer.y + dy;
    applyView();
  });
  const stopPan = (event) => {
    if (!pointer || event.pointerId !== pointer.id) return;
    pointer = null;
    viewport.classList.remove("is-panning");
    if (dragged) setTimeout(() => { dragged = false; }, 0);
  };
  viewport.addEventListener("pointerup", stopPan);
  viewport.addEventListener("pointercancel", stopPan);
  document.addEventListener("fullscreenchange", () => {
    if (!document.contains(shell)) return;
    const button = shell.querySelector('[data-map-action="fullscreen"]');
    const isFullscreen = document.fullscreenElement === shell;
    button.textContent = isFullscreen ? "Закрыть полный экран" : "На весь экран";
    if (isFullscreen) requestAnimationFrame(() => requestAnimationFrame(fit));
    else if (embeddedView) {
      Object.assign(view, embeddedView);
      embeddedView = null;
      requestAnimationFrame(applyView);
    }
  });
  window.addEventListener("resize", () => {
    if (document.fullscreenElement === shell) requestAnimationFrame(() => requestAnimationFrame(fit));
  });
  applyView();
}

async function renderTheory(parts) {
  setNav("theory");
  const slug = state.theory.some((x) => x.id === parts[1]) ? parts[1] : "foundations";
  const entry = state.theory.find((x) => x.id === slug);
  app.innerHTML = `<div class="theory-layout">${theoryNav(slug)}<section class="theory-content"><div class="loading-card">Загружаем раздел…</div></section></div>`;
  const response = await fetch(entry.file);
  if (!response.ok) throw new Error("Не удалось загрузить теорию");
  const markdown = await response.text();
  document.querySelector(".theory-content").innerHTML = `${slug === "foundations" ? tenseMapHtml() : ""}<article>${markdownToHtml(markdown)}</article>`;
  if (slug === "foundations") initialiseTenseMap();
  document.title = `${entry.title} — Grammar NOEON`;
  if (parts[2]) requestAnimationFrame(() => document.getElementById(parts.slice(2).join("/"))?.scrollIntoView());
}

async function loadExercises() {
  if (state.exercises) return state.exercises;
  const chunks = await Promise.all(state.manifest.parts.map((part) => fetchJson(part.file)));
  state.exercises = chunks.flat();
  return state.exercises;
}

function renderPractice() {
  setNav("theory");
  const levels = Object.keys(state.manifest.levels);
  app.innerHTML = `
    <div class="eyebrow">Настраиваемая практика</div>
    <h1>Практика</h1>
    <p class="lead">Выберите сложность и формат. Ответы проверяются сразу, а каждое объяснение связано с соответствующим правилом.</p>
    <form id="practice-form" class="filters">
      <div class="field"><label for="level">Уровень</label><select id="level" name="level"><option value="all">Все уровни</option>${levels.map((level) => `<option value="${level}">${level} · ${state.manifest.levels[level]} заданий</option>`).join("")}</select></div>
      <div class="field"><label for="type">Формат</label><select id="type" name="type"><option value="all">Все форматы</option>${Object.entries(state.manifest.types).map(([type, count]) => `<option value="${type}">${TYPE_LABELS[type]} · ${count}</option>`).join("")}</select></div>
      <div class="field"><label for="count">Размер сессии</label><select id="count" name="count"><option>10</option><option selected>20</option><option>25</option><option>50</option></select></div>
      <div class="filter-summary"><span id="available">Доступно: <strong>${state.manifest.total_items.toLocaleString("ru-RU")}</strong></span><button class="button primary" type="submit">Начать тренировку →</button></div>
    </form>
    <section class="stats">
      ${Object.entries(state.manifest.levels).map(([level, count]) => `<div class="stat"><strong>${count}</strong><span>уровень ${level}</span></div>`).join("")}
    </section>`;

  const form = document.querySelector("#practice-form");
  form.addEventListener("change", updateAvailable);
  form.addEventListener("submit", startSession);
  loadExercises().then(updateAvailable).catch(showError);
}

function filteredExercises(form) {
  if (!state.exercises) return [];
  const level = form.elements.level.value;
  const type = form.elements.type.value;
  return state.exercises.filter((item) => (level === "all" || item.cefr_estimate === level) && (type === "all" || item.type === type));
}

function updateAvailable() {
  const form = document.querySelector("#practice-form");
  if (!form) return;
  const count = state.exercises ? filteredExercises(form).length : state.manifest.total_items;
  document.querySelector("#available").innerHTML = `Доступно: <strong>${count.toLocaleString("ru-RU")}</strong>`;
  form.querySelector("button[type=submit]").disabled = count === 0;
}

async function startSession(event) {
  event.preventDefault();
  const button = event.currentTarget.querySelector("button[type=submit]");
  button.disabled = true;
  button.textContent = "Готовим задания…";
  await loadExercises();
  const pool = filteredExercises(event.currentTarget);
  const count = Math.min(Number(event.currentTarget.elements.count.value), pool.length);
  const selected = [...pool].sort(() => Math.random() - .5).slice(0, count);
  state.session = { items: selected, index: 0, correct: 0, answers: [], checked: false };
  location.hash = "session";
}

function renderPrompt(item) {
  if (item.type === "context_cloze") {
    return escapeHtml(item.prompt).replace(/\{\{(\d+):([^}]+)}}/g, (_, number, verb) => `<span class="blank-token">[${number}: ${escapeHtml(verb)}]</span>`);
  }
  if (item.type === "open_brackets") {
    let number = 0;
    return escapeHtml(item.prompt).replace(/\((?:to )?([^)]+)\)/g, (_, verb) => `<span class="blank-token">[${++number}: ${verb}]</span>`);
  }
  return escapeHtml(item.prompt);
}

function acceptedFor(item, blankIndex = null) {
  const source = blankIndex === null ? item : item.blanks[blankIndex];
  const answer = Array.isArray(source.answer) ? source.answer[blankIndex] : source.answer;
  return [...new Set([answer, ...(source.accepted_answers || [])].filter(Boolean))];
}

function answerControls(item) {
  if (item.options) {
    return `<fieldset class="choice-list"><legend>Выберите ответ</legend>${item.options.map((option, index) => `<label><input type="radio" name="choice" value="${index}"> <span>${escapeHtml(option)}</span></label>`).join("")}</fieldset>`;
  }
  if (item.blanks?.length) {
    return `<div class="blank-list">${item.blanks.map((blank, index) => `<div class="field"><label for="blank-${index}">${index + 1}. ${blank.base_verb ? `Форма глагола <strong>${escapeHtml(blank.base_verb)}</strong>` : "Ответ"}</label><input class="answer-input" id="blank-${index}" data-answer-index="${index}" lang="en" autocomplete="off" spellcheck="false"></div>`).join("")}</div>`;
  }
  return `<div class="field"><label for="answer">Ваш ответ</label><textarea class="answer-area" id="answer" rows="3" lang="en" autocomplete="off" spellcheck="false"></textarea></div>`;
}

function refsFor(item) {
  const refs = [...(item.rule_refs || []), ...(item.blanks || []).flatMap((blank) => blank.rule_refs || [])];
  return [...new Set(refs)];
}

function ruleLink(ref) {
  const match = ref.match(/content\/tenses\/([^#]+)(?:#(.+))?/);
  if (!match) return "#theory/foundations";
  const route = THEORY_ROUTE_BY_FILE[match[1]] || "foundations";
  return `#theory/${route}${match[2] ? `/${match[2]}` : ""}`;
}

function renderSession() {
  setNav("theory");
  const session = state.session;
  if (!session?.items.length) { location.hash = "practice"; return; }
  const item = session.items[session.index];
  app.innerHTML = `<section class="session">
    <div class="session-top"><span>Задание ${session.index + 1} из ${session.items.length}</span><span>Верно: ${session.correct}</span></div>
    <div class="progress" aria-label="Прогресс"><span style="width:${(session.index / session.items.length) * 100}%"></span></div>
    <article class="exercise-card">
      <div class="exercise-meta"><span class="pill">${escapeHtml(item.cefr_estimate || "—")}</span><span class="pill">${escapeHtml(TYPE_LABELS[item.type] || item.type)}</span></div>
      ${item.title ? `<h2>${escapeHtml(item.title)}</h2>` : ""}
      <div class="prompt" lang="${item.type === "translation_ru_en" ? "ru" : "en"}">${renderPrompt(item)}</div>
      ${item.type === "open_brackets" ? '<p class="verb-only-note">Впишите только формы указанных глаголов. Не добавляйте подлежащие, дополнения или другие слова.</p>' : ""}
      <form id="answer-form">${answerControls(item)}<div class="actions"><button class="button primary" type="submit">Проверить ответ</button><a class="button" href="#practice">Завершить</a></div></form>
      <div id="feedback" aria-live="polite"></div>
    </article>
  </section>`;
  document.querySelector("#answer-form").addEventListener("submit", checkAnswer);
  requestAnimationFrame(() => window.scrollTo(0, 0));
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
  if (item.options) return submitted === item.correct_option_index;
  if (item.blanks?.length) return submitted.every((value, index) => acceptedFor(item, index).some((answer) => normalise(answer) === normalise(value)));
  return acceptedFor(item).some((answer) => normalise(answer) === normalise(submitted));
}

function correctAnswer(item) {
  if (item.answer_text) return item.answer_text;
  if (Array.isArray(item.answer)) return item.answer.join(" · ");
  if (item.answer) return item.answer;
  return item.blanks?.map((blank, index) => `${index + 1}. ${blank.answer}`).join(" · ") || "—";
}

function explanations(item) {
  const detailedBlanks = (item.blanks || []).filter((blank) => blank.explanation_ru);
  const details = detailedBlanks.map((blank, index) => `<li><strong>${index + 1}. ${escapeHtml(blank.answer)}</strong> — ${escapeHtml(blank.explanation_ru)}</li>`).join("");
  return `${escapeHtml(item.explanation_ru || "")}${details ? `<details><summary>Разбор каждого пропуска</summary><ul>${details}</ul></details>` : ""}`;
}

function checkAnswer(event) {
  event.preventDefault();
  const session = state.session;
  if (session.checked) return;
  const item = session.items[session.index];
  const submitted = getSubmitted(item, event.currentTarget);
  const correct = evaluate(item, submitted);
  const feedback = document.querySelector("#feedback");
  if (correct === null) { feedback.innerHTML = `<div class="feedback wrong"><h3>Нужен ответ</h3><p>Заполните все поля или выберите вариант.</p></div>`; return; }
  session.checked = true;
  if (correct) session.correct += 1;
  session.answers.push({ id: item.id, correct, submitted });
  event.currentTarget.querySelectorAll("input, textarea, button").forEach((control) => { control.disabled = true; });
  const refs = refsFor(item);
  feedback.innerHTML = `<div class="feedback ${correct ? "" : "wrong"}">
    <h3>${correct ? "✓ Верно" : "× Ответ нужно исправить"}</h3>
    ${correct ? "" : `<p>Правильный ответ: <strong lang="en">${escapeHtml(correctAnswer(item))}</strong></p>`}
    <p>${explanations(item)}</p>
    ${item.review_note_ru ? `<details><summary>Редакторская заметка</summary><p>${escapeHtml(item.review_note_ru)}</p></details>` : ""}
    <div class="rule-links">${refs.map((ref) => `<a class="button" href="${ruleLink(ref)}">Открыть правило</a>`).join("")}</div>
    <div class="actions"><button id="next-question" class="button primary" type="button">${session.index + 1 === session.items.length ? "Завершить сессию →" : "Следующее задание →"}</button></div>
  </div>`;
  document.querySelector("#next-question").addEventListener("click", nextQuestion);
}

function nextQuestion() {
  const session = state.session;
  if (session.index + 1 < session.items.length) {
    session.index += 1;
    session.checked = false;
    renderSession();
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  const attempt = { date: new Date().toISOString(), total: session.items.length, correct: session.correct, levels: [...new Set(session.items.map((x) => x.cefr_estimate))], types: [...new Set(session.items.map((x) => x.type))] };
  const history = readHistory();
  history.unshift(attempt);
  localStorage.setItem("noeon-history", JSON.stringify(history.slice(0, 50)));
  location.hash = "results";
}

function readHistory() {
  try { return JSON.parse(localStorage.getItem("noeon-history") || "[]"); }
  catch { return []; }
}

function renderResults() {
  setNav("results");
  const history = readHistory();
  const latest = history[0];
  if (!latest) {
    app.innerHTML = `<div class="eyebrow">Личный прогресс</div><h1>Результаты</h1><div class="empty"><h2>Пока нет попыток</h2><p>Завершите первую тренировку — результат сохранится в этом браузере.</p><a class="button primary" href="#practice">Начать практику →</a></div>`;
    return;
  }
  const percent = Math.round(latest.correct / latest.total * 100);
  app.innerHTML = `<div class="eyebrow">Личный прогресс</div><h1>Результаты</h1>
    <section class="result-hero"><div class="score-ring">${percent}%</div><div><h2>${latest.correct} из ${latest.total}</h2><p>Последняя завершённая сессия. Данные хранятся только в этом браузере.</p><a class="button primary" href="#practice">Новая тренировка →</a></div></section>
    <section class="history"><h2>История</h2>${history.map((attempt) => `<div class="history-row"><div><strong>${attempt.correct} из ${attempt.total}</strong><br><small>${escapeHtml(attempt.levels.join(", "))} · ${attempt.types.length} форматов</small></div><span>${Math.round(attempt.correct / attempt.total * 100)}%</span><time datetime="${attempt.date}">${new Date(attempt.date).toLocaleString("ru-RU")}</time></div>`).join("")}</section>`;
}

function showError(error) {
  console.error(error);
  app.innerHTML = `<div class="error-card"><h2>Не удалось загрузить страницу</h2><p>${escapeHtml(error.message)}</p><button class="button" type="button" onclick="location.reload()">Повторить</button></div>`;
}

async function route() {
  window.scrollTo(0, 0);
  const parts = location.hash.replace(/^#/, "").split("/").filter(Boolean);
  const section = parts[0] || "home";
  document.title = "Grammar NOEON — английские времена";
  try {
    if (section === "home") renderHome();
    else if (section === "theory") await renderTheory(parts);
    else if (section === "practice") renderPractice();
    else if (section === "session") renderSession();
    else if (section === "results") renderResults();
    else if (section === "profile") renderProfile();
    else { location.hash = "home"; }
  } catch (error) { showError(error); }
}

async function initialise() {
  try {
    [state.manifest, state.theory] = await Promise.all([
      fetchJson("data/exercises/index.json"),
      fetchJson("data/theory.json"),
    ]);
    window.addEventListener("hashchange", route);
    await route();
  } catch (error) { showError(error); }
}

initialise();

if (typeof module !== "undefined") module.exports = { normalise, slugify, TYPE_LABELS, THEORY_ROUTE_BY_FILE };
