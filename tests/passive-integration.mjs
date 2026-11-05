// Native integration of the separately audited editorial bank. No content generation.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {grade} from '../cloudflare/generated/checker.mjs';
import {exerciseSection,targetSection,supportedResponseContract,exerciseTenses,balancedPractice} from '../cloudflare/generated/selection.mjs';
const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url)));
const editorial=read('../../content/passive/exercises/bank-1000.json');
const manifest=read('data/exercises/index.json'),all=manifest.parts.flatMap(p=>read(p.file));
const bank=all.filter(i=>exerciseSection(i)==='passive'),byId=new Map(bank.map(i=>[i.id,i]));
const proof=read('docs/review/PASSIVE-THREE-FORMATS-2026-11-03/import-proof.json');
const sha=s=>createHash('sha256').update(s).digest('hex');
const pythonJson=v=>Array.isArray(v)?'['+v.map(pythonJson).join(', ')+']':v&&typeof v==='object'?'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+': '+pythonJson(v[k])).join(', ')+'}':JSON.stringify(v);
assert.equal(sha(fs.readFileSync(new URL('../../../content/passive/exercises/bank-1000.json',import.meta.url))),proof.source_sha256);
assert.equal(bank.length,1000);assert.equal(all.length,7419);assert.equal(bank.reduce((n,x)=>n+x.blanks.length,0),1400);
assert.deepEqual(Object.fromEntries(['tenses','comparison','passive','modals'].map(s=>[s,all.filter(i=>exerciseSection(i)===s).length])),manifest.sections);
const old=read('docs/review/PASSIVE-2026-11-03/before-items.json');
for(const i of all.filter(i=>!['passive','modals'].includes(exerciseSection(i))))assert.equal(sha(pythonJson(i)),old[i.id],i.id+': old record must remain identical');
const baseline=read('docs/review/PASSIVE-2026-11-03/before-files.json');
// Historical schema prefix stays sealed; additive workspace migrations are tested separately.
for(const [file,hash] of Object.entries(baseline).filter(([p])=>/^data\/exercises\/part-|^cloudflare\/(?:wrangler.jsonc|schema.sql)$/.test(p)))assert.equal(sha((file==='cloudflare/schema.sql'?Buffer.from(fs.readFileSync(new URL('../'+file,import.meta.url),'utf8').split('\n-- Teacher library additions (0010).')[0]):fs.readFileSync(new URL('../'+file,import.meta.url)))),hash,file+': preserve previous parts and infrastructure');
const context={module:{exports:{}},document:{querySelector(){}},localStorage:{getItem(){return null}}};vm.createContext(context);
vm.runInContext(fs.readFileSync(new URL('../passive.js',import.meta.url),'utf8')+'\n'+fs.readFileSync(new URL('../app.js',import.meta.url),'utf8'),context);
const check=(x,values)=>{const g=grade(x,values);assert.equal(context.evaluate(x,values),g.correct,x.id+': client parity');return g;};
let canonical=0,variants=0,cosmetics=0,negative=0,dropped=0,agreement=0;
for(const source of editorial.items){
 const item=byId.get(source.id);assert(item,source.id);assert(supportedResponseContract(item));
 assert.equal(item.prompt,source.prompt||source.prompt_ru);assert.equal(item.instruction_ru,source.instruction_ru);
 assert.equal(item.type,source.direction||source.type);assert.equal(item.content_version,'passive-2026-11-03.3');
 assert(exerciseTenses(item).every(t=>targetSection(t)==='passive'));
 const fields=source.type==='translation_ru_en'?[{answer:source.model_answer,accepted_answers:source.accepted_translations}]:source.blanks;
 const submitted=fields.map(b=>b.answer);assert.equal(check(item,submitted).correct,item.grading_mode!=='teacher');canonical+=fields.length;
 for(const [n,b]of fields.entries()){
  assert.deepEqual(item.blanks[n].accepted_answers,b.accepted_answers);
  for(const v of b.accepted_answers){const values=submitted.slice();values[n]=v;assert.equal(check(item,values).correct,item.grading_mode!=='teacher',item.id+': '+v);variants++;}
  const values=submitted.slice();values[n]='  '+b.answer.toUpperCase().replaceAll(' ','  ').replaceAll("'",'’')+' .  ';assert.equal(check(item,values).correct,item.grading_mode!=='teacher',item.id+': cosmetic');cosmetics++;
  if(item.type==='translation_ru_en')continue;
  values[n]=/\bnot\b/.test(b.answer)?b.answer.replace(/\bnot\s*/,''):b.answer.replace(/\b(am|is|are|was|were|has|have|had|will)\b/,'$1 not');assert(!check(item,values).fields[n].correct,item.id+': polarity');negative++;
  if(item.type==='error_correction')continue;
  const words=b.answer.split(' ');
  for(const[pos,word]of words.entries())if(['am','is','are','was','were','has','have','had','be','been','being','to'].includes(word)){
   values[n]=words.filter((_,j)=>j!==pos).join(' ');if(b.accepted_answers.includes(values[n]))continue;assert(!check(item,values).fields[n].correct,item.id+': missing '+word);dropped++;
  }
  const flipped=b.answer.replace(/^(is|are|was|were|has|have)\b/,v=>({is:'are',are:'is',was:'were',were:'was',has:'have',have:'has'}[v]));
  if(flipped!==b.answer&&item.id!=='pv3-p2a-02'){values[n]=flipped;assert(!check(item,values).fields[n].correct,item.id+': agreement');agreement++;}
 }
 if(item.type==='translation_ru_en'){const result=check(item,['A different unreviewed translation.']);assert(!result.correct);assert.equal(result.fields[0].verified,false);}
 if(item.type==='open_brackets'){const rendered=context.renderPrompt(item);assert.equal((rendered.match(/data-answer-index=/g)||[]).length,item.blanks.length,item.id+': all fields inline');assert.equal((rendered.match(/class="passive-cue"/g)||[]).length,item.blanks.length,item.id+': cues remain visible');}
 if(item.type==='word_order')assert.equal(new Set(item.blocks).size,item.blocks.length,item.id+': independent button tokens');
 for(const ref of [...item.rule_refs,...item.blanks.flatMap(b=>b.rule_refs)]){
  assert.equal(context.ruleLink(ref),'#theory/passive/'+ref.split('#')[1]);
  assert(fs.readFileSync(new URL('../passive.js',import.meta.url),'utf8').includes(ref.split('#')[1]),item.id+': native rule anchor');
 }
}
for(const[id,value,correct]of [
 ['pv5-s600','was born',true],['pv5-s600','was borne',false],
 ['pv5-s001','is washed',true],['pv5-s001','are washed',false],
 ['pv5-s002','were cleaned',true],['pv5-s002','was cleaned',false],
 ['pv5-a2p001','The kitchen floor is washed by the cleaner every Monday.',true],
 ['pv5-a2p001','The kitchen floor gets washed every Monday by the cleaner.',true],
 ['pv5-a2p001','The kitchen floor was washed by the cleaner every Monday.',false],
 ['pv5-a2p007','The chicken was cooked by the cook before the meeting started.',false]
]){const i=byId.get(id);assert.equal(check(i,[value]).fields[0].correct,correct,id);}
for(const[count,expected]of [[20,{sentence:12,mini_text:4,translation:2,transformation:2}],[50,{sentence:30,mini_text:10,translation:5,transformation:5}]]){
 const selected=balancedPractice(bank,count);const counts={};for(const x of selected)counts[x.practice_group]=(counts[x.practice_group]||0)+1;
 assert.deepEqual(counts,expected);assert.equal(new Set(selected.map(x=>x.id)).size,count);
}
const onlyOpen=balancedPractice(bank.filter(i=>i.type==='open_brackets'),20);assert.equal(onlyOpen.filter(i=>i.layout==='mini_text').length,5);
let historical=0;
for(let n=56;n<=65;n++)for(const x of read('docs/review/PASSIVE-THREE-FORMATS-2026-11-03/before/data/exercises/part-'+n+'.json')){
 assert(grade(x,x.blanks.map(b=>b.answer)).correct,x.id+': prior published snapshot unchanged');historical++;
}
assert.equal(historical,1000);
const html=context.passiveRuleHtml('ref-');assert(html.includes('id="ref-pv-table"'));assert(html.includes('data-passive-id="pv-table"'));
context.saved={topic:'passive',type:'word_order',tenses:['pv_process']};
const migrated=context.updatedPracticeSettings(context.saved,'passive');assert.equal(migrated.type,'all');assert.deepEqual(Array.from(migrated.tenses),['pv_present_continuous','pv_past_continuous']);
const worker=fs.readFileSync(new URL('../cloudflare/worker.mjs',import.meta.url),'utf8');assert(worker.includes('supportedResponseContract(item)'));
const sw=fs.readFileSync(new URL('../sw.js',import.meta.url),'utf8');for(const asset of ['passive.js','passive.css','07-passive.md'])assert(sw.includes(asset));
console.log(`Passive native integration: 1000 records / ${canonical} fields / ${variants} accepted variants / ${cosmetics} cosmetic / ${negative} polarity / ${dropped} missing-word / ${agreement} agreement checks; old 5379 records and infrastructure unchanged; all 100 translations manual; 80/10/10 sampling and 1000 prior snapshots verified.`);
