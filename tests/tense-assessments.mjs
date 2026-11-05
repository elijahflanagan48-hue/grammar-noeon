import fs from 'node:fs';
import assert from 'node:assert/strict';
import {grade} from '../cloudflare/generated/checker.mjs';
const tests=JSON.parse(fs.readFileSync('content/assessments/tenses.json','utf8'));
const slug=s=>s.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu,'').trim().replace(/\s+/g,'-');
let variants=0;
for(const test of tests)for(const item of test.items){
 assert(!/\bshall\b/i.test(JSON.stringify(item)));
 for(const ref of item.rule_refs){const[file,anchor]=ref.split('#');const md=fs.readFileSync('content/theory/'+file.split('/').at(-1),'utf8');assert(md.split('\n').filter(l=>/^#+ /.test(l)).some(l=>slug(l.replace(/^#+ /,''))===anchor),ref);}
 if(item.blanks){
  assert.equal(item.blanks.length,1);assert(item.blanks[0].accepted_answers.length<=2);
  for(const a of item.blanks[0].accepted_answers){assert(grade(item,[a]).correct,item.id);variants++;}
  assert(!grade(item,['not a verb form']).correct,item.id);
 }else {assert.equal(item.options.length,4);assert.equal(new Set(item.options).size,4);}
}
console.log('Tenses assessments: all rule anchors, bounded fields, accepted variants, no shall, garbage negatives and four distinct choices passed; '+variants+' gap keys.');
