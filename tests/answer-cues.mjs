import {beforeAdjectiveMix} from '../scripts/review-snapshots.mjs';
import {manifest as bankManifest, assertBankVersion} from '../scripts/bank-versions.mjs';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const root = new URL('../',import.meta.url);
const bank = fs.readdirSync(new URL('data/exercises/',root)).filter(file=>/^part-.*json$/.test(file)).flatMap(file=>JSON.parse(fs.readFileSync(new URL('data/exercises/'+file,root),'utf8')));
const comparison = bank.filter(item=>item.id.startsWith('cmp-'));
const retired=JSON.parse(fs.readFileSync(new URL('docs/review/PRACTICE-FORMATS-2026-10-31/retired-records.json',root)));
const currentOrHistorical=id=>bank.find(i=>i.id===id)||retired.find(i=>i.id===id);
for(const old of retired)assert(!bank.some(i=>i.id===old.id),old.id+': retired record must not be newly selected');
const ctx = {module:{exports:{}},document:{querySelector(){return {}}},localStorage:{getItem(){return null}}};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(new URL('app.js',root),'utf8').replace(/initialise\(\);/,''),ctx);
const replacements = [...fs.readFileSync(new URL('scripts/comparison_task_review.py',root),'utf8').matchAll(/^\s*(\d+): \(/gm)].map(match=>'cmp-'+match[1].padStart(4,'0'));
assert.equal(replacements.length,68);
for(const id of replacements) {
  const item = beforeAdjectiveMix([currentOrHistorical(id)])[0];
  if(item.type==='open_brackets') {
    assert.equal(item.options,undefined,id+': stale choices');
    assert.equal(item.accepted_answers,undefined,id+': stale full-sentence key');
    assert.ok(item.blanks.length>0,id);
    assert.ok(!/\b(?:use|include|remove|delete)\b|используйте/i.test(item.prompt),id+': answer instruction');
    continue;
  }
  assert.equal(item.type,'meaning_choice',id);
  assert.equal(item.blanks,undefined,id+': stale blanks');
  assert.equal(item.accepted_answers,undefined,id+': stale free-response keys');
  assert.equal(item.options.length,3,id);
  assert.equal(new Set(item.options.map(value=>ctx.module.exports.normalise(value))).size,3,id);
  assert.ok(!/\b(?:use|include|remove|delete)\b|используйте/i.test(item.prompt),id+': answer instruction');
  assert.ok(!item.prompt.includes(item.answer),id+': answer copied into question');
  item.options.forEach((_,index)=>assert.equal(ctx.evaluate(item,index),index===item.correct_option_index,id));
}
for(const item of comparison) {
  assertBankVersion(item);
  assert.ok(!/Используйте форму с|Use (?:the form with )?-(?:ier|iest)|Use (?:MORE|MOST)\./i.test(item.prompt),item.id);
  if(item.type==='translation_ru_en') assert.ok(!/[a-z]{2,}/i.test(item.prompt),item.id+': translation contains English answer hint');
}
const expected = {
  'cmp-0125':'A is twice as wide as B.',
  'cmp-0126':'A is half as long as B.',
  'cmp-0267':'The new strap is a third as long as the old one.',
  'cmp-0296':'This ribbon is three times as long as that one.',
  'cmp-0300':'We do not have enough wide panels.',
  'cmp-0302':'The thickness must be no more than 12 mm.',
  'cmp-0308':'The width must be no less than 4 mm and no more than 7 mm.',
};
for(const [id,answer] of Object.entries(expected)) {
  const item=currentOrHistorical(id);
  if(item.type==='open_brackets') assert.ok(item.answer_text.endsWith(answer),id);
  else assert.equal(item.answer,answer,id);
}
for(const id of ['new-error-005','adv-transform-007']) {
  const item = beforeAdjectiveMix([currentOrHistorical(id)])[0];
  assert.equal(item.type,'meaning_choice');
  assertBankVersion(item);
  assert.ok(!/Future Perfect|Используйте|\bUse\b/i.test(item.prompt));
}
console.log('Answer-cue audit: 68 reviewed comparison records in their current choice/bracket formats, 2 tense replacements, all current comparison prompts plus retired snapshots, distinct distractors and preserved ratio/bound meanings passed.');
