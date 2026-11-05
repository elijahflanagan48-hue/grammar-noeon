import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import {grade as workerGrade} from '../cloudflare/generated/checker.mjs';
const root = new URL('../', import.meta.url);
const ctx = {module:{exports:{}},document:{querySelector(){return {}}},localStorage:{getItem(){return null}}};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(new URL('app.js',root),'utf8').replace(/initialise\(\);/,''),ctx);
const cases = [];
function check(item, submitted, correct, verified) {
  cases.push({item:{id:'flex-'+cases.length,...item},submitted,correct,verified});
}
const sentence = {type:'error_correction',answer:'The clearer the map is, the easier the task is.'};
for (const text of [' THE CLEARER THE MAP IS, THE EASIER THE TASK IS. ', 'The clearer the map is the easier the task is', '“The clearer the map is,the easier the task is.”', "'The clearer the map is the easier the task is;'"])
  check(sentence,text,true,true);
check({type:'error_correction',answer:'This is a better-informed panel.'},'This is a better‑informed panel.',true,true);
check({type:'error_correction',answer:'This is a better-informed panel.'},'This is a better informed panel.',true,true);
for (const adjective of ['better-known','best-known','better-lit','most well-lit']) {
  check({type:'open_brackets',blanks:[{answer:adjective}]},[adjective.replaceAll('-',' ')],true,true);
  check({type:'open_brackets',blanks:[{answer:adjective}]},['more '+adjective.replaceAll('-',' ')],false,true);
}
check({type:'open_brackets',blanks:[{answer:'cosier'}]},['cozier'],true,true);
check({type:'translation_ru_en',answer:'The colourful room is cosier.'},'The colorful room is cozier.',true,true);
check({type:'error_correction',answer:'It is not as expensive as ours.'},"It isn’t as expensive as ours!",true,true);
check({type:'error_correction',answer:'He had not left.'},"He hadn't left.",true,true);
check({type:'transformation',answer:'He would have left.'},"He’d’ve left.",true,true);
check({type:'translation_ru_en',answer:'They cannot come.'},'They can not come.',true,true);
// Unknown sentence responses are neither accepted nor penalised.
check({type:'error_correction',answer:'This chair is more comfortable than that one.'},'That chair is less comfortable than this one.',false,false);
check({type:'transformation',answer:'This is the cheapest option.'},'No other option costs less than this one.',false,false);
check({type:'translation_ru_en',answer:'This is the cheapest option.'},'There is no less expensive option.',false,false);
// Similarity must never silently approve grammatical or semantic differences.
for (const bad of ['It is as expensive as ours.','It is not as cheap as ours.','Ours is not as expensive as it is.'])
  check({type:'error_correction',answer:'It is not as expensive as ours.'},bad,false,false);
check({type:'transformation',blanks:[{answer:'cheaper than'}]},['less expensive than'],false,true);
for (const bad of ['has gone','had not gone','had go','had already gone'])
  check({type:'open_brackets',blanks:[{answer:'had gone'}]},[bad],false,true);
check({type:'open_brackets',blanks:[{answer:'twice as wide as'}]},['three times as wide as'],false,true);
check({type:'transformation',blanks:[{answer:'no more than 10'}]},['less than 10'],false,true);
check({type:'error_correction',answer:'The fee is 1,000 pounds.'},'The fee is 1000 pounds.',false,false);
check({type:'error_correction',answer:'The fee is 1.5 pounds.'},'The fee is 15 pounds.',false,false);
check({type:'open_brackets',blanks:[{answer:'better-informed'}]},['better formed'],false,true);
check({type:'error_correction',answer:'She has gone.'},'She have gone.',false,false);
check({type:'error_correction',answer:'They can come.'},"They can't come.",false,false);
check({type:'error_correction',answer:'It is cheaper.'},'It is not cheaper.',false,false);
// Check real exercise keys, not only synthetic fixtures.
const bank = JSON.parse(fs.readFileSync(new URL('data/exercises/part-13.json',root),'utf8'));
for (const item of bank.filter(i=>!i.options)) {
  const fields = item.blanks || [item];
  const answers = fields.map(f=>f.answer.toUpperCase().replaceAll('-', '‑')+' . ');
  check(item,item.blanks?answers:answers[0],true,true);
}
for (const row of cases) {
  const local = ctx.fieldResults(row.item,row.submitted);
  const worker = workerGrade(row.item,row.submitted);
  assert.equal(worker.correct,row.correct,row.item.id);
  assert.ok(worker.fields.every(f=>f.verified===row.verified),row.item.id+': worker status');
  assert.deepEqual(JSON.parse(JSON.stringify(local)),worker.fields,row.item.id+': browser/Worker parity');
  assert.equal(worker.checker,3);
}
// Use a file for fixture input: large synchronous stdin pipes can stall on macOS.
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'grammar-flexible-'));
const fixtureFile=path.join(temporary,'cases.json');fs.writeFileSync(fixtureFile,JSON.stringify(cases));
let python;
try{
  python=spawnSync(process.env.PYTHON || 'python3',['-B','-c','import json,sys;from server.grading import grade;cases=json.load(open(sys.argv[1]));print(json.dumps([grade(x["item"],x["submitted"]) for x in cases]))',fixtureFile],{cwd:root,encoding:'utf8',timeout:60000,maxBuffer:16*1024*1024});
}finally{fs.rmSync(temporary,{recursive:true,force:true});}

assert.equal(python.status,0,python.stderr);
const graded = JSON.parse(python.stdout);
graded.forEach((result,n)=>{
  const row = cases[n];
  assert.equal(result.correct,row.correct,row.item.id+': Python verdict');
  assert.ok(result.fields.every(f=>f.verified===row.verified),row.item.id+': Python status');
  assert.deepEqual(result.fields,workerGrade(row.item,row.submitted).fields,row.item.id+': Python/Worker parity');
  assert.equal(result.checker,3);
});
console.log('Flexible checking: '+cases.length+' cases passed in browser, Worker and Python; known variants accepted, unknown sentences unscored, semantic/grammar negatives not approved.');
