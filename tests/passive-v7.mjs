import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';
import {grade} from '../cloudflare/generated/checker.mjs';
import {reportFieldTopics} from '../cloudflare/generated/topics.mjs';
import {exerciseTenses,updatedPracticeSettings,supportedResponseContract,balancedPractice} from '../cloudflare/generated/selection.mjs';
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'passive-v7-test-'));
try{
 const output=path.join(dir,'items.json');
 const built=spawnSync('python3',['scripts/build_passive_bank_v7.py','--fixture','tests/fixtures/passive-v7-sample.jsonl','--output',output],{encoding:'utf8'});
 assert.equal(built.status,0,built.stderr);
 const items=JSON.parse(fs.readFileSync(output,'utf8'));
 const context={module:{exports:{}},document:{querySelector(){}},localStorage:{getItem(){return null}}};
 vm.createContext(context);vm.runInContext(fs.readFileSync('app.js','utf8').replace(/initialise\(\);/,''),context);
 let checked=0;
 for(const item of items){
  assert.deepEqual(exerciseTenses(item),['pv_'+item.cell]);
  assert(supportedResponseContract(item));
  const light=context.lightHistoryAttempt({answers:[{item,fields:[{correct:true,verified:true}]}]}).answers[0].item;
  assert.deepEqual(reportFieldTopics(light,0),['pv_'+item.cell]);
  if(item.options){assert(grade(item,item.correct_option_index).correct);continue;}
  const canonical=item.blanks?item.blanks.map(b=>b.answer):item.answer;
  for(const [index,field] of (item.blanks||[item]).entries())for(const answer of field.accepted_answers){
   const submitted=Array.isArray(canonical)?canonical.map((v,n)=>n===index?answer:v):answer;
   assert(grade(item,submitted).correct,item.id);
   assert(context.evaluate(item,submitted),item.id);
   const cosmetic=s=>'  '+s.toUpperCase().replaceAll(' ','  ').replaceAll("'",'’').replace(/[.!?]$/,'')+'  ';
   const variant=Array.isArray(submitted)?submitted.map(cosmetic):cosmetic(submitted);
   assert(grade(item,variant).correct,item.id+' whitespace/case/apostrophe');checked++;
  }
  const archived={...item,retired:'passive-v7'};
  assert(grade(archived,canonical).correct,'Retirement does not change stored grading');
  assert(!supportedResponseContract(archived));assert.equal(balancedPractice([archived],1).length,0);
 }
 for(const legacy of ['pv_simple','pv_process','pv_perfect','pv_present_simple','pv_past_perfect'])assert.deepEqual(updatedPracticeSettings({tenses:[legacy]},'passive').tenses,['pv_D1']);
 assert.deepEqual(updatedPracticeSettings({tenses:['pv_modals','pv_nonfinite','pv_questions']},'passive').tenses,['pv_D3','pv_D4','pv_D5','pv_D11']);
 assert.deepEqual(exerciseTenses({topic:'passive',practice_tenses:['pv_D2','active_past_simple','pv_past_simple']}),['pv_D2']);
 const unchanged=items.find(i=>i.type==='error_fix'&&!i.has_error);
 assert(grade(unchanged,unchanged.prompt).correct);
 const wrong=items.find(i=>i.type==='error_fix'&&i.has_error);assert(!grade(wrong,wrong.prompt).correct);
 const raw=fs.readFileSync('content/assessments/passive.json');
 const seal=JSON.parse(fs.readFileSync('content/assessments/passive.lock.json','utf8'));
 assert.equal(createHash('sha256').update(raw).digest('hex'),seal.sha256);
 const assessments=JSON.parse(raw);assert.equal(assessments.length,5);let questions=0;
 for(const form of assessments){assert.equal(form.items.length,25);for(const item of form.items){
  const values=item.options?item.correct_option_index:item.blanks.map(b=>b.answer);
  assert(grade(item,values).correct,item.id);assert(context.evaluate(item,values));questions++;
 }}
 const modal=JSON.parse(fs.readFileSync('cloudflare/generated/bank.json','utf8')).find(i=>i.type==='modal_fix');
 assert(grade(modal,modal.blanks?modal.blanks.map(b=>b.answer):modal.answer).correct);
 console.log('Passive assessments: sealed source hash and all '+questions+' questions passed; modal_fix compatibility passed.');
 console.log(`Passive v7: ${items.length} isolated fixtures, ${checked} accepted variants, client/Worker parity, old settings, retired snapshots and error-free correction verified.`);
}finally{fs.rmSync(dir,{recursive:true,force:true});}
