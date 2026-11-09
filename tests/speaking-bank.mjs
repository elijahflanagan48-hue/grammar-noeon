import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {grade} from '../cloudflare/generated/checker.mjs';
const {evaluate}=createRequire(import.meta.url)('../app.js');
const root=fileURLToPath(new URL('../',import.meta.url));
const read=file=>fs.readFileSync(root+file,'utf8');
const manifest=JSON.parse(read('data/exercises/index.json'));
const items=manifest.parts.filter(p=>p.section==='speaking').flatMap(p=>JSON.parse(read(p.file)));
assert.equal(items.length,500,'speaking bank size');
assert.equal(manifest.sections.speaking,500);
assert.equal(new Set(items.map(i=>i.id)).size,500,'unique ids');
const anchors=new Set([...read('content/theory/10-speaking-verbs-rule.html').matchAll(/id="([^"]+)"/g)].map(m=>m[1]));
const refs=item=>[...item.rule_refs,...(item.blanks||[]).flatMap(b=>b.rule_refs||[])];
const verbs=/\b(say|says|said|saying|tell|tells|told|telling|speak|speaks|spoke|spoken|speaking|talk|talks|talked|talking)\b/i;
for(const item of items){
  assert.equal(item.topic,'speaking',item.id);
  assert(item.practice_tenses.every(t=>t.startsWith('sv_')),item.id);
  assert(!/[А-Яа-яЁё]/.test(item.prompt)||item.type==='translation_ru_en',item.id+': Cyrillic in English prompt');
  for(const ref of refs(item)){
    const [file,anchor]=ref.split('#');
    assert.equal(file,'content/speaking/10-speaking-verbs-rule.html',item.id);
    assert(anchors.has(anchor),`${item.id}: unknown anchor ${anchor}`);
  }
  for(const blank of item.blanks||[]){assert(blank.accepted_answers.includes(blank.answer),item.id);assert(verbs.test(blank.answer),item.id);}
  if(item.type==='multiple_choice'){
    assert.equal(item.options.length,4,item.id);
    assert.equal(item.options[item.correct_option_index],item.answer,item.id);
    assert.deepEqual(item.accepted_option_indices,[item.correct_option_index],item.id);
  }
}
const positions=[0,0,0,0];for(const i of items)if(i.type==='multiple_choice')positions[i.correct_option_index]++;
assert(Math.max(...positions)-Math.min(...positions)<=Math.ceil(positions.reduce((a,b)=>a+b)/20),'MC positions are skewed: '+positions);
const src=read('app.js');
const targets=[...src.matchAll(/"id":\s*"(sv_[a-z_]+)"/g)].map(m=>m[1]);
assert.equal(targets.length,7);
for(const target of targets)assert(items.filter(i=>i.practice_tenses.includes(target)).length>=30,'too few tasks for '+target);
for(const level of ['basic','medium','advanced'])assert(items.filter(i=>i.level===level).length>=100,level);
// a wrong verb from the brackets is rejected, the official answer is accepted by client and server
const wrong={say:'told',tell:'said',speak:'talked',talk:'spoke'};
const lemma=w=>({says:'say',said:'say',saying:'say',tells:'tell',told:'tell',telling:'tell',speaks:'speak',spoke:'speak',spoken:'speak',speaking:'speak',talks:'talk',talked:'talk',talking:'talk'})[w.toLowerCase()]||w.toLowerCase();
for(const i of items.filter(i=>i.response_contract!=='manual-review-v1')){
  const answer=i.options?i.correct_option_index:i.blanks.map(b=>b.answer);
  assert.equal(evaluate(i,answer),true,i.id);assert.equal(grade(i,answer).correct,true,i.id);
  if(i.type==='open_brackets'){
    const b=i.blanks[0];const bad=wrong[lemma(b.answer)];
    if(!b.accepted_answers.some(a=>lemma(a)===lemma(bad)))assert.equal(evaluate(i,[bad]),false,i.id+' accepts '+bad);
  }
}
console.log('PASS speaking bank: 500 tasks, anchors, schema, balance, targets, grading');
