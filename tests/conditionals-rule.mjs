import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
// Conditionals: правило и карта «Зазеркалье» — целостность данных и ссылок.
const read = f => fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8');
const ctx = { document: undefined }; vm.createContext(ctx);
vm.runInContext(read('conditionals.js') + ';globalThis.__html = conditionalsRuleHtml(); globalThis.__raw = CONDITIONALS_RULE_CONTENT; globalThis.__out = cdBuilderOut;', ctx);
vm.runInContext(read('conditionals-map-data.js') + ';globalThis.__d = CDM_DISTRICTS; globalThis.__l = CDM_LIFTS;', ctx);
const html = ctx.__raw;
const ids = new Set([...html.matchAll(/id="([^"]+)"/g)].map(m => m[1]));
// разделы, на которые ссылаются карта, навигация и цели практики
const anchors = ['cd-core', 'cd-builder', 'cd-zero', 'cd-first', 'cd-conj', 'cd-second', 'cd-third', 'cd-mixed', 'cd-implied', 'cd-inversion', 'cd-wish', 'cd-unreal', 'cd-traps', 'cd-check'];
for (const a of anchors) assert(ids.has(a), 'нет раздела ' + a);
for (const m of html.matchAll(/href="#(cd-[^"]+)"/g)) assert(ids.has(m[1]), 'битая ссылка #' + m[1]);
assert.equal(new Set([...html.matchAll(/id="([^"]+)"/g)].map(m => m[1])).size, [...html.matchAll(/id="([^"]+)"/g)].length, 'повторяющиеся id');
assert(ctx.__html.includes('href="#theory/conditionals/cd-zero"'), 'ссылки правила ведут на маршрут темы');
// конструктор: каждая комбинация даёт ответ
for (const r of ['r', 'u']) for (const c of ['always', 'past', 'now', 'future']) for (const s of ['same', 'now', 'past']) assert(ctx.__out(`${r}-${c}-${s}`).includes('cd-b-type'), `${r}-${c}-${s}`);
// карта: у каждой проверки три варианта, верный первый, без повторов
let chips = 0;
const names = new Set();
for (const d of ctx.__d) {
  assert(ids.has(d.ref), `район ${d.key} ссылается на несуществующий раздел ${d.ref}`);
  for (const c of d.chips) {
    chips++;
    assert(c.length >= 9, c[0]);
    assert(!names.has(d.key + c[0]), 'повтор ' + c[0]); names.add(d.key + c[0]);
    assert(c[3] && c[4], 'нет примера: ' + c[0]);
    if (!c[7]) continue;
    const m = c[7].match(/\[([^\]]+)\]/); assert(m, 'проверка без пропуска: ' + c[0]);
    const opts = m[1].split('|'); assert.equal(opts.length, 3, c[0]); assert.equal(new Set(opts).size, 3, 'одинаковые варианты: ' + c[0]);
  }
}
assert(chips >= 110, 'на карте должно быть много конструкций: ' + chips);
for (const l of ctx.__l) for (const p of l.pairs) { assert.equal(p.length, 4, p[0]); assert.equal(new Set([p[1].replace(/\[\[|\]\]/g, ''), p[2], p[3]]).size, 3, p[0]); }
// сайт подключает файлы темы
const index = read('index.html'), sw = read('sw.js'), build = read('scripts/build_cloudflare.py');
for (const f of ['conditionals.js', 'conditionals.css', 'conditionals-map-data.js', 'conditionals-map.js', 'conditionals-map.css']) {
  assert(index.includes(f + '?v='), 'index.html: ' + f); assert(sw.includes(`"${f}"`), 'sw.js: ' + f); assert(build.includes(`'${f}'`), 'build: ' + f);
}
const theory = JSON.parse(read('data/theory.json'));
assert(theory.some(t => t.id === 'conditionals' && fs.existsSync(new URL('../' + t.file, import.meta.url))));
assert.equal(read('content/theory/12-conditionals-rule.html').trim(), html.trim(), 'content/theory/12-conditionals-rule.html устарел: node scripts/build_conditionals_rule.mjs');
console.log(`Conditionals rule and map passed: ${chips} constructions, ${ctx.__l.length} lifts, ${anchors.length} sections.`);
