import {manifest as bankManifest, assertBankVersion} from '../scripts/bank-versions.mjs';
// Writes only fictional practice attempts on the fixed, isolated test Worker.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const origin = 'https://grammar-noeon-test.grammar-noeon.workers.dev';
const fixtures = JSON.parse(fs.readFileSync(process.env.GRAMMAR_TEST_FIXTURES,'utf8'));
async function call(auth,path,data) {
  const response = await fetch(origin+'/api/'+path,{method:data===undefined?'GET':'POST',headers:{Origin:origin,'Content-Type':'application/json',Cookie:auth.cookie,'X-CSRF-Token':auth.csrf},body:data===undefined?undefined:JSON.stringify(data)});
  assert.equal(response.status,200,path);
  return response.json();
}
for(const auth of [fixtures.teacher,fixtures['anna-fixture']]) {
  const me = await call(auth,'auth/me');
  assert.match(me.user.email,/@example\.test$/);
}
for(const [auth,status] of [[null,401],[fixtures['anna-fixture'],403],[fixtures.teacher,200]]) {
  const response = await fetch(origin+'/data/exercises/part-13.json',{headers:auth?{Cookie:auth.cookie}:{},cache:'no-store'});
  assert.equal(response.status,status);
  if(status===200) {
    const bank = await response.json();
    assert.equal(bank.length,270);
    bank.forEach(item=>assertBankVersion(item));
  }
}
for(const path of ['/docs/review/COMPARISON-SOURCES-2026-10-27.md','/server/grading.py','/cloudflare/generated/bank.json'])
  assert.equal((await fetch(origin+path)).status,404,path);
const bank = JSON.parse(fs.readFileSync(new URL('../data/exercises/part-13.json',import.meta.url),'utf8'));
const cosy = bank.find(item=>item.blanks?.[0]?.base_adjective==='cosy'&&item.blanks[0].answer==='cosier');
const bound = bank.find(item=>item.id==='cmp-0158');
const rewrite = bank.find(item=>item.id==='cmp-0145');
const session = await call(fixtures.teacher,'practice/start',{ids:[cosy.id,bound.id,rewrite.id]});
let revision=0;
const answers = [['cozier'],bound.correct_option_index,(rewrite.correct_option_index+1)%rewrite.options.length];
for(let index=0;index<3;index++) {
  const result = await call(fixtures.teacher,'practice/'+session.id+'/check',{index,revision,submitted:answers[index],correct:true,score:999});
  assert.equal(result.answer.correct,index<2);
  assert.equal(result.answer.fields[0].verified,true);
  assert.equal(result.answer.checker,3);
  revision=result.revision;
}
const saved = await call(fixtures.teacher,'practice/'+session.id);
assert.equal(saved.index,3);
assert.equal(saved.answers.filter(answer=>answer.correct).length,2);
assert.equal(saved.answers.flatMap(answer=>answer.fields).filter(field=>!field.verified).length,0);
const replacedIDs=['cmp-0296','cmp-0151'];
const choiceSession=await call(fixtures.teacher,'practice/start',{ids:replacedIDs});
const choiceSaved=await call(fixtures.teacher,'practice/'+choiceSession.id);
let choiceRevision=0;
for(const [index,item] of choiceSaved.items.entries()) {
  assert.ok(!/Используйте|Use Future Perfect/.test(item.prompt),item.id);
  const correct=index!==1;
  assert.ok(['open_brackets'].includes(item.type),item.id);
  const submitted=item.blanks
    ? item.blanks.map(b=>correct?b.answer:'definitely wrong')
    : correct?item.correct_option_index:(item.correct_option_index+1)%item.options.length;
  const checked=await call(fixtures.teacher,'practice/'+choiceSession.id+'/check',{index,revision:choiceRevision,submitted,correct:!correct,score:999});
  assert.equal(checked.answer.correct,correct,item.id);
  assert.equal(checked.answer.fields[0].verified,true,item.id);
  choiceRevision=checked.revision;
}
assert.equal((await call(fixtures.teacher,'practice/'+choiceSession.id)).index,4);
console.log('Live answer-cue replacements passed: ribbon ratio, complete-sentence choices, two tense tasks and server-validated right/wrong options.');
console.log('Live comparison checks passed: 270 versioned items, protected bank/private files, cozier spelling, inclusive bound and automatic right/wrong choices with trusted results.');
