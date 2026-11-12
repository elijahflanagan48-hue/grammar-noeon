import {manifest} from '../scripts/bank-versions.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {grade} from '../cloudflare/generated/checker.mjs';
const root=new URL('../',import.meta.url);
const bank=fs.readdirSync(new URL('data/exercises/',root)).filter(p=>/^part-.*json$/.test(p)).flatMap(p=>JSON.parse(fs.readFileSync(new URL('data/exercises/'+p,root),'utf8')));
for(const [name,items,total] of [
 ['Tenses',bank.filter(i=>!['passive','modals','reported','nouns','speaking','infinitive'].includes(i.topic)&&!i.id.startsWith('cmp-')),manifest.sections.tenses],
 ['Passive',bank.filter(i=>i.topic==='passive'),manifest.sections.passive],
 ['Comparison',bank.filter(i=>i.id.startsWith('cmp-')),manifest.sections.comparison],
]){
 const open=items.filter(i=>i.type==='open_brackets').length;
 assert.equal(items.length,total,name+': manifest total');
 assert.ok(open*5>=total*4,name+': below 80%');
 console.log(`${name}: ${open}/${total} = ${(100*open/total).toFixed(2)}% open brackets.`);
}
const specs=fs.readFileSync(new URL('scripts/comparison_brackets.py',root),'utf8');
const converted=[...specs.matchAll(/^(\d+)\|/gm)].map(m=>'cmp-'+m[1].padStart(4,'0'));
assert.equal(converted.length,130);
for(const id of converted){
 const item=bank.find(i=>i.id===id);
 assert.equal(item.type,'open_brackets',id);
 for(const field of ['answer','accepted_answers','options','correct_option_index','accepted_option_indices']) assert.equal(item[field],undefined,id+': stale '+field);
 const bases=[...item.prompt.matchAll(/\(([^)]+)\)/g)].map(m=>m[1]);
 assert.deepEqual(bases,item.blanks.map(b=>b.base_adjective),id);
 const canonical=item.blanks.map(b=>b.answer);
 assert.equal(grade(item,canonical).correct,true,id);
 item.blanks.forEach((b,n)=>{
   assert.ok(b.explanation_ru && b.rule_refs.length,id);
   for(const a of b.accepted_answers){const response=canonical.slice();response[n]=a;assert.equal(grade(item,response).correct,true,id+': '+a);}
 });
 assert.equal(grade(item,canonical.map(()=> 'definitely wrong')).correct,false,id);
}
const largest=bank.find(i=>i.id==='cmp-0245');
assert.equal(grade(largest,['second-largest']).correct,false,'ordinal is already supplied');
assert.equal(grade(largest,['largest']).correct,true);
const informed=bank.find(i=>i.id==='cmp-0283');
assert.equal(grade(informed,['more better-informed']).correct,false,'no double comparison');
console.log('130 converted frames: visible adjective bases, no stale choice keys, accepted variants, negatives and rule links passed.');
