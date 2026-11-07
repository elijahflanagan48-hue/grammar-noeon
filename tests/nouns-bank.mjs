import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {grade} from '../cloudflare/generated/checker.mjs';
const {evaluate}=createRequire(import.meta.url)('../app.js');
const root=fileURLToPath(new URL('../',import.meta.url));
const read=file=>fs.readFileSync(root+file,'utf8');
const manifest=JSON.parse(read('data/exercises/index.json'));
const items=manifest.parts.filter(p=>p.section==='nouns').flatMap(p=>JSON.parse(read(p.file)));
assert.equal(items.length,1000,'nouns bank size');
assert.equal(manifest.sections.nouns,1000);
assert.equal(new Set(items.map(i=>i.id)).size,1000,'unique ids');
// every rule link points to an existing heading of the nouns rule
const src=read('app.js');
const slug=eval(src.match(/const slugify = (\(text\) => [\s\S]*?);\n/)[1]);
const anchors=new Set([...read('content/theory/09-nouns.md').matchAll(/^#{2,4}\s+(.+)$/gm)].map(m=>slug(m[1])));
const refs=item=>[...item.rule_refs,...(item.blanks||[]).flatMap(b=>b.rule_refs||[])];
for(const item of items){
  assert.equal(item.topic,'nouns',item.id);
  assert(item.practice_tenses.every(t=>t.startsWith('noun_')),item.id);
  for(const ref of refs(item)){
    const [file,anchor]=ref.split('#');
    assert.equal(file,'content/nouns/09-nouns.md',item.id);
    assert(anchors.has(anchor),`${item.id}: unknown heading ${anchor}`);
  }
  for(const blank of item.blanks||[])assert(blank.accepted_answers.includes(blank.answer),item.id);
  if(item.type==='multiple_choice'){
    assert.equal(item.options.length,4,item.id);
    assert.equal(item.options[item.correct_option_index],item.answer,item.id);
    assert(item.accepted_option_indices.includes(item.correct_option_index),item.id);
  }
}
// answer position of correct MC options is balanced
const positions=[0,0,0,0];for(const i of items)if(i.type==='multiple_choice')positions[i.correct_option_index]++;
assert(Math.max(...positions)-Math.min(...positions)<=Math.ceil(positions.reduce((a,b)=>a+b)/20),'MC positions are skewed: '+positions);
// every target of the practice page has tasks on each level
const targets=[...src.matchAll(/"id":"(noun_[a-z_]+)"/g)].map(m=>m[1]);
assert(targets.length>=13);
for(const target of targets)assert(items.some(i=>i.practice_tenses.includes(target)),'no tasks for '+target);
for(const level of ['basic','medium','advanced'])assert(items.filter(i=>i.level===level).length>=150,level);
// official answers are accepted by both the client and the server checker
for(const i of items.filter(i=>i.response_contract!=='manual-review-v1')){const answer=i.options?i.correct_option_index:i.blanks.map(b=>b.answer);assert.equal(evaluate(i,answer),true,i.id);assert.equal(grade(i,answer).correct,true,i.id);}
console.log('PASS nouns bank: 1000 tasks, anchors, schema, balance, targets');
