import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const root = new URL('../', import.meta.url);
const source=fs.readFileSync(new URL('app.js',root),'utf8');
const ctx={module:{exports:{}},document:{querySelector(){return {querySelectorAll(){return []},querySelector(){return null}}; }},localStorage:{getItem(){return null;}}};
vm.createContext(ctx);
vm.runInContext(source.replace(/initialise\(\);/,''),ctx);
vm.runInContext(fs.readFileSync(new URL('practice-report.js',root),'utf8'),ctx);
const files=fs.readdirSync(new URL('data/exercises/',root)).filter(f=>/^part-.*\.json$/.test(f));
const items=files.flatMap(file=>JSON.parse(fs.readFileSync(new URL('data/exercises/'+file,root),'utf8')));
let variants=0;
for(const item of items){
  if(item.grading_mode==='teacher'){const result=ctx.fieldResults(item,item.blanks.map(b=>b.answer));assert(result.every(f=>!f.correct&&!f.verified),item.id+': even model translations require teacher review');continue;}
  if(item.options){
    for(let n=0;n<item.options.length;n++) assert.equal(ctx.evaluate(item,n),(item.accepted_option_indices||[item.correct_option_index]).includes(n),item.id+': option '+n);
  } else if(item.blanks){
    const canonical=item.blanks.map(b=>b.answer);
    assert.equal(ctx.evaluate(item,canonical),true,item.id+': canonical');
    item.blanks.forEach((b,k)=>{
      for(const value of [b.answer,...b.accepted_answers]){
        const values=canonical.slice();values[k]=value;
        assert.equal(ctx.evaluate(item,values),true,item.id+': '+value);
        assert.equal(ctx.fieldResults(item,values).every(f=>f.correct),true,item.id+': per-field consistency');
        variants++;
      }
    });
    assert.equal(ctx.evaluate(item,canonical.map(()=>'')),null,item.id+': empty answer');
  } else {
    for(const value of [item.answer,...(item.accepted_answers||[])]){
      assert.equal(ctx.evaluate(item,value),true,item.id+': '+value);variants++;
    }
  }
}
const target=items.find(i=>i.id==='src-u02-020');
for(const v of ['had already translated','already translated']) assert.equal(ctx.evaluate(target,[v]),true);
for(const v of ['had translated','translated','has translated','had not translated','had never translated','had already translate','had already already translated'])assert.equal(ctx.evaluate(target,[v]),false,v);
const never=items.find(i=>i.id==='src-u09-027');
assert.equal(ctx.evaluate(never,['have been']),false,'never is not globally optional');
assert.equal(ctx.evaluate(never,['have never been']),true);
const exact={answer:'I have known Anna since 2019.'};
assert.equal(ctx.evaluate(exact,"I've known Anna since 2019."),true);
assert.equal(ctx.evaluate(exact,'I has known Anna since 2019.'),false);
assert.equal(ctx.evaluate({answer:'He had left.'},"He'd left."),true);
assert.equal(ctx.evaluate({answer:'He would have left.'},"He'd have left."),true);
assert.equal(ctx.evaluate({answer:'He would have left.'},"He'd've left."),true);
assert.equal(ctx.evaluate({answer:'She has gone.'},"She's gone."),true);
assert.equal(ctx.evaluate({answer:'He had not left.'},"He hadn't left."),true);
assert.equal(ctx.evaluate({answer:'He had left.'},"He hadn't left."),false);
assert.equal(ctx.evaluate({answer:'They cannot come.'},"They can't come."),true);
assert.equal(ctx.evaluate({answer:'They can come.'},"They can't come."),false);
assert.equal(ctx.evaluate({answer:'have translated'},'have already translated'),false,'no undeclared word deletion');
assert.equal(ctx.evaluate(items.find(i=>i.id==='adv-transform-004'),'Seldom have I encountered a dataset this internally consistent.'),false,'explicit RARELY instruction');
assert.equal(ctx.evaluate(JSON.parse(fs.readFileSync(new URL('docs/review/PRACTICE-FORMATS-2026-10-31/retired-records.json',root),'utf8')).find(i=>i.id==='new-error-005'),'By Friday I will finish the project.'),false,'choice requires an option index, not an arbitrary sentence');
console.log(`Answer checking passed: ${items.length} exercises, ${variants} reviewed variants, positive and negative regressions.`);
const theoryByFile={
 '08-modals.html':'08-modals.html',
 '07-passive.md':'07-passive.md',
 '06-comparison.md':'06-comparison.md',
 '01-foundations.md':'01-foundations.md','02-present.md':'02-present.md','03-past.md':'03-past.md','04-future.md':'04-future.md','05-contrasts-and-pitfalls.md':'05-contrasts-and-pitfalls.md',
};
const anchors=new Map(Object.keys(theoryByFile).map(file=>{
 const markdown=fs.readFileSync(new URL('content/theory/'+file,root),'utf8');
 return [file,new Set([...ctx.module.exports.markdownHeadings(markdown).map(h=>h.id),...Array.from(markdown.matchAll(/\bid="([^"]+)"/g),m=>m[1])])];
}));
const broken=new Set();
for(const i of items)for(const ref of [...(i.rule_refs||[]),...(i.blanks||[]).flatMap(b=>b.rule_refs||[])]){
 const match=ref.match(/^content\/(?:tenses|comparison|passive|modals)\/([^#]+)(?:#(.+))?$/);
 if(!match||!anchors.has(match[1])||(match[2]&&!anchors.get(match[1]).has(match[2])))broken.add(ref);
}
assert.deepEqual([...broken],[],'All exercise rule links must point to existing headings');
console.log('All exercise rule anchors exist.');

const memory=new Map();
ctx.localStorage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)};
ctx.location={hash:''};
ctx.document.querySelectorAll=()=>[];
assert.equal(ctx.fieldResults({type:'translation_ru_en',answer:'I know Anna.'},'Anna and I are acquainted.')[0].verified,false);
assert.equal(ctx.fieldResults({type:'open_brackets',answer:'know'},'knew')[0].verified,true);
vm.runInContext(`{
  const item={id:'qa-translation',type:'translation_ru_en',prompt:'Я знаю Анну.',answer:'I know Anna.',cefr_estimate:'A2'};
  state.session={items:[item],index:0,correct:0,checked:true,answers:[{item,submitted:'Anna and I are acquainted.',correct:false,fields:[{submitted:'Anna and I are acquainted.',correct:false,verified:false}]}]};
  nextQuestion();
  renderResults();
}`,ctx);
const pendingHistory=JSON.parse(memory.get('noeon-history'))[0];
assert.equal(pendingHistory.pending,1);
assert.equal(pendingHistory.maxScore,0);
assert.equal(pendingHistory.score,0);
const resultHtml=vm.runInContext('app.innerHTML',ctx);
assert.ok(!resultHtml.includes('NaN'));
assert.equal(ctx.reportSummary(pendingHistory).percent,null);
assert.ok(resultHtml.includes('не включены в процент и не объявлены ошибками'));
console.log('Unverified translations are stored separately and excluded from accuracy.');
