import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assignmentSentenceKeys } from '../cloudflare/generated/assignment-keys.mjs';
import {exerciseTenses} from '../cloudflare/generated/selection.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));

const {workerFixture}=await import('./helpers/worker-sqlite.mjs');
const fixtures=JSON.parse(fs.readFileSync(path.join(root,'cloudflare/generated/bank.json'),'utf8'));
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
const runtime=await workerFixture(fakeFirebase);
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

const bankItems=fixtures;
const run=async()=>{

  const teacher=new Client(),a=new Client(),b=new Client();
  await teacher.ok('auth/setup',{code:'fictional-owner-code',name:'T',email:'teacher@example.test',password:'FictionalPassword!2026'});
  for(const [c,n] of [[a,'anna'],[b,'misha']]){const inv=await teacher.ok('teacher/invite',{});await c.ok('auth/join',{token:inv.token,name:n,email:n+'@example.test',password:'FictionalPassword!2026'});}
  const aid=(await a.ok('auth/me')).user.id,bid=(await b.ok('auth/me')).user.id;
  for(const id of [aid,bid])await teacher.ok(`teacher/students/${id}/free-practice`,{allowed:true});
  const keysOf=items=>new Set(items.flatMap(i=>assignmentSentenceKeys(i)));
  const byId=new Map(bankItems.map(i=>[i.id,i]));
  const rows=bankItems.filter(i=>i.topic==='conditionals');
  const types=[...new Set(rows.map(i=>i.type))];
  const targets=[...new Set(rows.flatMap(exerciseTenses))];
  const filters={topic:'conditionals',tenses:targets,levels:['basic','medium','advanced'],type:'all',count:30};
  // Every format survives learner redaction, drafts, grading, reload and history.
  for(const type of types){
    const started=await a.ok('practice/start',{...filters,types:[type],type:undefined,count:1});
    const attempt=await a.ok('practice/'+started.id),visible=attempt.items[0],item=byId.get(visible.id);
    assert.equal(visible.type,type);assert(!('answer' in visible));assert(!('fixes' in visible));
    assert(!('explanation_ru' in visible));assert(!('correct_option_index' in visible));
    assert(visible.blanks?.every(b=>!('answer' in b)&&!('accepted_answers' in b))??true);
    const submitted=item.options?item.correct_option_index:item.blanks?item.blanks.map(b=>b.answer):item.answer;
    const draft=await a.ok('practice/'+started.id+'/draft',{index:0,revision:attempt.revision,submitted});
    const reloaded=await a.ok('practice/'+started.id);assert.deepEqual(reloaded.draft,submitted);
    const checked=await a.ok('practice/'+started.id+'/check',{index:0,revision:draft.revision,submitted});
    assert.equal(checked.answer.correct,true,type);assert.equal(checked.answer.item.explanation_ru,item.explanation_ru);
    if(type==='hunt')assert.deepEqual(checked.answer.item.fixes,item.fixes);
    const saved=await a.ok('practice/'+started.id);assert.deepEqual(saved.answers[0].submitted,submitted);
    const forbidden=await teacher.call(`teacher/students/${aid}/assignments`,{title:'Clash',ids:[item.id]});
    assert.equal(forbidden.status,409,type+': free practice cannot be assigned');
  }
  // Assign first, then sample free practice: no task or sentence overlap in either direction.
  const pool=await teacher.ok(`teacher/students/${bid}/assignment-pool`);
  const ids=types.map(type=>rows.find(i=>i.type===type&&pool.availableIds.includes(i.id)).id);
  await teacher.ok(`teacher/students/${bid}/assignments`,{title:'Conditionals',ids});
  const assignedKeys=keysOf(ids.map(id=>byId.get(id)));
  for(let n=0;n<4;n++){
    const started=await b.ok('practice/start',filters),attempt=await b.ok('practice/'+started.id);
    assert(attempt.items.length>0);
    assert(attempt.items.every(i=>assignmentSentenceKeys(byId.get(i.id)).every(k=>!assignedKeys.has(k))));
  }
  const construction='cd_conj_unless';
  const selected=await b.ok('practice/start',{...filters,construction,count:5});
  assert((await b.ok('practice/'+selected.id)).items.every(i=>byId.get(i.id).tags.includes(construction)));
  assert.equal((await b.call('practice/preview',{...filters,construction:'cd_fake'})).status,400);
  console.log('PASS Conditionals API: all formats, redaction, persisted drafts/answers, key feedback, construction filters and bidirectional assignment separation (SQLite; no workerd).');
};
try{await run();}finally{await runtime.dispose();}
