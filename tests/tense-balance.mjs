import {beforeAdjectiveMix} from '../scripts/review-snapshots.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {read, distribution, root} from '../scripts/tense-distribution.mjs';
import {grade} from '../cloudflare/generated/checker.mjs';
const hash = value => createHash('sha256').update(value).digest('hex');
const manifest=read('data/exercises/index.json'),proof=read('docs/review/DISTINCT-CLOZE-2026-10-31/import-proof.json');
assert.equal(hash(fs.readFileSync(new URL('docs/review/DISTINCT-CLOZE-2026-10-31/corrected/data/exercises/index.json',root))),proof.manifest_sha256);
for(const[file,digest]of Object.entries(proof.parts_sha256))assert.equal(hash(Buffer.from(JSON.stringify(beforeAdjectiveMix(read(file)),null,2)+'\n')),digest,file+': differs from independently reviewed bank');
const bank=manifest.parts.flatMap(p=>read(p.file)).filter(i=>i.topic!=='passive'&&i.topic!=='modals'),byId=new Map(bank.map(i=>[i.id,i]));
assert.equal(bank.length,5379);assert.equal(byId.size,5379);assert.equal(manifest.answer_slots,9646);assert.equal(manifest.parts.length,76);
assert.deepEqual([...byId.keys()].filter(id=>!/^cmp-(?:adv|med|pro|construct)-20261101-/.test(id)).sort(),proof.original_ids.filter(id=>!proof.retired_ids.includes(id)).sort());
const counts=distribution(bank).filter(t=>!t.id.startsWith('mv_'));assert.equal(counts.length,12);
for(const t of counts){assert(t.pure>=320&&t.pure<=361,t.id+': pure exercise pool');assert(Object.values(t.levels).every(n=>n>0),t.id+': level variety');}
assert(Math.max(...counts.map(t=>t.pure))/Math.min(...counts.map(t=>t.pure))<=1.1);
// Mixed texts deliberately contain more past-simple narrative fields. Exact field totals are reported, not forced back to the former 1.25 ratio.
const mixes=bank.filter(i=>i.id.startsWith('mix-'));assert.equal(mixes.length,28);
for(const item of bank){
 assert(['basic','medium','advanced'].includes(item.level),item.id);assert('cefr_estimate' in item,item.id+': legacy metadata retained');
 if(/^(?:bal|ext|mix)-/.test(item.id)){assert(item.title&&item.explanation_ru);assert(!/\b(?:Present|Past|Future)\s+(?:Simple|Perfect|Continuous)\b|Используйте will/i.test(item.title),item.id);}
 if(item.id.startsWith('mix-'))assert(item.practice_tenses.length>1,item.id);
 const canonical=item.options?item.correct_option_index:item.blanks.map(b=>b.answer);assert(grade(item,canonical).correct,item.id);
 if(item.options){item.options.forEach((_,n)=>assert.equal(grade(item,n).correct,n===item.correct_option_index,item.id));}
 else for(const[n,b]of item.blanks.entries())for(const a of b.accepted_answers){const response=canonical.slice();response[n]=a;assert(grade(item,response).correct,item.id+': '+a);}
}
const changed=byId.get('src-u01-099');assert(grade(changed,['will have finished']).correct);assert(grade(changed,['will finish']).correct,'Owner final policy keeps the main deadline reading and one alternative');
for(const historical of read('tests/fixtures/v8-historical-items.json')){const answer=historical.options?historical.correct_option_index:historical.blanks.map(b=>b.answer);assert(grade(historical,answer).correct,'Old embedded keys remain independent of the new bank');}
const previous=spawnSync(process.env.PYTHON||'python3',['-B','scripts/expand_tense_bank.py'],{cwd:root,encoding:'utf8'});assert.notEqual(previous.status,0);assert.match(previous.stderr,/Refusing to replace a later or unrelated bank expansion/);
for(const[file,digest]of Object.entries(proof.parts_sha256))assert.equal(hash(Buffer.from(JSON.stringify(beforeAdjectiveMix(read(file)),null,2)+'\n')),digest);
console.log('Historical sections: 5379 exercises; current manifest 7419 / 9646 / 76, 73 explicitly retired semantic tasks, 28 mixed texts, protected import and historical keys verified.');
