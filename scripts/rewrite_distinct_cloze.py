"""Apply fully authored texts with a distinct canonical tense for every gap."""
import copy,hashlib,json,re
from pathlib import Path
R=Path(__file__).resolve().parents[1];D=R/'docs/review/DISTINCT-CLOZE-2026-10-31';V='tenses-2026-10-31.6'
def read(p):return json.loads(p.read_text())
def write(p,x):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
T=dict(ps='present_simple',c='present_continuous',pp='present_perfect',ppc='present_perfect_continuous',past='past_simple',pc='past_continuous',hp='past_perfect',hpc='past_perfect_continuous',f='future_simple',fc='future_continuous',fp='future_perfect',fpc='future_perfect_continuous')
F=dict(ps='Настоящее состояние, привычка или опубликованное расписание.',c='Текущий процесс или явно подтверждённая договорённость.',pp='Результат к настоящему или период, продолжающийся до настоящего.',ppc='Процесс начался раньше и продолжается до настоящего.',past='Отдельное событие в указанном законченном прошлом периоде.',pc='Процесс шёл в указанный прошлый момент или служил фоном событию.',hp='Событие уже произошло до указанной прошлой границы.',hpc='К указанной прошлой границе процесс уже длился названный период.',f='Обещание, решение или прогноз на будущее.',fc='В названный будущий момент процесс будет в ходе выполнения.',fp='К явно названной будущей границе результат будет достигнут.',fpc='К явно названной будущей границе процесс будет длиться указанный период.')
G=dict(ps='V1 / V-s',c='am/is/are + V-ing',pp='have/has + V3',ppc='have/has been + V-ing',past='V2',pc='was/were + V-ing',hp='had + V3',hpc='had been + V-ing',f='will + V1',fc='will be + V-ing',fp='will have + V3',fpc='will have been + V-ing')
P=dict(ps='present-simple',c='present-continuous',past='past-simple',pc='past-continuous',f='future-simple',fc='future-continuous',fp='future-perfect',fpc='future-perfect-continuous')
def main():
 m=read(R/'data/exercises/index.json');assert m['content_versions']['tenses']=='tenses-2026-10-31.5'
 parts={p['file']:read(R/p['file']) for p in m['parts']};bank=sum(parts.values(),[]);by={i['id']:i for i in bank};before=[];patch=[]
 refs={b['tense_or_construction']:b['rule_refs'] for i in bank for b in i.get('blanks',[]) if b.get('tense_or_construction') and b.get('rule_refs')}
 expected={i['id'] for i in bank if i['type']=='context_cloze' and all(b.get('tense_or_construction') for b in i['blanks']) and len({b['tense_or_construction'] for b in i['blanks']})<len(i['blanks'])}
 for line in (D/'authored.txt').read_text().splitlines():
  if not line or line.startswith('#'):continue
  key,prompt,*answers=line.split('|');match=re.fullmatch(r'([a-z]+)(\d\d)',key)
  id=f'ext-20261030-{P[match[1]]}-cl-{int(match[2]):03}' if match else key
  i=by[id];before.append(copy.deepcopy(i));assert len(answers)==len(i['blanks'])-1,id
  markers=re.findall(r'\{\{(\d+):([^}]+)\}\}',prompt);assert [int(n) for n,b in markers]==list(range(1,len(i['blanks'])+1)),id
  i['prompt']=prompt;i['content_version']=V
  for n,(b,(_,base)) in enumerate(zip(i['blanks'],markers)):
   b['base_verb']=base.removeprefix('not ')
   if n:
    a,t=answers[n-1].rsplit('@',1);b['answer']=a.split('~')[0];b['accepted_answers']=a.split('~');b['tense_or_construction']=T[t];b['rule_refs']=refs[T[t]]
   else:t=next(k for k,v in T.items() if v==b['tense_or_construction']) if b['tense_or_construction'] in T.values() else None
   if t:
    b['explanation_ru']=F[t]+' Форма: '+G[t]+'. Основной ответ: '+b['answer']+'.'+((' Также принимается: '+b['accepted_answers'][1]+'.') if len(b['accepted_answers'])>1 else '')
  topics=[b['tense_or_construction'] for b in i['blanks']];assert len(set(topics))==len(topics),id
  i['practice_tenses']=topics;i['tags']=topics;i['rule_refs']=list(dict.fromkeys(r for b in i['blanks'] for r in b['rule_refs']))
  vals=iter(b['answer'] for b in i['blanks']);i['answer_text']=re.sub(r'\{\{\d+:[^}]+\}\}',lambda _:next(vals),prompt)
  i['explanation_ru']=' '.join(f"{n}) {b['explanation_ru']}" for n,b in enumerate(i['blanks'],1));patch.append(i)
 assert {i['id'] for i in patch}==expected,(len(patch),len(expected),expected-{i['id'] for i in patch})
 for file,items in parts.items():write(R/file,items)
 m['content_version']=V;m['content_versions']['tenses']=V;write(R/'data/exercises/index.json',m);write(D/'corrected/data/exercises/index.json',m)
 write(D/'before-records.json',before);write(D/'patch-records.json',patch);write(D/'bank.json',bank)
 prev=R/'docs/review/CLOZE-VARIETY-2026-10-31';overlay={i['id']:i for i in read(prev/'corrected-records.json')};overlay.update({i['id']:i for i in patch});write(D/'corrected-records.json',list(overlay.values()))
 proof=read(prev/'import-proof.json');proof['content_versions']=m['content_versions'];proof['parts_sha256']={f:hashlib.sha256((R/f).read_bytes()).hexdigest() for f in parts};proof['manifest_sha256']=hashlib.sha256((R/'data/exercises/index.json').read_bytes()).hexdigest();write(D/'import-proof.json',proof)
 print(len(patch),'texts; distinct canonical tenses in all gaps')
if __name__=='__main__':main()
