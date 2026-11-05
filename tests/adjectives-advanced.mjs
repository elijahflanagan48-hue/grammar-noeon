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
const root=new URL('../',import.meta.url);
const read=p=>JSON.parse(fs.readFileSync(new URL(p,root)));
const manifest=read('data/exercises/index.json');
const pack=beforeAdjectiveConstructions(read('data/exercises/part-48.json'));
assert.equal(pack.length,60);
assert.equal(pack.reduce((n,i)=>n+i.blanks.length,0),124);
assert.equal(new Set(pack.map(i=>i.id)).size,60);
assert(pack.every(i=>i.topic==='comparison'&&i.level==='advanced'&&i.type==='open_brackets'));
assert.deepEqual([...new Set(pack.flatMap(exerciseTenses))].sort(),['cmp_development','cmp_equality','cmp_forms','cmp_precision','cmp_superlatives']);
for(const [target,count] of Object.entries({cmp_forms:12,cmp_superlatives:12,cmp_equality:9,cmp_development:15,cmp_precision:12}))assert.equal(pack.filter(i=>exerciseTenses(i).includes(target)).length,count,target);
// A full 50-item assignment can be formed with no repeats and all five topics.
for(let run=0;run<20;run++){
 const selected=balancedPractice(pack,50);
 assert.equal(selected.length,50);assert.equal(new Set(selected.map(i=>i.id)).size,50);
 assert.equal(new Set(selected.flatMap(exerciseTenses)).size,5);
}
for(const item of pack){
 const canonical=item.blanks.map(b=>b.answer);
 for(const [n,b] of item.blanks.entries())for(const answer of b.accepted_answers){
  const values=canonical.slice();values[n]=answer;
  assert(grade(item,values).correct,item.id+': server '+answer);
  assert(evaluate(item,values),item.id+': browser '+answer);
 }
 const wrong=canonical.slice();wrong[0]='more better-informed';
 assert(!grade(item,wrong).correct,item.id+': double comparative');
 assert(!evaluate(item,wrong),item.id+': browser double comparative');
 assert(grade(item,canonical).fields.every(f=>f.verified),item.id);
}
const byId=new Map(pack.map(i=>[i.id,i]));
for(const [suffix,correct,wrong] of [
 ['049',['higher','narrower'],['highest','narrowest']],
 ['054',['thinner','thicker'],['thicker','thinner']],
 ['058',['more balanced','more practical'],['most balanced','most practical']],
 ['046',['more compelling','less defensible'],['more compelling','more defensible']],
 ['052',['farther','further'],['farther','farther']],
]){
 const item=byId.get('cmp-adv-20261101-'+suffix);
 assert(grade(item,correct).correct,item.id);assert(!grade(item,wrong).correct,item.id);
}
// Reproduce only the appended data; no destructive full-bank importer is used.
const reproduced=JSON.parse(execFileSync(process.env.PYTHON||'python3',['-B','-c',"import sys,json;sys.path.insert(0,'scripts');from add_advanced_adjectives import authored_items;print(json.dumps(authored_items()))"],{cwd:root,encoding:'utf8'}));
assert.deepEqual(pack,reproduced);
const proof=read('docs/review/DISTINCT-CLOZE-2026-10-31/import-proof.json');
for(const [file,digest] of Object.entries(proof.parts_sha256))assert.equal(createHash('sha256').update(Buffer.from(JSON.stringify(beforeAdjectiveMix(read(file)),null,2)+'\n')).digest('hex'),digest,file+': previous exercises must stay unchanged');
assert.equal(manifest.total_items,7419);assert.equal(manifest.answer_slots,9646);
assert.equal(manifest.sections.comparison,1000);
console.log('Advanced adjectives: 60 exercises / 124 fields, all five topics, 50-item balanced assignments, server/client variants and negative keys, reproducible source; all 47 previous parts unchanged.');
