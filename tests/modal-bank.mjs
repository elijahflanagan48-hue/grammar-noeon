import fs from 'node:fs';
import assert from 'node:assert/strict';
import {manifest, assertBankVersion} from '../scripts/bank-versions.mjs';
const root = new URL('../', import.meta.url);
const source = new URL('../../../content/modal-verbs/source/modal-verbs-package/', import.meta.url);
const rows = fs.readFileSync(new URL('data/modal-verbs.exercises.jsonl', source), 'utf8').trim().split('\n').map(JSON.parse);
const patches = JSON.parse(fs.readFileSync(new URL('../../../docs/reports/MODAL-VERBS-PATCHES-2026-11-05.json',import.meta.url),'utf8'));
assert.equal(patches.source_unchanged,true);
const byId = new Map(rows.map(row=>[row.id,row]));
for(const patch of patches.exercise_patches) {
  const row = byId.get(patch.id);
  assert(row,`Unknown editorial patch: ${patch.id}`);
  assert(Object.keys(patch.before).length && Object.keys(patch.after).length);
  for(const [field,expected] of Object.entries(patch.before)) assert.deepEqual(row[field],expected,`Outdated editorial patch: ${patch.id}.${field}`);
  assert(!Object.hasOwn(patch.after,'id'));
  Object.assign(row,patch.after);
}
const bank = manifest.parts.flatMap(part => JSON.parse(fs.readFileSync(new URL(part.file,root),'utf8')));
const modals = bank.filter(item => item.topic === 'modals');
assert.equal(modals.length,1040);
assert.equal(modals.reduce((n,item)=>n+(item.blanks?.length||1),0),1121);
assert.equal(modals.filter(item=>item.modal_type==='text').length,40);
assert.equal(manifest.sections.modals,modals.length);
assert.equal(manifest.content_versions.modals,'modals-2026-11-05.1');
assert.equal(new Set(modals.map(item=>item.id)).size,1040);
assert.deepEqual(modals.map(item=>item.id),rows.map(row=>row.id),'Author IDs and ordering are stable');
const typeMap={gap:'modal_gap',mc:'multiple_choice',meaning:'modal_meaning',fix:'modal_fix',text:'context_cloze'};
let fields=0;
for(let index=0;index<rows.length;index++) {
  const original=rows[index], item=modals[index];
  assertBankVersion(item);
  assert.equal(item.type,typeMap[original.type]);
  assert.equal(item.prompt,original.q);
  assert.equal(item.answer,original.answer);
  assert.equal(item.explanation_ru,original.why_ru);
  if(original.instruction_ru) assert.equal(item.instruction_ru,original.instruction_ru);
  assert.deepEqual(item.accept,original.accept);
  assert.deepEqual(item.accepted_answers,[original.answer,...original.accept]);
  assert.deepEqual(item.practice_tenses,['mv_'+original.sub,'mv_'+original.rule]);
  assert.equal(item.answer_profile,'modal-exact-v1');
  assert.equal(item.response_contract,'bounded-v1');
  assert.deepEqual(item.rule_refs,['content/modals/08-modals.html#mv-'+original.rule.toLowerCase()]);
  if(item.options) {
    assert.deepEqual(item.options,original.options,'Stored option order must not change');
    assert.equal(item.options[item.correct_option_index],original.answer);
    fields++;
  } else {
    const originals=original.type==='text'?original.gaps:[original];
    assert.equal(item.blanks.length,originals.length);
    originals.forEach((originalField,k)=> {
      const blank=item.blanks[k];
      assert.equal(blank.answer,originalField.answer);
      assert.deepEqual(blank.accepted_answers,[originalField.answer,...originalField.accept]);
      assert.deepEqual(blank.modal_options,originalField.options);
      assert.deepEqual(blank.rule_refs,item.rule_refs);
      fields++;
    });
    if(original.type==='gap'||original.type==='text') {
      let k=0;
      assert.equal(item.answer_text,item.prompt.replace(/___/g,()=>originals[k++].answer));
    }
  }
}
const index = JSON.parse(fs.readFileSync(new URL('data/theory.json',root),'utf8'));
const theory = index.find(entry=>entry.id==='modals');
assert(theory,'Modal rule registered in public theory index');
const rule=fs.readFileSync(new URL(theory.file,root),'utf8');
for(let number=1;number<=11;number++)assert.match(rule,new RegExp('id=["\\\']mv-r'+number+'["\\\']'),'Every rule reference resolves');
console.log(`Modal bank: ${modals.length} original records / ${fields} answer fields, audited source parity, ${patches.exercise_patches.length} guarded editorial patches and eleven rule anchors verified.`);
