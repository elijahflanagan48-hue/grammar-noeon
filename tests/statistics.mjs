import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';
import {statistics} from '../cloudflare/statistics.mjs';
import {storedTopicSummary} from '../cloudflare/generated/topics.mjs';

const folder=fs.mkdtempSync(path.join(os.tmpdir(),'grammar-statistics-')),db=path.join(folder,'fixture.sqlite');
function sql(statement,values=[]) {
  const source='import sqlite3,json,sys\nc=sqlite3.connect(sys.argv[1]);c.row_factory=sqlite3.Row\nr=c.execute(sys.argv[2],json.loads(sys.argv[3]));print(json.dumps([dict(x) for x in r.fetchall()]));c.commit()';
  const run=spawnSync('python3',['-c',source,db,statement,JSON.stringify(values)],{encoding:'utf8'});
  assert.equal(run.status,0,run.stderr);return JSON.parse(run.stdout);
}
const all=async(_db,statement,values)=>sql(statement,values);
let repaired=0;
async function materialize(_db,ids) {
  for(const id of ids){const row=sql('SELECT answers FROM practice WHERE id=?',[id])[0];sql('UPDATE practice SET topic_summary=? WHERE id=?',[JSON.stringify(storedTopicSummary(JSON.parse(row.answers))),id]);repaired++;}
}
const item={id:'sample',practice_tenses:['present_simple'],blanks:[{tense_or_construction:'present_simple'}]};
const answer=(given,correct=true,verified=true)=>({item:given,fields:[{correct,verified,submitted:'fixture'}]});
function add(id,owner,answers,completed,{assessment=false,legacy=false}={}) {
 const items=answers.map(a=>a.item);if(assessment)items[0]={...items[0],assessment_id:'tenses-1'};
 sql('INSERT INTO practice VALUES(?,?,?,?,?,?)',[id,owner,JSON.stringify(items),JSON.stringify(answers),completed,legacy?null:JSON.stringify(storedTopicSummary(answers))]);
}
try {
 sql('CREATE TABLE practice(id TEXT PRIMARY KEY,user_id TEXT,items TEXT,answers TEXT,completed REAL,topic_summary TEXT)');
 for(let n=0;n<30;n++)add('old-'+n,'anna',[answer(item,n%2===0)],1000+n);
 const multi={id:'multi',practice_tenses:['present_simple','present_continuous']};
 add('multi','anna',[answer(multi)],2000);
 const translation={id:'pv2-manual',topic:'passive',type:'translation_ru_en',practice_tenses:['pv_past_simple'],blanks:[{tense_or_construction:'pv_past_simple'}]};
 add('manual','anna',[answer(translation,false,false)],5000);
 const comparison={id:'cmp-test',practice_tenses:['cmp_forms'],blanks:[{tense_or_construction:'cmp_forms'}]};
 add('mixed-legacy','anna',[answer(item),answer(comparison,false)],3000,{legacy:true});
 add('assessment','anna',Array.from({length:10},(_,n)=>answer(item,n<8)),4000,{assessment:true});
 add('unfinished','anna',[answer(item)],null);
 add('another-owner','boris',[answer(item)],9999);
 const stats=await statistics(db,'anna',{all,materialize});
 assert.equal(stats.scope,'completed');assert.equal(repaired,1,'Legacy summary repaired independent of loaded history');
 assert.equal(stats.kinds.practice.sessions,33,'All completed works beyond a history page');
 assert.equal(stats.kinds.practice.checked,33);assert.equal(stats.kinds.practice.correct,17);assert.equal(stats.kinds.practice.pending,1);
 assert.equal(stats.kinds.practice.lastWork,new Date(5000*1000).toISOString());
 const tenses=stats.kinds.practice.sections.find(s=>s.id==='tenses');
 assert.equal(tenses.checked,32);assert.equal(tenses.correct,17);
 assert.equal(tenses.topics.find(t=>t.id==='present_simple').checked,32);
 assert.equal(tenses.topics.find(t=>t.id==='present_continuous').checked,1);
 assert.equal(tenses.lastWork,new Date(3000*1000).toISOString());
 assert.equal(stats.kinds.practice.sections.find(s=>s.id==='comparison').checked,1,'Mixed legacy snapshots classified per answer');
 assert.equal(stats.kinds.practice.sections.find(s=>s.id==='passive').pending,1);
 assert.equal(stats.kinds.assessment.sessions,1);assert.equal(stats.kinds.assessment.checked,10);assert.equal(stats.kinds.assessment.correct,8);
 const empty=await statistics(db,'new',{all,materialize});
 assert(empty.kinds.practice.sections.every(s=>s.checked===0&&s.topics.length===0&&s.lastWork===null));
 assert.equal(empty.kinds.assessment.sessions,0);
 const revised=answer(translation,true,true);
 sql('UPDATE practice SET answers=?,topic_summary=? WHERE id=?',[JSON.stringify([revised]),JSON.stringify(storedTopicSummary([revised])),'manual']);
 const after=await statistics(db,'anna',{all,materialize});
 assert.equal(after.kinds.practice.pending,0);assert.equal(after.kinds.practice.checked,34);assert.equal(after.kinds.practice.correct,18);
 assert.equal(repaired,1,'Warm summary requests do not rematerialize history');

 const container={innerHTML:'',querySelectorAll(){return []},querySelector(){return null}};
 const ctx={module:{exports:{}},location:{hash:'#results'},document:{querySelector(){return {}},getElementById(){return container}},localStorage:{getItem(){return null}}};
 vm.createContext(ctx);
 for(const file of ['app.js','practice-report.js'])vm.runInContext(fs.readFileSync(new URL('../'+file,import.meta.url),'utf8').replace(/initialise\(\);/,''),ctx);
 let resolve;ctx.accountRequest=()=>new Promise(r=>resolve=r);
 vm.runInContext("account.user={id:'anna',role:'student'};initialiseResultTopics([],true)",ctx);
 resolve(empty);await new Promise(r=>setImmediate(r));
 assert.equal((container.innerHTML.match(/<details class="statistics-section"/g)||[]).length,5);
 assert(!container.innerHTML.includes('data-statistics-section="tenses" open'));
 assert(!container.innerHTML.includes('data-topic-id='),'A new learner has four groups, no empty topic cells');
 assert(container.innerHTML.includes('Открыть задания и практику'));
 const previous=container.innerHTML;ctx.appendResultTopics([{id:'next-page',topic_summary:{present_simple:[99,99]}}],false);
 assert.equal(container.innerHTML,previous,'History pagination cannot mutate the independent statistics');
 vm.runInContext('initialiseResultTopics([],false)',ctx);const late=resolve;
 vm.runInContext("account.user={id:'boris',role:'student'}",ctx);late(stats);await new Promise(r=>setImmediate(r));
 assert(!container.innerHTML.includes('Проверено ответов: 33'),'Late owner response ignored');
 console.log('Statistics: full history, exact field denominators, separate assessments, pending/manual decisions, legacy repair, mixed sections, four compact empty groups, pagination independence and owner guards passed.');
} finally {fs.rmSync(folder,{recursive:true,force:true});}
