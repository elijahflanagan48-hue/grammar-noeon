import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';

const root = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(import.meta.url);
const {evaluate, fieldResults, answerForms, markdownHeadings, ruleLink} = require('../app.js');
import {assertBankVersion} from './bank-versions.mjs';
const prefix = /^\s*\d+\s*[.)]\s+/;
const section = item => ['passive','modals','reported'].includes(item.topic) ? item.topic : item.id.startsWith('cmp-') ? 'comparison' : 'tenses';
const countBy = (items, key) => Object.fromEntries([...new Set(items.map(key))].sort().map(value => [value,items.filter(item => key(item) === value).length]));
const slots = item => item.blanks?.length || 1;
const bareRule = 'content/tenses/05-contrasts-and-pitfalls.md';

// Canonical sorting makes a second run stable; Fisher-Yates is seeded only by id.
export function shuffleOptions(item) {
  if (!item.options) return;
  let seed = 2166136261;
  for (const char of item.id) seed = Math.imul(seed ^ char.charCodeAt(0),16777619) >>> 0;
  const random = () => { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return (seed >>> 0) / 4294967296; };
  const order = item.options.map((text,index) => ({text,index})).sort((a,b) => a.text < b.text ? -1 : a.text > b.text ? 1 : a.index-b.index);
  for (let i=order.length-1;i>0;i--) { const j=Math.floor(random()*(i+1)); [order[i],order[j]]=[order[j],order[i]]; }
  const remap = index => order.findIndex(option => option.index === index);
  item.correct_option_index = remap(item.correct_option_index);
  if (item.accepted_option_indices) item.accepted_option_indices = item.accepted_option_indices.map(remap).sort((a,b)=>a-b);
  item.options = order.map(option => option.text);
}
export function recount(index, parts) {
  const all=parts.flatMap(part=>part.items);
  return {...index, content_version:index.content_versions.tenses, total_items:all.length, answer_slots:all.reduce((n,item)=>n+slots(item),0),
    levels:countBy(all,item=>item.cefr_estimate||'unrated'), levels3:countBy(all,item=>item.level), types:countBy(all,item=>item.type), sections:countBy(all,section),
    content_versions:Object.fromEntries([...new Set(all.map(section))].map(key=>[key,index.content_versions[key]])),
    parts:parts.map(part=>({...index.parts.find(p=>p.file===part.file),file:part.file,count:part.items.length,levels:countBy(part.items,item=>item.cefr_estimate||'unrated'),levels3:countBy(part.items,item=>item.level),types:countBy(part.items,item=>item.type)}))};
}
export function validateBank(parts, index) {
  const ids=new Set(), headings=new Map(); let checks=0, variants=0;
  for (const {items} of parts) for (const item of items) {
    assert(!ids.has(item.id),`Duplicate id: ${item.id}`); ids.add(item.id);
    for(const blank of item.blanks||[]) {assert(!ids.has(blank.id),`Duplicate blank id: ${blank.id}`);ids.add(blank.id);}
    assertBankVersion(item, index);
    for (const text of [item.prompt,item.answer_text,...(item.options||[])]) assert(!prefix.test(text||''),`${item.id}: source numbering remains`);
    if (item.options) {
      assert(Number.isInteger(item.correct_option_index)&&item.correct_option_index>=0&&item.correct_option_index<item.options.length,`${item.id}: invalid canonical index`);
      if (typeof item.answer === 'string') {
        const correct=item.options[item.correct_option_index];
        const expected=item.type==='multiple_choice'&&(item.prompt.match(/___/g)||[]).length===1?item.prompt.replace('___',correct):correct;
        assert([correct,expected].includes(item.answer.replace(prefix,'')),`${item.id}: answer text differs from correct option/frame`);
      }
      for (const n of item.accepted_option_indices||[]) assert(Number.isInteger(n)&&n>=0&&n<item.options.length,`${item.id}: accepted index`);
    }
    if(item.type==='multiple_choice'&&item.prompt==='Выберите грамматически корректное предложение.') assert.equal(item.summary,item.options[item.correct_option_index],`${item.id}: missing or wrong summary`);
    const official=item.options ? item.correct_option_index : item.blanks?.length ? item.blanks.map(blank=>blank.answer) : item.answer;
    assert.equal(evaluate(item,official),item.grading_mode!=='teacher',`${item.id}: official answer rejected`);
    assert(fieldResults(item,official).every(field=>item.grading_mode==='teacher'?!field.verified&&!field.correct:field.correct),`${item.id}: official field rejected`); checks++;
    if(item.blanks) item.blanks.forEach((blank,i)=>{for(const value of blank.accepted_answers||[]){const values=official.slice();values[i]=value;assert.equal(evaluate(item,values),item.grading_mode!=='teacher',`${item.id}/${i+1}: accepted answer rejected`);variants++;}});
    if (item.type==='context_cloze') {
      if(item.topic==='modals') assert.equal((item.prompt.match(/___/g)||[]).length,item.blanks.length,`${item.id}: modal cloze count`);
      else {
        const markers=[...item.prompt.matchAll(/\{\{(\d+):[^}]*}}/g)];
        assert.equal(markers.length,item.blanks.length,`${item.id}: cloze count`);
        assert.deepEqual(markers.map(m=>Number(m[1])).sort((a,b)=>a-b),item.blanks.map((_,i)=>i+1),`${item.id}: cloze indices`);
      }
    }
    if (item.type==='open_brackets') assert.equal([...item.prompt.matchAll(/\([^()]*\)/g)].length,item.blanks.length,`${item.id}: bracket count`);
    const refs=[...(item.rule_refs||[]),...(item.blanks||[]).flatMap(blank=>blank.rule_refs||[])];
    assert(refs.length,`${item.id}: missing rules`);
    for (const ref of refs) {
      const route=ruleLink(ref).split('/'); const file=ref.split('#')[0].split('/').at(-1);
      assert(ref.includes('#'),`${item.id}: rule without anchor ${ref}`);
      if(!headings.has(file)){const md=fs.readFileSync(path.join(root,'content/theory',file),'utf8');headings.set(file,new Set([...markdownHeadings(md).map(h=>h.id),...Array.from(md.matchAll(/\bid="([^"]+)"/g),m=>m[1])]));}
      assert(headings.get(file).has(decodeURIComponent(route.slice(2).join('/'))),`${item.id}: unknown heading ${ref} -> ${route.join('/')}`);
    }
  }
  assert.deepEqual(index,recount(index,parts),'Manifest counts or content versions out of date');
  return {officialAnswers:checks,acceptedVariants:variants};
}
function manualCandidates(items) {
  const candidates=[];
  for(const item of items) for(const [i,blank] of (item.blanks||[]).entries()) {
    const canonical=new Set(answerForms(blank.answer));
    for(const answer of blank.accepted_answers||[]) {
      if(answerForms(answer).some(form=>canonical.has(form))) continue;
      const marker = item.type === 'context_cloze' ? `{{${i+1}:` : null;
      const bracket = item.type === 'open_brackets' ? [...item.prompt.matchAll(/\([^()]*\)/g)][i] : null;
      const position = marker ? item.prompt.indexOf(marker) : bracket?.index || 0;
      const located = marker || bracket;
      const boundary = located ? item.prompt.lastIndexOf('. ',position) : -1;
      const start = boundary<0 ? 0 : boundary+2;
      const end = located ? item.prompt.indexOf('. ',position) : -1;
      const context = located ? item.prompt.slice(Math.max(0,start),end<0?undefined:end+1) : item.prompt;
      const p=context.toLowerCase(), a=answer.toLowerCase(), c=blank.answer.toLowerCase();
      const reasons=[];
      let priority = 3;
      if (/\bit\s*\{\{\d+:/.test(p) && /^(have|are|were)\b/.test(a)) {priority=1;reasons.push('Согласование с явным It: проверить множественную форму вспомогательного глагола');}
      if (/\bby\b/.test(p) && /\bwill have\b/.test(c) && !/\bwill(?:\s+\w+){0,2}\s+have\b/.test(a)) {priority=Math.min(priority,2);reasons.push('Срок с by: Perfect заменён формой без явного предшествования');}
      if(/published schedule|timetable|according to.*schedule/.test(p)&&/\bwill\b/.test(a)&&! /\bwill\b/.test(c)) {priority=Math.min(priority,2);reasons.push('Расписание: will вместо Present Simple; проверить целевой учебный контраст');}
      if(/\bnot\b|n't/.test(a)!==/\bnot\b|n't/.test(c)) reasons.push('Меняется отрицание');
      if(/\b(have|has|had)\b.*\bbeen\b/.test(c)!==/\b(have|has|had)\b.*\bbeen\b/.test(a)) reasons.push('Perfect Continuous / другая форма: проверить длительность и завершённость');
      if(/\b(will|would|can|could|may|might|must|should)\b/.test(c)!==/\b(will|would|can|could|may|might|must|should)\b/.test(a)) reasons.push('Меняется модальность или способ выражения будущего');
      if(/\b(have|has|had)\b/.test(c)!==/\b(have|has|had)\b/.test(a)) reasons.push('Perfect / другая форма: проверить точку отсчёта');
      if(/\b(am|is|are|was|were)\b/.test(c)!==/\b(am|is|are|was|were)\b/.test(a)) reasons.push('Simple / Continuous либо другая временная рамка');
      if(!reasons.length) reasons.push('Иной лексический или грамматический вариант: проверить контекст вручную');
      candidates.push({id:item.id,blank:i+1,prompt:item.prompt,canonical:blank.answer,accepted:answer,context,priority,reasons});
    }
  }
  return candidates.sort((a,b)=>a.priority-b.priority || a.id.localeCompare(b.id) || a.blank-b.blank);
}
export function cleanBank({checkOnly=false}={}) {
  const original=JSON.parse(fs.readFileSync(path.join(root,'data/exercises/index.json'),'utf8'));
  const parts=original.parts.map(part=>({file:part.file,items:JSON.parse(fs.readFileSync(path.join(root,part.file),'utf8'))}));
  const stats={prompt:0,answer_text:0,optionItems:0,optionTexts:0,summaries:0,shuffled:0,ruleItems:0};
  if(!checkOnly) for(const {items} of parts) for(const item of items) {
    for(const key of ['prompt','answer_text']) if(prefix.test(item[key]||'')){item[key]=item[key].replace(prefix,'');stats[key]++;}
    if(item.options) {
      let changed=false;
      item.options=item.options.map(text=>{if(!prefix.test(text))return text;changed=true;stats.optionTexts++;return text.replace(prefix,'');});
      if(changed)stats.optionItems++;
      if(item.type==='multiple_choice'&&item.prompt==='Выберите грамматически корректное предложение.') {const label=item.options[item.correct_option_index];if(item.summary!==label){item.summary=label;stats.summaries++;}}
      const before=JSON.stringify(item.options);shuffleOptions(item);if(before!==JSON.stringify(item.options))stats.shuffled++;
    }
    if(item.rule_refs?.includes(bareRule)) {
      const anchor=item.id==='new-translation-018'?'2-perfect-и-past-до-сейчас-или-законченное-прошлое':item.id==='new-translation-020'?'19-как-разбирать-неоднозначное-предложение':null;
      assert(anchor,`No reviewed anchor for ${item.id}`);
      item.rule_refs=item.rule_refs.map(ref=>ref===bareRule?`${bareRule}#${anchor}`:ref);
      if(item.id==='new-translation-020')item.rule_refs.push('content/tenses/03-past.md#3-повторяющиеся-действия-и-привычки-в-прошлом');
      stats.ruleItems++;
    }
    // Editorial cleanup preserves the existing per-item version.
  }
  const index=checkOnly?original:recount(original,parts);
  const validation=validateBank(parts,index);
  const all=parts.flatMap(part=>part.items);
  const distribution=countBy(all.filter(item=>item.options?.length===4),item=>item.correct_option_index+1);
  assert([1,2,3,4].every(n=>distribution[n]>0),'Four-option keys must cover all four positions');
  const candidates=manualCandidates(all);
  const report={versions:original.content_versions,checkOnly,changes:stats,validation,totalItems:index.total_items,answerSlots:index.answer_slots,fourOptionPositions:distribution,manualReview:candidates};
  if(!checkOnly) {
    for(const part of parts)fs.writeFileSync(path.join(root,part.file),JSON.stringify(part.items,null,2)+'\n');
    fs.writeFileSync(path.join(root,'data/exercises/index.json'),JSON.stringify(index,null,2)+'\n');
    const dest=path.join(root,'docs/reports/BANK-CLEAN-2026-10-29');fs.mkdirSync(dest,{recursive:true});
    fs.writeFileSync(path.join(dest,'report.json'),JSON.stringify(report,null,2)+'\n');
    const cell=text=>String(text).replaceAll('|','\\|').replaceAll('\n',' ');
    fs.writeFileSync(path.join(dest,'MANUAL-REVIEW.md'),'# Кандидаты на ручную проверку\n\nДанные accepted_answers не изменены. Список намеренно полный: все варианты, не эквивалентные официальному после нормализации app.js. Это кандидаты, а не список доказанных ошибок; допустимое изменение смыслового акцента само по себе не ошибка. Показано предложение с соответствующим полем; при решении сверяйтесь также с полным заданием. Приоритет 1 — явное согласование; 2 — срок или расписание и учебный контраст; 3 — остальные альтернативы.\n\n| Приоритет | ID / поле | Официальный | Допустимый | Причина | Контекст |\n|---|---|---|---|---|---|\n'+candidates.map(c=>`| ${c.priority} | ${c.id} / ${c.blank} | ${cell(c.canonical)} | ${cell(c.accepted)} | ${cell(c.reasons.join('; '))} | ${cell(c.context)} |`).join('\n')+'\n');
  }
  console.log(JSON.stringify({...report,manualReview:undefined,manualReviewCount:candidates.length},null,2));
  return report;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try {cleanBank({checkOnly:process.argv.includes('--check')});}catch(error){console.error('Bank validation failed:',error.message);process.exitCode=1;}
}
