import {beforeDistinctCloze} from '../scripts/review-snapshots.mjs';
import {manifest as bankManifest, assertBankVersion} from '../scripts/bank-versions.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';
import {grade} from '../cloudflare/generated/checker.mjs';
const root=new URL('../',import.meta.url);
const bank=fs.readdirSync(new URL('data/exercises/',root)).filter(p=>/^part-.*json$/.test(p)).flatMap(p=>JSON.parse(fs.readFileSync(new URL('data/exercises/'+p,root),'utf8'))).filter(i=>i.topic!=='passive'&&i.topic!=='modals'&&!i.id.startsWith('cmp-'));
const ctx={module:{exports:{}},document:{querySelector(){return {}}},localStorage:{getItem(){return null}}};
const parity=[];
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(new URL('app.js',root),'utf8').replace(/initialise\(\);/,''),ctx);
assert.equal(bank.length,bankManifest.sections.tenses);
for(const item of bank){
  assertBankVersion(item);
  if(item.options){
    const keys=item.accepted_option_indices||[item.correct_option_index];
    assert.ok(keys.length<item.options.length,item.id+': every option accepted');
    assert.equal(new Set(item.options).size,item.options.length,item.id);
    item.options.forEach((_,n)=>{
      assert.equal(grade(item,n).correct,keys.includes(n),item.id);
      parity.push({item,submitted:n,correct:keys.includes(n)});
    });
  }
  const cues=item.type==='context_cloze'?[...item.prompt.matchAll(/\{\{\d+:([^}]+)}}/g)].map(m=>m[1]):[...item.prompt.matchAll(/\(([^()]+)\)/g)].map(m=>m[1]);
  for(const [n,b] of (item.blanks||[]).entries()) for(const token of b.answer.match(/\b(?:I|you|he|she|we|they|my|your|our|their)\b/gi)||[]) {
    assert.ok(new RegExp('\\b'+token+'\\b','i').test(cues[n]||''),item.id+': hidden subject '+token);
  }
  assert.ok(!/\b(?:use|using|with|make)\b.*?\b(?:Perfect|Continuous)\b|помощью Past Perfect/i.test(item.prompt),item.id+': named answer form');
  if(item.type==='open_brackets'){
    const parts=item.prompt.split(/\((?:to )?[^)]+\)/);
    assert.equal(parts.length-1,item.blanks.length,item.id);
    item.blanks.forEach((b,n)=>{
      const supplied=parts[n+1].match(/^\s*(still|just|already|up|out|off|back)\b/i)?.[1].toLowerCase();
      if(supplied) for(const a of b.accepted_answers) assert.notEqual(a.toLowerCase().split(' ').at(-1),supplied,item.id+': repeated supplied word');
    });
  }
}
const item=id=>bank.find(i=>i.id===id);
const cases=[
 ['src-u04-039',['gave'],true],['src-u04-039',['gave up'],false],['src-u04-039',['has given'],false],
 ['src-u05-094',['baked'],true],['src-u05-094',['have baked'],false],
 ['src-u01-042',['has been reading'],true],['src-u01-042',['was reading'],false],
 ['src-u04-016',['has written'],false],['src-u04-016',['is writing'],true],
 ['src-u01-017',['will finish'],true],['src-u01-017',['will have finished'],true],
 ['src-u01-017',['had finished'],false],['src-u01-013',['passed'],true],
 ['src-u01-013',['has passed'],true],['src-u01-013',['has pass'],false],
 ['src-u01-040',['became','was still'],false],['src-u09-064',['made','was just'],false],
];
for(const [id,submitted,correct] of cases){
 assert.equal(ctx.evaluate(item(id),submitted),correct,id+': browser');
 assert.equal(grade(item(id),submitted).correct,correct,id+': Worker');
 parity.push({item:item(id),submitted,correct});
}
// The original inversion remains supported in previously issued snapshots.
const inversion=beforeDistinctCloze([item('adv-cloze-003')])[0];
assert.ok(inversion.prompt.includes('Only later {{7:do}} I realise'));
const answers=inversion.blanks.map(b=>b.answer);
assert.equal(answers[6],'did');
assert.equal(grade(inversion,answers).correct,true);
answers[6]='did I realise';
assert.equal(grade(inversion,answers).correct,false);
parity.push({item:inversion,submitted:answers,correct:false});
const python=spawnSync(process.env.PYTHON || 'python3',['-B','-c','import json,sys;from server.grading import grade;print(json.dumps([grade(x["item"],x["submitted"])["correct"] for x in json.load(sys.stdin)]))'],{cwd:root,input:JSON.stringify(parity),encoding:'utf8'});
assert.equal(python.status,0,python.stderr);
assert.deepEqual(JSON.parse(python.stdout),parity.map(row=>row.correct),'Python/Worker parity');
console.log('Tenses clarity: current-bank triage, concrete choices, verb-only frames, boundary words and contextual positive/negative regressions passed.');
