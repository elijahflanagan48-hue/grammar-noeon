"""Short instructions, contextual constructions, stable IDs and historical snapshots."""
from pathlib import Path
import json,re,copy,csv
R=Path(__file__).resolve().parents[1];D=R/'docs/review/ADJECTIVES-CLARITY-2026-11-01';V='comparison-2026-11-01.5'
read=lambda p:json.loads(p.read_text());write=lambda p,x:p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
old=read(D/'baseline-bank.json');bank=copy.deepcopy(old);by={i['id']:i for i in bank};SLOT=re.compile(r'\(([^)]+)\)')
previous={i['id']:i for i in read(R/'docs/review/ADJECTIVES-MIXED-2026-11-01/before-records.json')}
counts={'hints_removed':0,'short_keywords':0,'long_correlatives':0,'rewrites':0,'progressive_fixes':0}
remove_cues={'AS','AS … AS','NOT AS','NOT AS … AS','NOT SO','NOT SO … AS','THAN','THE','ENOUGH','TOO','TWICE AS … AS','HALF AS … AS','THREE TIMES AS … AS','FOUR TIMES AS … AS','ONE THIRD AS … AS'}
for i in bank:
 if i.get('topic')!='comparison'or i['type']!='open_brackets':continue
 prompt=i['prompt'];cues=[]
 # Separate task instructions from the English context. No parsing is done in the learner renderer.
 while True:
  m=re.match(r'^Gap (\d+): include ([^.]+)\.\s*',prompt)
  if not m:break
  n,words=int(m[1]),m[2];prompt=prompt[m.end():]
  if words in remove_cues:counts['hints_removed']+=1
  else:
   words=re.sub(r' AS$','',words.replace(' … AS','')).replace('BY FAR THE','BY FAR').replace('EASILY THE','EASILY')
   cues.append((n,words))
 # Replace long whole-clause clozes by one short comparative phrase and a visible parallel clause.
 if ', the 'in i['blanks'][0]['answer'] and prompt.startswith('Use THE …, THE … in the gap.'):
  instruction='Use THE …, THE … in the gap. Keep the order of the words in brackets and change the adjectives. '
  prompt=prompt.removeprefix(instruction)
  prior=previous[i['id']];b=i['blanks'][0];first=prior['blanks'][0]
  key='The '+first['answer'];assert b['answer'].startswith(key),(i['id'],key)
  remainder=b['answer'][len(key):]
  prompt=SLOT.sub(lambda m:'('+first['base_adjective']+')'+remainder,prompt)
  b['base_adjective']=first['base_adjective'];b['answer']=key;b['accepted_answers']=['The '+a for a in first['accepted_answers']]
  counts['long_correlatives']+=1
 # Progressive change requires a concise task goal, not a supplied AND formula.
 progressive=False
 if prompt.startswith('Use AND in the gap to express continuing change. '):
  prompt=prompt.removeprefix('Use AND in the gap to express continuing change. ');progressive=True
 if prompt.startswith('Use MORE AND MORE in the gap. '):
  prompt=prompt.removeprefix('Use MORE AND MORE in the gap. ');progressive=True
 for b in i['blanks']:
  answers=[]
  for a in b['accepted_answers']:
   m=re.fullmatch(r'(more|less) (.+) and \1 \2',a)
   if m:a=m[1]+' and '+m[1]+' '+m[2];counts['progressive_fixes']+=1
   answers.append(a)
  b['accepted_answers']=answers;b['answer']=answers[0]
 # Obvious relational words are inferred. Keep only a small required lexical choice when needed.
 while True:
  m=re.match(r'^Use (.+?) in (?:the|each|the first) gap\.\s*',prompt)
  if not m:break
  words=m[1];prompt=prompt[m.end():]
  if words in {'AS','NOT AS','NOT SO','THAN','THE','ENOUGH','TWICE and AS','HALF and AS','JUST AS','THE and MORE','MORE'}:counts['hints_removed']+=1
  elif words=='NO and THAN':cues.append((1,'NO'))
  elif words in {'NOT SO MUCH and AS','MORE and THAN'}:cues.append((1,words.replace(' and ',' / ')))
  else:cues.append((1,words.replace(' and ',' / ')))
 for prefix in ['Add the required preposition to the adjective. ','Supply the required preposition in the first gap. ']:prompt=prompt.removeprefix(prefix)
 title='Раскройте скобки.'
 if progressive:title='Раскройте скобки: выразите постепенное изменение.'
 if cues:
  title+=' '+ ' '.join('Используйте '+words+(' в пропуске '+str(n)if len(i['blanks'])>1 else'')+'.'for n,words in sorted(cues));counts['short_keywords']+=1
 i['title']=title;i['prompt']=prompt
 # Once the NOT AS / NOT SO hint is removed, both ordinary standard frames are accepted.
 for b in i['blanks']:
  a=b['answer']
  if a.startswith('not as '):b['accepted_answers']=[a,a.replace('not as ','not so ',1)]
  elif a.startswith('not so ')and not a.startswith('not so much '):b['accepted_answers']=[a,a.replace('not so ','not as ',1)]
  elif a.startswith('just as '):b['accepted_answers']=[a,a.removeprefix('just ')]
# Explicit replacements for structures that required an arbitrary long recipe.
replacements={
 'cmp-adv-20261101-049':("The board's response expressed anger rather than concern: it was more (angry) than concerned. Its tone was (hostile) than that of the earlier statement.",'angry;more hostile'),
 'cmp-adv-20261101-050':('The spokesperson sounded defensive rather than informative. Her reply was more defensive than (informative), whereas the written report was (informative) than the speech.','informative;more informative'),
 'cmp-adv-20261101-051':('Both plans solve the problem equally well. The modular plan is (practical) the fixed plan, but is (adaptable) than it.','as practical as;more adaptable'),
 'cmp-adv-20261101-057':('The redesign created new problems rather than solving the old ones. It was (helpful) than the original system, and its rollout was too (costly) to repeat.','less helpful;costly'),
 'cmp-adv-20261101-060':('The first report described a major emergency, but the inspection found only a minor fault. The problem is not (urgent) enough to justify closing the site and is (limited) than the first report suggested.','urgent;more limited'),
 'cmp-construct-20261101-m038':('No other photograph in my folder has received such a high rating. This is my (good) photograph.','best'),
 'cmp-construct-20261101-m051':('The warning has to be understood immediately. Make its wording as (clear) as possible.','clear'),
 'cmp-construct-20261101-m052':('The box must fit under a low seat. Make the package as (small) as possible.','small'),
 'cmp-construct-20261101-m065':('The old hall covers 100 square metres and the new hall 200. The new hall is (large) the old hall.','twice as large as'),
 'cmp-construct-20261101-m066':('The original cable is 10 metres long and the spare is 5 metres long. The spare is (long) the original.','half as long as'),
 'cmp-construct-20261101-m067':('The blue strip measures 11 cm and the red strip 8 cm. The blue strip is three centimetres (long) than the red strip.','longer'),
 'cmp-construct-20261101-m085':('The cloth feels dry rather than stiff. It is more dry than (stiff).','stiff'),
 'cmp-construct-20261101-m086':('The visitors were interested rather than impressed. They were more interested than (impressed).','impressed'),
 'cmp-construct-20261101-m093':('The northern office charges more for the same service. Its fees are (high) than those of the southern office.','higher'),
 'cmp-construct-20261101-m094':('The new pump produces more water per minute. Its output is (high) than that of the old pump.','higher'),
 'cmp-construct-20261101-m095':('Rafi is 180 cm tall and I am 170 cm tall. Rafi is (tall) than I am.','taller'),
 'cmp-construct-20261101-m096':('The task took twenty minutes, though we had allowed only ten. It was (lengthy) than expected.','lengthier~more lengthy'),
}
for ident,(prompt,keys)in replacements.items():
 i=by[ident];i['prompt']=prompt;i['title']='Раскройте скобки.'
 for b,m,key in zip(i['blanks'],SLOT.finditer(prompt),keys.split(';')):b['base_adjective']=m[1];b['accepted_answers']=key.split('~');b['answer']=b['accepted_answers'][0]
 counts['rewrites']+=1
# A zero-direction repetitive pattern is not an idiom: replace it with natural deterioration and a superlative.
i=by['cmp-adv-20261101-047'];i['prompt']='Repeated audits revealed a worsening financial position. The organisation became (well-off) than before, while the latest restrictions were the (stringent) it had ever faced.';i['title']='Раскройте скобки.';i['blanks']=i['blanks'][:2]
for b,base,key in zip(i['blanks'],['well-off','stringent'],['less well-off','most stringent']):b['base_adjective']=base;b['answer']=key;b['accepted_answers']=[key]
# Mark only actual changed records and rebuild completed text/explanations against current keys.
changed=[];before=[]
for prior,i in zip(old,bank):
 if i==prior:continue
 assert i.get('topic')=='comparison'
 i['content_version']=V
 if i.get('blanks'):
  for n,b in enumerate(i['blanks'],1):
   b['id']=i['id']+f'-b{n}'
   # Preserve a substantive existing explanation unless its accepted answer changed.
   if n>len(prior['blanks'])or b['accepted_answers']!=prior['blanks'][n-1]['accepted_answers']:
    b['explanation_ru']='Ответ следует из сравнения в контексте и слов, уже напечатанных вне скобок. Основной ответ: '+b['answer']+'.'+(' Также принимается: '+b['accepted_answers'][1]+'.'if len(b['accepted_answers'])>1 else'')
  vals=iter(b['answer']for b in i['blanks']);i['answer_text']=SLOT.sub(lambda _:next(vals),i['prompt']);i['explanation_ru']=' '.join(b['explanation_ru']for b in i['blanks'])
 assert not re.search(r'Gap \d+:|Keep the order|Use .+? in .+? gap|Add the required|Supply the required',i['prompt']),i['id']
 assert not re.search(r'MORE OF A|A SOLUTION|AN ISSUE|THAN THOSE|THAN THAT|complete clause',i['title']),i['id']
 assert len(list(SLOT.finditer(i['prompt'])))==len(i['blanks']),i['id']
 changed.append(i);before.append(prior)
write(D/'before-records.json',before);write(D/'patch-records.json',changed);write(D/'summary.json',counts)
m=read(D/'baseline-manifest.json');n=0
for p in m['parts']:
 items=bank[n:n+p['count']];n+=p['count'];write(R/p['file'],items)
m['content_versions']['comparison']=V;m['answer_slots']=sum(len(i.get('blanks',[]))or 1 for i in bank);write(R/'data/exercises/index.json',m)
with (D/'review.csv').open('w')as f:
 w=csv.writer(f);w.writerow(['id','level','title','prompt','keys'])
 for i in changed:w.writerow([i['id'],i['level'],i['title'],i['prompt'],';'.join(' / '.join(b['accepted_answers'])for b in i['blanks'])])
print(len(changed),'changed; fields',m['answer_slots'],counts)
