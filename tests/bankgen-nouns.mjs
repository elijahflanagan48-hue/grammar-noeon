import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {grade} from '../cloudflare/generated/checker.mjs';
import {balancedPractice, exerciseTenses, targetSection, supportedResponseContract, updatedPracticeSettings} from '../cloudflare/generated/selection.mjs';

const read = p => JSON.parse(fs.readFileSync(new URL('../'+p, import.meta.url)));
const index = read('data/exercises/index.json');
const all = index.parts.flatMap(p => read(p.file));
const nounsAll = all.filter(i => i.topic === 'nouns');
const active = nounsAll.filter(i => !i.retired);
const final = fs.readdirSync(new URL('../content/bankgen/nouns/final/', import.meta.url))
  .sort().flatMap(f => fs.readFileSync(new URL('../content/bankgen/nouns/final/'+f, import.meta.url), 'utf8')
    .split('\n').filter(l => l.startsWith('{')).map(l => JSON.parse(l)));
const bySource = new Map(final.map(r => [r.id, r]));
const mapping = read('content/bankgen/nouns/id-map.json');
assert.equal(active.length, 1000);
assert.equal(nounsAll.filter(i => i.retired).length, 1000);
assert.equal(index.sections.nouns, 2000);
assert.equal(active.reduce((n, i) => n+(i.blanks?.length||1), 0), 1598);
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
  assert(item.tags.every(t => targetSection(t) === 'nouns'));
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
assert(nounsAll.filter(i => i.retired).every(i => !supportedResponseContract(i)));
const targets = [...new Set(active.flatMap(exerciseTenses))];
assert.equal(targets.length, 25);
for (const target of targets) {
  // Same conjunction rule as the form: every decision in a mini-text must be selected.
  const pool = active.filter(i => exerciseTenses(i).every(t => t===target));
  assert(pool.length, 'No selectable exercises for '+target);
  assert(balancedPractice(pool, 10).every(i => !i.retired));
}
for (const old of ['noun_count_uncount','noun_plural_regular','noun_plural_irregular','noun_number_only','noun_partitives','noun_dual_meaning','noun_possessive','noun_compound','noun_attributive','noun_collective','noun_articles','noun_quantifiers','noun_mixed','noun_text']) {
  const migrated = updatedPracticeSettings({tenses:[old], levels:['basic']}, 'nouns');
  assert(migrated.tenses.every(t => targets.includes(t)), old);
  assert(active.some(i => exerciseTenses(i).every(t => migrated.tenses.includes(t))), old);
}
const context = {module:{exports:{}}, document:{querySelector(){}}, localStorage:{getItem(){return null}}};
vm.createContext(context);
vm.runInContext(fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8'), context);
assert.equal(context.ruleLink('content/theory/09-nouns.md'), '#theory/nouns');
for (const item of active.filter(i => i.bankgen_format==='transform')) {
  context.item = item;
  assert(vm.runInContext('answerControls(item)', context).includes('<textarea'));
  assert(!vm.runInContext('needsReview(item)', context));
}
for (const t of targets) assert(context.todayRuleLink(t).startsWith('#theory/nouns/'), t);
console.log(`Reviewed Nouns: 1000 active, 1000 archived, 1598 fields, ${variants} accepted variants, 25 selectable targets, 14 legacy targets migrated.`);
