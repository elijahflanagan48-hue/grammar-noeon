import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {grade} from '../cloudflare/generated/checker.mjs';
import {balancedPractice, exerciseSection, exerciseTenses, supportedResponseContract, updatedPracticeSettings} from '../cloudflare/generated/selection.mjs';

const read = p => JSON.parse(fs.readFileSync(new URL('../'+p, import.meta.url)));
const index = read('data/exercises/index.json');
const all = index.parts.flatMap(p=>read(p.file)).filter(i=>i.topic==='comparison');
const active = all.filter(i=>!i.retired);
const dir = new URL('../content/bankgen/comparison/final/', import.meta.url);
const source = fs.readdirSync(dir).sort().flatMap(f=>fs.readFileSync(new URL(f,dir),'utf8')
  .split('\n').filter(l=>l.startsWith('{')).map(JSON.parse));
const bySource = new Map(source.map(r=>[r.id,r]));
const mapping = read('content/bankgen/comparison/id-map.json');
assert.equal(source.length,1000);
assert.equal(active.length,1000);
assert.equal(all.filter(i=>i.retired).length,1000);
assert.equal(index.sections.comparison,all.length);
assert.equal(index.content_versions.comparison,'comparison-2026-11-24.1');
let variants = 0;
for(const item of active){
  const row = bySource.get(item.bankgen_id);
  assert(row,item.id);
  assert.equal(mapping[row.id],item.id);
  assert.equal(item.prompt,row.prompt);
  assert.equal(item.explanation_ru,row.explanation_ru);
  assert.equal(exerciseSection(item),'comparison');
  assert(supportedResponseContract(item));
  assert.deepEqual(exerciseTenses(item),item.tags);
  if(item.options){
    assert.deepEqual(item.options,row.options);
    for(let ix=0;ix<4;ix++)assert.equal(grade(item,ix).correct,ix===row.correct_option_index,item.id);
  }else{
    const fields=item.blanks||[item], originals=row.blanks||[row];
    const canonical=fields.map(f=>f.answer);
    for(let n=0;n<fields.length;n++){
      assert.deepEqual(fields[n].accepted_answers,originals[n].accepted_answers);
      for(const answer of fields[n].accepted_answers){
        const submitted=canonical.slice();submitted[n]=answer;
        assert(grade(item,submitted).correct,item.id+': '+answer);variants++;
      }
      const wrong=canonical.slice();wrong[n]='a deliberately incorrect answer';
      assert(!grade(item,wrong).correct,item.id);
    }
  }
}
const context={module:{exports:{}},document:{querySelector(){}},localStorage:{getItem(){return null}}};
vm.createContext(context);vm.runInContext(fs.readFileSync(new URL('../app.js',import.meta.url),'utf8'),context);
context.bank=all;vm.runInContext('state.exercises=bank',context);
const targets=[...new Set(active.flatMap(exerciseTenses))];
assert.equal(targets.length,31);
for(const target of targets){
  const pool=active.filter(i=>exerciseTenses(i).every(t=>t===target));
  assert(pool.length,'No selectable exercises for '+target);
  assert(balancedPractice(pool,10).every(i=>!i.retired));
}
for(const old of ['cmp_forms','cmp_superlatives','cmp_equality','cmp_development','cmp_precision']){
  const migrated=updatedPracticeSettings({tenses:[old],levels:['basic']},'comparison');
  assert(migrated.tenses.every(t=>targets.includes(t)),old);
  assert(active.some(i=>exerciseTenses(i).every(t=>migrated.tenses.includes(t))),old);
}
assert(all.filter(i=>i.retired).every(i=>!supportedResponseContract(i)));
for(const item of active.filter(i=>i.bankgen_format==='transform')){
  context.item=item;assert(vm.runInContext('answerControls(item)',context).includes('<textarea'));
  assert(!vm.runInContext('needsReview(item)',context));
}
console.log(`Comparison bank: 1000 active, 1000 archived, 31 selectable targets, ${variants} accepted variants, six formats.`);
