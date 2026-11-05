import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const appNode={innerHTML:'',querySelectorAll(){return []}};
const ctx={document:{querySelector(){return appNode}},localStorage:{getItem(){return null}},module:{exports:{}}};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(new URL('../app.js',import.meta.url),'utf8').replace(/initialise\(\);/,''),ctx);
vm.runInContext(fs.readFileSync(new URL('../practice-report.js',import.meta.url),'utf8'),ctx);
vm.runInContext("account.user={id:'student',role:'student'}",ctx);
const bank=JSON.parse(fs.readFileSync(new URL('../data/exercises/part-13.json',import.meta.url),'utf8'));
const item=bank[0];
const attempt={date:'2026-10-28T12:00:00Z',total:3,answers:[
 {item,fields:[{submitted:'taller',correct:true,verified:true}]},
 {item,fields:[{submitted:'<img src=x onerror=alert(1)>',correct:false,verified:true}]},
 {item,fields:[{submitted:'Legacy answer',correct:false,verified:false}]},
]};
const s=ctx.reportSummary(attempt);
assert.equal(s.percent,50);assert.equal(s.checked,2);assert.equal(s.pending,1);assert.equal(s.wrong,1);
const markup=ctx.reportMarkup(attempt,'<script>alert(1)</script>','<svg/onload=alert(1)>');
assert.ok(markup.includes('&lt;script&gt;'));assert.ok(!markup.includes('<script>'));assert.ok(!markup.includes('<img src=x'));
assert.ok(markup.includes('data-report-filter="mistakes"'));assert.ok(markup.includes('Почему так?'));
assert.ok(markup.includes('<details class="report-review">'),'exercise list collapsed by default');
assert.ok(!/<details class="report-answer"[^>]*\sopen(?:\s|>)/.test(markup),'no answers auto-expanded');
assert.ok(markup.includes('Моя практика'));assert.ok(!markup.includes('Новая тренировка →'));
assert.equal(ctx.reportSummary({...attempt,answers:[]}).percent,null);
assert.ok(ctx.reportMarkup({...attempt,answers:[]}).includes('Сохранённая работа'));
let resolve;ctx.location={hash:'#results/one'};ctx.setNav=()=>{};
ctx.accountRequest=()=>new Promise(r=>resolve=r);
const loading=ctx.renderOwnReport('one');vm.runInContext("account.user={id:'other',role:'student'}",ctx);
resolve({attempt,title:'Secret title'});await loading;
assert.ok(!appNode.innerHTML.includes('Secret title'),'ignore late response after account change');
console.log('Reports: trusted stored fields, topic aggregates, mistakes filter, legacy neutrality, zero denominator, escaping, role-aware actions and late-owner guard passed.');
// Manual translations: learners see pending state; only the teacher gets review
// controls and the model. Comments and submitted answers must stay escaped.
const manual={id:'manual-work',status:'completed',revision:1,date:'2026-11-03T12:00:00Z',total:1,answers:[{item:{id:'manual-card',type:'translation_ru_en',grading_mode:'teacher',prompt:'Письмо отправили.',practice_tenses:['pv_past_simple'],answer_text:'The letter was sent.',blanks:[{answer:'The letter was sent.'}]},fields:[{submitted:'<img src=x onerror=alert(1)>',correct:false,verified:false}]}]};
vm.runInContext("account.user={id:'student',role:'student'}",ctx);
const learner=ctx.reportMarkup(manual);
assert(!learner.includes('The letter was sent.'));assert(!learner.includes('data-review-decision'));assert(!learner.includes('<img'));assert(learner.includes('Ожидает проверки преподавателем.'));
vm.runInContext("account.user={id:'teacher',role:'teacher'}",ctx);
const teacher=ctx.reportMarkup(manual,'Перевод','Anna',false,'student');assert(teacher.includes('data-review-decision="correct"'));assert(teacher.includes('data-review-decision="incorrect"'));assert(teacher.includes('The letter was sent.'));assert(!teacher.includes('<img'));
manual.answers[0].fields[0]={submitted:'The letter was sent.',correct:true,verified:true,manual_review:{note:'<img src=x onerror=alert(1)>'}};
vm.runInContext("account.user={id:'student',role:'student'}",ctx);
const reviewed=ctx.reportMarkup(manual);assert(reviewed.includes('The letter was sent.'));assert(!reviewed.includes('<img'));assert(reviewed.includes('&lt;img'));
console.log('Manual report: pending model protection, teacher-only controls, safe notes and reviewed feedback passed.');
