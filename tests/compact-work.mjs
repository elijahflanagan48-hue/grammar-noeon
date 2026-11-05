import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const appNode={innerHTML:'',querySelectorAll(){return []}};
const ctx={document:{querySelector(){return appNode}},localStorage:{getItem(){return null}},module:{exports:{}},location:{hash:'#profile'}};
vm.createContext(ctx);
for(const file of ['app.js','accounts.js','practice-report.js'])vm.runInContext(fs.readFileSync(new URL('../'+file,import.meta.url),'utf8').replace(/initialise\(\);/,''),ctx);
vm.runInContext("account.user={id:'student',role:'student'}",ctx);
const history=[{id:'done',date:'2026-10-29T00:00:00Z',status:'completed',index:2,total:2,score:1,maxScore:2,answers:[{item:{prompt:'SECRET EXERCISE',answer:'SECRET KEY',explanation_ru:'SECRET REASON'}}]},
 {id:'draft',date:'2026-10-29T00:00:00Z',status:'draft',index:1,total:2,score:1,maxScore:1,answers:[]}];
const assignments=[{id:'assigned',practiceId:'done',title:'<script>Title</script>',status:'completed',index:2,total:2,score:1,maxScore:2,created:history[0].date}];
for(const owner of [true,false]){
 const html=ctx.accountHistory(history,owner,'teacher/students/pupil',assignments);
 for(const secret of ['SECRET EXERCISE','SECRET KEY','SECRET REASON','<script>','<details','data-resume','data-assignment-manage'])assert.ok(!html.includes(secret),secret);
 assert.equal((html.match(/class="work-card"/g)||[]).length,2);
 assert.ok(html.includes(owner?'#work/done':'#student-work/pupil/done'));
 assert.ok(html.includes('&lt;script&gt;Title'));
}
const assigned=ctx.assignmentList(assignments,true);
assert.ok(assigned.includes('#work/done'));assert.ok(!assigned.includes('<button'));
const teacherAssigned=ctx.assignmentList(assignments,false,'pupil');assert.ok(teacherAssigned.includes('#student-work/pupil/done'));
const page={history,assignments,nextCursor:'next"cursor'};
const html=ctx.accountHistoryPages(page,true,'account',true);
assert.ok(!html.includes('#work/done'),'no duplicate assigned task in independent history');
assert.ok(html.includes('#work/draft'));assert.ok(html.includes('next&quot;cursor'));assert.ok(!html.includes('SECRET'));
assert.equal(ctx.separateHistorySection({history:[history[0]],assignments}),'' ,'no empty duplicate history section');
assert.ok(ctx.reportMarkup({date:history[0].date,total:2,status:'draft',answers:[]}).includes('Работа в процессе'));
let resolve;ctx.accountRequest=()=>new Promise(r=>resolve=r);ctx.setNav=()=>{};
ctx.location.hash='#work/done';const pending=ctx.renderWorkDetails('done');
vm.runInContext("account.user={id:'other',role:'student'}",ctx);
resolve({title:'Private detail',attempt:history[0]});await pending;
assert.ok(!appNode.innerHTML.includes('Private detail'));
console.log('Compact tasks: teacher/student cards, no inline exercises/keys/explanations, no duplicate links/history, safe titles/cursors, collapsed report and stale-owner guard passed.');
