import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {grade} from '../cloudflare/generated/checker.mjs';
import {exerciseSection,exerciseTenses,targetSection,supportedResponseContract} from '../cloudflare/generated/selection.mjs';
import {assignmentSentenceKeys} from '../cloudflare/generated/assignment-keys.mjs';

const read=f=>fs.readFileSync(new URL('../'+f,import.meta.url),'utf8');
const index=JSON.parse(read('data/exercises/index.json'));
const bank=index.parts.flatMap(p=>JSON.parse(read(p.file))).filter(i=>i.topic==='conditionals');
const raw=Array.from({length:29},(_,n)=>read('content/bankgen/conditionals/final/CD'+String(n+1).padStart(2,'0')+'.jsonl'));
const source=raw.flatMap(text=>text.split('\n').filter(l=>l.trim()&&!l.startsWith('#')).map(l=>JSON.parse(l)));
const byId=new Map(source.map(i=>[i.id,i]));
const expected={gap:228,mini:113,mc:184,fix:116,which:86,transform:103,fact:63,match:18,sort:28,bank:14,hunt:22,order:32};
assert.equal(bank.length,1007);assert.equal(index.sections.conditionals,1007);
assert.equal(index.content_versions.conditionals,'conditionals-2026-11-23.1');
assert.equal(new Set(bank.map(i=>i.id)).size,1007);
assert.deepEqual(Object.fromEntries(Object.keys(expected).map(f=>[f,bank.filter(i=>i.source_format===f).length])),expected);
const ctx={document:{querySelector(){}},localStorage:{getItem(){return null}},module:{exports:{}}};
vm.createContext(ctx);vm.runInContext(read('app.js'),ctx);
vm.runInContext(read('conditionals-map-data.js')+read('conditionals-map.js')+';globalThis.mapItems=CDM.items;',ctx);
let variants=0,negatives=0;
for(const item of bank){
  const author=byId.get(item.id);
  assert.equal(exerciseSection(item),'conditionals');assert(supportedResponseContract(item));
  assert.equal(item.level,author.level);assert.equal(item.explanation_ru,author.explanation_ru);
  assert.equal(exerciseTenses(item).length,1);assert(exerciseTenses(item).every(t=>targetSection(t)==='conditionals'));
  assert(item.tags.every(t=>t.startsWith('cd_')));
  const visible=Object.fromEntries(['id','topic','type','prompt','source_format','starts','endings','groups','sort_items','word_bank','sentences','blocks','options'].filter(k=>k in item).map(k=>[k,item[k]]));
  if(item.blanks)visible.blanks=item.blanks.map(b=>Object.fromEntries(['id','base_verb'].filter(k=>k in b).map(k=>[k,b[k]])));
  const html=ctx.renderPrompt(visible)+ctx.answerControls(visible);
  assert(!html.includes(item.explanation_ru),'no explanation before answering');
  if(item.blanks)assert.equal((html.match(/data-answer-index=/g)||[]).length,item.blanks.length,item.id+': exactly one control per field');

  const canonical=item.options?item.correct_option_index:item.blanks?item.blanks.map(b=>b.answer):item.answer;
  assert(grade(item,canonical).correct);assert(ctx.evaluate(item,canonical));
  if(item.options){
    assert.deepEqual(item.options,author.options);
    for(let n=0;n<item.options.length;n++)assert.equal(grade(item,n).correct,n===author.correct_option_index);
  }else{
    const fields=item.blanks||[item];
    for(const [n,field]of fields.entries()){
      if(['gap','mini'].includes(author.format))assert.deepEqual(field.accepted_answers,author.blanks[n].accepted_answers);
      if(['order','transform'].includes(author.format))assert.deepEqual(field.accepted_answers,author.accepted_answers);
      if(author.format==='fix')assert.deepEqual(field.accepted_answers,author.accepted_answers);
      for(const value of field.accepted_answers){
        const submitted=item.blanks?[...canonical]:value;if(item.blanks)submitted[n]=value;
        assert(grade(item,submitted).correct,item.id+': '+value);assert(ctx.evaluate(item,submitted));variants++;
      }
      for(const wrong of ['not a grammatical answer','___wrong___',field.answer+' extra']){
        const submitted=item.blanks?[...canonical]:wrong;if(item.blanks)submitted[n]=wrong;
        assert(!grade(item,submitted).correct,item.id);assert.equal(ctx.evaluate(item,submitted),false);negatives++;
      }
    }
    assert.throws(()=>grade(item,item.blanks?[]:''));
  }
  if(item.type==='match'){assert.equal(item.starts.length,4);assert.equal(item.endings.length,4);assert.deepEqual(item.starts,author.pairs.map(p=>p[0]));}
  if(item.type==='sort'){assert.equal(item.sort_items.length,item.blanks.length);assert.deepEqual(item.groups,author.groups);}
  if(item.type==='bank'){assert.equal((item.prompt.match(/___/g)||[]).length,item.blanks.length);assert.equal(item.word_bank.length,item.blanks.length+2);}
  if(item.type==='hunt'){assert.deepEqual(item.fixes,author.fixes);assert.equal(item.sentences.length,item.blanks.length);for(const text of Object.values(item.fixes))assert(assignmentSentenceKeys({id:'alias',type:'error_fix',prompt:text,answer:text}).some(k=>assignmentSentenceKeys(item).includes(k)),'corrected hunt sentence reserved');}
  // Keys must include task content, never a shared instruction that would reserve an entire format.
  if(['match','sort','hunt','word_order'].includes(item.type))assert(!assignmentSentenceKeys(item).includes('sentence:'+item.prompt.toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim()));
}
const strict={answer_profile:'conditionals-exact-v1',answer:'would have come',accepted_answers:['would have come']};
assert.equal(ctx.matchesField(strict,"'d have come"),false);assert.equal(ctx.matchesField(strict,'would already have come'),false);
assert.equal(ctx.matchesField(strict,'WOULD HAVE COME.'),true);
assert.equal(ctx.matchesField({answer_profile:'conditionals-exact-v1',answer:'were',accepted_answers:['were']},'was'),false);
for(const item of ctx.mapItems){const tag=ctx.cdmPracticeTarget(item);assert(index.construction_counts.conditionals[tag]||exerciseTenses(bank.find(i=>i.practice_tenses.includes(tag))||{}).includes(tag),item.name+': '+tag);}
const before=createHash('sha256').update(raw.join('\0')).digest('hex');
const result=spawnSync('python3',['-B','scripts/build_conditionals_bank.py'],{encoding:'utf8'});assert.equal(result.status,0,result.stderr);
assert.equal(createHash('sha256').update(Array.from({length:29},(_,n)=>read('content/bankgen/conditionals/final/CD'+String(n+1).padStart(2,'0')+'.jsonl')).join('\0')).digest('hex'),before,'source unchanged');
assert.deepEqual(JSON.parse(read('data/exercises/index.json')),index,'manifest values preserved on rebuild');
const rebuilt=read('data/exercises/index.json');
assert.equal(spawnSync('python3',['-B','scripts/build_conditionals_bank.py'],{encoding:'utf8'}).status,0);
assert.equal(read('data/exercises/index.json'),rebuilt,'builder idempotent');
for(const id of ['CD29-05','CD29-11']){
  const item=bank.find(i=>i.id===id);
  assert(byId.get(id).prompt.includes('___ ('),'source retains duplicate slot marker');
  assert(!item.prompt.includes('___')&&!item.answer_text.includes('___'),id+': one site slot per source blank');
}
const corrected=bank.find(i=>i.id==='CD20-01');
assert.deepEqual(corrected.blanks[0].accepted_answers,['were']);
assert.equal(grade(corrected,['was']).correct,false,'CD20-01 corrected plural agreement');
assert.equal(ctx.evaluate(corrected,['was']),false);
const report=JSON.parse(read('docs/conditionals/bank-report.json'));
assert.deepEqual(report.missing_levels,{cd_inversion:['basic']});
assert.deepEqual(report.undercovered,[]);
assert(Object.values(report.constructions).every(n=>n>=8));
assert.deepEqual(report.source_issues.map(i=>i.id),['CD23-11','CD23-21','CD23-28','CD24-11','CD24-17','CD24-30','CD26-40','CD29-42']);
console.log(`Conditionals: 1007 items, 12 source formats, ${variants} exact accepted variants, ${negatives} negative submissions, map filters, unchanged sources and reproducible manifest passed.`);
console.log('AUTHOR BANK COVERAGE UNMET: '+JSON.stringify({undercovered:report.undercovered.map(r=>[r.construction,r.count]),missingLevels:report.missing_levels,sourceIssues:report.source_issues}));
if(process.argv.includes('--coverage'))assert(report.coverage_met&&report.source_issues.length===0,'Author bank needs corrections; see docs/conditionals/bank-report.json. Sources must not be edited by this integration.');
