import {beforeClozeVariety} from '../scripts/review-snapshots.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {grade} from '../cloudflare/generated/checker.mjs';
const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url)));
const m=read('data/exercises/index.json'), bank=beforeClozeVariety(m.parts.flatMap(p=>read(p.file)).filter(i=>i.topic!=='passive'&&i.topic!=='modals')), byId=new Map(bank.map(i=>[i.id,i]));
const dir='docs/review/FUTURE-REFERENCE-2026-10-31/';
const plan=read(dir+'planned-edits.json'), before=read(dir+'before-records.json'), coverage=read(dir+'review-coverage.json');
assert.equal(plan.length,92);assert.equal(new Set(plan.map(p=>p.id)).size,plan.length);
assert.equal(coverage.length,720);assert.equal(coverage.filter(i=>i.decision==='clarified').length,92);
const candidates=bank.filter(i=>i.blanks?.some(b=>['future_perfect','future_perfect_continuous'].includes(b.tense_or_construction))||(i.type==='multiple_choice'&&i.practice_tenses?.some(t=>['future_perfect','future_perfect_continuous'].includes(t))));
assert.deepEqual(coverage.map(i=>i.id).sort(),candidates.map(i=>i.id).sort(),'Every candidate is accounted for');
for(const i of bank)if(i.blanks?.some(b=>b.accepted_answers.some(a=>/will have /i.test(a))))assert(coverage.some(r=>r.id===i.id),i.id+': unreviewed perfect key');
let alternatives=0, negatives=0;
for(const p of plan){
 const item=byId.get(p.id), old=before.find(i=>i.id===p.id);
 assert(item&&old,p.id);assert.equal(item.prompt,p.prompt);assert(item.prompt.includes(p.anchor));assert(item.explanation_ru.includes(p.anchor));
 for(const key of ['type','level','cefr_estimate','tags','practice_tenses','rule_refs','response_contract','correct_option_index','options'])assert.deepEqual(item[key],old[key],p.id+': '+key);
 if(item.type==='multiple_choice'){
  for(let n=0;n<item.options.length;n++){
   assert.equal(grade(item,n).correct,n===item.correct_option_index,p.id);
   assert.equal(grade(old,n).correct,n===old.correct_option_index,p.id+': historical choice');
  }
  assert.equal(item.answer,item.prompt.replace('___',item.options[item.correct_option_index]));
  continue;
 }
 assert.deepEqual(item.blanks.map(({explanation_ru,...b})=>b),old.blanks.map(({explanation_ru,...b})=>b),p.id+': keys preserved');
 const official=item.blanks.map(b=>b.answer);
 assert(grade(old,official).correct,p.id+': historical snapshot');assert(grade(item,official).correct,p.id);
 for(const[n,b]of item.blanks.entries()){
  assert(b.accepted_answers.length<=2,p.id);
  for(const a of b.accepted_answers){const x=official.slice();x[n]=a;assert(grade(item,x).correct,p.id+': '+a);alternatives++;}
  if(!/^will (?:not )?have been /i.test(b.answer))continue;
  const replacements=[b.answer.replace(/have been/i,'be'), b.answer.replace(/^will (?:not )?have been /i,'had been '),b.answer.replace(/\bhave\b/,'has')];
  for(const a of replacements){const x=official.slice();x[n]=a;assert(!grade(item,x).correct,p.id+': '+a);negatives++;}
 }
 const pattern=item.type==='context_cloze'?/\{\{\d+:[^}]+\}\}/g:/\([^()]+\)/g;
 let index=0;assert.equal(item.answer_text,item.prompt.replace(pattern,()=>official[index++]));assert.equal(index,item.blanks.length);
 assert(!/\bshall\b/i.test(JSON.stringify(item)),p.id);
}
// An endpoint plus an elapsed interval must distinguish the formerly plausible options.
assert.match(byId.get('ext-20261030-future-perfect-continuous-mc-004').prompt,/^By next October/);
assert.match(byId.get('ext-20261030-future-perfect-continuous-mc-009').prompt,/Tomorrow.*By the time.*since two/);
assert.match(byId.get('bal-20261030-future-perfect-continuous-133').prompt,/^By next week/);
assert.match(byId.get('bal-20261030-future-perfect-continuous-077').prompt,/test starts.*By noon tomorrow/);
console.log(`Future references: 720 candidate records reviewed, 92 clarified, ${alternatives} accepted variants and ${negatives} wrong-time/person replacements verified; historical keys preserved.`);
