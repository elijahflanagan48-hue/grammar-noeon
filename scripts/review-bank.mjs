// Reproducible mechanical audit. Grammar/meaning judgements remain in the review report.
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {grade} from '../cloudflare/generated/checker.mjs';
import {checkItems} from './agreement_check.mjs';
const require=createRequire(import.meta.url),{evaluate}=require('../app.js');
const root=fileURLToPath(new URL('../',import.meta.url));
export function auditBank(directory=root, manifestOverride=null){
 const read=file=>JSON.parse(fs.readFileSync(path.join(directory,file),'utf8'));
 const manifest=manifestOverride||read('data/exercises/index.json'),bank=manifest.parts.flatMap(p=>{if(!/^data\/exercises\/part-\d{2}\.json$/.test(p.file))throw Error('Unexpected part path');return read(p.file);});
 const structural=[],duplicates=[],ids=new Set(),prompts=new Map();let accepted=0,wrongPerson=0,invalid=0;
 const acceptedFailures=[],invalidAccepted=[],personAccepted=[],tenseAccepted=[];
 const lex=new Map();
 for(const i of bank)for(const b of i.blanks||[]){const key=b.base_verb||'';if(!lex.has(key))lex.set(key,new Set());for(const a of b.accepted_answers)lex.get(key).add(a);}
 const positive=value=>{const out=new Set([value]);const pairs={'will not':"won't",'shall not':"shan't",'has not':"hasn't",'have not':"haven't",'had not':"hadn't",'is not':"isn't",'are not':"aren't",'was not':"wasn't",'were not':"weren't",'do not':"don't",'does not':"doesn't",'did not':"didn't",'I will':"I'll",'we will':"we'll",'you will':"you'll",'I am':"I'm",'you are':"you're",'will have':"will've"};for(const[a,b]of Object.entries(pairs))if(new RegExp('\\b'+a+'\\b','i').test(value))out.add(value.replace(new RegExp('\\b'+a+'\\b','i'),b));return out;};
 for(const i of bank){
  if(ids.has(i.id))structural.push({id:i.id,kind:'duplicate_id'});ids.add(i.id);
  const group=prompts.get(i.prompt)||[];group.push(i.id);prompts.set(i.prompt,group);
  if(i.prompt!==i.prompt.trim()||/ {2,}/.test(i.prompt))structural.push({id:i.id,kind:'extra_spaces'});
  if(!i.explanation_ru?.trim())structural.push({id:i.id,kind:'empty_explanation'});
  if(!['basic','medium','advanced'].includes(i.level))structural.push({id:i.id,kind:'level'});
  if((i.prompt.match(/\(/g)||[]).length!==(i.prompt.match(/\)/g)||[]).length)structural.push({id:i.id,kind:'unpaired_brackets'});
  const markers=[...i.prompt.matchAll(i.type==='context_cloze'?/\{\{\d+:[^}]+}}/g:/\([^()]*\)/g)];
  if(i.blanks&&markers.length!==i.blanks.length)structural.push({id:i.id,kind:'blank_count'});
  const canonical=i.options?i.correct_option_index:i.blanks.map(b=>b.answer);
  if(!grade(i,canonical).correct||!evaluate(i,canonical))acceptedFailures.push({id:i.id,kind:'official'});
  if(i.options){for(let n=0;n<i.options.length;n++){if(n===i.correct_option_index)continue;invalid++;if(grade(i,n).correct)invalidAccepted.push({id:i.id,option:n});}continue;}
  for(const[k,b]of i.blanks.entries()){
   if(!b.accepted_answers.includes(b.answer))structural.push({id:i.id,field:k+1,kind:'canonical_omitted'});
   for(const a of b.accepted_answers)for(const v of positive(a)){const s=canonical.slice();s[k]=v;accepted++;if(!grade(i,s).fields[k].correct||!evaluate(i,s))acceptedFailures.push({id:i.id,field:k+1,answer:v});}
   for(const v of ['__invalid_answer__','this is not the supplied verb']){const s=canonical.slice();s[k]=v;invalid++;if(grade(i,s).fields[k].correct)invalidAccepted.push({id:i.id,field:k+1,answer:v});}
   const swap={has:'have',have:'has',am:'is',is:'are',are:'is',was:'were',were:'was',does:'do',do:'does'},first=b.answer.toLowerCase().split(' ')[0];
   if(swap[first]){const v=b.answer.replace(/^\S+/,swap[first]),clone=structuredClone(i);clone.blanks[k].answer=v;clone.blanks[k].accepted_answers=[v];if(checkItems([clone]).some(f=>f.blank===k+1&&f.kind==='agreement')){wrongPerson++;const s=canonical.slice();s[k]=v;if(grade(i,s).fields[k].correct)personAccepted.push({id:i.id,field:k+1,answer:v});}}
   const candidates=[...(lex.get(b.base_verb||'')||[])].filter(a=>a!==b.answer&&a.split(' ')[0].toLowerCase()!==first&&/^(?:had|has|have|will|was|were|is|are|am|did)\b/i.test(a)).slice(0,12);
   for(const v of candidates){const s=canonical.slice();s[k]=v;if(grade(i,s).fields[k].correct)tenseAccepted.push({id:i.id,field:k+1,prompt:i.prompt,official:b.answer,replacement:v,listed:b.accepted_answers.includes(v),status:'Candidate alternative, not automatically an error; see per-field manual review.'});}
  }
 }
 for(const[prompt,list]of prompts)if(list.length>1)duplicates.push({prompt,ids:list});
 const sha=[];if(fs.existsSync(path.join(directory,'SHA256.json')))for(const[file,digest]of Object.entries(read('SHA256.json'))){const resolved=path.resolve(directory,file);if(!resolved.startsWith(path.resolve(directory)+path.sep))throw Error('Unsafe SHA path');const actual=createHash('sha256').update(fs.readFileSync(resolved)).digest('hex');sha.push({file,valid:actual===digest});}
 const fields=bank.reduce((n,i)=>n+(i.blanks?.length||1),0);if(bank.length!==manifest.total_items||fields!==manifest.answer_slots)structural.push({kind:'manifest_counts'});
 return {summary:{records:bank.length,fields,parts:manifest.parts.length,accepted_submissions_and_contractions:accepted,accepted_failures:acceptedFailures,invalid_submissions:invalid,invalid_accepted:invalidAccepted,definite_person_mutations:wrongPerson,person_mutations_accepted:personAccepted,tense_candidates_accepted:tenseAccepted.length,structural_findings:structural,duplicate_prompts:duplicates,enhanced_grammar_findings:checkItems(bank),sha_checked:sha.length,sha_failures:sha.filter(x=>!x.valid)},tenseAccepted};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const directory=path.resolve(process.argv[2]||root),output=path.resolve(process.argv[3]||path.join(root,'docs/review/V8-2026-10-30/mechanical-current'));
 const result=auditBank(directory);fs.mkdirSync(output,{recursive:true});fs.writeFileSync(path.join(output,'summary.json'),JSON.stringify(result.summary,null,2)+'\n');fs.writeFileSync(path.join(output,'accepted-tense-candidates.json'),JSON.stringify(result.tenseAccepted,null,2)+'\n');console.log(JSON.stringify(result.summary,null,2));
 if(result.summary.structural_findings.length||result.summary.accepted_failures.length||result.summary.invalid_accepted.length||result.summary.person_mutations_accepted.length||result.summary.sha_failures.length||result.summary.enhanced_grammar_findings.length)process.exitCode=1;
}
