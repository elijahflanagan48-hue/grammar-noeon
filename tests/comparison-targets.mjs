import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {exerciseSection, exerciseTenses, targetSection, updatedPracticeSettings} from '../cloudflare/generated/selection.mjs';

const context = {module:{exports:{}}, document:{querySelector(){}}, localStorage:{getItem(){return null}}};
vm.createContext(context);
vm.runInContext(fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8'), context);
const targets = JSON.parse(vm.runInContext('JSON.stringify(COMPARISON_TARGETS)', context));
const legacy = JSON.parse(vm.runInContext('JSON.stringify(COMPARISON_LEGACY_TARGETS)', context));
const ids = targets.map(t=>t.id);
assert.equal(ids.length, 31);
assert.equal(exerciseSection({id:'cp-C1-001',topic:'comparison'}), 'comparison');
assert.equal(new Set(ids).size, 31);
const migrated = legacy.flatMap(({id})=>{
  const saved = {tenses:[id],levels:['basic'],count:10};
  const next = updatedPracticeSettings(saved, 'comparison');
  assert(next.tenses.length && next.tenses.every(t=>ids.includes(t)), id);
  assert.deepEqual(next.levels, saved.levels);
  assert.deepEqual(saved.tenses, [id]);
  assert.deepEqual(updatedPracticeSettings(next, 'comparison'), next);
  return next.tenses;
});
assert.deepEqual([...new Set(migrated)].sort(), ids.toSorted());
assert.deepEqual(updatedPracticeSettings({tenses:['cmp_forms','cp_comparative']}, 'comparison').tenses,
  updatedPracticeSettings({tenses:['cmp_forms']}, 'comparison').tenses);
for(const id of ids){
  assert.equal(targetSection(id), 'comparison');
  assert.deepEqual(exerciseTenses({topic:'comparison',practice_tenses:[id]}), [id]);
  const link = context.todayRuleLink(id);
  assert(link.startsWith('#theory/comparison/'), id);
  assert(!link.includes('undefined') && !link.endsWith('карта-раздела'), id);
}
const dir = new URL('../content/bankgen/comparison/final/', import.meta.url);
const rows = fs.readdirSync(dir).flatMap(f=>fs.readFileSync(new URL(f, dir),'utf8')
  .split('\n').filter(l=>l.startsWith('{')).map(JSON.parse));
for(const row of rows){
  const tags = row.blanks?.map(b=>b.construction) || [row.construction];
  assert(tags.every(t=>ids.includes(t)), row.id);
}
console.log(`Comparison targets: ${ids.length} constructions, five legacy filters migrated, rule links, ${rows.length} source exercises covered.`);
