# -*- coding: utf-8 -*-
"""Five original sealed Passive Voice assessments; training bank is read-only."""
from pathlib import Path
from collections import Counter
import json,re,hashlib,csv,sys
R=Path(__file__).resolve().parents[1];V='assessment-passive-2026-11-03.1';OUT=R/'docs/review/PASSIVE-TESTS-2026-11-03';OUT.mkdir(exist_ok=True)
MC=[
[
('past_simple','basic','Mia wrote the short notice yesterday. Choose the passive equivalent in the same tense: The short notice ___ by Mia yesterday.',['was written','was wrote','has written','were written'],'Сохраняем Past Simple и единственное число; write → written: was written.'),
('past_continuous','medium','The machines were being tested when the power failed. Choose the question about this action.',['Were the machines being tested when the power failed?','Did the machines being tested when the power failed?','Were being the machines tested when the power failed?','Were the machines been tested when the power failed?'],'В вопросе первый вспомогательный were ставится перед подлежащим; being tested сохраняется.'),
('present_perfect','medium','The parcel has been delivered. Choose its negative form with yet.',['The parcel has not been delivered yet.','The parcel has not being delivered yet.','The parcel has not been deliver yet.','The parcel does not has been delivered yet.'],'Отрицание ставится после has; полная цепочка: has not been delivered.'),
('future_simple','medium','A van will collect the boxes tomorrow. Complete the passive equivalent: The boxes ___ tomorrow.',['will be collected','will be collect','will collect','will been collected'],'После will в пассиве нужны be и V3: will be collected.'),
('future_perfect','advanced','The documents will have been signed by noon. Choose the question in the same tense.',['Will the documents have been signed by noon?','Have the documents will been signed by noon?','Will have the documents been signed by noon?','Will the documents have being signed by noon?'],'Первый вспомогательный will выносится перед подлежащим; have been signed сохраняется.')
],
[
('present_simple','basic','A guide explains the route at the start of every tour. Complete the passive equivalent: The route ___ by a guide at the start of every tour.',['is explained','are explained','is explain','does explained'],'Route — единственное число; Present Simple Passive: is explained.'),
('past_continuous','medium','The bags were being weighed at the check-in desk. Choose the negative form in the same tense.',['The bags were not being weighed at the check-in desk.','The bags were not been weighed at the check-in desk.','The bags did not being weighed at the check-in desk.','The bags was not being weighed at the check-in desk.'],'Множественное число и процесс в прошлом: were not being weighed.'),
('present_perfect','medium','Choose the grammatically correct passive question about ticket sales up to now.',['How many tickets have been sold so far?','How many tickets has been sold so far?','How many tickets have been sell so far?','How many tickets have being sold so far?'],'How many tickets — подлежащее во множественном числе; have been sold.'),
('future_simple','medium','Choose the direct question in Future Simple Passive.',['When will the letters be sent?','When the letters will be sent?','When will the letters been sent?','When do the letters will be sent?'],'В прямом вопросе will стоит перед подлежащим; далее be sent.'),
('past_perfect','advanced','The alarm had been switched off before the break-in. Choose the question that preserves this tense.',['Had the alarm been switched off before the break-in?','Had the alarm being switched off before the break-in?','Was the alarm had been switched off before the break-in?','Had the alarm be switched off before the break-in?'],'В Past Perfect Passive перед подлежащим ставится had; been switched off сохраняется.')
],
[
('future_simple','basic','The staff will issue the passes tomorrow. Complete the passive equivalent: The passes ___ tomorrow.',['will be issued','will been issued','will be issue','will issue'],'Сохраняем will и образуем пассив: will be issued.'),
('present_continuous','medium','Somebody is painting the door now. Choose the negative passive in the same tense.',['The door is not being painted now.','The door is not been painted now.','The door is not being paint now.','The door does not being painted now.'],'Отрицательный Present Continuous Passive: is not being painted.'),
('past_simple','medium','Choose the grammatically correct passive question about the origin of these toys.',['Where were these wooden toys made?','Where was these wooden toys made?','Where were these wooden toys maked?','Where did these wooden toys made?'],'Toys — множественное число; make → made; вопрос: Where were ... made?'),
('present_perfect','medium','Someone has taken the spare key. Choose the passive equivalent in the same tense.',['The spare key has been taken.','The spare key has being taken.','The spare key have been taken.','The spare key has been took.'],'Key — единственное число; Present Perfect Passive: has been taken.'),
('future_perfect','advanced','The repairs will have been completed by Monday. Choose the negative form in the same tense.',['The repairs will not have been completed by Monday.','The repairs will not been completed by Monday.','The repairs will have not being completed by Monday.','The repairs do not will have been completed by Monday.'],'В Future Perfect Passive отрицание ставится после will: will not have been completed.')
],
[
('past_simple','basic',"Choose the sentence that states the year of Nora's birth.",['Nora was born in 2002.','Nora were born in 2002.','Nora was borned in 2002.','Nora was bear in 2002.'],'О рождении говорят was born; Nora — единственное число. Born — особое причастие bear в этом значении.'),
('present_continuous','medium','Choose the grammatically correct passive question about the inspection in progress now.',['Is the new bridge being inspected right now?','Does the new bridge being inspected right now?','Is the new bridge been inspected right now?','Is being the new bridge inspected right now?'],'Первый вспомогательный is ставится перед подлежащим; being inspected обозначает процесс.'),
('present_perfect','medium','The uploads have been checked. Choose the negative form with yet in the same tense.',['The uploads have not been checked yet.','The uploads has not been checked yet.','The uploads have not being checked yet.','The uploads have not been check yet.'],'Uploads — множественное число; отрицание: have not been checked yet.'),
('past_continuous','medium','Volunteers were carrying the chairs upstairs at five yesterday. Complete the passive equivalent: The chairs ___ upstairs at five yesterday.',['were being carried','were been carried','was being carried','were carrying'],'Сохраняем процесс в прошлом; chairs — множественное число: were being carried.'),
('past_perfect','advanced','Someone had not noticed the mistake before the letter went out. Choose the negative passive in the same tense.',['The mistake had not been noticed before the letter went out.','The mistake had not being noticed before the letter went out.','The mistake did not had been noticed before the letter went out.','The mistake had not been notice before the letter went out.'],'Past Perfect Passive сохраняет had; not следует после него, затем been noticed.')
],
[
('present_simple','basic','Choose the passive form that agrees with each book: Each book ___ before it leaves the library.',['is checked','are checked','is check','does checked'],'Each book — единственное число; пассив образуется как is checked.'),
('past_simple','medium','Choose the grammatically correct passive question about the recipient of the prize.',['Who was the prize given to?','Who was the prize gave to?','Who did the prize given to?','Who were the prize given to?'],'Prize — единственное число; give → given. Предлог to сохраняется в конце вопроса.'),
('present_perfect','medium','The printer has produced all the copies. Complete the passive equivalent: All the copies ___.',['have been produced','has been produced','have being produced','have been produce'],'Copies — множественное число; Present Perfect Passive: have been produced.'),
('present_continuous','medium','They are checking the bags now. Choose the negative passive in the same tense.',['The bags are not being checked now.','The bags are not been checked now.','The bags do not being checked now.','The bags are not checking now.'],'Пассивный процесс в настоящем: are not being checked; are not checking — активная форма.'),
('future_perfect','advanced','By the time the show begins, all the costumes will have been delivered. Choose the question in the same tense.',['Will all the costumes have been delivered by the time the show begins?','Will all the costumes been delivered by the time the show begins?','Have all the costumes will been delivered by the time the show begins?','Will all the costumes have being delivered by the time the show begins?'],'В вопросе will выносится перед подлежащим; цепочка have been delivered остаётся полной.')
]]
POSITIONS=[[2,0,3,1,2],[0,3,1,0,2],[1,2,0,3,1],[3,1,2,0,3],[0,2,3,1,0]]
normal=lambda s:' '.join(re.findall(r'[^\W_]+',s.casefold()))
def expanded(keys,family,prompt,plural=False):
 out=list(keys)
 # Additional finite times are allowed only when the authored context licenses
 # them. This function never guesses an alternative tense from an adverb alone.
 if family=='future_simple':
  pp=keys[0].removeprefix('will be ');be='are'if plural else'is'
  # Number is supplied explicitly by the author below, not guessed from a noun.
  out += [f'{be} going to be {pp}',f'{be} being {pp}']
 for key in out[:]:
  m=re.fullmatch(r'(has|have|had) been (.+)',key)
  if m:out += [m[1]+' got '+m[2],m[1]+' gotten '+m[2]]
  elif key.startswith('will have been '):out += ['will have got '+key[15:],'will have gotten '+key[15:]]
  elif key.startswith('will be '):out += ['will get '+key[8:]]
  elif re.match(r'(is|are|am|was|were) being ',key):out += [key.replace(' being ',' getting ',1)]
  elif re.match(r'(is|are|am) going to be ',key):out += [key.replace(' going to be ',' going to get ',1)]
  elif re.match(r'(is|are|was|were) ',key):
   aux,pp=key.split(' ',1);out += [('gets'if aux=='is'else'get'if aux=='are'else'got')+' '+pp]
 for key in out[:]:
  out += [key.replace('cancelled','canceled'),key.replace('organised','organized')]
 for key in out[:]:
  first,*rest=key.split(' ',1);short={'is':"'s",'has':"'s",'are':"'re",'have':"'ve",'had':"'d",'will':"'ll",'am':"'m"}.get(first)
  if short:out.append(short+' '+rest[0])
 return list(dict.fromkeys(out))
# Explicit agreement for future items whose canonical will has no number.
FUTURE_PLURAL={(5,18),(1,12),(2,12),(2,20),(4,12),(4,20),(5,12)}
def build():
 practice=[x for p in (R/'data/exercises').glob('part-*.json')for x in json.loads(p.read_text())]
 prior=[x for topic in ['tenses','comparison']for t in json.loads((R/f'content/assessments/{topic}.json').read_text())for x in t['items']]
 seen={normal(s)for x in practice+prior for s in [x['prompt'],x.get('answer_text','')]if s};tests=[];ledger=[]
 for line in (R/'content/assessments/passive-authored.txt').read_text().splitlines():
  if not line or line.startswith('#'):continue
  if line.startswith('TEST '):
   t=int(line.split()[1]);tests.append(dict(id=f'passive-{t}',topic='passive',number=t,title=f'Тест {t}',version=V,items=[]));continue
  f,level,prompt,keys,why=line.split('|');n=len(tests[-1]['items'])+1;keys=keys.split('~')
  assert len(re.findall(r'\(to [a-z]+(?: [a-z]+){0,2}\)',prompt))==1,(t,n)
  ref=['content/passive/07-passive.md#pv-table'];target='pv_'+f;ident=f'assess-pv-v1-t{t}-q{n:02d}'
  answers=expanded(keys,f,prompt,(t,n)in FUTURE_PLURAL)
  item=dict(id=ident,type='open_brackets',level=level,topic='passive',content_version=V,assessment_id=f'passive-{t}',response_contract='bounded-v1',answer_profile='english-standard-v2',prompt=prompt,practice_tenses=[target],tags=[target],rule_refs=ref,title='Раскройте скобки.',explanation_ru=why)
  cue=re.search(r'\(([^)]+)\)',prompt)[1]
  item['blanks']=[dict(id=ident+'-b1',base_verb=cue,answer=keys[0],accepted_answers=answers,tense_or_construction=target,rule_refs=ref,explanation_ru=why)]
  item['answer_text']=prompt.replace('('+cue+')',keys[0]);tests[-1]['items'].append(item)
 for t,test in enumerate(tests,1):
  for k,(f,level,prompt,opts,why)in enumerate(MC[t-1]):
   n=21+k;pos=POSITIONS[t-1][k];correct=opts[0];other=opts[1:];options=other[:];options.insert(pos,correct);ident=f'assess-pv-v1-t{t}-q{n:02d}';target='pv_'+f
   test['items'].append(dict(id=ident,type='multiple_choice',level=level,topic='passive',content_version=V,assessment_id=test['id'],response_contract='bounded-v1',answer_profile='english-standard-v2',prompt=prompt,practice_tenses=[target],tags=[target],rule_refs=['content/passive/07-passive.md#pv-questions'if k in [1,2,4]else'content/passive/07-passive.md#pv-table'],title='Выберите один правильный ответ.',options=options,correct_option_index=pos,answer=correct,explanation_ru=why))
  assert len(test['items'])==25
  assert Counter(x['level']for x in test['items'])==dict(basic=8,medium=12,advanced=5),(t,Counter(x['level']for x in test['items']))
  assert Counter(x['type']for x in test['items'])==dict(open_brackets=20,multiple_choice=5)
  assert len(set(v for x in test['items']for v in x['practice_tenses']))==8
  for x in test['items']:
   texts={normal(v)for v in [x['prompt'],x.get('answer_text','')]if v};assert not(texts&seen),(x['id'],'duplicate');seen.update(texts)
   ledger.append(dict(id=x['id'],test=t,position=len(ledger)%25+1,target=x['practice_tenses'][0],type=x['type'],level=x['level'],sources='BC-BASE;BC-REF;CG-FORMS'+(';BC-FUTURE'if x['practice_tenses'][0]=='pv_future_perfect'else''),rule_refs=';'.join(x['rule_refs']),explanation=x['explanation_ru']))
 payload=json.dumps(tests,ensure_ascii=False,indent=2)+'\n';sha=hashlib.sha256(payload.encode()).hexdigest();lock=R/'content/assessments/passive.lock.json'
 seal=dict(version=V,sha256=sha,forms={t['id']:hashlib.sha256(json.dumps(t,ensure_ascii=False,sort_keys=True).encode()).hexdigest()for t in tests})
 if '--review-draft' in sys.argv:
  published=json.loads((R/'docs/current-release.json').read_text())
  assert 'passive'not in published.get('assessments',{}),'Published assessments require a new version.'
  if lock.exists() and not(OUT/'initial-draft-lock.json').exists():(OUT/'initial-draft-lock.json').write_bytes(lock.read_bytes())
  lock.write_text(json.dumps(seal,indent=2)+'\n')
 elif lock.exists():assert json.loads(lock.read_text())==seal,'Sealed assessment changed. Review a new version.'
 else:lock.write_text(json.dumps(seal,indent=2)+'\n')
 (R/'content/assessments/passive.json').write_text(payload)
 with (OUT/'blueprint.csv').open('w')as f:
  w=csv.DictWriter(f,fieldnames=ledger[0]);w.writeheader();w.writerows(ledger)
 print('Passive: 5 sealed forms / 125 original questions / 20 gaps + 5 choices each / all eight forms / 8-12-5 levels.')
if __name__=='__main__':build()
