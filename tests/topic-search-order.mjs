import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
// Поиск по темам: крупные разделы всегда выше подтем.
const box = { hidden: true, innerHTML: '' };
const ctx = { module: { exports: {} }, document: { querySelector() { return { querySelectorAll() { return []; } }; }, getElementById: id => id === 'topic-search-results' ? box : null, addEventListener() {} },
  localStorage: { getItem() { return null; } }, fetch: async () => { throw Error('offline'); }, caches: { async keys() { return []; } } };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8'), ctx);
vm.runInContext(fs.readFileSync(new URL('../topic-search.js', import.meta.url), 'utf8'), ctx);
function search(value) {
  ctx.__input = { value };
  vm.runInContext('tsRender(__input)', ctx);
  return [...box.innerHTML.matchAll(/<a class="ts-hit"[^>]*><span><strong>(.*?)<\/strong><small>(.*?)<\/small>/g)].map(m => ({ label: m[1], section: m[2].startsWith('Раздел · ') }));
}
let checked = 0;
for (const query of ['infinitive', 'инфинитив', 'to do', 'doing', 'герундий', 'present', 'perfect', 'пассив', 'say', 'артикли']) {
  const hits = search(query);
  const firstTopic = hits.findIndex(hit => !hit.section);
  if (firstTopic !== -1) assert(hits.slice(firstTopic).every(hit => !hit.section), `${query}: раздел после подтемы: ${JSON.stringify(hits)}`);
  checked += hits.length ? 1 : 0;
}
assert(checked >= 6, 'поиск должен находить результаты по большинству запросов');
const mixed = search('to do');
assert(mixed.some(hit => hit.section) && mixed.some(hit => !hit.section), 'запрос «to do» должен давать и раздел, и подтемы');
assert(mixed[0].section, 'первым идёт раздел: ' + JSON.stringify(mixed[0]));
console.log('Topic search: sections come before subtopics passed.');
