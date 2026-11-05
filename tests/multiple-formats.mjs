import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const root=new URL('../',import.meta.url),bank=fs.readdirSync(new URL('data/exercises/',root)).filter(x=>/^part-.*json$/.test(x)).flatMap(x=>JSON.parse(fs.readFileSync(new URL('data/exercises/'+x,root))));
const context={module:{exports:{}},document:{querySelector(){}},localStorage:{getItem(){return null}}};vm.createContext(context);
vm.runInContext(fs.readFileSync(new URL('app.js',root),'utf8').replace(/initialise\(\);/,''),context);
const get=s=>vm.runInContext(s,context),section=get('exerciseSection'),targets=get('exerciseTenses');context.bank=bank;get('state.exercises=bank');
let checks=0;
for(const topic of ['tenses','comparison','passive']){
 const topicItems=bank.filter(x=>section(x)===topic),types=[...new Set(topicItems.map(x=>x.type))],rules=[...new Set(topicItems.flatMap(targets))];
 for(let mask=0;mask<2**types.length;mask++)for(const chosenRules of [rules,...rules.map(x=>[x])]){
  const formats=types.filter((_,i)=>mask&(1<<i)),levels=['basic','medium','advanced'];
  context.form={elements:{topic:{value:topic},count:{value:'20'}},querySelectorAll(selector){return (selector.includes('name="format"')?formats:selector.includes('name="level"')?levels:chosenRules).map(value=>({value,disabled:false}));}};
  const pool=get('filteredExercises(form)'),expected=topicItems.filter(x=>formats.includes(x.type)&&levels.includes(x.level)&&targets(x).every(t=>chosenRules.includes(t)));
  assert.deepEqual(Array.from(pool,x=>x.id),expected.map(x=>x.id),topic+': strict format union and rule intersection');
  const payload=get('practiceFilterPayload(form)');assert.deepEqual(Array.from(payload.types),formats);assert(!('type'in payload));checks++;
 }
 // All/none/individual actions and presets use the same checkbox state.
 const inputs=types.map(value=>({value,checked:false,disabled:false}));context.form={querySelectorAll(selector){return selector.includes(':checked')?inputs.filter(x=>x.checked):inputs;}};
 get("setPracticeFormats(form,'all')");assert(inputs.every(x=>x.checked));
 get('setPracticeFormats(form,[])');assert(inputs.every(x=>!x.checked));
 context.wanted=types.slice(0,2);get('setPracticeFormats(form,wanted)');assert.deepEqual(Array.from(get('selectedFormats(form)')),types.slice(0,2));
 inputs[0].disabled=true;get("setPracticeFormats(form,'all')");assert(!inputs[0].checked,'Unavailable format cannot be selected');
}
console.log(`Multiple formats: ${checks} actual-bank combinations across all three sections and every rule, strict subset selection, empty union, payload arrays and all/none actions passed.`);
