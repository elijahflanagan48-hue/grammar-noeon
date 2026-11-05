import {sqlStatements} from '../scripts/sql-statements.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { grade } from '../cloudflare/generated/checker.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const require=createRequire(path.join(process.env.GRAMMAR_TOOLING_DIR||root,'package.json'));
const {Miniflare,convertV4MiniflareOptions}=await import(pathToFileURL(require.resolve('miniflare')));
const fixtures=JSON.parse(fs.readFileSync(path.join(root,'cloudflare/generated/bank.json'),'utf8'));
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


let checks=0;const eq=(a,b,msg)=>{assert.deepEqual(a,b,msg);checks++;};
try{
 const db=await runtime.getD1Database('DB');await db.batch(sqlStatements(fs.readFileSync(path.join(root,'cloudflare/schema.sql'),'utf8')).map(sql=>db.prepare(sql)));
 const teacher=new Client(),student=new Client(),other=new Client(),guest=new Client();
 await teacher.ok('auth/setup',{code:'fictional-owner-code',name:'Teacher',email:'teacher@example.test',password:'FictionalPassword!2026'});
 for(const [client,name] of [[student,'anna'],[other,'misha']]){const invite=await teacher.ok('teacher/invite',{});await client.ok('auth/join',{token:invite.token,name,email:name+'@example.test',password:'FictionalPassword!2026'});}
 const sid=(await student.ok('auth/me')).user.id,oid=(await other.ok('auth/me')).user.id,tid=(await teacher.ok('auth/me')).user.id;
 const pick=t=>fixtures.find(i=>i.type==='open_brackets'&&i.blanks.length===1&&i.blanks[0].tense_or_construction===t);
 const first=structuredClone(pick('present_simple')),second=pick('past_simple'),pending=pick('future_simple'),skipped=pick('present_continuous');first.content_version='historical-test';first.blanks[0].answer='historical answer';first.blanks[0].accepted_answers=['historical answer'];
 const wrong=grade(first,['wrong']),wrong2=grade(second,['wrong']),wait=grade(pending,['wrong']),skip=grade(skipped,['wrong']);wait.fields[0].verified=false;skip.fields[0].skipped=true;
 const retired={id:'retired-free',type:'error_correction',prompt:'Old free response',answer:'Old key',tags:['past_simple']};
 const retiredAnswer={item:retired,correct:false,fields:[{submitted:'wrong',correct:false,verified:true}]};
 const items=[first,second,pending,skipped,retired],answers=[wrong,wrong2,wait,skip,retiredAnswer],time=Date.now()/1000;
 await db.prepare('INSERT INTO practice(id,user_id,items,answers,created,completed,revision,pending_count) VALUES(?,?,?,?,?,?,0,1)').bind('source-errors',sid,JSON.stringify(items),JSON.stringify(answers),time-1,time).run();
 const endpoint='reports/source-errors/remediation',assigned='teacher/students/'+sid+'/'+endpoint;
 eq((await guest.call(endpoint)).status,401,'Guest rejected');eq((await other.call(endpoint)).status,404,'Other learner rejected');
 const closed=await student.ok(endpoint);eq([closed.canStart,closed.needsTeacher,closed.items.length],[false,true,0],'Disabled pupil gets no new bank content');
 eq((await student.call(endpoint,{mode:'new',revision:0,requestId:'a'.repeat(64),ids:[second.id]})).status,403,'Disabled pupil cannot bypass');
 const repeat=await teacher.ok(assigned+'?mode=repeat');eq(repeat.items.map(i=>i.id),[first.id,second.id],'Only verified wrong, excluding pending/skipped');eq(repeat.items[0].content_version,'historical-test','Repeat preserves snapshot');eq(repeat.omitted,1,'Unsupported historical shape explicitly omitted');
 const plan=await teacher.ok(assigned);eq(plan.items.length,5,'Small proposal');assert(plan.items.every(i=>!items.some(old=>old.id===i.id)));assert(plan.items.every(i=>i.blanks.every(b=>['present_simple','past_simple'].includes(b.tense_or_construction))));assert(plan.items.some(i=>i.blanks.some(b=>b.tense_or_construction==='present_simple')));assert(plan.items.some(i=>i.blanks.some(b=>b.tense_or_construction==='past_simple')));
 const payload={mode:'new',revision:plan.revision,requestId:plan.requestId,ids:plan.items.map(i=>i.id),itemVersions:plan.items.map(i=>i.content_version??null)};
 eq((await teacher.call(assigned,{...payload,revision:1})).status,409,'Stale review revision rejected');
 eq((await teacher.call(assigned,{...payload,ids:[first.id]})).status,409,'New mode cannot repeat original');
 eq((await teacher.call(assigned,{...payload,ids:[pending.id]})).status,409,'Cannot inject unrelated topics');
 eq((await teacher.call(assigned,payload,{badCsrf:true})).status,403,'CSRF required');eq((await teacher.call(assigned,{...payload,itemVersions:payload.ids.map(()=> 'outdated')})).status,409,'Outdated proposal versions rejected');
 const sent=await teacher.ok(assigned,payload);eq(sent.assigned,true,'Teacher assigns when self practice disabled');
 eq((await teacher.ok(assigned,payload)).practiceId,sent.practiceId,'Replay idempotent');eq((await teacher.call(assigned,{...payload,ids:[payload.ids[0]]})).status,409,'Same replay token cannot change selection');
 const work=await student.ok('practice/'+sent.practiceId);assert(!JSON.stringify(work.items).includes('accepted_answers'));eq(work.items.map(i=>i.id),payload.ids,'Assigned exact proposal');
 eq((await other.call('practice/'+sent.practiceId)).status,404,'Assigned work private');
 eq((await student.ok('notifications')).items.filter(n=>n.practiceId===sent.practiceId).length,1,'One assignment notification');
 const next=await teacher.ok(assigned);assert(next.items.every(i=>!payload.ids.includes(i.id)),'Newly issued material excluded');
 const repeated=await teacher.ok(assigned,{mode:'repeat',revision:0,requestId:repeat.requestId,ids:repeat.items.map(i=>i.id),itemVersions:repeat.items.map(i=>i.content_version??null)});
 const replayWork=await student.ok('practice/'+repeated.practiceId);eq(replayWork.items[0].id,first.id,'Old item repeated in distinct work');
 eq((await student.ok('practice/'+repeated.practiceId+'/check',{index:0,revision:0,submitted:['historical answer']})).answer.correct,true,'Historic key really grades repeat');
 const original=await db.prepare("SELECT items,answers FROM practice WHERE id='source-errors'").first();eq(JSON.parse(original.items),items,'Original snapshot unchanged');eq(JSON.parse(original.answers),answers,'Original grades unchanged');
 await teacher.ok('teacher/students/'+sid+'/free-practice',{allowed:true});
 const own=await student.ok(endpoint);eq(own.canStart,true,'Allowed pupil can train');assert(own.items.every(i=>!('answer_text'in i)&&i.blanks.every(b=>!('answer'in b))));
 const racing=await Promise.all([student.call(endpoint,{mode:'new',revision:0,requestId:'b'.repeat(64),ids:own.items.map(i=>i.id),itemVersions:own.items.map(i=>i.content_version??null)}),student.call(endpoint,{mode:'new',revision:0,requestId:'c'.repeat(64),ids:own.items.map(i=>i.id),itemVersions:own.items.map(i=>i.content_version??null)})]);eq(racing.map(r=>r.status).sort(),[200,409],'Two tabs cannot start identical new material');
 const personal=racing.find(r=>r.status===200).data;eq(personal.assigned,false,'Independent practice created');
 eq((await student.ok('practice/'+personal.id)).source,'self','Independent source');
 const revoke=await student.ok(endpoint);await teacher.ok('teacher/students/'+sid+'/free-practice',{allowed:false});eq((await student.call(endpoint,{mode:'new',revision:0,requestId:revoke.requestId,ids:revoke.items.map(i=>i.id),itemVersions:revoke.items.map(i=>i.content_version??null)})).status,403,'Revoked permission applied at start');
 eq((await teacher.call('teacher/students/'+oid+'/'+endpoint)).status,404,'Teacher/student source pair scoped');
 console.log(`Remediation: ${checks} assertions; precise topics, new material, distinct historical repeat, permissions, previews, grading, assignment notices and replay passed.`);
}finally{await runtime.dispose();fs.rmSync(temporary,{recursive:true,force:true});}
