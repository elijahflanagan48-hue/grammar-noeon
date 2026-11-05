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
const options={name:"grammar-test",modules:true,script:fs.readFileSync(bundled,"utf8"),compatibilityDate:'2026-10-26',
  bindings:{PUBLIC_ORIGIN:'https://grammar.test',OWNER_SETUP_CODE:'fictional-owner-code',FIREBASE_API_KEY:'fictional-public-api-key'},
  d1Databases:{DB:'grammar-isolated-tests'},d1Persist:false,outboundService:fakeFirebase};
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
try{
  const db=await runtime.getD1Database('DB');
  function legacyCopy(item,type='translation_ru_en') {
    const copy=structuredClone(item);
    for(const key of ['options','correct_option_index','response_contract','blanks','accepted_option_indices'])delete copy[key];
    copy.type=type;copy.content_version='historical-fixture';copy.answer='I usually check my inbox after breakfast.';copy.accepted_answers=[copy.answer];return copy;
  }
  async function storeLegacy(id,item,submitted) {
    const answer=grade(item,submitted);
    await db.prepare('UPDATE practice SET items=?,answers=?,completed=?,score=0,max_score=0,pending_count=1,revision=1 WHERE id=?').bind(JSON.stringify([item]),JSON.stringify([answer]),Date.now()/1000,id).run();
    return answer;
  }
  const sql=fs.readFileSync(path.join(root,'cloudflare/schema.sql'),'utf8').replace(/^--.*$/gm,'');
  await db.batch(sqlStatements(sql).map(sql=>db.prepare(sql)));
  const teacher=new Client(),student=new Client(),other=new Client(),anonymous=new Client();
  assert.deepEqual(await anonymous.ok('health'),{ok:true});
  assert.deepEqual(await anonymous.ok('auth/me'),{user:null});
  assert.equal((await anonymous.ok('auth/info')).local,false);
  assert.equal((await anonymous.call('auth/demo',{})).status,404);
  assert.equal((await anonymous.call('account')).status,401);
  assert.equal((await teacher.call('auth/setup',{code:'wrong'})).status,403);
  const setup=await teacher.ok('auth/setup',{code:'fictional-owner-code',name:'Тестовый учитель',email:'teacher@example.test',password:'FictionalPassword!2026'});
  assert.equal(setup.user.role,'teacher');
  assert.equal((await anonymous.call('auth/setup',{code:'fictional-owner-code'})).status,409);
  for(const [client,name] of [[student,'anna'],[other,'misha']]){
    const invite=await teacher.ok('teacher/invite',{name,email:name+'@example.test'});
    const joined=await client.ok('auth/join',{token:invite.token,name,password:'FictionalPassword!2026',role:'teacher',teacher_id:'forged'});
    assert.equal(joined.user.role,'student');
    assert.equal((await anonymous.call('auth/join',{token:invite.token,name,password:'FictionalPassword!2026'})).status,410);
  }
  assert.equal((await student.call('teacher/students')).status,403);
  const list=await teacher.ok('teacher/students');assert.equal(list.students.length,2);
  const needsVerification=await teacher.ok('teacher/invite',{name:'Проверка почты',email:'unverified@example.test'});
  const unverified=new Client();
  const unverifiedPayload={token:needsVerification.token,name:'Проверка почты',password:'FictionalPassword!2026'};
  assert.equal((await unverified.call('auth/join',unverifiedPayload)).status,403);
  assert.equal((await teacher.ok('teacher/students')).students.length,2,'Unverified email must not get an app role');
  identities.get('unverified@example.test').verified=true;
  await unverified.ok('auth/join',unverifiedPayload);
  const openOne=await teacher.ok('teacher/invite',{}),openTwo=await teacher.ok('teacher/invite',{});
  const openClient=new Client(),openPayload={token:openOne.token,name:'Self-registered pupil',password:'FictionalPassword!2026',role:'teacher',teacher_id:'forged'};
  assert.equal((await openClient.call('auth/join',openPayload)).status,400);
  assert.equal((await openClient.call('auth/join',{...openPayload,email:'not-an-email'})).status,400);
  assert.equal((await openClient.call('auth/join',{...openPayload,email:'anna@example.test'})).status,409);
  const pendingOpen={...openPayload,email:'unverified.open@example.test'};
  assert.equal((await openClient.call('auth/join',pendingOpen)).data.code,'VERIFY_EMAIL');
  assert.equal((await db.prepare('SELECT used FROM invites WHERE token=?').bind(require('node:crypto').createHash('sha256').update(openOne.token).digest('hex')).first()).used,0);
  identities.get('unverified.open@example.test').verified=true;
  const openJoined=await openClient.ok('auth/join',{...pendingOpen,email:' UNVERIFIED.OPEN@example.test '});
  assert.equal(openJoined.user.role,'student');assert.equal(openJoined.user.email,'unverified.open@example.test');
  assert.equal((await teacher.ok('teacher/students/'+openJoined.user.id)).user.id,openJoined.user.id);
  assert.equal((await anonymous.call('auth/join',{...openPayload,email:'different.open@example.test'})).status,410);
  const openRace=await Promise.all(['race.open.one@example.test','race.open.two@example.test'].map(email=>new Client().call('auth/join',{...openPayload,token:openTwo.token,email})));
  assert.deepEqual(openRace.map(r=>r.status).sort(),[200,410]);
  assert.equal((await db.prepare("SELECT COUNT(*) AS n FROM users WHERE email IN ('race.open.one@example.test','race.open.two@example.test')").first()).n,1);
  const bound=await teacher.ok('teacher/invite',{name:'Legacy pupil',email:'legacy.bound@example.test'});
  assert.equal((await anonymous.call('auth/join',{...openPayload,token:bound.token,email:'different.bound@example.test'})).status,400);
  const expiredOpen=await teacher.ok('teacher/invite',{});
  await db.prepare('UPDATE invites SET expires=0 WHERE token=?').bind(require('node:crypto').createHash('sha256').update(expiredOpen.token).digest('hex')).run();
  assert.equal((await anonymous.call('auth/join',{...openPayload,token:expiredOpen.token,email:'expired.open@example.test'})).status,410);
  console.log('Open invitations passed: no teacher-entered pupil details, independent links, self-entered verified email, enforced role/owner, single-use race and legacy email binding.');
  const studentID=(await student.ok('auth/me')).user.id;
  const otherID=(await other.ok('auth/me')).user.id;
  assert.equal((await student.call('teacher/students/'+otherID)).status,403);
  assert.equal((await teacher.call('teacher/students/'+setup.user.id)).status,404);
  assert.equal((await student.call('practice/start',{ids:[known.id]},{badCsrf:true})).status,403);
  assert.equal((await student.call('practice/start',{ids:[known.id]},{origin:'https://evil.test'})).status,403);
  assert.equal((await student.call('practice/start',{ids:[known.id]})).status,403);
  async function assignedPractice(ids){const assigned=await teacher.ok('teacher/students/'+studentID+'/assignments',{title:'Test practice',ids});return {id:assigned.practiceId,revision:0};}
  for(const name of ['part-01.json','part-13.json'])for(const [client,status] of [[anonymous,401],[student,403]])assert.equal((await runtime.dispatchFetch('https://grammar.test/data/exercises/'+name,{headers:{Cookie:client.cookie}})).status,status);
  assert.equal((await runtime.dispatchFetch('https://grammar.test/%64ata/exercises/part-01.json')).status,404);
  const legacy='legacy-free';
  await db.prepare('INSERT INTO practice(id,user_id,items,created) VALUES(?,?,?,?)').bind(legacy,studentID,JSON.stringify([known]),Date.now()/1000).run();
  for(const [suffix,data] of [['',undefined],['/draft',{index:0,revision:0,submitted:['had translated']}],['/check',{index:0,revision:0,submitted:['had translated']}]])assert.equal((await student.call('practice/'+legacy+suffix,data)).status,403);
  const session=await assignedPractice([known.id]);
  const hidden=(await student.ok('practice/'+session.id)).items[0];
  assert.equal(hidden.answer_text,undefined);assert.equal(hidden.blanks[0].answer,undefined);

  assert.equal((await other.call('practice/'+session.id)).status,404);
  assert.equal((await other.call('practice/'+session.id+'/check',{index:0,revision:0,submitted:['wrong']})).status,404);
  const draft=await student.ok('practice/'+session.id+'/draft',{index:0,revision:0,submitted:['had translated']});
  assert.equal(draft.revision,1);
  assert.equal((await student.call('practice/'+session.id+'/draft',{index:0,revision:0,submitted:['wrong']})).status,409);
  assert.deepEqual((await student.ok('practice/'+session.id)).draft,['had translated']);
  const check={index:0,revision:1,submitted:['wrong'],correct:true,score:999};
  const results=await Promise.all([student.ok('practice/'+session.id+'/check',check),student.ok('practice/'+session.id+'/check',check)]);
  assert.equal(results[0].answer.correct,false);assert.deepEqual(results[0],results[1]);
  assert.equal((await student.call('practice/'+session.id+'/check',{...check,submitted:['had translated']})).status,409);
  const progress=await teacher.ok('teacher/students/'+studentID);
  assert.equal(progress.stats.sessions,1);assert.equal(progress.stats.score,0);assert.equal(progress.stats.maxScore,1);
  const translation=fixtures.find(item=>item.id==='new-translation-001');
  const pending=await assignedPractice([translation.id]);
  await storeLegacy(pending.id,legacyCopy(translation),'An old unverified translation');
  const own=await student.ok('account');assert.equal(own.stats.pending,1);assert.equal(own.stats.maxScore,1);
  // 27 attempts prove full history can be paged without gaps or duplicates.
  for(let n=0;n<26;n++){const pool=await teacher.ok('teacher/students/'+studentID+'/assignment-pool');await assignedPractice([pool.availableIds[0]]);}
  const first=await student.ok('account');assert.equal(first.history.length,25);assert.ok(first.nextCursor);
  const second=await student.ok('account?cursor='+encodeURIComponent(first.nextCursor));
  assert.equal(new Set([...first.history,...second.history].map(row=>row.id)).size,29);
  assert.equal(second.nextCursor,null);
  // Assignments use immutable bank snapshots and the same trusted practice.
  const assignPath='teacher/students/'+studentID+'/assignments';
  const available=new Set((await teacher.ok('teacher/students/'+studentID+'/assignment-pool')).availableIds);
  const assignmentItem=fixtures.find(item=>available.has(item.id)&&item.blanks?.length===1);
  const expectedAnswer=[assignmentItem.blanks[0].answer];
  const payload={title:'Домашняя практика',ids:[assignmentItem.id],score:999};
  assert.equal((await anonymous.call(assignPath,payload)).status,401);
  assert.equal((await other.call(assignPath,payload)).status,403);
  assert.equal((await teacher.call(assignPath,payload,{badCsrf:true})).status,403);
  assert.equal((await teacher.call('teacher/students/'+setup.user.id+'/assignments',payload)).status,404);
  for(const invalid of [{...payload,ids:[]},{...payload,ids:[known.id,known.id]},{...payload,ids:['missing']},{...payload,title:' '}])assert.equal((await teacher.call(assignPath,invalid)).status,400);
  const assigned=await teacher.ok(assignPath,payload);
  const view=(await student.ok('account')).assignments;
  const justAssigned=view.find(row=>row.id===assigned.id);assert.equal(justAssigned.status,'assigned');assert.equal(justAssigned.score,0);
  assert.equal(justAssigned.practiceId,assigned.practiceId);assert.ok(!JSON.stringify(view).includes('had translated'),'List must not leak answer keys');
  assert.equal((await other.ok('account')).assignments.length,0);
  assert.equal((await other.call('practice/'+assigned.practiceId)).status,404);
  const savedAssignment=await student.ok('practice/'+assigned.practiceId);
  assert.equal(savedAssignment.items[0].id,assignmentItem.id);
  await student.ok('practice/'+assigned.practiceId+'/draft',{index:0,revision:0,submitted:expectedAnswer});
  assert.equal((await teacher.ok('teacher/students/'+studentID)).assignments[0].status,'started');
  assert.deepEqual((await student.ok('practice/'+assigned.practiceId)).draft,expectedAnswer);
  await student.ok('practice/'+assigned.practiceId+'/check',{index:0,revision:1,submitted:expectedAnswer,score:999});
  const finished=(await teacher.ok('teacher/students/'+studentID)).assignments[0];
  assert.equal(finished.status,'completed');assert.equal(finished.score,1);assert.equal(finished.maxScore,1);
  assert.equal((await student.ok('practice/'+assigned.practiceId)).index,1,'Reopening must preserve completion');
  const poolPath='teacher/students/'+studentID+'/assignment-pool';
  assert.equal((await student.call(poolPath)).status,403);
  assert.ok(!(await teacher.ok(poolPath)).availableIds.includes(known.id));
  assert.equal((await teacher.call(assignPath,{title:'Duplicate',ids:[known.id]})).status,409);
  // A different student has an independent history.
  await teacher.ok('teacher/students/'+otherID+'/assignments',{title:'Other student',ids:[known.id]});
  const allowed=new Set((await teacher.ok(poolPath)).availableIds);
  const seenSentences=new Map();let duplicatePair;
  for(const item of fixtures.filter(item=>allowed.has(item.id))){
    for(const key of assignmentSentenceKeys(item).filter(key=>key.startsWith('sentence:'))){
      if(seenSentences.has(key)){duplicatePair=[seenSentences.get(key),item.id];break;}
      seenSentences.set(key,item.id);
    }
    if(duplicatePair)break;
  }
  assert.ok(duplicatePair,'Bank contains duplicates under different IDs');
  assert.equal((await teacher.call(assignPath,{title:'Within batch duplicate',ids:duplicatePair})).status,409);
  await teacher.ok(assignPath,{title:'First sentence',ids:[duplicatePair[0]]});
  assert.equal((await teacher.call(assignPath,{title:'Same sentence under another ID',ids:[duplicatePair[1]]})).status,409);
  const raceID=(await teacher.ok(poolPath)).availableIds[0];
  const before=(await db.prepare('SELECT COUNT(*) AS n FROM practice WHERE user_id=?').bind(studentID).first()).n;
  const raced=await Promise.all([teacher.call(assignPath,{title:'Race A',ids:[raceID]}),teacher.call(assignPath,{title:'Race B',ids:[raceID]})]);
  assert.deepEqual(raced.map(result=>result.status).sort(),[200,409]);
  assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM practice WHERE user_id=?').bind(studentID).first()).n,before+1,'No orphan practice from rejected racing assignment');
  const freshPool=await teacher.ok(poolPath), chosen=[],seen=new Set();
  for(const id of freshPool.availableIds){const item=fixtures.find(item=>item.id===id),keys=assignmentSentenceKeys(item);if(keys.some(key=>seen.has(key)))continue;chosen.push(item);keys.forEach(key=>seen.add(key));if(chosen.length===4)break;}
  const managed=await teacher.ok(assignPath,{title:'Manage me',ids:chosen.slice(0,2).map(item=>item.id)});
  const managePath=assignPath+'/'+managed.id,practicePath='practice/'+managed.practiceId;
  assert.equal((await student.call(managePath)).status,403);
  assert.equal((await teacher.call(managePath.replace(studentID,otherID))).status,404);
  assert.equal((await teacher.call(managePath+'/cancel',{version:0},{badCsrf:true})).status,403);
  await teacher.ok(managePath+'/edit',{version:0,title:'Renamed'});
  assert.equal((await student.ok(practicePath)).revision,0,'Renaming must not interrupt student input');
  await teacher.ok(managePath+'/edit',{version:1,title:'Shorter',ids:[chosen[0].id]});
  assert.equal((await teacher.call(managePath+'/edit',{version:1,title:'Stale'})).status,409);
  const edited=await student.ok(practicePath);assert.equal(edited.items.length,1);assert.equal(edited.revision,1);
  assert.ok(!(await teacher.ok(poolPath)).availableIds.includes(chosen[1].id),'Removed sentences remain used');
  const managedDraft=chosen[0].options?0:chosen[0].blanks?chosen[0].blanks.map(blank=>blank.answer):chosen[0].answer;
  await student.ok(practicePath+'/draft',{revision:1,index:0,submitted:managedDraft});
  assert.equal((await teacher.call(managePath+'/edit',{version:2,title:'Cannot replace',ids:[chosen[2].id]})).status,409);
  const beforeCancel=await student.ok(practicePath),statsBefore=(await student.ok('account')).stats;
  await teacher.ok(managePath+'/cancel',{version:2});
  for(const [suffix,payload] of [['',undefined],['/draft',{revision:2,index:0,submitted:managedDraft}],['/check',{revision:2,index:0,submitted:managedDraft}]]) assert.equal((await student.call(practicePath+suffix,payload)).status,403);
  const cancelled=await student.ok('account');assert.equal(cancelled.assignments.find(a=>a.id===managed.id).status,'cancelled');assert.equal(cancelled.stats.drafts,statsBefore.drafts-1);
  await teacher.ok(managePath+'/restore',{version:3});
  const restored=await student.ok(practicePath);assert.deepEqual(restored.draft,beforeCancel.draft);assert.deepEqual(restored.answers,beforeCancel.answers);
  await student.ok(practicePath+'/check',{revision:restored.revision,index:0,submitted:managedDraft});
  assert.equal((await teacher.call(managePath+'/edit',{version:4,title:'Cannot replace completed',ids:[chosen[2].id]})).status,409);
  const score=(await student.ok(practicePath)).score;
  const edits=await Promise.all([teacher.call(managePath+'/edit',{version:4,title:'Edit A'}),teacher.call(managePath+'/edit',{version:4,title:'Edit B'})]);
  assert.deepEqual(edits.map(r=>r.status).sort(),[200,409]);assert.equal((await student.ok(practicePath)).score,score);
  const events=await db.prepare('SELECT * FROM assignment_events WHERE assignment_id=? ORDER BY created').bind(managed.id).all();assert.equal(events.results.length,5);assert.equal(JSON.parse(events.results[1].items).length,2);
  const racing=await teacher.ok(assignPath,{title:'Race input and cancel',ids:[chosen[3].id]});
  const input=chosen[3].options?0:chosen[3].blanks?chosen[3].blanks.map(blank=>blank.answer):chosen[3].answer;
  const cancelledRace=await Promise.all([teacher.call(assignPath+'/'+racing.id+'/cancel',{version:0}),student.call('practice/'+racing.practiceId+'/check',{revision:0,index:0,submitted:input})]);
  assert.ok(cancelledRace.some(r=>r.status===200));
  const raceState=(await student.ok('account')).assignments.find(a=>a.id===racing.id);
  if(raceState.status==='cancelled')assert.equal((await student.call('practice/'+racing.practiceId)).status,403);
  assert.ok(cancelledRace.every(r=>[200,403,409].includes(r.status)));
  const rewriteAvailable=new Set((await teacher.ok('teacher/students/'+studentID+'/assignment-pool')).availableIds);
  const rewrite=fixtures.find(item=>rewriteAvailable.has(item.id)&&item.id.startsWith('adv-edit-')&&item.options);
  assert.ok(rewrite);
  const statsBeforeRewrite=(await student.ok('account')).stats;
  const rewritePractice=await assignedPractice([rewrite.id]);
  const rewritten=await storeLegacy(rewritePractice.id,legacyCopy(rewrite,'error_correction'),'An old unrecognised alternative sentence.');
  assert.equal(rewritten.correct,false);
  assert.equal(rewritten.fields[0].verified,false);
  assert.equal(rewritten.checker,3);
  const statsAfterRewrite=(await student.ok('account')).stats;
  assert.equal(statsAfterRewrite.pending,statsBeforeRewrite.pending+1);
  assert.equal(statsAfterRewrite.maxScore,statsBeforeRewrite.maxScore);
  assert.equal(statsAfterRewrite.score,statsBeforeRewrite.score);
  console.log('Unknown sentence rewrite saved without automatic approval or score penalty.');
  {
    const pool=new Set((await teacher.ok(poolPath)).availableIds);
    const current=fixtures.find(i=>pool.has(i.id)&&i.id.startsWith('new-translation-')&&i.options);
    const p=await assignedPractice([current.id]),legacy=legacyCopy(current);
    const workRoute='attempts/'+p.id,teacherWork='teacher/students/'+studentID+'/attempts/'+p.id;
    assert.equal((await anonymous.call(workRoute)).status,401);
    assert.equal((await other.call(workRoute)).status,404);
    assert.equal((await teacher.call(workRoute)).status,404);
    const unstarted=await student.ok(workRoute);assert.equal(unstarted.canResume,true);assert.deepEqual(unstarted.attempt.answers,[]);
    assert.equal(unstarted.attempt.items,undefined);assert.ok(!JSON.stringify(unstarted).includes('accepted_answers'));
    assert.equal((await student.call(teacherWork)).status,403);
    const teacherUnstarted=await teacher.ok(teacherWork);assert.equal(teacherUnstarted.canResume,false);assert.ok(teacherUnstarted.assignment);
    await db.prepare('UPDATE practice SET items=?,draft=? WHERE id=?').bind(JSON.stringify([legacy]),JSON.stringify('Archived old draft'),p.id).run();
    const report='reports/'+p.id,endpoint='practice/'+p.id+'/automatic';
    assert.equal((await student.call(report)).status,404);
    assert.equal((await student.call('practice/'+p.id+'/check',{revision:0,index:0,submitted:'Unknown free sentence'})).status,409);
    assert.equal((await other.call(endpoint,{revision:0})).status,404);
    assert.equal((await student.call(endpoint,{revision:0},{badCsrf:true})).status,403);
    const raced=await Promise.all([student.call(endpoint,{revision:0}),student.call(endpoint,{revision:0})]);
    assert.deepEqual(raced.map(r=>r.status).sort(),[200,409]);
    const saved=await student.ok('practice/'+p.id);
    assert.equal(saved.revision,1);assert.equal(saved.draft,null);assert.ok(saved.items[0].options);assert.equal(saved.items[0].answer,undefined);
    const audit=await db.prepare('SELECT * FROM practice_format_events WHERE practice_id=?').bind(p.id).all();
    assert.equal(audit.results.length,1);assert.deepEqual(JSON.parse(audit.results[0].items),[legacy]);assert.equal(JSON.parse(audit.results[0].draft),'Archived old draft');
    await student.ok('practice/'+p.id+'/check',{index:0,revision:1,submitted:current.correct_option_index,score:999});
    const ownReport=await student.ok(report);assert.equal(ownReport.attempt.score,1);assert.equal(ownReport.attempt.pending,0);
    const completedWork=await student.ok(workRoute);assert.equal(completedWork.canResume,false);assert.deepEqual(completedWork.attempt.answers,ownReport.attempt.answers);
    assert.deepEqual((await teacher.ok(teacherWork)).attempt.answers,ownReport.attempt.answers);
    assert.equal((await other.call(report)).status,404);assert.equal((await teacher.call(report)).status,404);
    assert.equal((await student.call(endpoint,{revision:2})).status,409);
    console.log('Automatic upgrade: CSRF/owner/revision/cancel guards, atomic concurrent requests, original snapshot/draft preserved, bounded server grade and private completed report passed.');
  }
  console.log('Assignment management passed: edit/trim/archive, stale edits, role/CSRF checks, cancel/restore, preserved progress and concurrent student input.');
  // Notification receipts are private and do not change attempts or scores.
  {
  assert.equal((await anonymous.call('notifications')).status,401);
  await teacher.ok('notifications/read',{all:true});
  await student.ok('notifications/read',{all:true});
  const notificationPool=(await teacher.ok(poolPath)).availableIds;
  const notificationItem=fixtures.find(i=>notificationPool.includes(i.id)&&i.type==='open_brackets');
  const notificationAssignment=await teacher.ok('teacher/students/'+studentID+'/assignments',{title:'Проверка уведомлений',ids:[notificationItem.id]});
  const noticeId='assigned:'+notificationAssignment.id;
  const notices=await student.ok('notifications');
  assert.equal(notices.unreadCount,1);
  assert.ok(notices.items.some(n=>n.id===noticeId));
  assert.ok(!JSON.stringify(notices).includes('accepted_answers'));
  assert.ok(!(await other.ok('notifications')).items.some(n=>n.id===noticeId));
  assert.equal((await other.call('notifications/read',{id:noticeId})).status,404);
  assert.equal((await student.call('notifications/read',{id:noticeId},{badCsrf:true})).status,403);
  await student.ok('notifications/read',{id:noticeId});
  await student.ok('notifications/read',{id:noticeId});
  assert.equal((await student.ok('notifications')).unreadCount,0);
  const reportPath='teacher/students/'+studentID+'/reports/'+notificationAssignment.practiceId;
  assert.equal((await teacher.call(reportPath)).status,404);
  const payload={index:0,revision:0,submitted:notificationItem.blanks.map(b=>b.answer),score:999};
  await student.ok('practice/'+notificationAssignment.practiceId+'/check',payload);
  await student.ok('practice/'+notificationAssignment.practiceId+'/check',payload);
  const reports=await teacher.ok('notifications');
  assert.equal(reports.unreadCount,1);
  const completed=reports.items.filter(n=>n.id==='completed:'+notificationAssignment.id);
  assert.equal(completed.length,1);
  assert.equal(completed[0].score,notificationItem.blanks.length);
  assert.equal((await student.call(reportPath)).status,403);
  assert.equal((await teacher.call(reportPath.replace(studentID,otherID))).status,404);
  assert.equal((await teacher.ok(reportPath)).attempt.score,notificationItem.blanks.length);
  await teacher.ok('notifications/read',{all:true});
  assert.equal((await teacher.ok('notifications')).unreadCount,0);
  await teacher.ok('teacher/students/'+studentID+'/assignments/'+notificationAssignment.id+'/cancel',{version:0});
  assert.ok(!(await student.ok('notifications')).items.some(n=>n.id===noticeId));
  console.log('Private notifications passed: assignment, completion, exact report, trusted scores, replay deduplication, read receipts, cancellation, role/owner and CSRF guards.');
  }
  await student.ok('auth/logout',{});assert.equal((await student.call('account')).status,401);
  const login=await student.call('auth/login',{email:'anna@example.test',password:'FictionalPassword!2026'});
  assert.equal(login.status,200);assert.match(login.headers.get('Set-Cookie'),/; Secure/);
  assert.match(login.headers.get('Set-Cookie'),/Max-Age=2592000/);
  assert.match(login.headers.get('Set-Cookie'),/HttpOnly; SameSite=Lax; Secure/);
  const sessionHash=require('node:crypto').createHash('sha256').update(student.cookie.split('=')[1]).digest('hex');
  const seconds=()=>Date.now()/1000;
  const lifetime=(await db.prepare('SELECT expires FROM sessions WHERE token=?').bind(sessionHash).first()).expires-seconds();
  assert.ok(lifetime>29.99*86400&&lifetime<=30*86400,'Session must persist for 30 days');
  const oldExpiry=seconds()+28*86400;
  await db.prepare('UPDATE sessions SET expires=? WHERE token=?').bind(oldExpiry,sessionHash).run();
  const rejected=await student.call('auth/logout',{}, {badCsrf:true});
  assert.equal(rejected.status,403);assert.equal(rejected.headers.get('Set-Cookie'),null);
  assert.equal((await db.prepare('SELECT expires FROM sessions WHERE token=?').bind(sessionHash).first()).expires,oldExpiry);
  const renewed=await student.call('auth/me');assert.equal(renewed.status,200);assert.match(renewed.headers.get('Set-Cookie'),/Max-Age=2592000/);
  const expiry=(await db.prepare('SELECT expires FROM sessions WHERE token=?').bind(sessionHash).first()).expires;
  assert.ok(expiry-seconds()>29.99*86400);
  assert.equal((await student.call('auth/me')).headers.get('Set-Cookie'),null,'Do not rewrite the cookie on every request');
  await db.prepare('UPDATE users SET active=0 WHERE id=?').bind(studentID).run();
  assert.deepEqual(await student.ok('auth/me'),{user:null},'Disabled app users lose access immediately');
  await db.prepare('UPDATE users SET active=1 WHERE id=?').bind(studentID).run();
  await db.prepare('UPDATE sessions SET expires=? WHERE token=?').bind(seconds()-1,sessionHash).run();
  const expired=await student.call('auth/me');assert.equal(expired.status,200);assert.equal(expired.data.user,null);assert.equal(expired.headers.get('Set-Cookie'),null);
  assert.ok((await db.prepare('SELECT expires FROM sessions WHERE token=?').bind(sessionHash).first()).expires<seconds(),'An expired session must not be revived');

  assert.equal((await anonymous.call('auth/login',{email:'anna@example.test',password:'IncorrectPassword!2026'})).status,401);
  await anonymous.ok('auth/reset',{email:'anna@example.test'});
  for(let n=0;n<12;n++)await anonymous.call('auth/login',{email:'rate@example.test',password:'wrong'},{ip:'192.0.2.99'});
  assert.equal((await anonymous.call('auth/login',{email:'rate@example.test',password:'wrong'},{ip:'192.0.2.99'})).status,429);
  console.log('Local D1 checks passed: roles, ownership, invitations, CSRF, drafts, concurrent replay, trusted scoring, history pagination, sessions and login limits.');
} finally {await runtime.dispose();fs.rmSync(temporary,{recursive:true,force:true});}
