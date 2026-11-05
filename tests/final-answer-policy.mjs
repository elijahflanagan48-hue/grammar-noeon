import assert from 'node:assert/strict';
import fs from 'node:fs';
import {grade} from '../cloudflare/generated/checker.mjs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{evaluate}=require('../app.js');
const read=name=>JSON.parse(fs.readFileSync(new URL('../'+name,import.meta.url)));
const manifest=read('data/exercises/index.json'),bank=manifest.parts.flatMap(p=>read(p.file)).filter(i=>i.topic!=='passive'&&i.topic!=='modals');
const shall=/\bshall\b|\bshan[’']t\b/i;
let fields=0,historical=0;
for(const item of bank){
 assert(!shall.test(JSON.stringify(item)),item.id+': shall in current exercise');
 if(item.options){assert(!item.accepted_option_indices||item.accepted_option_indices.length===1,item.id);continue;}
 const submitted=item.blanks.map(b=>b.answer);
 for(const[n,b]of item.blanks.entries()){
  fields++;assert(b.accepted_answers.length>=1&&b.accepted_answers.length<=2,item.id);
  assert.equal(new Set(b.accepted_answers).size,b.accepted_answers.length,item.id);
  assert(b.accepted_answers.includes(b.answer));
  for(const answer of b.accepted_answers){const values=submitted.slice();values[n]=answer;assert(grade(item,values).correct,item.id);assert(evaluate(item,values),item.id);}
 }
}
// The policy applies to newly selected records; persisted pre-policy keys still grade unchanged.
for(const item of read('docs/review/V8-2026-10-30/corrected/bank.json')){
 if(!item.blanks)continue;
 for(const[n,b]of item.blanks.entries())for(const answer of b.accepted_answers.filter(a=>shall.test(a))){
  const values=item.blanks.map(b=>b.answer);values[n]=answer;
  assert(grade(item,values).correct,item.id+': historical shall key');
  assert(evaluate(item,values),item.id+': historical client key');historical++;
 }
}
const source=bank.find(i=>i.id==='src-u03-092');
assert(grade(source,['have chosen']).correct);assert(!grade(source,['has chosen']).correct);
const promise=bank.find(i=>i.id==='src-u01-017');
assert(!grade(promise,['shall have finished']).correct);assert(!grade(promise,['shall finish']).correct);
const decisions=read('docs/review/V8-FINAL-2026-10-30/resolved-decisions.json');
assert.equal(decisions.length,451);assert(decisions.every(d=>d.action&&d.reason&&d.prompt));
assert.equal(read('docs/review/V8-FINAL-2026-10-30/summary.json').pending_questions,0);
console.log(`Final answer policy: ${fields} fields capped at two forms; current shall excluded, ${historical} historical shall keys preserved; all 451 editorial decisions recorded.`);
