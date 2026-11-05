import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {grade} from '../cloudflare/generated/checker.mjs';
import {ASSESSMENT_SECTIONS,assessmentSection,assessmentTitle} from '../cloudflare/generated/assessment-config.mjs';
const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url)));
const raw=fs.readFileSync(new URL('../content/assessments/passive.json',import.meta.url));
const tests=JSON.parse(raw),seal=read('content/assessments/passive.lock.json');
assert.equal(createHash('sha256').update(raw).digest('hex'),seal.sha256);
assert.equal(tests.length,5);assert.deepEqual(ASSESSMENT_SECTIONS.passive,{title:'Passive Voice',openBrackets:20,multipleChoice:5});
const baseline=read('docs/review/PASSIVE-TESTS-2026-11-03/before-hashes.json');
// Old exercise parts and assessments stay sealed. The index and theory catalog
// legitimately grow when an independent section is appended. The schema prefix
// remains sealed; additive workspace migrations are tested separately.
for(const[p,hash]of Object.entries(baseline))if(/^(?:data\/exercises\/part-|content\/assessments\/|cloudflare\/(?:schema.sql|wrangler.jsonc))/.test(p))assert.equal(createHash('sha256').update((p==='cloudflare/schema.sql'?Buffer.from(fs.readFileSync(new URL('../'+p,import.meta.url),'utf8').split('\n-- Teacher library additions (0010).')[0]):fs.readFileSync(new URL('../'+p,import.meta.url)))).digest('hex'),hash,p+': original content/infrastructure unchanged');
const legacyTheory=read('data/theory.json').filter(entry=>entry.id!=='modals');
assert.equal(createHash('sha256').update(JSON.stringify(legacyTheory,null,2)+'\n').digest('hex'),baseline['data/theory.json'],'Pre-modal theory catalog preserved exactly');
const legacyParts=read('data/exercises/index.json').parts.filter(part=>part.section!=='modals');
assert.equal(legacyParts.length,65);
assert.equal(legacyParts.reduce((n,part)=>n+part.count,0),6379);
assert(legacyParts.every(part=>Object.hasOwn(baseline,part.file)),'Only the sealed pre-modal parts belong to legacy sections');
const lexical=Object.fromEntries(`ask:asked sell:sold paint:painted cancel:cancelled return:returned put_up:put_up arrange:arranged check:checked examine:examined steal:stolen win:won set:set repair:repaired upload:uploaded offer:offered report:reported tell:told announce:announced replace:replaced read:read give:given send:sent receive:received add:added hang:hung move:moved choose:chosen carry:carried inspect:inspected write:written connect:connected build:built copy:copied collect:collected find:found delay:delayed wash:washed discuss:discussed contact:contacted damage:damaged record:recorded introduce:introduced hold:held cut:cut fill:filled do:done play:played film:filmed enter:entered recover:recovered take_down:taken_down inform:informed keep:kept publish:published fit:fitted organise:organised translate:translated pass_on:passed_on sweep:swept attach:attached break:broken show:shown teach:taught perform:performed turn_down:turned_down reopen:reopened weigh:weighed put_together:put_together photograph:photographed bring:brought unpack:unpacked include:included discover:discovered explain:explained spend:spent display:displayed feed:fed mark_out:marked_out remove:removed test:tested reserve:reserved leave:left release:released fix:fixed`.split(' ').map(p=>p.split(':').map(s=>s.replaceAll('_',' '))));
const numberRows=[['s','p','p','p','s','s','p','s','p','s','s','p','s','s','p','s','s','s','p','s'],['s','s','s','p','s','p','s','s','s','s','p','p','s','p','p','s','s','s','s','p'],['s','s','s','p','s','p','s','s','p','s','s','s','s','p','p','p','s','s','p','s'],['s','p','p','p','s','s','s','s','s','p','s','p','p','s','p','s','s','s','s','p'],['s','s','p','p','s','p','p','s','s','s','p','p','p','s','s','p','s','p','p','s']];
const contractions={"'s":['is','has'],"'re":['are'],"'ve":['have'],"'ll":['will'],"'d":['had'],"'m":['am']};
const normal=s=>s.replaceAll('canceled','cancelled').replaceAll('organized','organised');
const grammar=/^(?:(?:is|are|am|was|were)(?: being| getting| going to (?:be|get))?|(?:has|have|had) (?:been|got|gotten)|will (?:be|get|have (?:been|got|gotten))|gets?|got) $/;
const ids=new Set(),positions=[0,0,0,0];let keys=0,agreement=0,drops=0;
const prompts=new Set();
for(const[t,test]of tests.entries()){
 assert.equal(test.id,'passive-'+(t+1));assert.equal(test.items.length,25);assert.equal(assessmentSection(test.id),'passive');assert.equal(assessmentTitle(test.id),'Passive Voice — Тест '+(t+1));
 assert.equal(test.items.filter(i=>i.blanks).length,20);assert.equal(test.items.filter(i=>i.options).length,5);
 assert.deepEqual(Object.fromEntries(['basic','medium','advanced'].map(l=>[l,test.items.filter(i=>i.level===l).length])),{basic:8,medium:12,advanced:5});
 assert.equal(new Set(test.items.flatMap(i=>i.practice_tenses)).size,8);
 for(const[n,x]of test.items.entries()){
  assert(!ids.has(x.id));ids.add(x.id);assert(!prompts.has(x.prompt));prompts.add(x.prompt);
  assert.equal(x.assessment_id,test.id);assert.equal(x.content_version,'assessment-passive-2026-11-03.1');assert.equal(x.response_contract,'bounded-v1');assert(!x.grading_mode);
  assert(!/be-passive|Используйте.*(?:Present|Past|Future)/.test(x.title));
  if(x.options){assert.equal(x.options.length,4);assert.equal(new Set(x.options).size,4);positions[x.correct_option_index]++;for(let v=0;v<4;v++)assert.equal(grade(x,v).correct,v===x.correct_option_index);continue;}
  const b=x.blanks[0],lemma=b.base_verb.replace(/^to /,'');assert.equal(x.blanks.length,1);assert(x.prompt.includes('('+b.base_verb+')'));assert.equal((x.prompt.match(/\(to [a-z]+(?: [a-z]+)*\)/g)||[]).length,1);
  const pp=lexical[lemma];assert(pp,lemma);assert(b.answer.endsWith(pp));
  for(const value of b.accepted_answers){
   assert(grade(x,[value]).correct,x.id+': '+value);keys++;
   let forms=[normal(value)];const first=value.split(' ')[0];if(contractions[first])forms=contractions[first].map(aux=>normal(value.replace(first,aux)));
   assert(forms.some(v=>v.endsWith(pp)&&grammar.test(v.slice(0,-pp.length))),x.id+': valid passive chain '+value);
   assert(forms.some(v=>!/^(?:is|has|was|gets)\b/.test(v)||numberRows[t][n]==='s'),x.id+': singular key');
   assert(forms.some(v=>!/^(?:are|have|were|get)\b/.test(v)||numberRows[t][n]==='p'),x.id+': plural key');
  }
  const flipped=b.answer.replace(/^(is|are|was|were|has|have)\b/,v=>({is:'are',are:'is',was:'were',were:'was',has:'have',have:'has'}[v]));
  if(flipped!==b.answer){assert(!grade(x,[flipped]).correct,x.id+': wrong person');agreement++;}
  const words=b.answer.split(' ');for(const[k,w]of words.entries())if(['is','are','was','were','has','have','had','will','be','being','been'].includes(w)){
   const v=words.filter((_,i)=>i!==k).join(' ');if(b.accepted_answers.includes(v))continue;assert(!grade(x,[v]).correct,x.id+': missing '+w);drops++;
  }
  assert(!grade(x,['not a grammatical verb form']).correct);
 }
}
assert.deepEqual(positions,[7,6,6,6]);assert.equal(ids.size,125);
const c={document:{querySelector(){}},localStorage:{getItem(){return null}},module:{exports:{}}};vm.createContext(c);
vm.runInContext(fs.readFileSync(new URL('../assessments.js',import.meta.url),'utf8')+'\n'+fs.readFileSync(new URL('../app.js',import.meta.url),'utf8').replace(/initialise\(\);/,''),c);
assert(c.assessmentQuestion(tests[0].items[0],0).includes('(to ask)'));assert(!c.assessmentQuestion(tests[0].items[0],0).includes('[to ask]'));
const published=read('docs/review/PASSIVE-TESTS-2026-11-03/before/docs/current-release.json');assert.equal(published.assessments.passive,undefined);
console.log(`Passive assessments: 5 sealed forms / 125 original questions, 20+5 formats, 8/12/5 levels, eight forms per test, ${keys} variants, ${agreement} agreement and ${drops} missing-word checks, original bank and 10 old forms unchanged.`);
