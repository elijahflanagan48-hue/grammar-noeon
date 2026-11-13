/* Поиск по темам на странице «Темы»: разделы и все подтемы практики, переход сразу к правилу. */
function tsNorm(text) { return String(text || '').toLowerCase().replaceAll('ё', 'е').replace(/[·\-–—/,.()«»"']/g, ' ').replace(/\s+/g, ' ').trim(); }
const TS_RU = { present: 'настоящее презент', past: 'прошедшее паст', future: 'будущее фьючер', simple: 'простое симпл', continuous: 'длительное продолженное континиус', perfect: 'совершенное перфект', passive: 'пассив страдательный залог', modal: 'модальные', comparison: 'сравнение', reported: 'косвенная речь' };
function tsRu(text) { return tsNorm(text).split(' ').map(word => TS_RU[word] || '').join(' '); }
function tsIndex() {
  if (tsIndex.cache) return tsIndex.cache;
  const legacy = new Set((typeof PASSIVE_LEGACY_TARGETS !== 'undefined' ? PASSIVE_LEGACY_TARGETS : []).map(t => t.id));
  const items = Object.entries(GRAMMAR_SECTIONS).filter(([, s]) => !s.soon).map(([id, s]) => ({ kind: 'section', id, section: id, label: s.title, sub: s.subtitle, href: '#theory/' + s.theory, text: tsNorm([s.title, s.subtitle, s.description].join(' ')) + ' ' + tsRu(s.title) }));
  PRACTICE_TENSES.forEach(t => {
    if (t.id === 'other_constructions' || legacy.has(t.id)) return;
    const section = targetSection(t.id), sec = GRAMMAR_SECTIONS[section];
    if (!sec || sec.soon) return;
    items.push({ kind: 'topic', id: t.id, section, label: t.label, sub: sec.subtitle, href: todayRuleLink(t.id), text: tsNorm([t.label, sec.title, sec.subtitle].join(' ')) + ' ' + tsRu(t.label + ' ' + sec.title) });
  });
  return (tsIndex.cache = items);
}
function topicSearchHtml() {
  return `<div class="ts" role="search"><label class="sr-only" for="topic-search">Поиск по темам</label><svg class="ts-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input id="topic-search" type="search" autocomplete="off" spellcheck="false" placeholder="Найти тему: Present Perfect, артикли, say или tell…" aria-controls="topic-search-results"><div id="topic-search-results" class="ts-results" hidden></div></div>`;
}
function tsRender(input) {
  const box = document.getElementById('topic-search-results'), query = tsNorm(input.value), grid = document.querySelector('.gs-grid');
  if (!box) return;
  if (!query) { box.hidden = true; box.innerHTML = ''; grid?.querySelectorAll('[data-grammar-section]').forEach(card => card.hidden = false); return; }
  const words = query.split(' ');
  const hits = tsIndex().map(item => {
    if (!words.every(w => item.text.includes(w))) return null;
    const label = tsNorm(item.label);
    return { item, score: (label.startsWith(query) ? 0 : label.includes(query) ? 1 : 2) + (item.kind === 'section' ? -0.5 : 0) };
  }).filter(Boolean).sort((a, b) => a.score - b.score).slice(0, 12).map(hit => hit.item);
  const sections = new Set(hits.map(hit => hit.section));
  grid?.querySelectorAll('[data-grammar-section]').forEach(card => card.hidden = !sections.has(card.dataset.grammarSection));
  box.hidden = false;
  box.innerHTML = hits.length
    ? `<p class="ts-count" role="status">Найдено: ${hits.length}</p>` + hits.map(hit => `<a class="ts-hit" href="${escapeHtml(hit.href)}"><span><strong>${escapeHtml(hit.label)}</strong><small>${hit.kind === 'section' ? 'Раздел · ' : ''}${escapeHtml(hit.sub)}</small></span><span class="ts-go">Правило →</span></a>`).join('')
    : '<p class="ts-count" role="status">Ничего не нашлось. Попробуйте по-английски (Present Perfect) или по-русски (артикли).</p>';
}
if (document.addEventListener) {
  document.addEventListener('input', event => { if (event.target.id === 'topic-search') tsRender(event.target); });
  document.addEventListener('keydown', event => {
    if (event.target.id !== 'topic-search') return;
    if (event.key === 'Enter') { const first = document.querySelector('.ts-hit'); if (first) { event.preventDefault(); first.click(); } }
    if (event.key === 'Escape') { event.target.value = ''; tsRender(event.target); }
  });
}
