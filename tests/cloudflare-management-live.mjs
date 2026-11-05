// Only the dedicated test deployment and fictional identities may be mutated.
import fs from 'node:fs';import assert from 'node:assert/strict';
import {assignmentSentenceKeys} from '../cloudflare/generated/assignment-keys.mjs';
const origin='https://grammar-noeon-test.grammar-noeon.workers.dev';
const fixtures=JSON.parse(fs.readFileSync(process.env.GRAMMAR_TEST_FIXTURES,'utf8'));
class Client {
 constructor(auth){Object.assign(this,auth);}
 async call(path,data){const r=await fetch(origin+'/api/'+path,{method:data===undefined?'GET':'POST',headers:{Origin:origin,'Content-Type':'application/json',Cookie:this.cookie,'X-CSRF-Token':this.csrf},body:data===undefined?undefined:JSON.stringify(data)});return {status:r.status,data:await r.json()};}
 async ok(path,data){const r=await this.call(path,data);assert.equal(r.status,200,JSON.stringify(r.data));return r.data;}
}
const teacher=new Client(fixtures.teacher),student=new Client(fixtures['anna-fixture']);
for(const client of [teacher,student])assert.match((await client.ok('auth/me')).user.email,/@example\.test$/);
const id=(await student.ok('auth/me')).user.id,path='teacher/students/'+id+'/assignments';
const pool=new Set((await teacher.ok('teacher/students/'+id+'/assignment-pool')).availableIds);
const bank=JSON.parse(fs.readFileSync(new URL('../cloudflare/generated/bank.json',import.meta.url),'utf8'));
const chosen=[],keys=new Set();
for(const item of bank){if(!pool.has(item.id)||!item.blanks?.length)continue;const k=assignmentSentenceKeys(item);if(k.some(v=>keys.has(v)))continue;chosen.push(item);k.forEach(v=>keys.add(v));if(chosen.length===2)break;}
assert.equal(chosen.length,2);
const made=await teacher.ok(path,{title:'Management fixture',ids:chosen.map(i=>i.id)}),endpoint=path+'/'+made.id,practice='practice/'+made.practiceId;
assert.equal((await student.call(endpoint)).status,403);
await teacher.ok(endpoint+'/edit',{version:0,title:'Trimmed fixture',ids:[chosen[0].id]});
assert.equal((await teacher.call(endpoint+'/edit',{version:0,title:'Stale'})).status,409);
const current=await student.ok(practice);assert.equal(current.items.length,1);
const submitted=chosen[0].blanks.map(b=>b.answer);
await student.ok(practice+'/draft',{revision:current.revision,index:0,submitted});
assert.equal((await teacher.call(endpoint+'/edit',{version:1,title:'Blocked',ids:[chosen[1].id]})).status,409);
await teacher.ok(endpoint+'/cancel',{version:1});
assert.equal((await student.call(practice)).status,403);
assert.equal((await student.call(practice+'/check',{revision:2,index:0,submitted})).status,403);
assert.equal((await student.ok('account')).assignments.find(a=>a.id===made.id).status,'cancelled');
assert.ok(!(await teacher.ok('teacher/students/'+id+'/assignment-pool')).availableIds.includes(chosen[1].id));
await teacher.ok(endpoint+'/restore',{version:2});
const restored=await student.ok(practice);assert.deepEqual(restored.draft,submitted);
await student.ok(practice+'/check',{revision:restored.revision,index:0,submitted});
const score=(await student.ok(practice)).score;
const raced=await Promise.all([teacher.call(endpoint+'/edit',{version:3,title:'Final A'}),teacher.call(endpoint+'/edit',{version:3,title:'Final B'})]);
assert.deepEqual(raced.map(r=>r.status).sort(),[200,409]);
assert.equal((await student.ok(practice)).score,score);
console.log('Live isolated management passed: edit, stale conflict, started-content lock, cancel/restore, preserved draft and score, unique reservations and simultaneous edits.');
