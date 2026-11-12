import {manifest} from '../scripts/bank-versions.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const root = new URL('../',import.meta.url);
const source=fs.readFileSync(new URL('app.js',root),'utf8');
const context={module:{exports:{}},document:{querySelector(){}},localStorage:{getItem(){return null}},console};
vm.createContext(context);
vm.runInContext(source.replace(/initialise\(\);/,''),context);
const get = expression => vm.runInContext(expression,context);
const bank=fs.readdirSync(new URL('data/exercises/',root)).filter(name=>/^part-.*json$/.test(name)).flatMap(name=>JSON.parse(fs.readFileSync(new URL('data/exercises/'+name,root),'utf8')));
context.bank=bank;
const targets=get('exerciseTenses');
const select=get('balancedPractice');
const ids=get('PRACTICE_TENSES.map(tense=>tense.id).filter(id=>bank.some(item=>exerciseSection(item)==="tenses"&&exerciseTenses(item).includes(id)))');
assert.equal(bank.filter(item=>!['passive','modals','reported','nouns','speaking','infinitive'].includes(item.topic)&&!item.id.startsWith('cmp-')).length,manifest.sections.tenses);
assert.equal(bank.filter(item=>item.id.startsWith('cmp-')).length,manifest.sections.comparison);
for(const item of bank) assert.ok(targets(item).length,`Missing reviewed targets: ${item.id}`);
assert.deepEqual(Array.from(targets(bank.find(i=>i.id==='new-translation-016'))),['future_simple','present_simple']);
assert.deepEqual(Array.from(targets(bank.find(i=>i.id==='new-error-002'))),['past_simple']);
assert.deepEqual(Array.from(targets(bank.find(i=>i.id==='adv-choice-007'))),['future_continuous']);
assert.deepEqual(Array.from(targets({blanks:[{tense_or_construction:'future_time_clause',answer:'comes'}]})),['present_simple']);
const eligible=choices=>bank.filter(item=>targets(item).every(target=>choices.includes(target)));
let seed=90210;
const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2**32);
for(const choices of [ids, ['present_simple'], ['past_simple','present_perfect'],['future_continuous','future_perfect_continuous'],['present_simple','past_simple','future_simple']]) {
 const pool=eligible(choices);
 for(let run=0;run<30;run++) {
  const sample=select(pool,Math.min(50,pool.length),random);
  assert.equal(sample.length,Math.min(50,pool.length));
  assert.equal(new Set(sample.map(item=>item.id)).size,sample.length);
  assert.ok(sample.every(item=>targets(item).every(target=>choices.includes(target))));
  for(const target of choices) assert.ok(sample.some(item=>targets(item).includes(target)),target);
 }
}
// Grossly uneven banks must not give the common tense most of the practice.
const uneven=['present_simple','past_simple','future_simple'].flatMap((target,index)=>Array.from({length:index?30:900},(_,i)=>({id:target+i,type:['open_brackets','multiple_choice','error_correction'][i%3],practice_tenses:[target]})));
for(let run=0;run<100;run++) {
 const sample=select(uneven,20,random);
 const counts=['present_simple','past_simple','future_simple'].map(target=>sample.filter(item=>targets(item).includes(target)).length);
 assert.ok(Math.max(...counts)-Math.min(...counts)<=1);
 assert.equal(new Set(sample.map(item=>item.type)).size,3);
 for(let i=1;i<sample.length;i++) assert.notEqual(targets(sample[i])[0],targets(sample[i-1])[0]);
}
const rare=uneven.filter(item=>!item.id.startsWith('future_simple')||item.id==='future_simple0');
const exhausted=select(rare,50,random);
assert.equal(exhausted.length,50);
assert.equal(exhausted.filter(item=>targets(item).includes('future_simple')).length,1);
assert.equal(select([],20,random).length,0);
const orderings=new Set(Array.from({length:20},()=>select(uneven,20,random).map(item=>item.id).join(',')));
assert.equal(orderings.size,20);
// Actual UI filter enforces conjunction for multi-tense exercises and all filters.
get('state.exercises=bank');
context.form={elements:{type:{value:'all'}},querySelectorAll(selector){return selector.includes('name="format"')?[...new Set(bank.map(i=>i.type))].map(value=>({value})):selector.includes('name="level"')?['basic','medium','advanced'].map(value=>({value})):[{value:'past_simple'}]}};
const filtered=get('filteredExercises(form)');
assert.ok(filtered.length>0&&filtered.every(item=>targets(item).every(target=>target==='past_simple')));
context.form.querySelectorAll=selector=>selector.includes('name="format"')?[...new Set(bank.map(i=>i.type))].map(value=>({value})):selector.includes('name="level"')?[{value:'basic'},{value:'medium'}]:[{value:'past_simple'}];
const twoLevels=get('filteredExercises(form)');
assert.ok(twoLevels.some(item=>item.level==='basic'));
assert.ok(twoLevels.some(item=>item.level==='medium'));
assert.ok(twoLevels.every(item=>['basic','medium'].includes(item.level)));
context.form.querySelectorAll=selector=>selector.includes('name="format"')?[...new Set(bank.map(i=>i.type))].map(value=>({value})):selector.includes('name="level"')?[]:[{value:'past_simple'}];
assert.equal(get('filteredExercises(form).length'),0);
context.form.querySelectorAll=()=>[];
assert.equal(get('filteredExercises(form).length'),0);
console.log(`Practice selection: ${manifest.sections.tenses} classified exercises; strict multi-tense filters, fairness, diversity, exhaustion and randomisation passed.`);

const {execFileSync}=await import('node:child_process');
const pythonKeys=JSON.parse(execFileSync('python3',['-B','-c',`import json,glob;from server.assignment_keys import assignment_sentence_keys;items=sum([json.load(open(p)) for p in sorted(glob.glob('data/exercises/part-*.json'))],[]);print(json.dumps({i['id']:assignment_sentence_keys(i) for i in items}))`],{cwd:new URL('../',import.meta.url),encoding:'utf8',maxBuffer:5_000_000}));
const sentenceKeys=get('assignmentSentenceKeys');
for(const item of bank) assert.deepEqual(Array.from(sentenceKeys(item)),pythonKeys[item.id],item.id);
const first={id:'first',type:'open_brackets',prompt:'33. Last spring we (to have) exams.',answer_text:'33. Last spring we had exams.',blanks:[{answer:'had'}]};
const alias={id:'alias',type:'multiple_choice',prompt:'Last spring we ___ exams.',options:['had','have'],correct_option_index:0};
assert.ok(sentenceKeys(first).some(key=>sentenceKeys(alias).includes(key)));
context.dedupPool=[first,alias];
assert.equal(get('uniqueAssignmentPool(dedupPool).length'),1);
context.form={elements:{type:{value:'all'}},assignmentAvailableIds:new Set(),querySelectorAll(selector){return selector.includes('name="format"')?[...new Set(bank.map(i=>i.type))].map(value=>({value})):selector.includes('name="level"')?[{value:'basic'}]:[{value:'past_simple'}]}};
assert.equal(get('filteredExercises(form).length'),0,'An exhausted per-student pool cannot fall back to old exercises');
console.log(`Unique assignments: cross-format sentence identity, exhausted-pool handling and Python/JS parity for all ${manifest.sections.tenses} exercises passed.`);
