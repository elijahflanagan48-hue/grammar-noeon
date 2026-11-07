import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {subjectBefore,disagrees,checkItems,loadBank} from '../scripts/agreement_check.mjs';
import {grade} from '../cloudflare/generated/checker.mjs';
const require=createRequire(import.meta.url),{evaluate}=require('../app.js');
for(const [prefix,bad,good] of [['I ','has chosen','have chosen'],['He ','have worked','has worked'],['They ','was working','were working'],['It ','were testing','was testing'],['You ','is working','are working'],['Anna ','have arrived','has arrived'],['James ','have arrived','has arrived'],['She ','haven’t worked','has worked'],['They ','wasn’t working','were working'],['The students ','has arrived','have arrived'],['The children ','was playing','were playing']]){
 const subject=subjectBefore(prefix);assert(subject,prefix);assert(disagrees(subject,bad,prefix),prefix+bad);assert(!disagrees(subject,good,prefix),prefix+good);
}
for(const prefix of ['The support team ','My family ','The government ','The company ','The class '])for(const a of ['has worked','have worked','was working','were working'])assert(!disagrees(subjectBefore(prefix),a,prefix));
assert(!disagrees('he','were here','If he '));
assert.equal(subjectBefore('They {{1:work}} all day and '),'they');
assert.equal(subjectBefore('The number of people who (to take up) regular fitness activities '),'singular');
const broken=[{id:'fixture',prompt:'I (to work). It {{2:test}}.',blanks:[{answer:'has worked',accepted_answers:[]},{answer:'have tested',accepted_answers:[]}]}];assert.equal(checkItems(broken).length,2);
assert(checkItems([{id:'name',prompt:'(Emily / to work) here?',blanks:[{answer:'Has Emily worked',accepted_answers:['Has worked']}]}]).some(x=>x.kind==='question_subject_missing'));
// This subject heuristic was authored for the original active-tense bank.
const items=loadBank().filter(i=>i.topic!=='passive');assert.deepEqual(checkItems(items),[]);
const item=items.find(i=>i.id==='src-u03-092');
const historical=structuredClone(item);historical.content_version='historical-fixture';historical.blanks[0].answer='has chosen';historical.blanks[0].accepted_answers=['has chosen'];assert.equal(grade(historical,['has chosen']).correct,true,'Historical embedded keys retain their original grading');
for(const check of [evaluate,(i,a)=>grade(i,a).correct]){assert.equal(check(item,['have chosen']),true);assert.equal(check(item,['has chosen']),false);}
let checked=0;
for(const i of items.filter(i=>i.response_contract!=='manual-review-v1')){const answer=i.options?i.correct_option_index:i.blanks?i.blanks.map(b=>b.answer):i.answer;assert.equal(evaluate(i,answer),true,i.id);assert.equal(grade(i,answer).correct,true,i.id);checked++;}
const review=JSON.parse(fs.readFileSync(new URL('../docs/review/V8-2026-10-30/rejected-answers.json',import.meta.url)));
for(const {id,field,answers} of review){const i=items.find(i=>i.id===id),k=field-1;for(const removed of answers){assert(!i.blanks[k].accepted_answers.includes(removed));const a=i.blanks.map(b=>b.answer);a[k]=removed;assert.equal(evaluate(i,a),false,id+': '+removed);assert.equal(grade(i,a).correct,false,id+': '+removed);}}
for(const [prefix,bad,good]of [['The witness ','are testifying','is testifying'],['Someone ','have arrived','has arrived'],['Everyone ','are heading','is heading'],['The builders ','is fixing','are fixing']]){assert(disagrees(subjectBefore(prefix),bad,prefix));assert(!disagrees(subjectBefore(prefix),good,prefix));}
assert(checkItems([{id:'question',prompt:'What (you / to do) tomorrow?',blanks:[{answer:'will you be doing',accepted_answers:['is doing']}]}]).some(x=>x.kind==='question_subject_missing'));
assert(checkItems([{id:'negative',prompt:'I (not to finish) by tomorrow.',blanks:[{answer:'will not have finished',accepted_answers:['am going to have finished']}]}]).some(x=>x.kind==='negative_polarity_missing'));
console.log(`Agreement and v8: ${checked} official answers evaluate/grade; known bad forms, polarity, question subjects and rejected answers verified.`);
