/* Grammar NOEON — компактный раздел «Ученики» для учителя.
   Подключать ПОСЛЕ accounts.js и ДО app.js. Заменяет renderStudents/studentCards,
   использует существующие: account, app, accountRequest, escapeHtml, toast,
   syncRouteNav, bindInviteForm, renderActiveInvites. Серверные запросы те же. */
(() => {
  'use strict';

  const STORE_KEY = 'noeon.roster.v1';
  const DAY = 86400000;
  const SORTS = { activity: 'Активность', name: 'Имя', accuracy: 'Точность', tasks: 'Задания' };
  const FILTERS = ['all', 'today', 'attention', 'review', 'tasks', 'new', 'archive'];
  const FILTER_LABELS = { all: 'Все', today: 'Сегодня', attention: 'Внимание', review: 'Проверка', tasks: 'С заданиями', new: 'Новые', archive: 'Архив' };
  const HUES = [205, 262, 330, 14, 42, 150, 176, 232];

  /* ---------- чистые функции (покрыты тестами) ---------- */

  const RU_KEYS = 'йцукенгшщзхъфывапролджэячсмитьбюё';
  const EN_KEYS = "qwertyuiop[]asdfghjkl;'zxcvbnm,.`";
  const TO_RU = new Map([...EN_KEYS].map((c, i) => [c, RU_KEYS[i]]));
  const TO_EN = new Map([...RU_KEYS].map((c, i) => [c, EN_KEYS[i]]));
  const TRANSLIT = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya' };

  const normalize = s => String(s ?? '').toLowerCase().replace(/ё/g, 'е');
  const layoutFix = s => {
    const text = normalize(s);
    const cyr = (text.match(/[а-я]/g) || []).length, lat = (text.match(/[a-z]/g) || []).length;
    const map = cyr > lat ? TO_EN : TO_RU;
    return [...text].map(c => map.get(c) ?? c).join('');
  };
  const translit = s => [...normalize(s)].map(c => TRANSLIT[c] ?? c).join('');

  function haystack(student) {
    return normalize(student.name) + ' ' + normalize(student.email) + ' ' + translit(student.name);
  }
  const queryTokens = q => normalize(q).split(/\s+/).filter(Boolean);
  function matchesQuery(student, q) {
    const tokens = queryTokens(q);
    if (!tokens.length) return true;
    const hay = haystack(student);
    return tokens.every(t => hay.includes(t));
  }
  /* Сначала ищем как введено; если никого — пробуем исправить раскладку («fkbyf» → «алина»). */
  function resolveQuery(students, q) {
    const direct = String(q ?? '').trim();
    if (!direct || students.some(s => matchesQuery(s, direct))) return { q: direct, fixed: false };
    const fixed = layoutFix(direct);
    return fixed !== normalize(direct) && students.some(s => matchesQuery(s, fixed)) ? { q: fixed, fixed: true } : { q: direct, fixed: false };
  }

  function daysSince(iso, now) {
    const t = Date.parse(iso);
    if (!t) return null;
    const a = new Date(now), b = new Date(t);
    const d = Math.round((new Date(a.getFullYear(), a.getMonth(), a.getDate()) - new Date(b.getFullYear(), b.getMonth(), b.getDate())) / DAY);
    return Math.max(0, d);
  }

  function describeStudent(student, now = Date.now()) {
    const st = student.stats || {};
    const answers = Number(st.maxScore) || 0, score = Number(st.score) || 0;
    const sessions = Number(st.sessions) || 0, unfinished = Number(student.unfinished) || 0;
    const t = Date.parse(student.lastActive) || null;
    const days = daysSince(student.lastActive, now);
    const pct = answers ? Math.round(score / answers * 100) : null;
    let level = 'none';
    if (days !== null) level = t && now - t >= 0 && now - t < 10 * 60000 ? 'online' : days === 0 ? 'today' : days <= 3 ? 'ok' : days <= 7 ? 'warn' : 'cold';
    const debt = unfinished > 0, fresh = sessions === 0 && answers === 0;
    const low = answers >= 15 && pct < 60;
    const stale = debt && (level === 'cold' || (level === 'none' && sessions === 0));
    const attention = student.active !== false && (low || stale);
    let flag = '';
    if (low) flag = `точность ${pct}%`;
    else if (level === 'cold' && debt) flag = `${days} дн. без занятий`;
    return { answers, score, sessions, unfinished, t, days, pct, level, debt, fresh, low, attention, flag };
  }

  const FILTER_TESTS = {
    all: x => x.s.active !== false,
    today: x => x.s.active !== false && (x.i.level === 'online' || x.i.level === 'today'),
    attention: x => x.i.attention,
    review: x => x.s.active !== false && (x.i.review?.fields || 0) > 0,
    tasks: x => x.s.active !== false && x.i.debt,
    new: x => x.s.active !== false && x.i.fresh,
    archive: x => x.s.active === false,
  };

  /* Имена в двух алфавитах идут вперемешку: сравниваем по транслитерации. */
  const byName = (A, B) => translit(A.s.name).localeCompare(translit(B.s.name), 'en', { sensitivity: 'base' });

  function sortItems(items, sort, rev) {
    const dir = rev ? -1 : 1;
    const key = x => sort === 'activity' ? x.i.t : sort === 'accuracy' ? x.i.pct : null;
    return [...items].sort((A, B) => {
      let d = 0;
      if (sort === 'activity' || sort === 'accuracy') {
        const a = key(A), b = key(B);
        if (a == null || b == null) { if (a !== b) return a == null ? 1 : -1; }
        else d = (b - a) * dir;
      } else if (sort === 'tasks') d = (B.i.unfinished - A.i.unfinished) * dir;
      else if (sort === 'name') d = byName(A, B) * dir;
      return d || byName(A, B) || String(A.s.id).localeCompare(String(B.s.id));
    });
  }

  const plural = (n, [one, few, many]) => {
    const m10 = n % 10, m100 = n % 100;
    return m10 === 1 && m100 !== 11 ? one : m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20) ? few : many;
  };
  const fmtTime = t => new Date(t).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  function activityText(i) {
    if (i.level === 'online') return 'онлайн';
    if (i.level === 'none') return i.sessions ? 'нет данных' : 'не заходил';
    if (i.days === 0) return `сегодня, ${fmtTime(i.t)}`;
    if (i.days === 1) return `вчера, ${fmtTime(i.t)}`;
    if (i.days < 7) return `${i.days} дн. назад`;
    if (i.days < 30) return `${Math.floor(i.days / 7)} нед. назад`;
    return `${Math.floor(i.days / 30)} мес. назад`;
  }
  const taskText = n => `${n} ${plural(n, ['задание', 'задания', 'заданий'])}`;

  function initials(name) {
    const parts = String(name || '?').trim().split(/\s+/).filter(Boolean);
    return (parts.length > 1 ? parts[0][0] + parts[1][0] : (parts[0] || '?')[0]).toUpperCase();
  }
  function hueFor(name) {
    let h = 0;
    for (const c of String(name)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return HUES[h % HUES.length];
  }

  function summary(items) {
    const active = items.filter(FILTER_TESTS.all);
    const answers = active.reduce((n, x) => n + x.i.answers, 0), score = active.reduce((n, x) => n + x.i.score, 0);
    return {
      total: active.length,
      today: items.filter(FILTER_TESTS.today).length,
      attention: items.filter(FILTER_TESTS.attention).length,
      avg: answers ? Math.round(score / answers * 100) : null,
    };
  }

  function summaryText(items, now = Date.now()) {
    const date = new Date(now).toLocaleDateString('ru-RU');
    const lines = items.map(({ s, i }) => {
      const parts = [activityText(i)];
      parts.push(i.pct == null ? 'точность —' : `точность ${i.pct}% (${i.answers} отв.)`);
      if (i.debt) parts.push(`ждёт: ${taskText(i.unfinished)}`);
      return `• ${s.name} — ${parts.join('; ')}`;
    });
    return `Ученики · ${date} · ${items.length}\n${lines.join('\n')}`;
  }

  function highlight(text, q) {
    const raw = String(text), norm = normalize(raw);
    const tokens = queryTokens(q);
    if (!tokens.length || norm.length !== raw.length) return escape(raw);
    const marks = [];
    for (const v of tokens) {
      let at = norm.indexOf(v);
      while (at !== -1) { marks.push([at, at + v.length]); at = norm.indexOf(v, at + v.length); }
    }
    if (!marks.length) return escape(raw);
    marks.sort((a, b) => a[0] - b[0]);
    const merged = [marks[0].slice()];
    for (const m of marks.slice(1)) { const last = merged[merged.length - 1]; if (m[0] <= last[1]) last[1] = Math.max(last[1], m[1]); else merged.push(m.slice()); }
    let out = '', pos = 0;
    for (const [a, b] of merged) { out += escape(raw.slice(pos, a)) + '<mark>' + escape(raw.slice(a, b)) + '</mark>'; pos = b; }
    return out + escape(raw.slice(pos));
  }
  const escape = s => (typeof escapeHtml === 'function' ? escapeHtml(s) : String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])));

  /* ---------- состояние ---------- */

  function loadState() {
    const base = { sort: 'activity', rev: false, filter: 'all' };
    try {
      const s = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
      return { sort: SORTS[s.sort] ? s.sort : base.sort, rev: !!s.rev, filter: FILTERS.includes(s.filter) ? s.filter : base.filter };
    } catch { return base; }
  }
  function saveState(state) { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch { /* приватный режим */ } }

  /* ---------- разметка ---------- */

  function rowHtml(x, q) {
    const { s, i } = x;
    const archived = s.active === false;
    const meta = [`<span class="roster-act lvl-${i.level}">${escape(activityText(i))}</span>`];
    if (archived) meta.push('<span class="roster-chip">в архиве</span>');
    else {
      if (i.debt) meta.push(`<span class="roster-chip task">${taskText(i.unfinished)}</span>`);
      if (i.review?.fields) meta.push(`<span class="roster-chip review">проверить: ${i.review.fields}</span>`);
    }
    if (i.flag && !archived) meta.push(`<span class="roster-flag">${escape(i.flag)}</span>`);
    const barClass = i.pct == null ? '' : i.pct >= 80 ? 'good' : i.pct >= 60 ? 'mid' : 'low';
    const score = i.pct == null
      ? '<span class="roster-score empty"><b>—</b><small>нет данных</small></span>'
      : `<span class="roster-score${i.answers < 10 ? ' thin' : ''}"><b>${i.pct}%</b><i class="roster-bar ${barClass}"><u style="width:${i.pct}%"></u></i><small>${i.answers} ${plural(i.answers, ['ответ', 'ответа', 'ответов'])}</small></span>`;
    return `<a class="roster-row${i.attention ? ' attn' : ''}${archived ? ' is-archived' : ''}" href="#student/${escape(encodeURIComponent(s.id))}" data-roster-row title="${escape(s.email)}">`
      + `<span class="roster-ava" style="--h:${hueFor(s.name)}" aria-hidden="true">${escape(initials(s.name))}<i class="roster-dot lvl-${i.level}"></i></span>`
      + `<span class="roster-main"><strong>${highlight(s.name, q)}</strong><span class="roster-meta">${meta.join('')}</span></span>`
      + `<span class="roster-mail">${highlight(s.email, q)}</span>${score}<span class="roster-go" aria-hidden="true">›</span></a>`;
  }

  const ICON_SEARCH = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';

  /* ---------- профиль ученика и очередь проверки: чистые функции ---------- */

  /* Время приходит то ISO-строкой, то миллисекундами, то секундами Unix. */
  const ts = v => {
    if (v == null || v === '') return null;
    const n = typeof v === 'number' ? v : Date.parse(v);
    return Number.isFinite(n) ? (n > 0 && n < 1e11 ? n * 1000 : n) : null;
  };
  function fmtDate(v, now = Date.now()) {
    const t = ts(v);
    if (t == null) return '—';
    const d = new Date(t), otherYear = d.getFullYear() !== new Date(now).getFullYear();
    return d.toLocaleDateString('ru-RU', otherYear ? { day: 'numeric', month: 'short', year: 'numeric' } : { day: 'numeric', month: 'short' }).replace(' г.', '');
  }
  function agoText(v, now = Date.now()) {
    const t = ts(v);
    if (t == null) return 'нет данных';
    const days = daysSince(new Date(t).toISOString(), now);
    if (days === 0) return 'сегодня';
    if (days === 1) return 'вчера';
    if (days < 7) return `${days} дн. назад`;
    return fmtDate(t, now);
  }

  const STATUS = { assigned: ['Не начато', 'new'], started: ['В процессе', 'run'], draft: ['В процессе', 'run'], completed: ['Выполнено', 'done'], cancelled: ['Снято', 'off'] };
  const STALE_DAYS = 3;

  /* Одна запись задания или тренировки в едином виде. */
  function workView(item, now = Date.now()) {
    const status = STATUS[item.status] ? item.status : 'started';
    const index = Number(item.index) || 0, total = Number(item.total) || 0;
    const max = Number(item.maxScore) || 0, score = Number(item.score) || 0;
    const created = ts(item.created ?? item.date);
    return {
      id: item.practiceId ?? item.id, title: item.title || 'Тренировка', status, label: STATUS[status][0], tone: STATUS[status][1],
      date: ts(item.date ?? item.created), index, total, progress: total ? Math.min(100, Math.round(index / total * 100)) : 0,
      pct: max ? Math.round(score / max * 100) : null, score, max, self: item.source === 'self',
      staleDays: status === 'assigned' && !index && created != null && now - created > STALE_DAYS * DAY ? Math.floor((now - created) / DAY) : 0,
    };
  }
  function bucketAssignments(list, now = Date.now()) {
    const views = (list || []).map(a => workView(a, now));
    const byDate = dir => (a, b) => ((a.date ?? 0) - (b.date ?? 0)) * dir;
    return {
      open: views.filter(v => v.tone === 'new' || v.tone === 'run').sort(byDate(1)),
      done: views.filter(v => v.tone === 'done').sort(byDate(-1)),
      off: views.filter(v => v.tone === 'off').sort(byDate(-1)),
    };
  }

  const heatClass = (pct, checked) => !checked ? 'none' : checked < 5 ? 'thin' : pct < 50 ? 'bad' : pct < 70 ? 'warn' : pct < 85 ? 'mid' : 'good';
  const SECTIONS = [['tenses', 'Tenses'], ['comparison', 'Comparison'], ['passive', 'Passive'], ['modals', 'Modal Verbs'], ['reported', 'Reported Speech']];
  const SECTION_IDS = SECTIONS.map(s => s[0]);

  function addCounts(target, part) {
    target.correct += Number(part.correct) || 0;
    target.checked += Number(part.checked) || 0;
    target.pending += Number(part.pending) || 0;
    const a = ts(target.lastWork), b = ts(part.lastWork);
    if (b != null && (a == null || b > a)) target.lastWork = b;
  }
  /* which: 'practice' | 'assessment' | 'all' (сумма). Всегда 5 разделов, даже пустых. */
  function sectionsView(stat, which = 'practice') {
    const kinds = which === 'all' ? ['practice', 'assessment'] : [which];
    return SECTIONS.map(([id, title]) => {
      const sec = { id, title, correct: 0, checked: 0, pending: 0, lastWork: null, topics: [] }, byId = new Map();
      for (const kind of kinds) {
        const part = (stat?.kinds?.[kind]?.sections || []).find(s => s.id === id);
        if (!part) continue;
        addCounts(sec, part);
        for (const t of part.topics || []) {
          let m = byId.get(t.id);
          if (!m) { m = { id: t.id, correct: 0, checked: 0, pending: 0, lastWork: null }; byId.set(t.id, m); sec.topics.push(m); }
          addCounts(m, t);
        }
      }
      for (const t of sec.topics) { t.pct = t.checked ? Math.round(t.correct / t.checked * 100) : null; t.heat = heatClass(t.pct, t.checked); }
      sec.pct = sec.checked ? Math.round(sec.correct / sec.checked * 100) : null;
      return sec;
    });
  }
  function overallStats(stat) {
    const out = { correct: 0, checked: 0, pending: 0, lastWork: null, sessions: 0, practiceSessions: 0, testSessions: 0 };
    for (const [kind, key] of [['practice', 'practiceSessions'], ['assessment', 'testSessions']]) {
      const k = stat?.kinds?.[kind];
      if (!k) continue;
      addCounts(out, k);
      out[key] = Number(k.sessions) || 0;
    }
    out.sessions = out.practiceSessions + out.testSessions;
    out.pct = out.checked ? Math.round(out.correct / out.checked * 100) : null;
    return out;
  }
  function weakTopics(stat, { minChecked = 5, below = 70, limit = 3 } = {}) {
    const all = sectionsView(stat, 'all').flatMap(s => s.topics.map(t => ({ ...t, section: s.id })));
    return all.filter(t => t.checked >= minChecked && t.pct < below).sort((a, b) => a.pct - b.pct || b.checked - a.checked).slice(0, limit);
  }

  /* Что учителю стоит заметить в первую очередь. */
  function insightsFor({ studentId, buckets, stat, labelOf = id => id, now = Date.now() }) {
    const out = [], sid = encodeURIComponent(studentId);
    const stale = buckets.open.filter(v => v.staleDays);
    if (stale.length === 1) out.push({ tone: 'warn', title: `«${stale[0].title}» не начато ${stale[0].staleDays} дн.`, href: `#student-work/${sid}/${encodeURIComponent(stale[0].id)}`, action: 'Открыть' });
    else if (stale.length > 1) out.push({ tone: 'warn', title: `Не начато больше ${STALE_DAYS} дней: ${stale.length} ${plural(stale.length, ['задание', 'задания', 'заданий'])}`, href: '#tasks', tab: 'tasks', action: 'Показать' });
    if (stat) {
      const o = overallStats(stat);
      if (o.pending > 0) out.push({ tone: 'info', title: `${o.pending} ${plural(o.pending, ['ответ ждёт', 'ответа ждут', 'ответов ждут'])} вашей проверки`, href: '#review-queue', action: 'Открыть очередь' });
      const weak = weakTopics(stat);
      if (weak.length) out.push({ tone: 'bad', title: weak.length === 1 ? 'Слабая тема' : 'Слабые темы', sub: 'Меньше 70% при 5 и более ответах. Нажмите на тему, чтобы назначить повторение.', chips: weak.map(t => ({ id: t.id, label: labelOf(t.id), pct: t.pct, checked: t.checked, href: `#assign/${sid}/${encodeURIComponent(t.id)}` })) });
      if (!o.sessions && !buckets.open.length && !buckets.done.length) out.push({ tone: 'info', title: 'Работ пока нет', href: `#assign/${sid}`, action: 'Назначить первое задание' });
    }
    return out;
  }

  /* Список учеников по давности активности (только при сортировке «Активность»). */
  const GROUPS = [['today', 'Сегодня'], ['week', 'На этой неделе'], ['old', 'Давно не заходили'], ['none', 'Нет данных об активности']];
  function groupByActivity(items) {
    const key = i => i.level === 'online' || i.level === 'today' ? 'today' : i.level === 'ok' || i.level === 'warn' ? 'week' : i.level === 'cold' ? 'old' : 'none';
    const map = new Map(GROUPS.map(([k, label]) => [k, { key: k, label, items: [] }]));
    for (const x of items) map.get(key(x.i)).items.push(x);
    return [...map.values()].filter(g => g.items.length);
  }

  /* Очередь проверки: по ученикам. */
  function reviewsByStudent(entries) {
    const map = new Map();
    for (const w of entries || []) {
      const m = map.get(w.studentId) || { fields: 0, works: 0 };
      m.fields += Number(w.pending) || 0; m.works += 1;
      map.set(w.studentId, m);
    }
    return map;
  }
  function groupReviews(entries, q = '') {
    const tokens = queryTokens(q), groups = new Map();
    for (const w of entries || []) {
      const hay = normalize(w.studentName) + ' ' + normalize(w.title) + ' ' + translit(w.studentName);
      if (!tokens.every(t => hay.includes(t))) continue;
      let g = groups.get(w.studentId);
      if (!g) { g = { studentId: w.studentId, studentName: w.studentName, fields: 0, works: [] }; groups.set(w.studentId, g); }
      g.fields += Number(w.pending) || 0; g.works.push(w);
    }
    return [...groups.values()].sort((a, b) => b.fields - a.fields || a.studentName.localeCompare(b.studentName, 'ru'));
  }

  /* ---------- общие вещи экранов ---------- */

  const enc = encodeURIComponent;
  const labelOf = id => (typeof PRACTICE_TENSES !== 'undefined' ? PRACTICE_TENSES.find(t => t.id === id)?.label : null) || id;
  const barTone = heat => ({ warn: 'mid', bad: 'low' }[heat] || '');
  const bar = (pct, tone = '') => `<i class="roster-bar ${tone}"><u style="width:${Math.max(0, Math.min(100, pct))}%"></u></i>`;
  const answersWord = n => plural(n, ['ответ', 'ответа', 'ответов']);
  const avatar = (name, level = 'none', cls = '') => `<span class="roster-ava ${cls}" style="--h:${hueFor(name)}" aria-hidden="true">${escape(initials(name))}<i class="roster-dot lvl-${level}"></i></span>`;
  const skeletonRows = n => Array.from({ length: n }, () => '<div class="roster-skel-row"><i></i><span><b></b><b></b></span></div>').join('');
  const copyText = async (text, ok) => { try { await navigator.clipboard.writeText(text); toast(ok); } catch { toast('Не удалось скопировать — разрешите доступ к буферу обмена'); } };

  /* Сводка по очереди проверки: общая для списка и очереди; кэш на минуту. */
  let reviewCache = null;
  async function loadReviewSummary(force = false) {
    const owner = account.user?.id;
    if (!force && reviewCache && reviewCache.owner === owner && Date.now() - reviewCache.at < 60000) return reviewCache;
    const entries = []; let cursor = null, total = 0, totalFields = 0;
    for (let page = 0; page < 5; page++) {
      const data = await accountRequest('teacher/reviews' + (cursor ? '?cursor=' + enc(cursor) : ''));
      entries.push(...(data.items || [])); total = Number(data.total) || entries.length; totalFields = Number(data.totalFields) || 0; cursor = data.nextCursor;
      if (!cursor) break;
    }
    return (reviewCache = { at: Date.now(), owner, entries, total, totalFields, map: reviewsByStudent(entries) });
  }

  /* Строка работы — одна для заданий, тренировок и очереди. */
  function workRow(v, href, extra = {}) {
    const meta = [];
    if (extra.meta) meta.push(...extra.meta);
    else {
      meta.push(`<span>${escape(fmtDate(v.date))}</span>`);
      if (v.total) meta.push(`<span>${v.index}/${v.total}</span>`);
      if (v.self) meta.push('<span class="roster-chip">самостоятельно</span>');
      if (v.staleDays) meta.push(`<span class="roster-flag">не начато ${v.staleDays} дн.</span>`);
    }
    const side = extra.side ?? (v.tone === 'done'
      ? (v.pct == null ? '<span class="sp-work-side"><b class="sp-report">Отчёт</b></span>' : `<span class="sp-work-side ${heatClass(v.pct, 5)}"><b>${v.pct}%</b><small>${v.score}/${v.max}</small></span>`)
      : `<span class="sp-work-side"><span class="sp-state ${v.tone}">${v.label}</span></span>`);
    return `<a class="sp-work ${v.tone}${v.staleDays ? ' stale' : ''}" href="${escape(href)}"><span class="sp-work-main"><strong>${escape(v.title)}</strong><span class="sp-work-meta">${meta.join('')}</span>${v.tone === 'run' && v.total ? bar(v.progress) : ''}</span>${side}<span class="roster-go" aria-hidden="true">›</span></a>`;
  }

  /* ---------- экран: список учеников ---------- */

  let keyAbort = null;

  async function renderStudentsRoster() {
    syncRouteNav();
    if (account.user?.role !== 'teacher') { location.hash = 'profile'; return; }
    const owner = account.user.id, routeAtStart = location.hash;
    app.innerHTML = `<div class="roster" aria-busy="true"><div class="roster-head"><h1>Ученики</h1></div><div class="roster-list">${skeletonRows(6)}</div></div>`;
    let data;
    try { data = await accountRequest('teacher/students'); }
    catch (error) {
      if (account.user?.id === owner && location.hash === routeAtStart) app.innerHTML = `<p role="alert">${escape(error.message || 'Не удалось загрузить учеников')}</p><p><a class="button" href="#students">Повторить</a></p>`;
      return;
    }
    if (account.user?.id !== owner || location.hash !== routeAtStart) return;

    const now = Date.now();
    const items = (data.students || []).map(s => ({ s, i: describeStudent(s, now) }));
    const state = loadState();
    let query = '', reviewFields = 0;

    app.innerHTML = `<div class="roster" data-roster>
      <div class="roster-head">
        <h1>Ученики</h1>
        <div class="roster-actions">
          <a class="button" href="#review-queue" id="roster-review-link">На проверке<span class="roster-badge" id="roster-review-count" hidden></span></a>
          <button class="button primary" type="button" id="roster-invite-open">+ Пригласить<span class="roster-badge" id="roster-invite-count" hidden></span></button>
        </div>
      </div>
      <div class="roster-kpis" id="roster-kpis" role="group" aria-label="Сводка"></div>
      <div class="roster-search" role="search">${ICON_SEARCH}<input id="roster-q" type="search" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="search" placeholder="Поиск: имя или почта" aria-label="Поиск по ученикам"><kbd aria-hidden="true">/</kbd></div>
      <div class="roster-chips" role="group" aria-label="Фильтр">${FILTERS.map(f => `<button type="button" class="roster-fchip" data-filter="${f}" aria-pressed="${state.filter === f}">${FILTER_LABELS[f]} <b data-count="${f}">0</b></button>`).join('')}</div>
      <div class="roster-tools">
        <label>Сортировка <select id="roster-sort">${Object.entries(SORTS).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></label>
        <button type="button" class="roster-icon" id="roster-rev" aria-label="Обратный порядок" title="Обратный порядок">⇅</button>
        <button type="button" class="roster-icon wide" id="roster-copy" title="Скопировать показанный список текстом">Скопировать</button>
      </div>
      <p class="roster-count" id="roster-count" role="status" aria-live="polite"></p>
      <div class="roster-list" id="roster-list"></div>
      <dialog class="roster-dialog" id="roster-invite-dialog" aria-labelledby="roster-invite-title">
        <div class="roster-dialog-head"><h2 id="roster-invite-title">Пригласить ученика</h2><button type="button" class="roster-icon" data-close aria-label="Закрыть">✕</button></div>
        <form id="invite-form"><p>Создайте ссылку и отправьте ученику. Имя, почту и пароль он введёт сам. Одна ссылка — один ученик, срок действия — 7 дней.</p><button class="button primary">Создать ссылку приглашения</button><div id="invite-result" role="status"></div></form>
        <h3>Действующие приглашения</h3><div id="active-invites" role="status">Загружаем приглашения…</div>
      </dialog></div>`;

    const $ = sel => app.querySelector(sel);
    const list = $('#roster-list'), input = $('#roster-q'), sortSel = $('#roster-sort');
    sortSel.value = state.sort;
    const mounted = () => account.user?.id === owner && list.isConnected;

    /* счётчики, плитки сводки и бейдж «На проверке» */
    const recount = () => {
      const sum = summary(items);
      for (const f of FILTERS) { const el = $(`[data-count="${f}"]`); if (el) el.textContent = items.filter(FILTER_TESTS[f]).length; }
      const tile = (filter, value, label, tone = '') => {
        const inner = `<b>${value}</b><span>${label}</span>`;
        return filter ? `<button type="button" class="roster-kpi ${tone}" data-filter="${filter}" aria-pressed="${state.filter === filter}">${inner}</button>` : `<div class="roster-kpi ${tone}">${inner}</div>`;
      };
      $('#roster-kpis').innerHTML = tile('all', sum.total, 'Учеников') + tile('today', sum.today, 'Сегодня', sum.today ? 'ok' : '') + tile('attention', sum.attention, 'Внимание', sum.attention ? 'warn' : '')
        + tile(null, sum.avg == null ? '—' : sum.avg + '%', 'Точность', sum.avg == null ? '' : heatClass(sum.avg, 99));
      const badge = $('#roster-review-count');
      badge.textContent = reviewFields; badge.hidden = !reviewFields;
    };

    let shown = [];
    const paint = () => {
      const { q, fixed } = resolveQuery(items.map(x => x.s), query);
      const inFilter = items.filter(FILTER_TESTS[state.filter]);
      shown = sortItems(q ? inFilter.filter(x => matchesQuery(x.s, q)) : inFilter, state.sort, state.rev);
      app.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filter === state.filter)));
      $('#roster-rev').setAttribute('aria-pressed', String(state.rev));
      $('#roster-count').textContent = '';
      if (shown.length) {
        const grouped = state.sort === 'activity' && !state.rev && !q && state.filter !== 'archive' && shown.length > 3;
        list.innerHTML = grouped
          ? groupByActivity(shown).map(g => `<div class="roster-group" role="presentation">${g.label}<b>${g.items.length}</b></div>${g.items.map(x => rowHtml(x, q)).join('')}`).join('')
          : shown.map(x => rowHtml(x, q)).join('');
        $('#roster-count').textContent = fixed ? `Раскладка исправлена: «${q}» · найдено ${shown.length}` : q || state.filter !== 'all' ? `Показано ${shown.length} из ${inFilter.length}` : '';
      } else {
        const other = q ? FILTERS.find(f => f !== state.filter && items.some(x => FILTER_TESTS[f](x) && matchesQuery(x.s, q))) : null;
        list.innerHTML = `<div class="roster-empty">${!items.length ? '<strong>Пока нет учеников</strong><p>Создайте ссылку-приглашение и отправьте первому ученику.</p><button class="button primary" type="button" data-invite>+ Пригласить</button>'
          : q ? `<strong>Никого не нашли по «${escape(q)}»</strong>${other ? `<p>Но есть совпадения в разделе «${FILTER_LABELS[other]}». <button type="button" class="roster-link" data-jump="${other}">Показать</button></p>` : '<p>Проверьте написание — раскладку переключать не нужно.</p>'}`
          : '<strong>В этом разделе никого нет</strong><p><button type="button" class="roster-link" data-jump="all">Показать всех</button></p>'}</div>`;
      }
      recount();
    };
    paint();

    /* очередь проверки подтягивается отдельно и не задерживает список */
    loadReviewSummary().then(r => {
      if (!mounted()) return;
      for (const x of items) x.i.review = r.map.get(x.s.id) || null;
      reviewFields = r.totalFields; paint();
    }).catch(() => {});

    input.addEventListener('input', () => { query = input.value; paint(); });
    input.addEventListener('keydown', e => { if (e.key === 'Enter' && shown.length) { e.preventDefault(); location.hash = '#student/' + enc(shown[0].s.id); } });
    sortSel.addEventListener('change', () => { state.sort = sortSel.value; state.rev = false; saveState(state); paint(); });

    const dialog = $('#roster-invite-dialog');
    const openInvite = () => { dialog.showModal(); };
    dialog.addEventListener('click', e => { if (e.target === dialog || e.target.closest('[data-close]')) dialog.close(); });

    app.querySelector('[data-roster]').addEventListener('click', async e => {
      const t = e.target.closest('button');
      if (!t) return;
      if (t.dataset.filter) { state.filter = state.filter === t.dataset.filter && t.classList.contains('roster-kpi') ? 'all' : t.dataset.filter; saveState(state); paint(); }
      else if (t.dataset.jump) { state.filter = t.dataset.jump; saveState(state); paint(); }
      else if (t.id === 'roster-rev') { state.rev = !state.rev; saveState(state); paint(); }
      else if (t.id === 'roster-invite-open' || t.dataset.invite !== undefined) openInvite();
      else if (t.id === 'roster-copy') await copyText(summaryText(shown, Date.now()), `Скопировано: ${shown.length} ${plural(shown.length, ['ученик', 'ученика', 'учеников'])}`);
    });

    /* клавиатура: «/» — в поиск, ↑↓ — по строкам, Esc — очистить */
    keyAbort?.abort();
    keyAbort = new AbortController();
    const opts = { signal: keyAbort.signal };
    window.addEventListener('hashchange', () => { if (!location.hash.startsWith('#students')) keyAbort.abort(); }, opts);
    document.addEventListener('keydown', e => {
      if (!document.body.contains(input) || dialog.open) return;
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
      if (e.key === '/' && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); input.focus(); input.select(); return; }
      if (e.key === 'Escape' && document.activeElement === input) { if (input.value) { input.value = ''; query = ''; paint(); } else input.blur(); return; }
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      const rows = [...list.querySelectorAll('[data-roster-row]')];
      if (!rows.length) return;
      const at = rows.indexOf(document.activeElement);
      if (document.activeElement === input && e.key === 'ArrowDown') { e.preventDefault(); rows[0].focus(); }
      else if (at !== -1) { e.preventDefault(); if (e.key === 'ArrowUp' && at === 0) input.focus(); else rows[Math.min(rows.length - 1, Math.max(0, at + (e.key === 'ArrowDown' ? 1 : -1)))].focus(); }
    }, opts);

    /* приглашения: прежняя логика, но в диалоге; число активных ссылок — бейдж на кнопке */
    bindInviteForm();
    const badge = $('#roster-invite-count'), invites = $('#active-invites');
    const syncBadge = () => { const n = invites.querySelectorAll('.active-invite').length; badge.textContent = n; badge.hidden = !n; };
    new MutationObserver(syncBadge).observe(invites, { childList: true, subtree: true });
    await renderActiveInvites();
  }

  /* ---------- экран: страница ученика ---------- */

  const TABS = [['tasks', 'Задания'], ['topics', 'Темы'], ['history', 'Самостоятельно']];

  function profileSkeleton() {
    return '<div class="sp" aria-busy="true"><div class="sp-nav"><span class="sp-back">← Ученики</span></div><div class="sp-hero"><i class="sp-skel sk-round"></i><span class="sp-id"><b class="sp-skel sk-line"></b><b class="sp-skel sk-line sk-short"></b></span></div><div class="sp-kpi">' + '<i class="sp-skel sk-tile"></i>'.repeat(4) + '</div></div>';
  }

  async function renderStudentProfile(id) {
    syncRouteNav();
    if (account.user?.role !== 'teacher') { location.hash = 'profile'; return; }
    const owner = account.user.id, routeAtStart = location.hash;
    app.innerHTML = profileSkeleton();
    let data;
    try { data = await accountRequest('teacher/students/' + enc(id)); }
    catch (error) {
      if (account.user?.id === owner && location.hash === routeAtStart) app.innerHTML = `<p role="alert">${escape(error.message)}</p><a class="button" href="#students">← Ученики</a>`;
      return;
    }
    if (account.user?.id !== owner || location.hash !== routeAtStart) return;

    const user = data.user, archived = user.active === false, now = Date.now();
    document.title = `Ученик: ${user.name} — Grammar NOEON`;
    const assigned = new Set((data.assignments || []).map(a => a.practiceId));
    const ctx = {
      id, user, archived, now, buckets: bucketAssignments(data.assignments, now), stat: null, statLoading: true, statError: '',
      tab: 'tasks', kind: 'practice', weakFirst: false, open: new Set(), selected: null, selectedSection: null,
      errors: [], errCursor: null, errLoaded: false, errLoading: false, errGen: 0, errMsg: '',
      history: (data.history || []).filter(a => !assigned.has(a.id)), histCursor: data.nextCursor || null, histBusy: false, assigned, histError: '',
    };

    app.innerHTML = `${accountNotice()}<div class="sp" data-sp>
      <nav class="sp-nav" aria-label="Навигация"><a class="sp-back" href="#students">← Ученики</a>${archived ? '<span class="subtle">Кабинет отключён</span>' : `<a class="button primary" href="#assign/${escape(enc(id))}">Назначить задание</a>`}</nav>
      <header class="sp-hero">
        ${avatar(user.name, 'none', 'sp-ava').replace('lvl-none"', 'lvl-none" id="sp-dot"')}
        <div class="sp-id">
          <h1>${escape(user.name)}</h1>
          <button type="button" class="sp-email" data-sp-copy title="Скопировать почту">${escape(user.email)}</button>
          <div class="sp-chips"><span class="roster-chip${archived ? '' : ' ok'}">${archived ? 'в архиве' : 'активен'}</span><span class="sp-last" id="sp-last">Последняя работа: …</span></div>
        </div>
        <label class="sp-switch"><input id="free-practice-toggle" type="checkbox" role="switch" ${archived ? 'disabled' : ''} ${data.freePracticeAllowed ? 'checked' : ''}><span class="sp-track" aria-hidden="true"></span><span class="sp-switch-text">Свободная практика<small id="sp-switch-hint"></small></span></label>
      </header>
      <p id="free-practice-status" class="sp-status" role="status"></p>
      <section class="sp-kpi" id="sp-kpi" aria-label="Сводка"></section>
      <section class="sp-insights" id="sp-insights" aria-label="На что обратить внимание"></section>
      <div class="sp-tabs" role="tablist" aria-label="Разделы" id="sp-tabs"></div>
      <div class="sp-panel" id="sp-panel" role="tabpanel"></div>
      ${studentManagement(user)}
    </div>`;

    const root = app.querySelector('[data-sp]');
    const $ = sel => root.querySelector(sel);
    const alive = () => account.user?.id === owner && location.hash === routeAtStart && root.isConnected;
    const sectionsNow = () => sectionsView(ctx.stat, ctx.kind);

    /* --- сводка --- */
    const paintKpi = () => {
      const el = $('#sp-kpi'), o = ctx.stat ? overallStats(ctx.stat) : null, open = ctx.buckets.open;
      if (ctx.statError && !ctx.stat) { el.innerHTML = `<div class="sp-kpi-error"><p role="alert">${escape(ctx.statError)}</p><button type="button" class="button" data-sp-retry>Повторить загрузку</button></div>`; return; }
      const wait = ctx.statLoading && !o;
      const tile = (cls, label, value, sub, extra = '') => `<div class="sp-tile ${cls}${wait ? ' wait' : ''}"><span>${label}</span><b>${value}</b><small>${sub}</small>${extra}</div>`;
      el.innerHTML = tile(o ? heatClass(o.pct, o.checked) : '', 'Точность', o ? (o.pct == null ? '—' : o.pct + '%') : '…', o ? (o.checked ? `${o.checked} ${answersWord(o.checked)}` : 'нет проверенных ответов') : 'считаем…', o && o.pct != null ? bar(o.pct, barTone(heatClass(o.pct, o.checked))) : '')
        + tile('', 'Работ завершено', o ? o.sessions : '…', o ? `тренировок ${o.practiceSessions} · тестов ${o.testSessions}` : '')
        + tile(open.length ? 'warn' : '', 'Ждут выполнения', open.length, open[0] ? `с ${fmtDate(open[0].date, now)}` : 'всё выполнено')
        + (o && o.pending ? `<a class="sp-tile info link" href="#review-queue"><span>На проверке</span><b>${o.pending}</b><small>открыть очередь →</small></a>` : tile('', 'На проверке', o ? 0 : '…', o ? 'ничего не ждёт' : ''));
    };

    const lastActivity = () => {
      const o = ctx.stat ? overallStats(ctx.stat) : null;
      return Math.max(o?.lastWork ?? 0, ts(ctx.history[0]?.date) ?? 0, ...ctx.buckets.done.map(v => v.date ?? 0)) || null;
    };
    const paintHero = () => {
      const last = lastActivity();
      $('#sp-last').textContent = ctx.statLoading && !ctx.stat ? 'Последняя работа: …' : `Последняя работа: ${last ? agoText(last, now) : 'пока нет'}`;
      if (last) $('#sp-dot').className = 'roster-dot lvl-' + describeStudent({ lastActive: new Date(last).toISOString(), active: true, unfinished: 0, stats: {} }, now).level;
      const on = $('#free-practice-toggle').checked;
      $('#sp-switch-hint').textContent = on ? 'Ученик сам запускает тренировки' : 'Только назначенные задания';
    };

    /* --- внимание --- */
    const paintInsights = () => {
      const list = insightsFor({ studentId: id, buckets: ctx.buckets, stat: ctx.stat, labelOf, now });
      const chips = n => n.chips ? `<span class="sp-chiprow">${n.chips.map(c => `<a class="sp-chip" href="${escape(c.href)}" title="Назначить повторение · ${c.checked} ${answersWord(c.checked)}">${escape(c.label)}<b>${c.pct}%</b></a>`).join('')}</span>` : '';
      const action = n => n.chips ? '' : n.tab ? `<button type="button" class="button" data-sp-tab="${n.tab}">${n.action}</button>` : `<a class="button" href="${escape(n.href)}">${n.action}</a>`;
      $('#sp-insights').innerHTML = list.length
        ? `<h2 class="sp-h">Обратите внимание</h2>${list.map(n => `<div class="sp-note ${n.tone}"><span class="sp-note-text"><strong>${escape(n.title)}</strong>${n.sub ? `<small>${escape(n.sub)}</small>` : ''}${chips(n)}</span>${action(n)}</div>`).join('')}` : '';
    };

    /* --- вкладки --- */
    const weakCount = () => ctx.stat ? weakTopics(ctx.stat, { limit: 99 }).length : 0;
    const paintTabs = () => {
      const badges = { tasks: ctx.buckets.open.length, topics: weakCount(), history: ctx.history.length };
      $('#sp-tabs').innerHTML = TABS.map(([key, label]) => `<button type="button" role="tab" id="tab-${key}" class="sp-tab" data-sp-tab="${key}" aria-selected="${ctx.tab === key}" aria-controls="sp-panel" tabindex="${ctx.tab === key ? 0 : -1}">${label}${badges[key] ? `<b class="${key === 'topics' ? 'bad' : ''}">${badges[key]}${key === 'history' && ctx.histCursor ? '+' : ''}</b>` : ''}</button>`).join('');
      $('#sp-panel').setAttribute('aria-labelledby', 'tab-' + ctx.tab);
    };

    const tasksPanel = () => {
      const { open, done, off } = ctx.buckets, href = v => `#student-work/${enc(id)}/${enc(v.id)}`;
      const group = (title, views, cls = '') => views.length ? `<section class="sp-group ${cls}"><h2 class="sp-h">${title}<b>${views.length}</b></h2><div class="sp-list">${views.map(v => workRow(v, href(v))).join('')}</div></section>` : '';
      if (!open.length && !done.length && !off.length) return `<div class="roster-empty"><strong>Назначенных заданий пока нет</strong>${archived ? '' : `<p>Подберите темы и количество заданий — ученик увидит их на своей странице.</p><a class="button primary" href="#assign/${escape(enc(id))}">Назначить первое задание</a>`}</div>`;
      return group('В работе', open) + group('Выполнено', done)
        + (off.length ? `<details class="sp-off"><summary>Снятые задания · ${off.length}</summary><div class="sp-list">${off.map(v => workRow(v, href(v))).join('')}</div></details>` : '');
    };

    const errItem = ({ attemptId, item, field, index }) => `<article class="topic-error"><p>${escape(displayPrompt(item))}</p><p>Ответ ученика: <strong>${escape(submittedDisplay(item, field.submitted))}</strong> · Верно: <strong>${escape(stripSourceNumber(item.blanks?.[index]?.answer || correctAnswer(item)))}</strong></p><a class="button" href="#student-work/${enc(id)}/${enc(attemptId)}">Отчёт</a></article>`;
    const errorsBlock = () => `<div class="sp-errors" id="topic-errors"><div class="sp-errors-head"><h3>${escape(labelOf(ctx.selected))} · ошибки</h3><span class="sp-errors-actions">${archived ? '' : `<a class="button" href="#assign/${escape(enc(id))}/${escape(enc(ctx.selected))}">Назначить повторение</a>`}<button type="button" class="roster-icon" data-sp-close-errors aria-label="Закрыть список ошибок">✕</button></span></div>${ctx.errors.map(errItem).join('')}${ctx.errMsg ? `<p role="alert">${escape(ctx.errMsg)}</p>` : ''}${ctx.errLoading ? '<p role="status">Загружаем ошибки…</p>' : ctx.errLoaded && !ctx.errors.length ? '<p>Проверенных ошибок по этой теме пока не найдено.</p>' : ''}${!ctx.errLoading && (!ctx.errLoaded || ctx.errCursor) ? `<button type="button" class="button" data-sp-more-errors>${ctx.errLoaded ? 'Показать ещё ошибки' : 'Загрузить ошибки'}</button>` : ''}</div>`;

    const topicsPanel = () => {
      if (!ctx.stat) return ctx.statLoading ? '<div class="sp-skel sk-block"></div>' : `<p role="alert">${escape(ctx.statError)}</p><button type="button" class="button" data-sp-retry>Повторить загрузку</button>`;
      const kinds = ctx.stat.kinds;
      if (!kinds.practice.sessions && !kinds.assessment.sessions) return `<div class="roster-empty"><strong>Статистика появится после первой завершённой работы</strong>${archived ? '' : `<a class="button primary" href="#assign/${escape(enc(id))}">Назначить первую работу</a>`}</div>`;
      const seg = [['practice', 'Тренировки'], ['assessment', 'Тесты']].map(([k, l]) => `<button type="button" data-sp-kind="${k}" aria-pressed="${ctx.kind === k}">${l}<b>${Number(kinds[k].sessions) || 0}</b></button>`).join('');
      const tile = (t, sec) => `<button type="button" class="sp-topic ${t.heat}" data-topic-id="${escape(t.id)}" data-sec="${sec}" aria-pressed="${ctx.selected === t.id}"><span class="sp-topic-name">${escape(labelOf(t.id))}</span><span class="sp-topic-pct">${t.pct == null ? '—' : t.pct + '%'}</span><span class="sp-topic-n">${t.checked} отв.${t.pending ? ` · ${t.pending} на пров.` : ''}</span>${t.pct == null ? '' : bar(t.pct, barTone(t.heat))}</button>`;
      const sections = sectionsNow().map(sec => {
        const topics = ctx.weakFirst ? [...sec.topics].sort((a, b) => (a.pct ?? 101) - (b.pct ?? 101) || b.checked - a.checked) : sec.topics;
        return `<details class="sp-sec" data-sec="${sec.id}" ${ctx.open.has(sec.id) ? 'open' : ''}><summary><strong>${sec.title}</strong><span class="sp-sec-pct ${heatClass(sec.pct, sec.checked)}">${sec.pct == null ? '—' : sec.pct + '%'}</span><small>${sec.checked ? `${sec.checked} ${answersWord(sec.checked)}` : 'работ нет'}${sec.pending ? ` · ${sec.pending} на проверке` : ''}${sec.lastWork ? ` · ${fmtDate(sec.lastWork, now)}` : ''}</small></summary>${sec.topics.length ? `<div class="sp-topics">${topics.map(t => tile(t, sec.id)).join('')}</div>` : '<p class="subtle">Завершённых работ по этому разделу пока нет.</p>'}${ctx.selected && ctx.selectedSection === sec.id ? errorsBlock() : ''}</details>`;
      }).join('');
      return `<div class="sp-toolbar"><div class="sp-seg" role="group" aria-label="Тип работ">${seg}</div><button type="button" class="roster-icon wide" id="sp-weak" aria-pressed="${ctx.weakFirst}" title="Сначала темы с наименьшей точностью">Слабые сначала</button></div><p class="subtle sp-note-line">Учитываются завершённые работы; ответы на проверке не влияют на точность. Серые плитки — меньше 5 ответов, выводы пока рано делать.</p>${sections}`;
    };

    const historyPanel = () => {
      const rows = ctx.history.map(a => workRow(workView(a, now), `#student-work/${enc(id)}/${enc(a.id)}`)).join('');
      if (!rows && !ctx.histCursor) return '<div class="roster-empty"><strong>Самостоятельных тренировок пока нет</strong><p>Здесь появятся тренировки, которые ученик запускает сам.</p></div>';
      return `<div class="sp-list">${rows}</div>${ctx.histError ? `<p role="alert">${escape(ctx.histError)}</p>` : ''}${ctx.histCursor ? `<button type="button" class="button sp-more" data-sp-history-more ${ctx.histBusy ? 'disabled' : ''}>${ctx.histBusy ? 'Загружаем…' : 'Показать ещё'}</button>` : ''}`;
    };

    const paintPanel = () => { $('#sp-panel').innerHTML = ctx.tab === 'tasks' ? tasksPanel() : ctx.tab === 'topics' ? topicsPanel() : historyPanel(); };
    const paintAll = () => { paintHero(); paintKpi(); paintInsights(); paintTabs(); paintPanel(); };
    paintAll();

    /* --- данные --- */
    const loadStat = async () => {
      ctx.statLoading = true; ctx.statError = ''; paintKpi(); if (ctx.tab === 'topics') paintPanel();
      try {
        const s = await accountRequest('teacher/students/' + enc(id) + '/statistics');
        if (!alive()) return;
        ctx.stat = s;
        const k = s.kinds; if (!k.practice.sessions && k.assessment.sessions) ctx.kind = 'assessment';
        const weakest = sectionsNow().filter(x => x.checked).sort((a, b) => a.pct - b.pct)[0];
        if (weakest) ctx.open.add(weakest.id);
      } catch (error) { if (alive()) ctx.statError = error.message || 'Не удалось загрузить статистику.'; }
      finally { if (alive()) { ctx.statLoading = false; paintAll(); } }
    };
    const loadErrors = async () => {
      if (ctx.errLoading) return;
      const topic = ctx.selected, gen = ctx.errGen, cursor = ctx.errCursor;
      ctx.errLoading = true; ctx.errMsg = ''; paintPanel();
      try {
        const r = await accountRequest(`teacher/students/${enc(id)}/mistakes?topic=${enc(topic)}&kind=${enc(ctx.kind)}${cursor ? '&cursor=' + enc(cursor) : ''}`);
        if (!alive() || ctx.selected !== topic || ctx.errGen !== gen) return;
        ctx.errors.push(...r.errors); ctx.errCursor = r.nextCursor; ctx.errLoaded = true;
      } catch (error) { if (alive() && ctx.selected === topic && ctx.errGen === gen) ctx.errMsg = error.message; }
      finally { if (alive() && ctx.selected === topic && ctx.errGen === gen) { ctx.errLoading = false; paintPanel(); } }
    };
    const loadHistory = async () => {
      if (ctx.histBusy || !ctx.histCursor) return;
      ctx.histBusy = true; ctx.histError = ''; paintPanel();
      try {
        const r = await accountRequest(`teacher/students/${enc(id)}?cursor=${enc(ctx.histCursor)}`);
        if (!alive()) return;
        for (const a of r.assignments || []) ctx.assigned.add(a.practiceId);
        ctx.history.push(...(r.history || []).filter(a => !ctx.assigned.has(a.id)));
        ctx.histCursor = r.nextCursor || null;
      } catch (error) { if (alive()) ctx.histError = error.message; }
      finally { if (alive()) { ctx.histBusy = false; paintTabs(); paintPanel(); } }
    };

    /* --- события --- */
    const selectTab = (key, focus) => { ctx.tab = key; paintTabs(); paintPanel(); if (focus) $('#tab-' + key)?.focus(); };
    root.addEventListener('click', e => {
      const t = e.target.closest('button');
      if (!t || !root.contains(t)) return;
      if (t.dataset.spTab) selectTab(t.dataset.spTab, false);
      else if (t.dataset.spCopy !== undefined) copyText(user.email, 'Почта скопирована');
      else if (t.dataset.spRetry !== undefined) loadStat();
      else if (t.dataset.spKind) { ctx.kind = t.dataset.spKind; ctx.selected = null; ctx.errGen++; paintPanel(); }
      else if (t.id === 'sp-weak') { ctx.weakFirst = !ctx.weakFirst; paintPanel(); }
      else if (t.dataset.topicId) {
        const same = ctx.selected === t.dataset.topicId;
        ctx.errGen++; ctx.errors = []; ctx.errCursor = null; ctx.errLoaded = false; ctx.errLoading = false; ctx.errMsg = '';
        ctx.selected = same ? null : t.dataset.topicId; ctx.selectedSection = same ? null : t.dataset.sec; ctx.open.add(t.dataset.sec);
        paintPanel();
        root.querySelector(`[data-topic-id="${CSS.escape(t.dataset.topicId)}"]`)?.focus({ preventScroll: true });
        if (ctx.selected) loadErrors();
      }
      else if (t.dataset.spMoreErrors !== undefined) loadErrors();
      else if (t.dataset.spCloseErrors !== undefined) { ctx.selected = null; ctx.errGen++; paintPanel(); }
      else if (t.dataset.spHistoryMore !== undefined) loadHistory();
    });
    root.addEventListener('toggle', e => {
      const d = e.target.closest?.('.sp-sec');
      if (d) { if (d.open) ctx.open.add(d.dataset.sec); else ctx.open.delete(d.dataset.sec); }
    }, true);
    $('#sp-tabs').addEventListener('keydown', e => {
      const at = TABS.findIndex(([k]) => k === ctx.tab);
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); selectTab(TABS[(at + (e.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length][0], true); }
      else if (e.key === 'Home') { e.preventDefault(); selectTab(TABS[0][0], true); }
      else if (e.key === 'End') { e.preventDefault(); selectTab(TABS[TABS.length - 1][0], true); }
    });

    const toggle = $('#free-practice-toggle');
    toggle.addEventListener('change', async () => {
      const allowed = toggle.checked; toggle.disabled = true;
      try {
        await accountRequest(`teacher/students/${enc(id)}/free-practice`, { allowed });
        if (toggle.isConnected && account.user?.id === owner) { data.freePracticeAllowed = allowed; $('#free-practice-status').textContent = allowed ? 'Свободная тренировка разрешена' : 'Новые свободные тренировки запрещены. Начатые работы можно завершить.'; paintHero(); }
      } catch (error) {
        if (toggle.isConnected && account.user?.id === owner) { toggle.checked = !!data.freePracticeAllowed; $('#free-practice-status').textContent = error.message; paintHero(); }
      } finally { if (toggle.isConnected) toggle.disabled = archived; }
    });

    bindStudentManagement(user);
    loadStat();
  }

  /* ---------- экран: очередь проверки ---------- */

  async function renderReviewQueueRoster() {
    if (account.user?.role !== 'teacher') { location.hash = 'profile'; return; }
    syncRouteNav();
    const owner = account.user.id, route = location.hash;
    const active = () => account.user?.id === owner && account.user?.role === 'teacher' && location.hash === route;
    let entries = [], cursor = null, total = 0, totalFields = 0, generation = 0, query = '';
    app.innerHTML = `<div class="rq" data-rq>
      <nav class="sp-nav"><a class="sp-back" href="#students">← Ученики</a><button class="button" id="review-queue-refresh" type="button">Обновить</button></nav>
      <header class="rq-head"><h1>Ожидают моей проверки</h1><p class="roster-sub" id="review-queue-total" role="status">Собираем переводы…</p></header>
      <p class="rq-hint">Переводы из завершённых работ ваших активных учеников. Откройте работу, прочитайте условие и ответ, выберите решение и при желании добавьте комментарий.</p>
      <div class="roster-search" role="search">${ICON_SEARCH}<input id="rq-q" type="search" autocomplete="off" spellcheck="false" placeholder="Поиск: ученик или работа" aria-label="Поиск по очереди проверки"></div>
      <div id="review-queue-items" class="rq-list"><div class="roster-list">${skeletonRows(3)}</div></div>
      <button class="button sp-more" id="review-queue-more" type="button" hidden>Показать ещё</button><p id="review-queue-error" role="alert"></p></div>`;
    const $ = sel => app.querySelector(sel);
    const paint = () => {
      const groups = groupReviews(entries, query);
      const tail = cursor ? ' (загружена часть очереди)' : '';
      $('#review-queue-total').textContent = `Переводов: ${totalFields} · Работ: ${total} · Учеников: ${new Set(entries.map(w => w.studentId)).size}${cursor ? '+' : ''}${tail}`;
      $('#review-queue-items').innerHTML = groups.length ? groups.map(g => `<section class="rq-group"><header class="rq-group-head">${avatar(g.studentName)}<strong>${escape(g.studentName)}</strong><span class="roster-chip review">${g.fields} ${plural(g.fields, ['перевод', 'перевода', 'переводов'])}</span><a class="sp-back" href="#student/${escape(enc(g.studentId))}">Профиль →</a></header><div class="sp-list">${g.works.map(w => workRow({ id: w.practiceId, title: w.title, tone: 'run', label: '', date: null }, `#report/${enc(w.studentId)}/${enc(w.practiceId)}`, {
        meta: [`<span>Завершено: ${escape(fmtDate(Number(w.completed) * 1000))}</span>`, ...(w.source === 'self' ? ['<span class="roster-chip">самостоятельно</span>'] : [])],
        side: `<span class="sp-work-side"><span class="sp-state new">${Number(w.pending)} на проверку</span></span>`,
      })).join('')}</div></section>`).join('')
        : entries.length ? '<div class="roster-empty"><strong>Ничего не найдено</strong><p>Попробуйте другой запрос.</p></div>'
          : '<div class="roster-empty rq-clear"><strong>Всё проверено</strong><p>Сейчас нет переводов, ожидающих вашей проверки.</p></div>';
    };
    async function load(more = false) {
      const requestGeneration = ++generation;
      const data = await accountRequest('teacher/reviews' + (more && cursor ? '?cursor=' + enc(cursor) : ''));
      if (!active() || requestGeneration !== generation) return;
      cursor = data.nextCursor; total = Number(data.total) || 0; totalFields = Number(data.totalFields) || 0;
      entries = more ? entries.concat(data.items) : data.items;
      $('#review-queue-more').hidden = !cursor; $('#review-queue-error').textContent = '';
      paint();
    }
    async function update(event, more) {
      const button = event.currentTarget; button.disabled = true;
      try { await load(more); } catch (error) { if (active()) $('#review-queue-error').textContent = error.message; }
      finally { if (active()) button.disabled = false; }
    }
    $('#review-queue-refresh').addEventListener('click', event => { reviewCache = null; update(event, false); });
    $('#review-queue-more').addEventListener('click', event => update(event, true));
    $('#rq-q').addEventListener('input', e => { query = e.target.value; paint(); });
    try { await load(); } catch (error) { if (active()) { $('#review-queue-items').innerHTML = ''; $('#review-queue-error').textContent = error.message; } }
  }

  if (typeof window !== 'undefined') {
    window.renderStudents = renderStudentsRoster;
    window.renderStudentAccount = renderStudentProfile;
    window.renderReviewQueue = renderReviewQueueRoster;
    window.studentCards = items => items.map(s => rowHtml({ s, i: describeStudent(s) }, '')).join('');
  }
  if (typeof module !== 'undefined') Object.assign(module.exports, {
    normalize, layoutFix, translit, matchesQuery, resolveQuery, describeStudent, sortItems, summary, summaryText, activityText, plural, initials, highlight, FILTER_TESTS, daysSince,
    ts, fmtDate, agoText, workView, bucketAssignments, heatClass, sectionsView, overallStats, weakTopics, insightsFor, groupByActivity, reviewsByStudent, groupReviews,
  });
})();
