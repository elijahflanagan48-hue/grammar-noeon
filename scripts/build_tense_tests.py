"""Five authored, sealed Tenses assessments. No training-bank changes."""
from pathlib import Path
import json,re,hashlib,csv
from collections import Counter
R=Path(__file__).resolve().parents[1]
V='assessment-tenses-2026-11-01.1'
theory=json.loads((R/'data/theory.json').read_text())
def slug(s):
 return re.sub(r'\s+','-',re.sub(r'[^\w\s-]','',s.lower()).strip())
refs={}
for file in ['02-present.md','03-past.md','04-future.md']:
 for line in (R/'content/theory'/file).read_text().splitlines():
  if not line.startswith('## '):continue
  heading=line[3:];label=heading.split(':')[0].strip().lower().replace(' simple','').replace(' ','_')
  # Explicit target mapping rather than morphology guesses.
  for target,name in [('present_simple','Present Simple'),('present_continuous','Present Continuous'),('present_perfect','Present Perfect Simple'),('present_perfect_continuous','Present Perfect Continuous'),('past_simple','Past Simple'),('past_continuous','Past Continuous'),('past_perfect','Past Perfect Simple'),('past_perfect_continuous','Past Perfect Continuous'),('future_simple','Future Simple:'),('future_continuous','Future Continuous:'),('future_perfect','Future Perfect Simple:'),('future_perfect_continuous','Future Perfect Continuous:')]:
   if heading==name or (name.endswith(':') and heading.startswith(name)):refs[target]=f'content/tenses/{file}#{slug(heading)}'
norm=lambda s:' '.join(re.findall(r'[^\W_]+',s.casefold()))
practice=[i for p in (R/'data/exercises').glob('part-*.json') for i in json.loads(p.read_text())]
seen={norm(i['prompt']) for i in practice}|{norm(i.get('answer_text','')) for i in practice if i.get('answer_text')}
tests=[];ledger=[]
for line in (R/'content/assessments/tenses-authored.txt').read_text().splitlines():
 if not line or line.startswith('#'):continue
 if line.startswith('TEST '):
  t=int(line.split()[1]);tests.append(dict(id=f'tenses-{t}',topic='tenses',number=t,title=f'Тест {t}',version=V,items=[]));continue
 target,level,prompt,keys,why=line.split('|');n=len(tests[-1]['items'])+1
 if n==23:level='medium'
 ident=f'assess-ten-v1-t{t}-q{n:02}';ref=[refs[target]]
 if n==25:ref=['content/tenses/04-future.md#future-time-clauses']
 item=dict(id=ident,type='open_brackets' if n<=20 else 'multiple_choice',level=level,topic='tenses',content_version=V,assessment_id=f'tenses-{t}',response_contract='bounded-v1',prompt=prompt,practice_tenses=[target],tags=[target],rule_refs=ref,title='Раскройте скобки.' if n<=20 else 'Выберите один правильный ответ.',explanation_ru=why)
 if n<=20:
  cue=re.findall(r'\(([^)]+)\)',prompt);assert len(cue)==1
  answers=keys.split('~');assert 1<=len(answers)<=2
  item['blanks']=[dict(id=ident+'-b1',base_verb=cue[0],answer=answers[0],accepted_answers=answers,tense_or_construction=target,rule_refs=ref,explanation_ru=why)]
  item['answer_text']=re.sub(r'\([^)]+\)',answers[0],prompt)
 else:
  options=keys.split('~');assert len(set(options))==4
  shift=(t+n)%4;item.update(options=options[shift:]+options[:shift],correct_option_index=(-shift)%4,answer=options[0])
 texts={norm(text) for text in [prompt,item.get('answer_text')] if text}
 assert not (texts & seen),(ident,'duplicate')
 seen.update(texts)
 tests[-1]['items'].append(item);ledger.append(dict(id=ident,test=t,position=n,target=target,level=level,type=item['type'],explanation=why,rule_refs=';'.join(ref)))
assert len(tests)==5
for test in tests:
 assert len(test['items'])==25
 assert Counter(i['type'] for i in test['items'])=={'open_brackets':20,'multiple_choice':5}
 assert Counter(i['level'] for i in test['items'])=={'basic':8,'medium':12,'advanced':5}
 assert len(set(i['practice_tenses'][0] for i in test['items']))==12
payload=json.dumps(tests,ensure_ascii=False,indent=2)+'\n';digest=hashlib.sha256(payload.encode()).hexdigest()
lock=R/'content/assessments/tenses.lock.json'
if lock.exists():assert json.loads(lock.read_text())['sha256']==digest,'Sealed forms changed; review a new version.'
else:lock.write_text(json.dumps(dict(version=V,sha256=digest),indent=2)+'\n')
(R/'content/assessments/tenses.json').write_text(payload)
d=R/'docs/review/TENSES-TESTS-2026-11-01';d.mkdir(parents=True,exist_ok=True)
with (d/'blueprint.csv').open('w') as f:
 w=csv.DictWriter(f,fieldnames=ledger[0]);w.writeheader();w.writerows(ledger)
print('Tenses: 5 fixed tests, 125 unique items, 20/5 formats, all 12 forms per test.')
