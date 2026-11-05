import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {grade} from '../cloudflare/generated/checker.mjs';
const require=createRequire(import.meta.url),{evaluate}=require('../app.js');
const root=new URL('../',import.meta.url);
const index=JSON.parse(fs.readFileSync(new URL('data/exercises/index.json',root),'utf8'));
const modals=index.parts.flatMap(part=>JSON.parse(fs.readFileSync(new URL(part.file,root),'utf8'))).filter(item=>item.topic==='modals');
assert.equal(modals.length,1040);
const normalize=value=>value.replace(/[\u2019\u2018\u02bc]/g,"'").trim().toLowerCase().replace(/\s+/g,' ').replace(/[.!?]+$/,'').trim();
const variants=value=>[value,value.toUpperCase(),value.toLowerCase(),' \t'+value+'\n ',value.replace(/'/g,'’'),value.replace(/'/g,'‘'),value.replace(/'/g,'ʼ'),value.replace(/ /g,' \t '),value+'.!?'];
let accepted=0,rejected=0,choices=0,fixes=0;
for(const item of modals) {
  assert.equal(item.answer_profile,'modal-exact-v1');
  if(item.options) {
    for(let n=0;n<item.options.length;n++) {
      const expected=n===item.correct_option_index;
      assert.equal(grade(item,n).correct,expected,item.id+': server option '+n);
      assert.equal(evaluate(item,n),expected,item.id+': browser option '+n);
      choices++;
    }
    continue;
  }
  const canonical=item.blanks.map(blank=>blank.answer);
  assert.equal(grade(item,canonical).correct,true,item.id+': canonical');
  item.blanks.forEach((blank,n)=> {
    for(const value of blank.accepted_answers) for(const variant of variants(value)) {
      const submitted=canonical.slice();submitted[n]=variant;
      assert.equal(grade(item,submitted).correct,true,item.id+': server accepts '+variant);
      assert.equal(evaluate(item,submitted),true,item.id+': browser accepts '+variant);
      accepted++;
    }
    for(const option of blank.modal_options||[]) {
      if(normalize(option)===normalize(blank.answer))continue;
      assert(!blank.accepted_answers.some(answer=>normalize(answer)===normalize(option)),item.id+': distractor must not be in accept');
      const submitted=canonical.slice();submitted[n]=option;
      const result=grade(item,submitted);
      assert.equal(result.correct,false,item.id+': server rejects distractor '+option);
      assert.equal(result.fields[n].correct,false,item.id+': individual field rejects distractor '+option);
      assert.equal(result.fields.filter(field=>field.correct).length,item.blanks.length-1,item.id+': each other text field still correct');
      assert.equal(evaluate(item,submitted),false,item.id+': browser rejects distractor '+option);
      rejected++;
    }
  });
  if(item.type==='modal_fix') {
    assert.equal(grade(item,[item.prompt]).correct,false,item.id+': uncorrected sentence rejected by server');
    assert.equal(evaluate(item,[item.prompt]),false,item.id+': uncorrected sentence rejected by browser');
    fixes++;
  }
}
assert.equal(fixes,50);
assert.equal(choices,1000);
assert(accepted>10000 && rejected>2000);
console.log(`Modal checker: all 1040 records, ${accepted} accepted normalization/answer variants, ${rejected} field distractors, ${choices} choice positions and ${fixes} uncorrected sentences verified in server and browser checkers.`);
