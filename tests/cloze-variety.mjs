import {beforeDistinctCloze} from '../scripts/review-snapshots.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {grade} from '../cloudflare/generated/checker.mjs';
import {exerciseTenses,balancedPractice} from '../cloudflare/generated/selection.mjs';
const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url)));
const m=read('data/exercises/index.json'), bank=beforeDistinctCloze(m.parts.flatMap(p=>read(p.file))),by=new Map(bank.map(i=>[i.id,i]));
const dir='docs/review/CLOZE-VARIETY-2026-10-31/',old=read(dir+'before-records.json'), patches=read(dir+'patch-records.json');
assert.equal(old.length,120);assert.equal(patches.length,120);
for(const item of bank.filter(i=>i.type==='context_cloze'&&i.topic!=='modals'))for(let n=0;n<item.blanks.length-2;n++)assert(new Set(item.blanks.slice(n,n+3).map(b=>b.tense_or_construction)).size>1,item.id+': three identical tenses in succession');
let keys=0;
for(const saved of old){
 const i=by.get(saved.id);assert.deepEqual(i,patches.find(p=>p.id===i.id));assert.equal(i.type,saved.type);assert.equal(i.blanks.length,saved.blanks.length);assert.equal(i.level,saved.level);
 assert(grade(saved,saved.blanks.map(b=>b.answer)).correct,i.id+': original snapshot');
 const official=i.blanks.map(b=>b.answer);assert(grade(i,official).correct,i.id);
 for(const[n,b]of i.blanks.entries())for(const answer of b.accepted_answers){assert(b.accepted_answers.length<=2);const submitted=official.slice();submitted[n]=answer;assert(grade(i,submitted).correct,i.id+': '+answer);keys++;}
 const topics=[...new Set(i.blanks.map(b=>b.tense_or_construction))];assert.deepEqual(i.practice_tenses,topics);assert(exerciseTenses(i).length>=2,i.id);
 let n=0;assert.equal(i.answer_text,i.prompt.replace(/\{\{\d+:[^}]+\}\}/g,()=>official[n++]));assert.equal(n,i.blanks.length);
 assert(!/\bshall\b/i.test(JSON.stringify(i)));assert(!/Present|Past|Future/.test(i.title||''));
}
const project=by.get('ext-20261030-present-continuous-cl-016');assert(grade(project,['are testing','are improving','fixed']).correct);assert(!grade(project,['are testing','are improving','are fixing']).correct);
assert(!balancedPractice(bank.filter(i=>exerciseTenses(i).every(t=>t==='present_continuous')),50).some(i=>i.id===project.id),'Mixed project requires both selected topics');
console.log(`Cloze variety: 120 revised texts; ${keys} accepted keys, original snapshots, metadata, selection and no three identical tenses in a row verified.`);
