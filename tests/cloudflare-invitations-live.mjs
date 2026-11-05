// Dedicated test deployment only. No Firebase registrations or emails are triggered.
import fs from 'node:fs';import assert from 'node:assert/strict';
const origin='https://grammar-noeon-test.grammar-noeon.workers.dev';
const fixture=JSON.parse(fs.readFileSync(process.env.GRAMMAR_TEST_FIXTURES,'utf8'));
async function call(auth,path,data){const r=await fetch(origin+'/api/'+path,{method:data===undefined?'GET':'POST',headers:{Origin:origin,'Content-Type':'application/json',Cookie:auth.cookie||'','X-CSRF-Token':auth.csrf||''},body:data===undefined?undefined:JSON.stringify(data)});return {status:r.status,data:await r.json()};}
for(const auth of [fixture.teacher,fixture['anna-fixture']]){const me=await call(auth,'auth/me');assert.equal(me.status,200);assert.match(me.data.user.email,/@example\.test$/);}
const pupil=(await call(fixture['anna-fixture'],'auth/me')).data.user;
assert.equal((await call(fixture['anna-fixture'],'teacher/invite',{})).status,403);
const first=await call(fixture.teacher,'teacher/invite',{}),second=await call(fixture.teacher,'teacher/invite',{});
assert.equal(first.status,200);assert.equal(second.status,200);assert.notEqual(first.data.token,second.data.token);assert.equal(first.data.email,'');
for(const invitation of [first,second]){
 const payload={token:invitation.data.token,name:'Fictional pupil'};
 assert.equal((await call({},'auth/join',payload)).status,400);
 assert.equal((await call({},'auth/join',{...payload,email:'invalid'})).status,400);
 // Existing local account is rejected before contacting Firebase.
 assert.equal((await call({},'auth/join',{...payload,email:pupil.email})).status,409);
}
assert.equal((await call({},'auth/join',{token:'invalid-invite',name:'Fictional pupil',email:pupil.email})).status,410);
console.log('Live invitation checks passed: teacher creates independent links without pupil data, pupil supplies email, invalid and registered emails rejected, student cannot issue invitations. No emails sent.');
