import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const collective = /\b(team|family|staff|government|company|class|committee|council|audience|crew|jury|band|group|board)\s*$/i;
const adverbs = /\b(?:already|just|still|also|never|often|always|usually|finally|currently|recently|certainly|probably|really|now|then)\b\s*/gi;
// Conservative local syntax: do not guess across finite verbs, relative clauses or prepositions.
function legacySubjectBefore(prefix) {
 const text=prefix.replace(adverbs,'').trim();
 if(/\b(people|children|men|women)\s+who$/i.test(text))return 'plural';
 if(/\bseries$/i.test(text)||/\bthe number of[^.!?;]*?(?:\([^)]*\)|\{\{[^}]*\}\})?[^.!?;]*$/i.test(text))return 'singular';
 if(/\b(children|men|women|teeth|feet|mice|geese|people|police)\s*$/i.test(text))return 'plural';
 if(/\b(and|or)\s*$/i.test(text)){
  const marker=[...text.matchAll(/\{\{\d+:[^}]+\}\}|\([^()]*\)/g)].at(-1);
  if(marker&&!/[.!?;]/.test(text.slice(marker.index)))return legacySubjectBefore(text.slice(0,marker.index));
  return null;
 }
 if(collective.test(text))return 'collective';
 const m=text.match(/(?:^|[\s,;.!?])((?:I|you|he|she|it|we|they)|[A-Za-z]+)\s*$/i);
 if(!m)return null;
 const word=m[1], lower=word.toLowerCase();
 if(['i','you','he','she','it','we','they'].includes(lower))return lower;
 if(/\b(?:and|or)\s+[A-Z][a-z]+$/.test(text))return 'plural';
 if(/\b(?:of|to|for|with|in|on|at|from|by|than|as)\s+(?:\w+\s+){0,3}\w+$/i.test(text))return null;
 if(/(?:ss|us|is|news)$/.test(lower))return null;
 if(/^(James|Charles|Chris|Thomas|Lucas|Lewis|Frances)$/i.test(word))return 'singular';
 if(/s$/.test(lower))return 'plural';
 if(/^[A-Z][a-z]+$/.test(word)&&!['This','That','There','When','Where','What','Who','If','By','So'].includes(word))return 'singular';
 if(/\b(?:the|a|an|my|your|his|her|our|their|this|that)\s+(?:[a-z]+\s+){0,2}[a-z]+$/i.test(text))return 'singular';
 return null;
}
export function disagrees(subject,answer,prefix='') {
 if(!subject||subject==='collective')return false;
 // Irrealis were is grammatical with singular subjects in conditional clauses.
 const irrealis=/\b(if|wish|as though|as if)\b/i.test(prefix);
 const first=String(answer).toLowerCase().replace(/’/g,"'").replace(/^(hasn't|haven't|isn't|aren't|wasn't|weren't|doesn't|don't)\b/,w=>w.split("n'")[0]).match(/^[a-z]+/)?.[0];
 const allowed={i:['am','have','was','do'],you:['are','have','were','do'],he:['is','has','was','does'],she:['is','has','was','does'],it:['is','has','was','does'],we:['are','have','were','do'],they:['are','have','were','do'],singular:['is','has','was','does'],plural:['are','have','were','do']};
 return ['am','is','are','has','have','was','were','do','does'].includes(first)&&!allowed[subject].includes(first)&&!(first==='were'&&irrealis);
}

const collectives=/\b(?:United|club|airline|coalition|commission|inquiry|community|delegation|firm|orchestra|crowd|opposition|defence|defense|coastguard|charity|department|ministry|union|hospital|bank|tribunal|court|press|public|media|fleet|school|museum|institute|festival|army|supermarket chain|cast)\s*$/i;
export function subjectBefore(prefix){
 const text=prefix.replace(/\b(?:already|just|still|also|never|often|always|usually|finally|currently|recently|certainly|probably|really|now|then|painstakingly|constantly|forever|increasingly|hardly|no longer|almost)\b\s*/gi,'').trim();
 if(/\b(?:someone|somebody|anyone|anybody|everyone|everybody|nobody|no one|nothing|something|anything|everything|witness|witness's|news|physics|mathematics|maths|the United States|Wales)\s*$/i.test(text))return 'singular';
 if(/\b(?:(?:this|that|a|one) species)\s*$/i.test(text))return 'singular';
 if(/\b(?:(?:these|those|many|several|two|three|four|five) species)\s*$/i.test(text))return 'plural';
 if(/\bspecies\s*$/i.test(text))return null;
 if(/\b(?:James|Charles|Chris|Thomas|Lucas|Lewis|Frances)\s*$/.test(text))return 'singular';
 if(collectives.test(text))return 'collective';
 const last=[...text.matchAll(/\{\{\d+:[^}]+}}|\([^()]*\)/g)].at(-1);
 if(last){const tail=text.slice(last.index+last[0].length);if(!/[.!?;]/.test(tail)&&/\band\s+[A-Z][a-z]+$/.test(tail))return legacySubjectBefore(tail.split(/\band\s+/).at(-1));if(!/[.!?;]/.test(tail)&&/(?:,|\band|\bor)\s*$/.test(tail))return subjectBefore(text.slice(0,last.index));}
 return legacySubjectBefore(text);
}
function questionSubject(marker){
 const cue=marker.replace(/^\{\{\d+:|}}$|^\(|\)$/g,'');const parts=cue.split('/').map(s=>s.trim());if(parts.length<2)return null;
 const candidate=parts[0];
 const explicit=/^(?:I|you|he|she|it|we|they|anyone|anybody|everyone|everybody|someone|somebody|nobody|no one|people|children|men|women|police|(?:the|my|your|his|her|our|their|this|that|these|those) .+)$/i;
 const proper=/^[A-Z][a-z]+(?: [A-Z][a-z]+)*$/;
 const pluralNoun=/^[a-z]+s$/;
 const adverb=/^(?:always|sometimes|perhaps|not|to|already|just|still|never|usually|often|ever|constantly|forever|hardly|no longer|almost|probably|certainly|so far|painstakingly|increasingly|rarely|seldom|fast|all|once|only|doubtless)$/i;
 if(adverb.test(candidate)||(/ly$/i.test(candidate)&&!proper.test(candidate)))return null;
 if(!explicit.test(candidate)&&!proper.test(candidate)&&!pluralNoun.test(candidate))return null;
 if(candidate==='there')return null;
 return candidate;
}
export function checkItems(items){const findings=[];
 for(const i of items){const markers=[...i.prompt.matchAll(/\{\{\d+:[^}]+}}|\([^()]*\)/g)];if(markers.length!==(i.blanks||[]).length)continue;
 for(const [k,b] of (i.blanks||[]).entries()){
  const prefix=i.prompt.slice(0,markers[k].index),q=questionSubject(markers[k][0]),subject=q?subjectBefore(q):subjectBefore(prefix);
  for(const answer of new Set([b.answer,...b.accepted_answers||[]])){
   const a=answer.toLowerCase().replace(/’/g,"'");const scoped=prefix.slice(Math.max(prefix.lastIndexOf(','),prefix.lastIndexOf('.'),prefix.lastIndexOf(';'))+1);
   
   const cue=markers[k][0].toLowerCase();
   if (/\b(?:not|never|no longer)\b/.test(cue) && !/\b(?:not|never|no longer|cannot)\b|n't/.test(a)) findings.push({id:i.id,blank:k+1,answer,kind:'negative_polarity_missing',prefix});
   if(disagrees(subject,answer,scoped))findings.push({id:i.id,blank:k+1,subject,answer,kind:'agreement',prefix});
   if(q&&!a.includes(q.toLowerCase()))findings.push({id:i.id,blank:k+1,subject:q,answer,kind:'question_subject_missing',prefix});
   if(/\b(?:shrinked|rewrited|misreaded|transfered|begining|patroling|buyed|teached|catched|choosed|knowed|taked|drawed|swimmed|feeled|meaned|understanded)\b/i.test(answer))findings.push({id:i.id,blank:k+1,answer,kind:'known_bad_morphology',prefix});
  }
 }
 }return findings;
}

// The subject/verb heuristic belongs to verb-form banks; the Nouns bank deliberately trains noun-verb agreement (e.g. "Economics is") and has its own test.
export function loadBank(root=new URL('../',import.meta.url)) {
 return fs.readdirSync(new URL('data/exercises/',root)).filter(f=>/^part-.*\.json$/.test(f)).flatMap(f=>JSON.parse(fs.readFileSync(new URL('data/exercises/'+f,root),'utf8'))).filter(i=>i.topic!=='nouns');
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const items=loadBank(),findings=checkItems(items);
 for(const f of findings)console.error(JSON.stringify(f));
 console.log(`Agreement: ${items.length} exercises, ${findings.length} findings.`);
 if(findings.length)process.exitCode=1;
}
