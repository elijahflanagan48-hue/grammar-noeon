"""Compile five immutable, authored assessment forms; never add them to practice."""
from pathlib import Path
import re,json,hashlib,csv
from collections import Counter
R=Path(__file__).resolve().parents[1];D=R/'docs/review/COMPARISON-TESTS-2026-11-01'
# Position, family, difficulty fixed across all five forms.
families=['forms','group','equal','change','logic','irregular','articles','equal','modifiers','elder','forms','articles','less','parallel','precision','forms','articles','ratio','modifiers','far','compound','group','threshold','parallel','scale']
basic={1,2,3,4,6,7,8,10}
from build_comparisons import RULES
norm=lambda s:' '.join(re.findall(r'[^\W_]+',s.casefold()))
practice=[i for p in sorted((R/'data/exercises').glob('part-*.json'))for i in json.loads(p.read_text())]
practice_text={norm(i['prompt'])for i in practice}|{norm(i.get('answer_text',''))for i in practice if i.get('answer_text')}
seen=set();tests=[];ledger=[]
for t in range(1,6):
 items=[]
 for n,line in enumerate((D/f'test-{t}.txt').read_text().splitlines(),1):
  typ,prompt,keys=line.split('|');rule=families[n-1]
  if n==13 and t!=3:rule='equal'
  if n==18 and t<=2:rule='threshold'
  if n==24 and t in {1,2,4}:rule='change'
  if n==21 and t<=2:rule='scale'
  _,anchor,why=RULES[rule]
  if n==21 and t<=2:why='После уже напечатанного more используется основа прилагательного, без дополнительного -er или more.'
  groups=['cmp_forms','cmp_superlatives','cmp_equality','cmp_development','cmp_precision'];target=groups[(n-1)%5]
  ident=f'assess-cmp-v1-t{t}-q{n:02}';level='basic'if n in basic else'advanced'if n>=21 else'medium'
  refs=[f'content/comparison/06-comparison.md#{anchor}'];i=dict(id=ident,type='open_brackets'if typ=='OB'else'multiple_choice',level=level,topic='comparison',content_version='assessment-comparison-2026-11-01.1',assessment_id=f'comparison-{t}',response_contract='bounded-v1',prompt=prompt,practice_tenses=[target],tags=[target],rule_refs=refs,title='Раскройте скобки.'if typ=='OB'else'Выберите один правильный ответ.')
  if typ=='OB':
   matches=list(re.finditer(r'\(([^)]+)\)',prompt));assert len(matches)==1 and '/'not in matches[0][1]
   answers=keys.split('~');assert 1<=len(answers)<=2
   i['blanks']=[dict(id=ident+'-b1',base_adjective=matches[0][1],answer=answers[0],accepted_answers=answers,rule_refs=refs,explanation_ru=why+' Основной ответ: '+answers[0]+'.'+(' Также принимается: '+answers[1]+'.'if len(answers)>1 else''))]
   i['answer_text']=re.sub(r'\([^)]+\)',answers[0],prompt);i['explanation_ru']=i['blanks'][0]['explanation_ru']
  else:
   options=keys.split('~');assert len(options)==4 and len(set(options))==4
   offset=(t+n)%4;i['options']=options[offset:]+options[:offset];i['correct_option_index']=(-offset)%4;i['answer']=options[0];i['explanation_ru']=why+' Правильный вариант: '+options[0]
  assert norm(prompt)not in practice_text,(ident,'practice overlap');assert norm(prompt)not in seen,(ident,'cross-test overlap');seen.add(norm(prompt))
  if i.get('answer_text'):assert norm(i['answer_text'])not in practice_text,(ident,'completed overlap')
  items.append(i);ledger.append(dict(test=t,question=n,id=ident,family=rule,level=level,type=i['type'],sources='Cambridge EGT comparison; British Council modifying comparatives'))
 assert len(items)==25 and Counter(i['type']for i in items)=={'open_brackets':15,'multiple_choice':10}
 assert Counter(i['level']for i in items)=={'basic':8,'medium':12,'advanced':5}
 tests.append(dict(id=f'comparison-{t}',number=t,title=f'Тест {t}',version='assessment-comparison-2026-11-01.1',items=items))
payload=json.dumps(tests,ensure_ascii=False,indent=2)+'\n'
lockfile=R/'content/assessments/comparison.lock.json'
if lockfile.exists():
 lock=json.loads(lockfile.read_text());assert hashlib.sha256(payload.encode()).hexdigest()==lock['sha256'],'Fixed forms changed: create an explicitly reviewed new revision instead of overwriting this set.'
(R/'content/assessments/comparison.json').write_text(payload)
with (D/'blueprint.csv').open('w')as f:
 w=csv.DictWriter(f,fieldnames=ledger[0]);w.writeheader();w.writerows(ledger)
print('Five fixed tests / 125 new items; no exact prompt or completed-text overlap with practice.')
