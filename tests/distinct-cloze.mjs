import fs from 'node:fs';
import assert from 'node:assert/strict';
import {grade} from '../cloudflare/generated/checker.mjs';
import {exerciseTenses} from '../cloudflare/generated/selection.mjs';
const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url)));
const m=read('data/exercises/index.json'),bank=m.parts.flatMap(p=>read(p.file)),by=new Map(bank.map(i=>[i.id,i]));
const old=read('docs/review/DISTINCT-CLOZE-2026-10-31/before-records.json'),patch=read('docs/review/DISTINCT-CLOZE-2026-10-31/patch-records.json');
assert.equal(old.length,166);assert.equal(patch.length,166);
let count=0,accepted=0;
for(const i of bank.filter(i=>i.type==='context_cloze'&&i.topic!=='modals'&&i.blanks.every(b=>b.tense_or_construction))){
 const topics=i.blanks.map(b=>b.tense_or_construction);assert.equal(new Set(topics).size,topics.length,i.id+': repeated canonical tense');count++;
}
assert.equal(count,182);
for(const saved of old){
 const i=by.get(saved.id);assert.deepEqual(i,patch.find(p=>p.id===i.id));assert.equal(i.type,saved.type);assert.equal(i.level,saved.level);assert.equal(i.blanks.length,saved.blanks.length);
 assert(grade(saved,saved.blanks.map(b=>b.answer)).correct,i.id+': historical keys');
 const official=i.blanks.map(b=>b.answer);assert(grade(i,official).correct,i.id);
 assert.deepEqual(i.practice_tenses,i.blanks.map(b=>b.tense_or_construction));assert(exerciseTenses(i).length>=2,i.id);
 for(const[n,b]of i.blanks.entries()){
  assert(b.accepted_answers.length<=2);assert(b.accepted_answers.includes(b.answer));
  for(const a of b.accepted_answers){const response=official.slice();response[n]=a;assert(grade(i,response).correct,i.id+': '+a);accepted++;}
 }
 let n=0;assert.equal(i.answer_text,i.prompt.replace(/\{\{\d+:[^}]+\}\}/g,()=>official[n++]));assert.equal(n,i.blanks.length);
 assert(!/\bshall\b/i.test(JSON.stringify(i)));assert(!/Present|Past|Future/.test(i.title||''));
}
const project=by.get('ext-20261030-present-continuous-cl-016');assert(grade(project,['are testing','have already improved','fixed']).correct);assert(!grade(project,['are testing','are improving','fixed']).correct);
console.log(`Distinct cloze: ${count} tense texts have different canonical tenses in every gap; 166 revisions, ${accepted} accepted keys and historical snapshots passed.`);
