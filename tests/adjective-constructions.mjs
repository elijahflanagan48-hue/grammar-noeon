import {beforeAdjectiveMix} from '../scripts/review-snapshots.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {grade} from '../cloudflare/generated/checker.mjs';
import {beforeAdjectiveConstructions} from '../scripts/review-snapshots.mjs';
const require=createRequire(import.meta.url),{evaluate}=require('../app.js');
const root=new URL('../',import.meta.url),dir='docs/review/ADJECTIVES-CONSTRUCTIONS-2026-11-01/';
const read=p=>JSON.parse(fs.readFileSync(new URL(p,root)));
const manifest=read('data/exercises/index.json'),baseline=read(dir+'baseline-manifest.json');
const bank=beforeAdjectiveMix(manifest.parts.flatMap(p=>read(p.file))),byId=new Map(bank.map(i=>[i.id,i]));
const added=bank.filter(i=>i.id.startsWith('cmp-construct-')),before=read(dir+'before-records.json'),patch=read(dir+'patch-records.json');
assert.equal(added.length,170);assert.equal(before.length,12);assert.equal(patch.length,12);
assert.equal(manifest.total_items,7419);assert.equal(manifest.answer_slots,9646);assert.equal(manifest.parts.length,76);
assert.equal(manifest.content_versions.comparison,'comparison-2026-11-01.5');
for(const [level,count] of [['basic',300],['medium',400],['advanced',300]])assert.equal(bank.filter(i=>i.topic==='comparison'&&i.level===level).length,count);
assert.equal(added.filter(i=>i.level==='basic').length,70);assert.equal(added.filter(i=>i.level==='medium').length,100);
for(const i of [...added,...patch]){
 assert.equal(i.type,'open_brackets');const keys=i.blanks.map(b=>b.answer);
 assert(grade(i,keys).correct&&evaluate(i,keys),i.id);
 for(const [n,b] of i.blanks.entries())for(const key of b.accepted_answers){const values=keys.slice();values[n]=key;assert(grade(i,values).correct&&evaluate(i,values),i.id+': '+key);}
}
for(const item of before){
 assert(grade(item,item.blanks.map(b=>b.answer)).correct,item.id+': old snapshot');
 assert.deepEqual(byId.get(item.id),patch.find(i=>i.id===item.id));
 assert.equal(byId.get(item.id).level,item.level);assert.equal(byId.get(item.id).blanks.length,item.blanks.length);
}
for(const [file,digest] of Object.entries(read(dir+'baseline-hashes.json'))){
 const payload=file==='data/exercises/part-48.json'?JSON.stringify(beforeAdjectiveConstructions(read(file)),null,2)+'\n':Buffer.from(JSON.stringify(beforeAdjectiveMix(read(file)),null,2)+'\n');
 assert.equal(createHash('sha256').update(payload).digest('hex'),digest,file+': uncontrolled old change');
}
assert.deepEqual(manifest.parts.slice(0,53),baseline.parts,'Existing part counts/levels/formats preserved');
const reproduced=JSON.parse(execFileSync(process.env.PYTHON||'python3',['-B','-c',"import json,sys;sys.path.insert(0,'scripts');from expand_adjective_constructions import authored_items;print(json.dumps(authored_items()))"],{cwd:root,encoding:'utf8',maxBuffer:6_000_000}));
assert.deepEqual(added,reproduced[0]);assert.deepEqual(patch,reproduced[1]);
const specs=read(dir+'construction-specs.json'),sources=read(dir+'sources.json').sources;
const rules=new Set(reproduced[2].map(f=>f.rule));assert.equal(rules.size,20,'All 20 theory families have checked fields');
for(const field of reproduced[2]){
 assert(specs[field.construction],field.item_id);assert(field.checked_answer);
 for(const id of field.sources.split(';'))assert(sources[id],field.item_id+': missing evidence');
}
const candidates=[...added,...patch];const find=fragment=>{const i=candidates.find(i=>i.prompt.includes(fragment));assert(i,fragment);return i;};
for(const [fragment,correct,wrong] of [
 ['The two filters remove',['as effective as'],['effective']],
 ['The revised form takes',['not so complicated as'],['not so more complicated as']],
 ['The replacement passed every test',['superior to'],['superior than']],
 ['Panel A is 80',['twice as wide as'],['twice wider than']],
 ['The blue strip measures 11',['three centimetres longer than'],['three times as long as']],
 ['The old hall covers',['twice the size of'],['twice as size as']],
 ['Detailed instructions make',['The more detailed','the more useful'],['more detailed','more useful']],
 ['The wood was as',['dry'],['drier']],
 ['The cloth feels dry',['more dry than'],['drier than']],
 ['Both plans solve',['as practical a solution as','more adaptable'],['as a practical solution as','more adaptable']],
 ['the committee understood nothing',['wiser','more detailed'],['wisest','more detailed']],
 ['Neither response was desirable',['lesser','more disruptive'],['less','more disruptive']],
 ['They could not have been',['more helpful','more complicated'],['less helpful','more complicated']],
 ['The two sisters were born',['elder'],['eldest']],
]){
 const i=find(fragment);assert(grade(i,correct).correct,i.id+': positive');assert(!grade(i,wrong).correct,i.id+': structure must be checked');
}
const promptKeys=new Set(),doneKeys=new Set(),norm=s=>s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
for(const i of candidates){assert(!promptKeys.has(norm(i.prompt)),i.id);promptKeys.add(norm(i.prompt));assert(!doneKeys.has(norm(i.answer_text)),i.id);doneKeys.add(norm(i.answer_text));}
assert(!fs.existsSync(new URL('cloudflare/public/docs/review',root)));
console.log(`Adjective constructions: 300/400/300; 170 additions, 12 versioned advanced revisions; ${Object.keys(specs).length} documented subcases across 20 theory families, whole-phrase negatives, historical keys and baseline preservation passed.`);
