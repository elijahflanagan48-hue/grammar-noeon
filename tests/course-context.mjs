import {beforeClozeVariety} from '../scripts/review-snapshots.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {grade} from '../cloudflare/generated/checker.mjs';
const read=name=>JSON.parse(fs.readFileSync(new URL('../'+name,import.meta.url)));
const m=read('data/exercises/index.json'),bank=beforeClozeVariety(m.parts.flatMap(p=>read(p.file)));
const courseDeadlines=bank.filter(i=>/\bcourse\b/i.test(i.prompt)&&/\bby the end\b/i.test(i.prompt)&&i.blanks?.some(b=>/^future_perfect/.test(b.tense_or_construction)));
assert.equal(courseDeadlines.length,8);
for(const i of courseDeadlines){
 assert(/\b(?:tomorrow|next (?:Monday|September))\b/i.test(i.prompt),i.id+': course deadline requires an explicit future anchor');
 assert(grade(i,i.blanks.map(b=>b.answer)).correct,i.id);
}
const item=bank.find(i=>i.id==='ext-20261030-future-perfect-cl-006');
assert.match(item.prompt,/The course starts next Monday\./);
assert(grade(item,['will have studied','will have written','will have taken']).correct);
assert(grade(item,['will study','will write','will take']).correct);
assert(!grade(item,['had studied','had written','had taken']).correct,'Explicit next Monday now excludes a past interpretation');
assert(!item.explanation_ru.includes('при for/since'),'No duration claim in the bounded course-results example');
// Existing works retain the keys stored with their original exercise snapshot.
for(const old of read('docs/review/COURSE-CONTEXT-2026-10-30/before-records.json'))assert(grade(old,old.blanks.map(b=>b.answer)).correct);
console.log('Course contexts: all eight future deadline examples have explicit dates; six corrected snapshots and existing keys remain compatible.');
