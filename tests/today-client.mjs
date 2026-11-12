import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const values=new Map();
const node={innerHTML:'',querySelectorAll(){return []}};
const ctx={module:{exports:{}},document:{querySelector(){return node},querySelectorAll(){return []},getElementById(){return null}},localStorage:{getItem(k){return values.get(k)||null},setItem(k,v){values.set(k,v)}},location:{hash:'#home'}};
vm.createContext(ctx);vm.runInContext(fs.readFileSync(new URL('../home-design.js',import.meta.url),'utf8'),ctx);vm.runInContext(fs.readFileSync(new URL('../today-design.js',import.meta.url),'utf8'),ctx);vm.runInContext(fs.readFileSync(new URL('../app.js',import.meta.url),'utf8'),ctx);
const item={id:'fixture',type:'open_brackets',prompt:'I (to work).',blanks:[{answer:'do',base_verb:'work'}]};
const other=structuredClone(item);other.blanks[0].answer='a very very long hidden answer';
assert.equal(ctx.blankControl(item,0,true),ctx.blankControl(other,0,true));
const question={type:'open_brackets',prompt:'How often (you / to walk) to work?',blanks:[{base_verb:'walk'}]};
assert(ctx.renderPrompt(question).includes('you / walk'));assert(ctx.blankControl(question,0).includes('you / walk'));assert(!ctx.blankControl(question,0).includes('можно повторить или опустить'));
const hostile={type:'open_brackets',prompt:'(<img src=x> / to work)',blanks:[{base_verb:'work'}]};assert(!ctx.blankControl(hostile,0).includes('<img'));
const input={value:'',style:{}};ctx.resizeAnswerInput(input);assert.equal(input.size,12);input.value='had been doing';ctx.resizeAnswerInput(input);assert(input.size>12);assert.equal(input.style.width,input.size+'ch');
const remote={items:[item],index:0,checked:true,correct:1,answers:[{item,correct:true,fields:[{correct:true,verified:true}]}],remote:{id:'remote-fixture'}};
ctx.fixture=remote;vm.runInContext("account.user={id:'u',role:'student'};state.session=fixture",ctx);
values.set('noeon-history:u','[{"legacy":true}]');ctx.nextQuestion();assert.equal(values.get('noeon-history:u'),'[{"legacy":true}]');assert.equal(ctx.location.hash,'results/remote-fixture');
values.clear();vm.runInContext('state.session=fixture',ctx);ctx.nextQuestion();assert(!values.has('noeon-history:u'));
ctx.fixture={...remote,remote:undefined};vm.runInContext('state.session=fixture',ctx);ctx.nextQuestion();assert.equal(JSON.parse(values.get('noeon-history:u')).length,1);
vm.runInContext('account.user=null',ctx);ctx.location.hash='#home';await ctx.renderHome();
assert(!node.innerHTML.includes('#results'));assert(!node.innerHTML.includes('Ваш прогресс'));assert(!node.innerHTML.includes('1424'));assert(!node.innerHTML.includes('1 424'));assert(node.innerHTML.includes('#profile'));
const weak={resume:{id:'<img>',title:'<script>',index:8,total:20},newAssignments:{items:[],total:0},week:{sessions:1,score:2,maxScore:6,pending:0},stats:{maxScore:6,score:2},weakTopics:[{topicId:'present_simple',correct:2,checked:6}],freePracticeAllowed:false};
assert(!ctx.todayStudentMarkup(weak).includes('Тренировать тему'));weak.freePracticeAllowed=true;assert(ctx.todayStudentMarkup(weak).includes('#practice/tenses/present_simple'));assert(!ctx.todayStudentMarkup(weak).includes('<script>'));
const source=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');assert(!source.includes('subtree:true'));assert(source.includes('.observe(app,{childList:true})'));
// A response for a previous user/route cannot overwrite another screen.
let resolve;ctx.accountRequest=()=>new Promise(r=>resolve=r);vm.runInContext("account.user={id:'first',role:'student'}",ctx);const loading=ctx.renderHome();vm.runInContext("account.user={id:'second',role:'student'}",ctx);node.innerHTML='Another account';resolve({role:'student'});await loading;assert.equal(node.innerHTML,'Another account');
const theory=JSON.parse(fs.readFileSync(new URL('../data/theory.json',import.meta.url),'utf8'));
for(const id of vm.runInContext('PRACTICE_TENSES.map(t=>t.id)',ctx)){
 const parts=ctx.todayRuleLink(id).slice(1).split('/'),entry=theory.find(t=>t.id===parts[1]);assert(entry,id);
 if(parts[2]&&['speaking','infinitive'].includes(parts[1])){assert(fs.readFileSync(new URL('../'+entry.file,import.meta.url),'utf8').includes('id="'+parts[2]+'"'),id+': '+parts[2]);continue;}
 if(parts[2]&&parts[1]!=='reported'){const headings=ctx.markdownHeadings(fs.readFileSync(new URL('../'+entry.file,import.meta.url),'utf8'));assert(headings.some(h=>h.id===parts[2]),id+': '+parts[2]);}
}
ctx.accountRequest=async()=>{const error=new Error('Expired');error.status=401;throw error;};vm.runInContext("account.user={id:'expired',role:'student'}",ctx);await ctx.renderHome();assert.equal(vm.runInContext('account.user',ctx),null);assert(node.innerHTML.includes('home-guest'));
console.log('Today client: guest explanation, role actions, escaping, late-owner guard, neutral input sizing and remote history isolation passed.');
