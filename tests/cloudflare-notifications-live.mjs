import {manifest as bankManifest, assertBankVersion} from '../scripts/bank-versions.mjs';
// All writes are confined to the dedicated TEST Worker and fictional identities.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {assignmentSentenceKeys} from '../cloudflare/generated/assignment-keys.mjs';
const origin='https://grammar-noeon-test.grammar-noeon.workers.dev';
const fixtures=JSON.parse(fs.readFileSync(process.env.GRAMMAR_TEST_FIXTURES,'utf8'));
class Client {
 constructor(auth={}){Object.assign(this,auth);}
 async call(path,data){
  const response=await fetch(origin+'/api/'+path,{method:data===undefined?'GET':'POST',headers:{Origin:origin,'Content-Type':'application/json',Cookie:this.cookie||'','X-CSRF-Token':this.csrf||''},body:data===undefined?undefined:JSON.stringify(data)});
  return {status:response.status,data:await response.json()};
 }
 async ok(path,data){const r=await this.call(path,data);assert.equal(r.status,200,path+': '+(r.data.error||''));return r.data;}
}
const teacher=new Client(fixtures.teacher),student=new Client(fixtures['anna-fixture']),other=new Client(fixtures['misha-fixture']),guest=new Client();
for(const client of [teacher,student,other])assert.match((await client.ok('auth/me')).user.email,/@example\.test$/);
assert.equal((await guest.call('notifications')).status,401);
const studentId=(await student.ok('auth/me')).user.id;
const base='teacher/students/'+studentId;
const prior=(await student.ok('account')).history;
await teacher.ok('notifications/read',{all:true});
await student.ok('notifications/read',{all:true});
const pool=new Set((await teacher.ok(base+'/assignment-pool')).availableIds);
const bank=JSON.parse(fs.readFileSync(new URL('../cloudflare/generated/bank.json',import.meta.url),'utf8'));
const selected=[],keys=new Set();
for(const predicate of [i=>i.id.startsWith('cmp-')&&i.type==='open_brackets',i=>!i.id.startsWith('cmp-')&&i.type==='context_cloze',i=>!i.id.startsWith('cmp-')&&i.type==='multiple_choice']){
 const item=bank.find(i=>pool.has(i.id)&&predicate(i)&&assignmentSentenceKeys(i).every(key=>!keys.has(key)));
 assert.ok(item,'Available unique fictional exercise');selected.push(item);assignmentSentenceKeys(item).forEach(key=>keys.add(key));
}
assertBankVersion(selected[0]);
assertBankVersion(selected[1]);
const made=await teacher.ok(base+'/assignments',{title:'Уведомления: проверка сетевого выпуска',ids:selected.map(i=>i.id)});
const assignedId='assigned:'+made.id,completedId='completed:'+made.id,report=base+'/reports/'+made.practiceId;
const notices=await student.ok('notifications');
assert.equal(notices.unreadCount,1);
assert.equal(notices.items.find(n=>n.id===assignedId).total,3);
assert.ok(!JSON.stringify(notices).includes('accepted_answers'));
assert.ok(!(await other.ok('notifications')).items.some(n=>n.id===assignedId));
assert.equal((await other.call('notifications/read',{id:assignedId})).status,404);
assert.equal((await teacher.call(report)).status,404,'No report before completion');
await student.ok('notifications/read',{id:assignedId});
await student.ok('notifications/read',{id:assignedId});
assert.equal((await student.ok('notifications')).unreadCount,0);
let revision=0,last;
for(const [index,item] of selected.entries()){
 const submitted=index===2?(item.correct_option_index+1)%item.options.length:item.options?item.correct_option_index:item.blanks.map(b=>b.answer);
 last={index,revision,submitted,score:999,correct:true};
 const result=await student.ok('practice/'+made.practiceId+'/check',last);
 assert.equal(result.answer.correct,index<2);
 assert.equal(result.answer.fields[0].verified,true);
 revision=result.revision;
 if(index<2)assert.equal((await teacher.ok('notifications')).unreadCount,0);
}
await student.ok('practice/'+made.practiceId+'/check',last);
const completed=await teacher.ok('notifications');
assert.equal(completed.unreadCount,1);
assert.equal(completed.items.filter(n=>n.id===completedId).length,1);
const notice=completed.items.find(n=>n.id===completedId);
assert.equal(notice.pending,0);
assert.equal(notice.score,notice.maxScore-1);
assert.ok(notice.score<999);
assert.equal((await student.call(report)).status,403);
const detail=await teacher.ok(report);
assert.equal(detail.attempt.pending,0);
assert.equal(detail.attempt.answers.length,3);
assert.equal(detail.attempt.answers[2].fields[0].verified,true);
assert.deepEqual((await student.ok('reports/'+made.practiceId)).attempt.answers,detail.attempt.answers);
const ownWork=await student.ok('attempts/'+made.practiceId);
assert.equal(ownWork.canResume,false);assert.deepEqual(ownWork.attempt.answers,detail.attempt.answers);assert.equal(ownWork.attempt.items,undefined);
const teacherWork=await teacher.ok(base+'/attempts/'+made.practiceId);
assert.deepEqual(teacherWork.attempt.answers,detail.attempt.answers);
assert.equal((await other.call('attempts/'+made.practiceId)).status,404);
await teacher.ok('notifications/read',{id:completedId});
assert.equal((await teacher.ok('notifications')).unreadCount,0);
const after=(await student.ok('account')).history;
for(const old of prior){const current=after.find(row=>row.id===old.id);if(current)assert.deepEqual(current.answers,old.answers,'Saved old answers remain unchanged');}
for(const name of ['notifications.js','practice-report.js','app.js','index.html']){
 const response=await fetch(origin+'/'+name,{cache:'no-store'});assert.equal(response.status,200);
 assert.equal(await response.text(),fs.readFileSync(new URL('../'+name,import.meta.url),'utf8'),name+': deployed asset');
}
console.log('Live notification release passed: fictional assignment, isolated recipients, read receipts, one completion event, private teacher/student reports, all fields automatically graded, preserved history, current content and matching assets.');
