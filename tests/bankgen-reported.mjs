import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {grade} from '../cloudflare/generated/checker.mjs';
import {balancedPractice, exerciseTenses, targetSection, supportedResponseContract, updatedPracticeSettings} from '../cloudflare/generated/selection.mjs';

const read = p => JSON.parse(fs.readFileSync(new URL('../'+p, import.meta.url)));
const index = read('data/exercises/index.json');
const all = index.parts.flatMap(p => read(p.file));
const reported = all.filter(i => i.topic === 'reported');
const active = reported.filter(i => !i.retired);
const final = fs.readdirSync(new URL('../content/bankgen/reported/final/', import.meta.url))
  .sort().flatMap(f => fs.readFileSync(new URL('../content/bankgen/reported/final/'+f, import.meta.url), 'utf8')
    .split('\n').filter(l => l.startsWith('{')).map(l => JSON.parse(l)));
const bySource = new Map(final.map(r => [r.id, r]));
const mapping = read('content/bankgen/reported/id-map.json');
assert.equal(active.length, 1000);
assert.equal(reported.filter(i => i.retired).length, 1000);
assert.equal(index.sections.reported, 2000);
assert.equal(active.reduce((n, i) => n+(i.blanks?.length||1), 0), 1554);
assert.equal(read('docs/current-release.json').passive_v7_status, 'built; deployment and verification pending');
let variants = 0;
for (const item of active) {
  const row = bySource.get(item.bankgen_id);
  assert(row, item.id);
  assert.equal(mapping[row.id], item.id);
  assert.equal(item.prompt, row.prompt);
  assert.equal(item.explanation_ru, row.explanation_ru);
  assert(supportedResponseContract(item));
  assert.deepEqual(item.tags, item.practice_tenses);
  assert.deepEqual(exerciseTenses(item), item.tags, item.id);
  assert(item.tags.every(t => targetSection(t) === 'reported'));
  if (item.options) {
    assert.deepEqual(item.options, row.options);
    for (let ix=0; ix<4; ix++) assert.equal(grade(item, ix).correct, ix===row.correct_option_index);
  } else {
    const targets = item.blanks || [item], sources = row.blanks || [row];
    const values = targets.map(f => f.answer);
    for (let n=0; n<targets.length; n++) {
      assert.deepEqual(targets[n].accepted_answers, sources[n].accepted_answers);
      for (const answer of targets[n].accepted_answers) {
        const submitted = values.slice(); submitted[n] = answer;
        assert(grade(item, submitted).correct, item.id+': '+answer); variants++;
      }
      const wrong = values.slice(); wrong[n] = 'a deliberately incorrect answer';
      assert(!grade(item, wrong).correct, item.id);
    }
  }
}
assert(reported.filter(i => i.retired).every(i => !supportedResponseContract(i)));
const targets = [...new Set(active.flatMap(exerciseTenses))];
assert.equal(targets.length, 30);
for (const target of targets) {
  // Same conjunction rule as the form: every decision in a mini-text must be selected.
  const pool = active.filter(i => exerciseTenses(i).every(t => t===target));
  assert(pool.length, 'No selectable exercises for '+target);
  assert(balancedPractice(pool, 10).every(i => !i.retired));
}
for (let n=1; n<=20; n++) {
  const old = 'rs'+String(n).padStart(2,'0');
  const migrated = updatedPracticeSettings({tenses:[old], levels:['basic']}, 'reported');
  assert(migrated.tenses.every(t => targets.includes(t)), old);
  assert(active.some(i => exerciseTenses(i).every(t => migrated.tenses.includes(t))), old);
}
const context = {module:{exports:{}}, document:{querySelector(){}}, localStorage:{getItem(){return null}}};
vm.createContext(context);
vm.runInContext(fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8'), context);
assert.equal(context.ruleLink('content/theory/08-reported.md'), '#theory/reported');
for (const item of active.filter(i => i.bankgen_format==='transform')) {
  context.item = item;
  assert(vm.runInContext('answerControls(item)', context).includes('<textarea'));
  assert(!vm.runInContext('needsReview(item)', context));
}
console.log(`Reviewed Reported: 1000 active, 1000 archived, 1554 fields, ${variants} accepted variants, 30 selectable targets, 20 legacy links migrated.`);
