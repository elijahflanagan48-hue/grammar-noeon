import {beforeAdjectiveMix} from '../scripts/review-snapshots.mjs';
import {beforeAdjectiveConstructions} from '../scripts/review-snapshots.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {grade} from '../cloudflare/generated/checker.mjs';
import {balancedPractice,exerciseTenses} from '../cloudflare/generated/selection.mjs';
const require=createRequire(import.meta.url),{evaluate}=require('../app.js');
const root=new URL('../',import.meta.url),dir='docs/review/ADJECTIVES-300-2026-11-01/';
const read=p=>JSON.parse(fs.readFileSync(new URL(p,root)));
const manifest=read('data/exercises/index.json'),baseline=read(dir+'baseline-manifest.json');
const bank=beforeAdjectiveMix(manifest.parts.flatMap(p=>read(p.file)));
const additions=bank.filter(i=>/^cmp-(?:med|pro)-20261101-/.test(i.id));
const comparison=bank.filter(i=>i.id.startsWith('cmp-'));
const sources=read(dir+'sources.json').sources;
assert.equal(additions.length,500);assert.equal(comparison.length,1000);
assert.equal(additions.reduce((n,i)=>n+i.blanks.length,0),788);
assert.equal(manifest.total_items,7419);assert.equal(manifest.answer_slots,9646);assert.equal(manifest.parts.length,76);
assert.equal(manifest.content_versions.tenses,baseline.content_versions.tenses);
assert.equal(manifest.content_versions.comparison,'comparison-2026-11-01.5');
assert.deepEqual(manifest.parts.slice(0,48),baseline.parts);
for(const [file,digest] of Object.entries(read(dir+'baseline-hashes.json'))){
 assert.equal(createHash('sha256').update(file==='data/exercises/part-48.json' ? JSON.stringify(beforeAdjectiveConstructions(read(file)),null,2)+'\n' : Buffer.from(JSON.stringify(beforeAdjectiveMix(read(file)),null,2)+'\n')).digest('hex'),digest,file+': previous content changed');
}
for(const [level,count,added] of [['basic',300,0],['medium',400,260],['advanced',300,240]]){
 assert.equal(comparison.filter(i=>i.level===level).length,count,level);
 const pool=additions.filter(i=>i.level===level);assert.equal(pool.length,added,level);
 if(!added)continue;
 assert(pool.every(i=>i.type==='open_brackets'&&i.response_contract==='bounded-v1'));
 assert(pool.every(i=>i.blanks.length>=(level==='advanced'?2:1)));
 for(const target of ['cmp_forms','cmp_superlatives','cmp_equality','cmp_development','cmp_precision']){
  const topicPool=pool.filter(i=>exerciseTenses(i).includes(target));assert.equal(topicPool.length,added/5,level+': '+target);
 }
 for(let n=0;n<20;n++){
  const selected=balancedPractice(pool,50);assert.equal(selected.length,50);assert.equal(new Set(selected.map(i=>i.id)).size,50);
  assert.equal(new Set(selected.flatMap(exerciseTenses)).size,5);
 }
}
const promptKeys=new Set(),completedKeys=new Set();
const norm=s=>s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
for(const i of bank.filter(i=>!additions.includes(i))){promptKeys.add(norm(i.prompt));if(i.answer_text)completedKeys.add(norm(i.answer_text));}
for(const item of additions){
 assert(!promptKeys.has(norm(item.prompt)),item.id+': duplicate prompt');promptKeys.add(norm(item.prompt));
 assert(!completedKeys.has(norm(item.answer_text)),item.id+': duplicate completed text');completedKeys.add(norm(item.answer_text));
 const keys=item.blanks.map(b=>b.answer);
 assert(grade(item,keys).correct&&evaluate(item,keys),item.id);
 for(const [n,b] of item.blanks.entries()){
  for(const value of b.accepted_answers){const answers=keys.slice();answers[n]=value;assert(grade(item,answers).correct&&evaluate(item,answers),item.id+': '+value);}
  for(const wrong of ['more '+b.answer,'most '+b.answer,'wrong adjective']){
   if(b.accepted_answers.includes(wrong))continue;
   const answers=keys.slice();answers[n]=wrong;
   assert(!grade(item,answers).fields[n].correct&&!evaluate(item,answers),item.id+': '+wrong);
  }
 }
}
function example(fragment){const i=additions.find(i=>i.prompt.includes(fragment));assert(i,fragment);return i;}
const cases=[
 ['A broader survey',['more extensive','less defensible'],['more extensive','more defensible']],
 ['The specification allows panels',['thinner','thicker'],['thicker','thinner']],
 ['We need (far) evidence',['further','farthest'],['farther','farthest']],
 ['Although the interim report',['rigorous','less comprehensive'],['more rigorous','more comprehensive']],
 ['The manuscript is',['older','more recent'],['elder','more recent']],
 ['The second-(high) offer',['highest','most favourable'],['second-highest','most favourable']],
 ['The replacement must match',['worse'],['worst']],
];
for(const [fragment,correct,wrong] of cases){const item=example(fragment);assert(grade(item,correct).correct,item.id);assert(!grade(item,wrong).correct,item.id);}
const reproduced=JSON.parse(execFileSync(process.env.PYTHON||'python3',['-B','-c',"import sys,json;sys.path.insert(0,'scripts');from expand_adjectives_300 import authored_items;print(json.dumps(authored_items()))"],{cwd:root,encoding:'utf8',maxBuffer:8_000_000}));
assert.deepEqual(additions,reproduced[0]);assert.equal(reproduced[1].length,788);
for(const field of reproduced[1]){
 assert(field.sources.length);for(const id of field.sources.split(';')){
  assert(sources[id],field.item_id+': unknown source');
  assert(['dictionary.cambridge.org','learnenglish.britishcouncil.org','www.pearson.com','www.collinsdictionary.com','scrabble.merriam.com','www.oxfordlearnersdictionaries.com'].includes(new URL(sources[id].url).hostname));
 }
}
assert(!fs.existsSync(new URL('cloudflare/public/docs/review',root)));
console.log('Adjectives 300/300: 500 additions / 788 fields, five balanced topics per level, trusted keys, contextual negatives, original sources for every field, reproducible data, all 48 earlier parts preserved.');
