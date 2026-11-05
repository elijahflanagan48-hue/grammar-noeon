import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {validateBank,shuffleOptions} from '../scripts/clean-bank.mjs';
const require=createRequire(import.meta.url);
const {displayPrompt,lightHistoryAttempt}=require('../app.js');
const index=JSON.parse(fs.readFileSync(new URL('../data/exercises/index.json',import.meta.url)));
const parts=index.parts.map(part=>({file:part.file,items:JSON.parse(fs.readFileSync(new URL('../'+part.file,import.meta.url)))}));
validateBank(parts,index);
const rejected = (name,edit) => {const p=structuredClone(parts),i=structuredClone(index);edit(p,i);assert.throws(()=>validateBank(p,i),undefined,name);console.log('PASS rejects',name)};
rejected('duplicate id',p=>p[0].items[1].id=p[0].items[0].id);
rejected('wrong official option',p=>{const it=p.flatMap(p=>p.items).find(i=>i.options);it.correct_option_index=(it.correct_option_index+1)%it.options.length});
rejected('missing heading',p=>p[0].items[0].rule_refs=['content/tenses/02-present.md#does-not-exist']);
rejected('cloze marker count',p=>p.flatMap(p=>p.items).find(i=>i.type==='context_cloze').prompt+=' {{99:work}}');
rejected('bracket count',p=>p[0].items[0].prompt+=' (work)');
rejected('manifest counts',(_,i)=>i.total_items++);
rejected('stale version',p=>p[0].items[0].content_version='old');
for(const item of parts.flatMap(p=>p.items).filter(i=>i.options)){const copy=structuredClone(item),answer=item.options[item.correct_option_index];shuffleOptions(copy);assert.equal(copy.options[copy.correct_option_index],answer,'Shuffle preserves correct option');const once=structuredClone(copy);shuffleOptions(copy);assert.deepEqual(copy,once,'Stable deterministic option order after normalization');}
const generic=parts.flatMap(p=>p.items).filter(i=>i.prompt==='Выберите грамматически корректное предложение.');assert.equal(generic.length,29);
for(const item of generic){assert.equal(displayPrompt(item),item.options[item.correct_option_index]);const legacy=structuredClone(item);delete legacy.summary;assert.equal(displayPrompt(legacy),item.summary);const light=lightHistoryAttempt({answers:[{item}]}).answers[0].item;assert.equal(displayPrompt(light),item.summary);}
assert.equal(displayPrompt({type:'multiple_choice',prompt:'Выберите грамматически корректное предложение.',answer:'17. Old stored correct answer.'}),'Old stored correct answer.');
console.log('PASS current bank, deterministic idempotence, all 29 summaries and legacy/light history');
