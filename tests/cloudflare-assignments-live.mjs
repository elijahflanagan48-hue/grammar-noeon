// Mutates the dedicated TEST Worker only, using short-lived fictional sessions.
import assert from 'node:assert/strict';
import fs from 'node:fs';
const origin='https://grammar-noeon-test.grammar-noeon.workers.dev';
const fixtures=JSON.parse(fs.readFileSync(process.env.GRAMMAR_TEST_FIXTURES,'utf8'));
class Client {
  constructor(auth={}){Object.assign(this,auth)}
  async call(path,data){
    const response=await fetch(origin+'/api/'+path,{method:data===undefined?'GET':'POST',headers:{Origin:origin,'Content-Type':'application/json',Cookie:this.cookie||'','X-CSRF-Token':this.csrf||''},body:data===undefined?undefined:JSON.stringify(data)});
    return {status:response.status,data:await response.json()};
  }
  async ok(path,data){const r=await this.call(path,data);assert.equal(r.status,200,JSON.stringify(r));return r.data}
}
const teacher=new Client(fixtures.teacher),student=new Client(fixtures['anna-fixture']),other=new Client(fixtures['misha-fixture']);
for(const client of [teacher,student,other])assert.match((await client.ok('auth/me')).user.email,/@example\.test$/,'Only test identities may be used');
const id=(await student.ok('auth/me')).user.id;
const path='teacher/students/'+id+'/assignments';
assert.equal((await student.call('practice/start',{ids:['src-u02-020']})).status,403);
for(const [client,status] of [[new Client(),401],[student,403],[teacher,200]]){
 const response=await fetch(origin+'/data/exercises/part-01.json',{headers:{Cookie:client.cookie||''},cache:'no-store'});
 assert.equal(response.status,status);
 if(status===200){assert.match(response.headers.get('Cache-Control'),/private, no-store/);assert.ok((await response.json()).length>0);}
}
for(const route of ['/%64ata/exercises/part-01.json','/data/exercises/%70art-01.json','/data/exercises//part-01.json','//data/exercises/part-01.json']){
 const response=await fetch(origin+route);assert.ok([401,404].includes(response.status),route);
}
const previous=await student.ok('account');
const assignedIDs=new Set(previous.assignments.map(row=>row.practiceId));
const legacy=previous.history.find(row=>!assignedIDs.has(row.id));
if(legacy){
 for(const [suffix,data] of [['',undefined],['/draft',{index:0,revision:0,submitted:['had translated']}],['/check',{index:0,revision:0,submitted:['had translated']}]])assert.equal((await student.call('practice/'+legacy.id+suffix,data)).status,403);
}
const ownTeacher=await teacher.ok('practice/start',{ids:['src-u02-020']});
assert.ok((await teacher.ok('practice/'+ownTeacher.id)).items[0].answer_text);

const eligible=new Set((await teacher.ok('teacher/students/'+id+'/assignment-pool')).availableIds);
const bank=JSON.parse(fs.readFileSync(new URL('../cloudflare/generated/bank.json',import.meta.url),'utf8'));
const item=bank.find(row=>eligible.has(row.id)&&row.blanks?.length===1);
assert.ok(item);const expected=[item.blanks[0].answer];
const payload={title:'Проверка сетевого назначения · вымышленные данные',ids:[item.id]};
assert.equal((await other.call(path,payload)).status,403);
const assigned=await teacher.ok(path,payload), practice='practice/'+assigned.practiceId;
assert.equal((await other.call(practice)).status,404);
let own=(await student.ok('account')).assignments.find(row=>row.id===assigned.id);
assert.equal(own.status,'assigned');assert.equal(own.total,1);assert.equal(own.index,0);
assert.ok(!(await other.ok('account')).assignments.some(row=>row.id===assigned.id));
const first=await student.ok(practice);assert.equal(first.items[0].id,payload.ids[0]);assert.equal(first.items[0].answer_text,undefined);assert.equal(first.items[0].blanks[0].answer,undefined);
await student.ok(practice+'/draft',{index:0,revision:0,submitted:expected});
assert.deepEqual((await student.ok(practice)).draft,expected);
assert.equal((await teacher.ok('teacher/students/'+id)).assignments.find(row=>row.id===assigned.id).status,'started');
await student.ok(practice+'/check',{index:0,revision:1,submitted:expected,score:999});
const done=(await teacher.ok('teacher/students/'+id)).assignments.find(row=>row.id===assigned.id);
assert.equal(done.status,'completed');assert.equal(done.score,1);assert.equal(done.maxScore,1);
assert.equal((await student.ok(practice)).index,1);
console.log('Live isolated assignment checks passed: creation, roles, ownership, draft/resume, server grading and teacher completion.');

assert.equal((await teacher.call(path,payload)).status,409,'Repeat assignment must fail');
assert.ok(!(await teacher.ok('teacher/students/'+id+'/assignment-pool')).availableIds.includes(item.id));
assert.equal((await student.call('teacher/students/'+id+'/assignment-pool')).status,403);
const raceID=(await teacher.ok('teacher/students/'+id+'/assignment-pool')).availableIds[0];
const before=(await student.ok('account')).assignments.length;
const raced=await Promise.all([teacher.call(path,{title:'Race A',ids:[raceID]}),teacher.call(path,{title:'Race B',ids:[raceID]})]);
assert.deepEqual(raced.map(row=>row.status).sort(),[200,409]);
assert.equal((await student.ok('account')).assignments.length,before+1);
console.log('Live uniqueness checks passed: previous assignments excluded, duplicate rejected and simultaneous requests allocate once.');
