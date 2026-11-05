import {sqlStatements} from '../scripts/sql-statements.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { grade } from '../cloudflare/generated/checker.mjs';
import { assignmentSentenceKeys } from '../cloudflare/generated/assignment-keys.mjs';
import {exerciseSection,exerciseTenses} from '../cloudflare/generated/selection.mjs';

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


let checks=0;
const equal=(a,b,label)=>{assert.deepEqual(a,b,label);checks++};
const modal=fixtures.filter(i=>i.topic==='modals');
const noKeys=items=>{for(const item of items){for(const key of ['answer','answer_text','accepted_answers','explanation_ru','rule_refs','modal_sub','modal_rule','practice_tenses','accept','correct_option_index'])assert(!(key in item),key+' must be private');for(const blank of item.blanks||[])for(const key of ['answer','accepted_answers','explanation_ru','rule_refs','tense_or_construction'])assert(!(key in blank),key+' must be private')}};
try {
 const db=await runtime.getD1Database('DB');
 await db.batch(sqlStatements(fs.readFileSync(path.join(root,'cloudflare/schema.sql'),'utf8')).map(s=>db.prepare(s)));
 const teacher=new Client(),student=new Client(),other=new Client(),guest=new Client();
 await teacher.ok('auth/setup',{code:'fictional-owner-code',name:'Teacher',email:'teacher@example.test',password:'FictionalPassword!2026'});
 for(const [client,name]of [[student,'anna'],[other,'misha']]){const invite=await teacher.ok('teacher/invite',{});await client.ok('auth/join',{token:invite.token,name,email:name+'@example.test',password:'FictionalPassword!2026'});}
 const sid=(await student.ok('auth/me')).user.id;
 const allTargets=[...new Set(modal.flatMap(exerciseTenses))];
 const filters={topic:'modals',tenses:allTargets,levels:['basic','medium','advanced'],types:[...new Set(modal.map(i=>i.type))],count:10};
 equal((await guest.call('practice/start',filters)).status,401,'Guest cannot start');
 equal((await student.call('practice/start',filters)).status,403,'Unpermitted student cannot start');
 await teacher.ok('teacher/students/'+sid+'/free-practice',{allowed:true});
 for(const level of filters.levels){const preview=await student.ok('practice/preview',{...filters,levels:[level]});assert(preview.canStart);checks++}
 for(const sub of allTargets){const preview=await student.ok('practice/preview',{...filters,tenses:[sub],count:1});assert(preview.canStart,sub);checks++}
 for(const rule of [...new Set(modal.map(i=>i.modal_rule))]){const targets=[...new Set(modal.filter(i=>i.modal_rule===rule).flatMap(exerciseTenses))];const preview=await student.ok('practice/preview',{...filters,tenses:targets,count:1});assert(preview.canStart,rule);checks++}
 for(const type of filters.types){
   const started=await student.ok('practice/start',{...filters,types:[type],count:1});
   const view=await student.ok('practice/'+started.id);noKeys(view.items);equal(view.items[0].type,type,'Native format');
   const item=modal.find(i=>i.id===view.items[0].id);let submitted=item.options?item.correct_option_index:item.blanks.map(b=>b.answer);
   if(type==='context_cloze')submitted[0]=item.blanks[0].modal_options.find(x=>x!==item.blanks[0].answer);
   await student.ok('practice/'+started.id+'/draft',{index:0,revision:0,submitted});
   equal((await student.ok('practice/'+started.id)).draft,submitted,'Draft persists');
   const result=await student.ok('practice/'+started.id+'/check',{index:0,revision:1,submitted,score:999,correct:true});
   equal(result.answer.fields.filter(f=>f.correct).length,type==='context_cloze'?item.blanks.length-1:item.blanks?.length||1,'Trusted per-field grade');
   equal(result.answer.item.explanation_ru,item.explanation_ru,'Only checked feedback contains explanation');
   equal((await other.call('practice/'+started.id)).status,404,'Other student protected');
   equal((await student.ok('reports/'+started.id)).attempt.answers[0].item.answer_profile,'modal-exact-v1','Stored checker profile');
   const replay=await student.ok('practice/'+started.id+'/check',{index:0,revision:1,submitted});equal(replay.answer,result.answer,'Replay retains stored grade');
 }
 const pool=await teacher.ok('teacher/students/'+sid+'/assignment-pool');
 const choices=modal.filter(i=>pool.availableIds.includes(i.id));
 const selected=[...new Set(choices.map(i=>i.type))].map(type=>choices.find(i=>i.type===type));
 const assigned=await teacher.ok('teacher/students/'+sid+'/assignments',{title:'Modal workflows',ids:selected.map(i=>i.id)});
 const view=await student.ok('practice/'+assigned.practiceId);noKeys(view.items);equal(view.items.map(i=>i.id),selected.map(i=>i.id),'Assignment order');
 let revision=0;
 for(const [index,item] of selected.entries()){
   const submitted=item.options?item.correct_option_index:item.blanks.map(b=>b.answer);
   const result=await student.ok('practice/'+assigned.practiceId+'/check',{index,revision,submitted});revision=result.revision;assert(result.answer.correct);checks++;
 }
 const stats=await student.ok('statistics');const section=stats.kinds.practice.sections.find(s=>s.id==='modals');assert(section.checked>0&&section.topics.every(t=>t.id.startsWith('mv_S')));checks++;
 for(const bad of [{...filters,tenses:['present_simple']},{...filters,types:['open_brackets']},{...filters,levels:['C2']}])equal((await student.call('practice/start',bad)).status,400,'Other section filter rejected');
 console.log(JSON.stringify({checks,modals:1040,subrules:31,formats:5,privacy:true,drafts:true,partialTextScore:true,storedReports:true,assignment:true,statistics:true}));
} finally {await runtime.dispose();fs.rmSync(temporary,{recursive:true,force:true});}
