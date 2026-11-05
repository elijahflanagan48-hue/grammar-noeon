import {createHash} from 'node:crypto';
import {sqlStatements} from '../scripts/sql-statements.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { grade } from '../cloudflare/generated/checker.mjs';
import { assignmentSentenceKeys } from '../cloudflare/generated/assignment-keys.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const require=createRequire(path.join(process.env.GRAMMAR_TOOLING_DIR||root,'package.json'));
const {Miniflare,convertV4MiniflareOptions}=await import(pathToFileURL(require.resolve('miniflare')));
const fixtures=JSON.parse(fs.readFileSync(path.join(root,'cloudflare/generated/bank.json'),'utf8'));
let count=0;
for(const item of fixtures){
  if(item.grading_mode==='teacher'){const r=grade(item,item.blanks.map(b=>b.answer));assert(r.fields.every(f=>!f.verified&&!f.correct));continue;}
  if(item.options){for(let n=0;n<item.options.length;n++)assert.equal(grade(item,n).correct,(item.accepted_option_indices||[item.correct_option_index]).includes(n));}
  else if(item.blanks){
    const values=item.blanks.map(field=>field.answer);
    for(const [index,field] of item.blanks.entries())for(const answer of [field.answer,...(field.accepted_answers||[])]){
      const submitted=values.slice();submitted[index]=answer;assert.equal(grade(item,submitted).correct,true,item.id);count++;
    }
  }else for(const answer of [item.answer,...(item.accepted_answers||[])]){assert.equal(grade(item,answer).correct,true,item.id);count++;}
}
const known=fixtures.find(item=>item.id==='src-u02-020');
for(const value of ['had already translated','already translated'])assert.equal(grade(known,[value]).correct,true);
for(const value of ['had translate','has translated','had not translated'])assert.equal(grade(known,[value]).correct,false);
console.log('Worker grader:',fixtures.length,'items;',count,'accepted variants and negative regressions passed.');

const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'grammar-worker-test-'));
const bundled=path.join(temporary,'worker.mjs');
await require('esbuild').build({entryPoints:[path.join(root,'cloudflare/worker.mjs')],outfile:bundled,bundle:true,format:'esm',platform:'neutral',external:['node:crypto']});
const identities=new Map(); let identityCounter=0;
async function fakeFirebase(request){
  const url=new URL(request.url);
  assert.equal(url.origin,'https://identitytoolkit.googleapis.com','No unexpected outbound network calls');
  const action=url.pathname.split(':').at(-1), data=await request.json();
  const fail=message=>Response.json({error:{message}},{status:400});
  if(action==='sendOobCode')return Response.json({email:data.email||'fixture@example.test'});
  if(action==='lookup'){
    const identity=[...identities.values()].find(value=>value.token===data.idToken);
    return identity?Response.json({users:[{localId:identity.id,email:identity.email,emailVerified:identity.verified,disabled:!!identity.disabled}]}):fail('INVALID_ID_TOKEN');
  }
  let identity=identities.get(data.email);
  if(action==='signUp'){
    if(identity)return fail('EMAIL_EXISTS');
    identity={id:'firebase-fixture-'+(++identityCounter),email:data.email,password:data.password,token:'fictional-token-'+identityCounter,verified:!data.email.startsWith('unverified')};
    identities.set(data.email,identity);
  }else if(action==='signInWithPassword'){
    if(!identity||identity.password!==data.password)return fail('INVALID_LOGIN_CREDENTIALS');
    if(identity.disabled)return fail('USER_DISABLED');
  }else return fail('UNKNOWN_METHOD');
  return Response.json({localId:identity.id,email:identity.email,idToken:identity.token,expiresIn:'3600'});
}
async function assets(request) {
  const filename=new URL(request.url).pathname==='/'?'index.html':decodeURIComponent(new URL(request.url).pathname).slice(1);
  const target=path.resolve(root,'cloudflare/public',filename);
  if(!target.startsWith(path.resolve(root,'cloudflare/public')+path.sep))return new Response('',{status:404});
  try {return new Response(fs.readFileSync(target),{headers:{'Content-Type':target.endsWith('.js')?'text/javascript':target.endsWith('.html')?'text/html':target.endsWith('.css')?'text/css':target.endsWith('.json')?'application/json':'text/plain','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; object-src 'none'"}});}catch{return new Response('',{status:404});}
}
const options={name:"grammar-test",modules:true,script:fs.readFileSync(bundled,"utf8"),compatibilityDate:'2026-10-26',
  bindings:{PUBLIC_ORIGIN:'https://grammar.test',OWNER_SETUP_CODE:'fictional-owner-code',FIREBASE_API_KEY:'fictional-public-api-key'},
  serviceBindings:{ASSETS:assets},d1Databases:{DB:'grammar-isolated-tests'},d1Persist:false,outboundService:fakeFirebase};
const runtime=new Miniflare(convertV4MiniflareOptions?convertV4MiniflareOptions(options):options);
class Client{
  cookie='';csrf='';
  async call(route,data,settings={}){
    const response=await runtime.dispatchFetch('https://grammar.test/api/'+route,{
      method:data===undefined?'GET':'POST',headers:{'Content-Type':'application/json','Origin':settings.origin||'https://grammar.test',Cookie:this.cookie,
        'CF-Connecting-IP':settings.ip||'192.0.2.1','X-CSRF-Token':settings.badCsrf?'bad':this.csrf},body:data===undefined?undefined:JSON.stringify(data)});
    const json=await response.json();
    if(response.headers.get('Set-Cookie'))this.cookie=response.headers.get('Set-Cookie').split(';')[0];
    if(json.csrf)this.csrf=json.csrf;
    return {status:response.status,data:json,headers:response.headers};
  }
  async ok(route,data,settings){const result=await this.call(route,data,settings);assert.equal(result.status,200,JSON.stringify(result));return result.data;}
}


const tests=JSON.parse(fs.readFileSync(path.join(root,'content/assessments/comparison.json')));
const lock=JSON.parse(fs.readFileSync(path.join(root,'content/assessments/comparison.lock.json')));
assert.equal(createHash('sha256').update(fs.readFileSync(path.join(root,'content/assessments/comparison.json'))).digest('hex'),lock.sha256);
const norm=s=>s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim(),practiceTexts=new Set(fixtures.flatMap(i=>[norm(i.prompt),norm(i.answer_text||'')])),seen=new Set();
for(const test of tests){
 assert.deepEqual(Object.fromEntries(['basic','medium','advanced'].map(k=>[k,test.items.filter(i=>i.level===k).length])),{basic:8,medium:12,advanced:5});
 for(const i of test.items){assert(!seen.has(norm(i.prompt)));seen.add(norm(i.prompt));assert(!practiceTexts.has(norm(i.prompt)));if(i.answer_text)assert(!practiceTexts.has(norm(i.answer_text)));if(i.blanks){assert.equal(i.blanks.length,1);assert(!i.blanks[0].base_adjective.includes('/'));assert(!/Use |Gap \d+:/.test(i.prompt));}}
}

try {
 const db=await runtime.getD1Database('DB');await db.batch(sqlStatements(fs.readFileSync(path.join(root,'cloudflare/schema.sql'),'utf8')).map(s=>db.prepare(s)));
 const teacher=new Client(),student=new Client(),other=new Client(),guest=new Client();
 await teacher.ok('auth/setup',{code:'fictional-owner-code',name:'Fixture teacher',email:'teacher@example.test',password:'FictionalPassword!2026'});
 for(const [client,name]of [[student,'anna'],[other,'other']]){const invite=await teacher.ok('teacher/invite',{});await client.ok('auth/join',{token:invite.token,name,email:name+'@example.test',password:'FictionalPassword!2026'});}
 const sid=(await student.ok('auth/me')).user.id;
 assert.equal((await teacher.ok('tests')).tests.length,15);assert.equal((await guest.call('tests')).status,401);assert.equal((await student.call('tests')).status,403);assert.equal((await student.call('tests/comparison-1/start',{})).status,403);
 for(const test of tests){
  assert.equal(test.items.length,25);for(const group of ['cmp_forms','cmp_superlatives','cmp_equality','cmp_development','cmp_precision'])assert.equal(test.items.filter(i=>i.practice_tenses.includes(group)).length,5);assert.equal(test.items.filter(i=>i.options).length,10);assert.equal(test.items.filter(i=>i.blanks).length,15);
  for(const item of test.items){const correct=item.options?item.correct_option_index:item.blanks.map(b=>b.answer);assert(grade(item,correct).correct);if(item.options)for(let n=0;n<4;n++)assert.equal(grade(item,n).correct,n===item.correct_option_index);}
  const preview=await teacher.ok('tests/'+test.id);assert.deepEqual(preview,test);
 }
 const created=await teacher.ok('tests/comparison-1/assign',{studentId:sid}),id=created.id;
 let saved=await student.ok('test-attempts/'+id);assert.equal(saved.items.length,25);assert(!saved.completed);assert(!('attempt'in saved));
 for(const item of saved.items){for(const key of ['answer','correct_option_index','explanation_ru','answer_text'])assert(!(key in item));for(const b of item.blanks||[])assert(!('answer'in b)&&!('accepted_answers'in b));}
 assert.equal((await other.call('test-attempts/'+id)).status,404);assert.equal((await other.call('test-attempts/'+id+'/submit',{revision:0,responses:[]})).status,404);
 assert.equal((await student.call('practice/'+id+'/check',{index:0,revision:0,submitted:['heavier']})).status,409,'No per-question grading bypass');
 assert.equal((await student.call('test-attempts/'+id+'/draft',{revision:0,responses:[]},{badCsrf:true})).status,403);
 const empty=tests[0].items.map(i=>i.options?null:['']);
 assert.equal((await student.call('test-attempts/'+id+'/submit',{revision:0,responses:empty})).status,409);assert.equal((await student.ok('test-attempts/'+id)).revision,0);
 const draft=await student.ok('test-attempts/'+id+'/draft',{revision:0,responses:empty});assert.equal(draft.revision,1);saved=await student.ok('test-attempts/'+id);assert.deepEqual(saved.draft,empty);assert(!('attempt'in saved));
 assert.equal((await student.call('test-attempts/'+id+'/submit',{revision:0,responses:empty})).status,409);
 const assignmentRow=await db.prepare('SELECT id FROM assignments WHERE practice_id=?').bind(id).first();assert.equal((await teacher.call('teacher/students/'+sid+'/assignments/'+assignmentRow.id+'/edit',{version:0,title:'Changed',ids:[tests[0].items[1].id]})).status,409);
 const answers=tests[0].items.map(i=>i.options?i.correct_option_index:i.blanks.map(b=>b.answer));
 const result=await student.ok('test-attempts/'+id+'/submit',{revision:1,responses:answers,score:0});assert(result.completed);assert.equal(result.attempt.score,25);assert.equal(result.attempt.maxScore,25);assert.equal(result.attempt.answers.length,25);
 const replay=await student.ok('test-attempts/'+id+'/submit',{revision:1,responses:answers});assert.equal(replay.attempt.score,25);
 const wrong=answers.slice();wrong[0]=['wrong'];assert.equal((await student.call('test-attempts/'+id+'/submit',{revision:2,responses:wrong})).status,409);
 const report=await teacher.ok('test-attempts/'+id);assert.equal(report.attempt.score,25);
 const second=await teacher.ok('tests/comparison-1/assign',{studentId:sid}),secondView=await student.ok('test-attempts/'+second.id);assert.deepEqual(secondView.items,(await teacher.ok('test-attempts/'+(await teacher.ok('tests/comparison-1/start',{})).id)).items,'Identical fixed ordering for all attempts');
 const assignment=await db.prepare('SELECT id FROM assignments WHERE practice_id=?').bind(second.id).first();await db.prepare('INSERT INTO assignment_controls VALUES(?,1,0)').bind(assignment.id).run();assert.equal((await student.call('test-attempts/'+second.id)).status,403);assert.equal((await student.call('test-attempts/'+second.id+'/draft',{revision:0,responses:empty})).status,403);
 const skipped=await teacher.ok('tests/comparison-2/start',{}),empty2=tests[1].items.map(i=>i.options?null:['   ']);
 assert.equal((await teacher.call('test-attempts/'+skipped.id+'/submit',{revision:0,responses:empty2})).status,409);
 const skippedResult=await teacher.ok('test-attempts/'+skipped.id+'/submit',{revision:0,responses:empty2,allowIncomplete:true});assert.equal(skippedResult.attempt.score,0);assert.equal(skippedResult.attempt.maxScore,25);assert(skippedResult.attempt.answers.every(a=>a.skipped&&a.fields[0].verified));
 const partial=await teacher.ok('tests/comparison-1/start',{}),mixed=tests[0].items.map((i,n)=>n===0?['heavier']:i.options?null:['']);const partialResult=await teacher.ok('test-attempts/'+partial.id+'/submit',{revision:0,responses:mixed,allowIncomplete:true});assert.equal(partialResult.attempt.score,1);assert.equal(partialResult.attempt.maxScore,25);
 const own=await teacher.ok('tests/comparison-3/start',{});assert((await teacher.ok('account')).history.find(h=>h.id===own.id).title.includes('Тест 3'));
 assert(!fs.existsSync(path.join(root,'cloudflare/public/content/assessments/comparison.json')));
 assert.equal(fixtures.filter(i=>i.id.startsWith('assess-')).length,0);
 const tenseTests=JSON.parse(fs.readFileSync(path.join(root,'content/assessments/tenses.json')));
 const tenseLock=JSON.parse(fs.readFileSync(path.join(root,'content/assessments/tenses.lock.json')));
 assert.equal(createHash('sha256').update(fs.readFileSync(path.join(root,'content/assessments/tenses.json'))).digest('hex'),tenseLock.sha256);
 assert.equal(tenseTests.length,5);
 for(const test of tenseTests){
  assert.equal(test.items.length,25);assert.equal(test.items.filter(i=>i.blanks).length,20);assert.equal(test.items.filter(i=>i.options).length,5);
  assert.equal(new Set(test.items.flatMap(i=>i.practice_tenses)).size,12);
  assert.deepEqual(await teacher.ok('tests/'+test.id),test);
  assert.equal((await student.call('tests/'+test.id)).status,403);
  for(const item of test.items){
   assert(!practiceTexts.has(norm(item.prompt)));if(item.answer_text)assert(!practiceTexts.has(norm(item.answer_text)));
   for(const submitted of item.options?item.options.map((_,n)=>n):item.blanks[0].accepted_answers.map(a=>[a]))assert.equal(grade(item,submitted).correct,item.options?submitted===item.correct_option_index:true,item.id);
  }
  const made=await teacher.ok('tests/'+test.id+'/assign',{studentId:sid});
  const hidden=await student.ok('test-attempts/'+made.id);assert.match(hidden.title,/Tenses/);assert.equal(hidden.items.length,25);
  assert(!JSON.stringify(hidden).includes('accepted_answers'));assert(!('attempt'in hidden));
  const responses=test.items.map(i=>i.options?i.correct_option_index:[i.blanks[0].answer]);
  const drafted=await student.ok('test-attempts/'+made.id+'/draft',{revision:0,responses});
  assert.deepEqual((await student.ok('test-attempts/'+made.id)).draft,responses);
  const finished=await student.ok('test-attempts/'+made.id+'/submit',{revision:drafted.revision,responses});
  assert.equal(finished.attempt.score,25);assert.equal(finished.attempt.maxScore,25);
  assert.deepEqual((await teacher.ok('test-attempts/'+made.id)).attempt.answers,finished.attempt.answers);
 }
 assert(!fs.existsSync(path.join(root,'cloudflare/public/content/assessments/tenses.json')));
 const passiveTests=JSON.parse(fs.readFileSync(path.join(root,'content/assessments/passive.json')));
 for(const test of passiveTests){
  assert.deepEqual(await teacher.ok('tests/'+test.id),test);
  assert.equal((await student.call('tests/'+test.id)).status,403);
  assert.equal((await student.call('tests/'+test.id+'/start',{})).status,403);
  const made=await teacher.ok('tests/'+test.id+'/assign',{studentId:sid});
  const hidden=await student.ok('test-attempts/'+made.id);assert.match(hidden.title,/Passive Voice/);assert.equal(hidden.items.length,25);
  for(const key of ['accepted_answers','correct_option_index','answer_text','explanation_ru'])assert(!JSON.stringify(hidden).includes('"'+key+'"'),key+': no keys before submission');
  assert.equal((await other.call('test-attempts/'+made.id)).status,404);
  assert.equal((await student.call('practice/'+made.id+'/check',{index:0,revision:0,submitted:['answer']})).status,409);
  const values=test.items.map(i=>i.options?i.correct_option_index:[i.blanks[0].accepted_answers.at(-1)]);
  const draft=await student.ok('test-attempts/'+made.id+'/draft',{revision:0,responses:values});assert.deepEqual((await student.ok('test-attempts/'+made.id)).draft,values);
  const finished=await student.ok('test-attempts/'+made.id+'/submit',{revision:draft.revision,responses:values,score:-999});
  assert.equal(finished.attempt.score,25);assert.equal(finished.attempt.maxScore,25);assert.equal(finished.attempt.pending,0);
  assert.deepEqual((await teacher.ok('test-attempts/'+made.id)).attempt.answers,finished.attempt.answers);
  const report=await teacher.ok('teacher/students/'+sid+'/reports/'+made.id);assert.equal(report.attempt.score,25);assert.match(report.title,/Passive Voice/);
 }
 assert(!fs.existsSync(path.join(root,'cloudflare/public/content/assessments/passive.json')));
 console.log('Fixed tests: three sections, 15 sealed forms / 375 questions, all keys and distractors, private assignments, draft persistence, deferred 25-point results and previous guards passed.');
} finally {await runtime.dispose();fs.rmSync(temporary,{recursive:true,force:true});}
