import {beforeClozeVariety} from '../scripts/review-snapshots.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {grade} from '../cloudflare/generated/checker.mjs';
import {balancedPractice} from '../cloudflare/generated/selection.mjs';
const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url)));
const manifest=read('data/exercises/index.json'),bank=beforeClozeVariety(manifest.parts.flatMap(p=>read(p.file)).filter(i=>i.topic!=='passive'&&i.topic!=='modals')),byId=new Map(bank.map(i=>[i.id,i]));
const dir='docs/review/PRACTICE-FORMATS-2026-10-31/';
const retired=read(dir+'retired-records.json'),plan=read(dir+'planned-edits.json'),before=read(dir+'before-records.json');
assert.equal(retired.length,73);assert.equal(retired.filter(i=>['meaning_choice','discourse_choice'].includes(i.type)).length,61);
assert.deepEqual([...new Set(bank.map(i=>i.type))].sort(),['context_cloze','multiple_choice','open_brackets']);
assert.equal(bank.length,5379);assert.equal(manifest.answer_slots,9646);
for(const i of bank)assert(['context_cloze','multiple_choice','open_brackets'].includes(i.type),i.id);
for(const old of retired){
 assert(!byId.has(old.id),old.id+': retired record still selectable');
 assert(grade(old,old.correct_option_index).correct,old.id+': old key changed');
 for(let n=0;n<old.options.length;n++)assert.equal(grade(old,n).correct,n===old.correct_option_index,old.id);
}
for(const group of ['basic','medium','advanced']){
 const pool=bank.filter(i=>i.level===group);
 for(const i of balancedPractice(pool,Math.min(100,pool.length)))assert(byId.has(i.id)&&!retired.some(r=>r.id===i.id));
}
assert(!bank.some(i=>i.options&&/Which (?:version|sentence).*?(?:foreground|viewpoint)|What (?:is compared|does THOSE|does THAT)|Why is other useful/i.test(i.prompt)));
for(const d of plan){
 const item=byId.get(d.id),old=before.find(i=>i.id===d.id);assert(item&&old,d.id);
 assert.equal(item.blanks.length,old.blanks.length,d.id);
 const official=item.blanks.map(b=>b.answer);assert.deepEqual(official,old.blanks.map(b=>b.answer),d.id+': canonical answers preserved');
 assert(item.prompt.toLowerCase().includes(d.anchor.toLowerCase()),d.id+': visible timeframe');
 assert(grade(item,official).correct);assert(grade(old,old.blanks.map(b=>b.answer)).correct);
 for(const[n,b]of item.blanks.entries())for(const a of b.accepted_answers){const values=official.slice();values[n]=a;assert(grade(item,values).correct,d.id);}
 if(d.id!=='ext-20261030-past-simple-ob-052')assert(item.explanation_ru.toLowerCase().includes(d.anchor.toLowerCase()),d.id);
}
const closed=byId.get('ext-20261030-past-simple-ob-052');
assert(grade(closed,['Did you see','put']).correct);
assert(!grade(closed,['Have you seen','have put']).correct);
const historical=before.find(i=>i.id===closed.id);assert(grade(historical,['Have you seen','have put']).correct);
assert.match(byId.get('bal-20261030-present-continuous-022').prompt,/next Monday/,'A present form can refer to an explicit future date');
assert.match(byId.get('ext-20261030-present-perfect-continuous-ob-002').prompt,/is still asleep/,'Current result, not a closed past night');
console.log(`Practice formats: 73 retired items, three historical-section formats, ${plan.length} visible timeframe corrections, current sampling and old keys verified.`);
