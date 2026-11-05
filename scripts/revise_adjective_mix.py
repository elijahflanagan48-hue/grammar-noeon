"""Versioned editorial revision, using a frozen pre-review bank and explicit authored clauses."""
import json,re,copy,csv
from pathlib import Path
from collections import Counter
R=Path(__file__).resolve().parents[1];D=R/'docs/review/ADJECTIVES-MIXED-2026-11-01';V='comparison-2026-11-01.4'
read=lambda p:json.loads(p.read_text())
write=lambda p,v:p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
SLOT=re.compile(r'\(([^)]+)\)')
basebank=read(D/'baseline-bank.json');bank=copy.deepcopy(basebank);by={i['id']:i for i in bank};targets=read(D/'targets.json');changes={};notes=[]
def sup(b):
 out=[]
 for a in b['accepted_answers']:
  if a.startswith('more '):s='most '+a[5:]
  elif a.startswith('less '):s='least '+a[5:]
  elif a in {'better','worse','farther','further','elder'}:s={'better':'best','worse':'worst','farther':'farthest','further':'furthest','elder':'eldest'}[a]
  elif a.endswith('er'):s=a[:-2]+'est'
  elif a.startswith(('most ','least '))or a.endswith('est'):s=a
  else:s='most '+b['base_adjective']
  if s not in out:out.append(s)
 return out
for line in (D/'first-clauses.txt').read_text().splitlines():
 n,prefix,degree=line.split('|');old=targets[int(n)];i=by[old['id']];slots=list(SLOT.finditer(i['prompt']));s1,s2=slots[:2]
 middle=i['prompt'][s1.end():s2.start()]
 matches=list(re.finditer(r', (?:but|while|although|yet|and|even though|though|whereas|making) |; | but | and (?:exactly|no|the|no less)',middle))
 if not matches:
  notes.append((n,old['id'],middle));continue
 m=matches[0];tail=i['prompt'][s1.end()+m.start():]
 # Keep the original connecting clause. Participial 'making' remains attached to a sensible main clause.
 i['prompt']=prefix+tail
 b=i['blanks'][0];b['accepted_answers']=[SLOT.search(prefix)[1]]if degree=='p'else sup(b);b['base_adjective']=SLOT.search(prefix)[1];b['answer']=b['accepted_answers'][0]
 b['explanation_ru']=('Здесь положительная форма в конструкции степени: as … as, too, sufficiently или adjective + enough.'if degree=='p'else'Превосходная степень выделяет объект внутри явно заданной группы.')+' Основной ответ: '+b['answer']+'.'
 changes[i['id']]='mixed authored first clause'
write(D/'unmatched.json',notes)
write(D/'draft-records.json',[by[k]for k in changes])
print('Draft',len(changes),'unmatched',notes)
for line in (D/'overrides.txt').read_text().splitlines():
 ident,prompt,keys=line.split('|');i=by[ident];i['prompt']=prompt
 for b,m,ks in zip(i['blanks'],SLOT.finditer(prompt),keys.split(';')):
  b['base_adjective']=m[1];b['accepted_answers']=ks.split('~');b['answer']=b['accepted_answers'][0]
 changes[ident]='authored mixed rewrite'
# Editorial corrections discovered by reading the completed draft.
for i in bank:
 if i['id']not in changes:continue
 for b in i['blanks']:
  replacements={'most large':'largest','most wide':'widest','most strong':'strongest'}
  b['accepted_answers']=[replacements.get(a,a)for a in b['accepted_answers']];b['answer']=b['accepted_answers'][0]
 if i['id']=='cmp-adv-20261101-007':i['prompt']=i['prompt'].replace('than his.','than the first witness\'s.')
 if i['id']=='cmp-adv-20261101-009':i['prompt']=i['prompt'].replace('than his.','than her predecessor\'s.')
 if i['id']=='cmp-adv-20261101-020':i['prompt']=i['prompt'].replace('but only the fifth-','but ranks only fifth among the twenty cities for density: it is the fifth-')
 if i['id']=='cmp-adv-20261101-029':i['prompt']=i['prompt'].replace('less (effective) in reducing delays','less (effective) in reducing delays than the previous policy')
 if i['id']=='cmp-adv-20261101-030':i['prompt']=i['prompt'].replace('half as (thick).','half as (thick) as the larger prototype\'s.')
 if i['id']=='cmp-pro-20261101-036':i['prompt']=i['prompt'].replace('than the hall','than the main hall')
 if i['id']=='cmp-pro-20261101-194':i['prompt']=i['prompt'].replace('than twelve.','than twelve millimetres.')
 if i['id']=='cmp-pro-20261101-198':i['prompt']=i['prompt'].replace('than 200.','than 200 words.')
# Progressive repetition is one grammatical unit, elicited in one gap rather than two identical answers.
for i in bank:
 if i.get('topic')!='comparison' or i['type']!='open_brackets':continue
 ms=list(SLOT.finditer(i['prompt']))
 for k in range(len(ms)-1):
  a,b=ms[k:k+2]
  if i['prompt'][a.end():b.start()]==' and ' and a[1]==b[1]:
   first,second=i['blanks'][k:k+2]
   answers=[x+' and '+x for x in first['accepted_answers'] if x in second['accepted_answers']]
   if not answers:continue
   i['prompt']=i['prompt'][:a.start()]+'('+a[1]+')'+i['prompt'][b.end():]
   first['answer']=answers[0];first['accepted_answers']=answers;del i['blanks'][k+1]
   i['title']='Раскройте скобки: восстановите конструкцию постепенного изменения целиком'
   i['prompt']='Use AND in the gap to express continuing change. '+i['prompt']
   changes[i['id']]='one progressive construction'
   break
# Correlative clauses are also single constructions. Keep eight two-field models for focused practice.
correlatives=0
for i in bank:
 if i.get('topic')!='comparison' or i['type']!='open_brackets' or len(i['blanks'])!=2:continue
 ms=list(SLOT.finditer(i['prompt']))
 if len(ms)!=2:continue
 a,b=ms
 if not i['prompt'][:a.start()].endswith('The ') or ', the ' not in i['prompt'][a.end():b.start()]:continue
 correlatives+=1
 if correlatives<=8:continue
 start=a.start()-4;end=len(i['prompt'].rstrip('.'))
 clause=i['prompt'][start:end];vals=iter(x['answer']for x in i['blanks']);answer=SLOT.sub(lambda _:next(vals),clause)
 cue=SLOT.sub(lambda m:m[1],clause).replace('The ','',1).replace(', the ', ', ')
 i['prompt']='Use THE …, THE … in the gap. Keep the order of the words in brackets and change the adjectives. '+i['prompt'][:start]+'('+cue+').'
 first=i['blanks'][0];first['answer']=answer;first['accepted_answers']=[answer];i['blanks']=[first]
 i['title']='Раскройте скобки: восстановите конструкцию связанных изменений целиком'
 changes[i['id']]='one correlative construction'
# Elicit whole constructions in existing natural contexts, without changing their completed meaning.
frames=[(r'(?P<pre>not nearly as |nowhere near as |not quite as |nearly as |almost as |not as |not so |just as |as )\((?P<base>[^)]+)\)(?P<post> as\b)','equal'),
(r'(?P<pre>too )\((?P<base>[^)]+)\)(?P<post>)','threshold'),
(r'(?P<pre>)\((?P<base>[^)]+)\)(?P<post> enough\b)','threshold'),
(r'(?P<pre>no less |no more |not any |considerably |substantially |significantly |slightly |marginally |a little |a great deal |much |far |even |by far the |easily the )\((?P<base>[^)]+)\)(?P<post>)','modifiers'),
(r'(?P<pre>twice as |half as |three times as |four times as |one third as )\((?P<base>[^)]+)\)(?P<post> as\b)','ratio')]
frames=[frames[-1]]+frames[:-1]
frame_records=[]
for i in bank:
 if i.get('topic')!='comparison' or i['type']!='open_brackets':continue
 # Apply from right to left so the original field index remains unambiguous.
 captures=[]
 for pattern,family in frames:
  for m in re.finditer(pattern,i['prompt']):
   idx=sum(1 for s in SLOT.finditer(i['prompt'][:m.start()]))
   if idx>=len(i['blanks']):continue
   b=i['blanks'][idx]
   if any(len(a.split())>4 for a in b['accepted_answers']):continue
   if any(m.start()<end and m.end()>start for start,end,*_ in captures):continue
   captures.append((m.start(),m.end(),idx,m.group('pre'),m.group('base'),m.group('post'),family))
 if not captures:continue
 cues=[]
 for start,end,idx,pre,base,post,family in sorted(captures,reverse=True):
  b=i['blanks'][idx];b['accepted_answers']=[pre+a+post for a in b['accepted_answers']];b['answer']=b['accepted_answers'][0]
  i['prompt']=i['prompt'][:start]+'('+base+')'+i['prompt'][end:]
  cues.append((idx+1,(pre.strip()+' … '+post.strip()).strip(' …')))
  frame_records.append(dict(id=i['id'],field=idx+1,family=family,frame=(pre+'…'+post).strip()))
 # Specific given function words bound the answer, while the adjective degree still has to be chosen.
 instruction=' '.join(f'Gap {n}: include {cue.upper()}.'for n,cue in sorted(cues))
 i['prompt']=instruction+' '+i['prompt'];i['title']='Раскройте скобки: восстановите сочетание целиком по условию'
 changes[i['id']]=changes.get(i['id'],'')+'; whole structure'
# Final explanations use the actual current key and cite the relevant unchanged theory anchors.
from build_comparisons import RULES
for i in bank:
 if i['id']not in changes:continue
 i['content_version']=V
 for n,(b,m)in enumerate(zip(i['blanks'],SLOT.finditer(i['prompt'])),1):
  b['id']=i['id']+f'-b{n}';b['base_adjective']=m[1]
  before=i['prompt'][:m.start()];after=i['prompt'][m.end():];answer=b['answer']
  if ', the ' in answer:rule='parallel';why='Коррелятивная модель the + comparative …, the + comparative … связывает изменение двух величин. Сохраняйте заданный порядок слов.'
  elif answer in {'wiser','lesser','stronger'} and i['id'] in {'cmp-adv-20261101-053','cmp-adv-20261101-054','cmp-adv-20261101-055'}:rule='idioms';why='Устойчивый сравнительный оборот употребляется в заданной форме: none the wiser, the lesser of two evils, all the stronger.'
  elif answer=='further' and 'information' in after or answer=='further' and 'clarification' in after:rule='far';why='В значении дополнительной информации употребляется further, а не farther.'
  elif ' and 'in answer:rule='change';why='Постепенное изменение: comparative and comparative либо more and more + adjective. Введите весь оборот с AND.'
  elif re.search(r'\bas\b',answer)or before.endswith('as '):rule='equal';why='В as … as / not as … as употребляется положительная форма. Восстановите также указанные в условии части рамки.'
  elif 'too 'in answer or ' enough'in answer or before.endswith(('too ','sufficiently '))or after.startswith(' enough'):rule='threshold';why='Too + положительная форма выражает избыток; adjective + enough / sufficiently + adjective — достаточность.'
  elif 'most 'in answer or 'least 'in answer or answer.endswith('est')or answer in {'best','worst','furthest','farthest'}:rule='group';why='Превосходная степень выделяет участника внутри указанной группы. Определитель перед пропуском не повторяется.'
  else:rule='modifiers';why='Сравнительная форма согласуется с заданной рамкой, направлением сравнения и величиной разницы. Вводите все служебные слова, которые прямо требует условие.'
  b['rule_refs']=[f'content/comparison/06-comparison.md#{RULES[rule][1]}'];b['explanation_ru']=why+' Основной ответ: '+answer+'.'+(' Также принимается: '+b['accepted_answers'][1]+'.'if len(b['accepted_answers'])>1 else'')
 i['rule_refs']=list(dict.fromkeys(ref for b in i['blanks']for ref in b['rule_refs']))
 vals=iter(b['answer']for b in i['blanks']);i['answer_text']=SLOT.sub(lambda _:next(vals),i['prompt']);i['explanation_ru']=' '.join(b['explanation_ru']for b in i['blanks'])
 assert len(list(SLOT.finditer(i['prompt'])))==len(i['blanks']),i['id']
original={i['id']:i for i in basebank}
write(D/'before-records.json',[original[k]for k in changes]);write(D/'patch-records.json',[by[k]for k in changes]);write(D/'frame-ledger.json',frame_records)
with (D/'review.csv').open('w')as f:
 w=csv.writer(f);w.writerow(['id','level','change','prompt','keys'])
 for k,reason in changes.items():i=by[k];w.writerow([k,i['level'],reason,i['prompt'],';'.join(' / '.join(b['accepted_answers'])for b in i['blanks'])])
m=read(D/'baseline-manifest.json');n=0
for p in m['parts']:
 items=bank[n:n+p['count']];n+=p['count'];write(R/p['file'],items)
m['content_versions']['comparison']=V;m['answer_slots']=sum(len(i.get('blanks',[]))or 1 for i in bank);write(R/'data/exercises/index.json',m)
print('Final changed',len(changes),'whole structure fields',len(frame_records),'fields',m['answer_slots'])
