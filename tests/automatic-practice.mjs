import {manifest} from '../scripts/bank-versions.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import {grade} from '../cloudflare/generated/checker.mjs';
const root=new URL('../',import.meta.url);
const bank=JSON.parse(fs.readFileSync(new URL('cloudflare/generated/bank.json',root),'utf8'));
const ctx={document:{querySelector(){return {}}},localStorage:{getItem(){return null}},module:{exports:{}}};
vm.createContext(ctx);vm.runInContext(fs.readFileSync(new URL('app.js',root),'utf8').replace(/initialise\(\);/,''),ctx);
const parity=[];let fields=0;const indices=new Map(bank.map((item,n)=>[item.id,n]));
assert.equal(bank.length,manifest.total_items);
for(const item of bank) {
  assert.equal(item.response_contract,item.type==='translation_ru_en'?'manual-review-v1':'bounded-v1',item.id);
  assert.ok(item.options?.length||item.blanks?.length,item.id);
  assert.ok(item.topic==='passive'||!['translation_ru_en','transformation','error_correction'].includes(item.type),item.id);
  const cases=item.options?item.options.map((_,n)=>n):[item.blanks.map(b=>b.answer),item.blanks.map(()=>'not a grammatical answer')];
  if(item.blanks)for(const [n,b] of item.blanks.entries())for(const accepted of b.accepted_answers||[]){const values=item.blanks.map(x=>x.answer);values[n]=accepted;cases.push(values);}
  for(const [n,submitted] of cases.entries()){
    const result=grade(item,submitted);
    assert.equal(result.correct,item.grading_mode==='teacher'?false:item.options?submitted===item.correct_option_index:n!==1,item.id+': expected positive/negative key');
    const verified=item.grading_mode!=='teacher'&&(item.type!=='translation_ru_en'||n!==1);
    assert.ok(result.fields.every(f=>f.verified===verified),item.id+': closed answers graded, unknown translations pending');
    assert.equal(ctx.evaluate(item,submitted),result.correct,item.id+': browser parity');
    parity.push({item_index:indices.get(item.id),submitted,correct:result.correct,verified});
  }
  fields+=item.blanks?.length||1;
}
assert.equal(fields,manifest.answer_slots);
// Transfer each grading contract once. Repeating complete pedagogical records for
// every answer can block large synchronous stdin writes and wastes memory.
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'grammar-parity-'));
try {
 const contracts=bank.map(item=>Object.fromEntries(['id','type','answer_profile','grading_mode','answer','accepted_answers','blanks','options','correct_option_index','accepted_option_indices'].filter(k=>k in item).map(k=>[k,k==='blanks'?item.blanks.map(b=>({answer:b.answer,accepted_answers:b.accepted_answers})):item[k]])));
 const input=path.join(temporary,'cases.json');fs.writeFileSync(input,JSON.stringify({items:contracts,cases:parity}));
 const program=`import json,sys
from server.grading import grade
with open(sys.argv[1],encoding='utf-8') as source: payload=json.load(source)
results=[]
for case in payload['cases']:
    answer=grade(payload['items'][case['item_index']],case['submitted'])
    results.append([answer['correct'],all(f['verified'] for f in answer['fields'])])
print(json.dumps(results))`;
 const py=spawnSync(process.env.PYTHON || 'python3',['-B','-c',program,input],{cwd:root,encoding:'utf8',maxBuffer:32*1024*1024,timeout:120000});
 assert.equal(py.status,0,py.stderr||String(py.error));
 assert.deepEqual(JSON.parse(py.stdout),parity.map(x=>[x.correct,x.verified]));
}finally{fs.rmSync(temporary,{recursive:true,force:true});}
console.log(`Automatic bank: ${bank.length} records / ${fields} fields / ${parity.length} submissions; browser, Worker and Python agree; all new translations correctly pending, including model matches.`);
