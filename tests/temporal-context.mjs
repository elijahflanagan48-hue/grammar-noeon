import {beforeClozeVariety} from '../scripts/review-snapshots.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {grade} from '../cloudflare/generated/checker.mjs';
const read = p => JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url)));
const manifest=read('data/exercises/index.json');
const bank=beforeClozeVariety(manifest.parts.flatMap(p=>read(p.file))), byId=new Map(bank.map(i=>[i.id,i]));
const dir='docs/review/TEMPORAL-CONTEXT-2026-10-31/';
const plan=read(dir+'planned-edits.json'), before=read(dir+'before-records.json');
assert.equal(new Set(plan.map(d=>d.id)).size,plan.length);
for(const d of plan){
 const item=byId.get(d.id), old=before.find(i=>i.id===d.id);
 assert(item&&old,d.id);
 const answers=item.blanks.map(b=>b.answer), oldAnswers=old.blanks.map(b=>b.answer);
 assert.deepEqual(answers,oldAnswers,d.id+': canonical answers must not be silently replaced');
 assert(grade(item,answers).correct,d.id);
 assert(grade(old,oldAnswers).correct,d.id+': historical snapshot still grades independently');
 assert.equal(item.blanks.length,old.blanks.length);
 assert.deepEqual(item.practice_tenses,old.practice_tenses);
 assert.deepEqual(item.rule_refs,old.rule_refs);
 assert(!/\b(?:Future|Past|Present)\s+(?:Simple|Perfect|Continuous)\b/i.test(item.title),d.id+': hidden tense label');
 if(d.category==='accepted_missing')continue;
 assert(item.prompt.toLowerCase().includes(d.anchor.toLowerCase()),d.id+': missing reviewed temporal reference');
 assert(item.explanation_ru.toLowerCase().includes(d.anchor.toLowerCase()),d.id+': explanation must explain the visible context');
 assert(/\b(?:tomorrow|tonight|next|yesterday|last|in (?:two|six|eleven) hours|this (?:decade|century)|have not begun yet)\b/i.test(item.prompt),d.id+': temporal reference');
 // The explicit future context must reject a past-perfect replacement, independently of the editorial label.
 for(let n=0;n<answers.length;n++)if(/^will have /.test(answers[n])){
  const wrong=answers.slice();wrong[n]=answers[n].replace(/^will have /,'had ');
  assert(!grade(item,wrong).correct,d.id+': past interpretation must now be excluded');
 }
 for(const [n,b]of item.blanks.entries())for(const a of b.accepted_answers){const x=answers.slice();x[n]=a;assert(grade(item,x).correct,d.id+': '+a);}
}
for(const [id,forms,rejected]of [
 ['bal-20261030-future-simple-093',['get','will get'],'gets'],
 ['bal-20261030-future-simple-176',['stops','will stop'],'stop'],
]){
 const i=byId.get(id);assert.equal(i.blanks[0].accepted_answers.length,2);
 for(const a of forms)assert(grade(i,[a]).correct,id+': general truth / concrete prediction');
 assert(!grade(i,[rejected]).correct,id+': wrong-person form');
}
// Completion remains the reference point, not the newly introduced start of an event.
for(const [id,needle]of [
 ['bal-20261030-future-perfect-173','The lesson ends in two hours.'],
 ['bal-20261030-future-perfect-continuous-006','The match ends in two hours.'],
 ['bal-20261030-future-perfect-continuous-099','The race finishes in six hours.'],
 ['bal-20261030-future-perfect-continuous-141','My shift ends in eleven hours.'],
])assert(byId.get(id).prompt.startsWith(needle),id);
assert.match(byId.get('ext-20261030-future-simple-cl-015').prompt,/pledge[\s\S]*"The government/);
assert.match(byId.get('ext-20261030-future-continuous-ob-049').prompt,/judge warns/);
console.log(`Temporal contexts: ${plan.length} reviewed records, visible anchors, general truths, wrong-time/person rejection and historical snapshots passed.`);
