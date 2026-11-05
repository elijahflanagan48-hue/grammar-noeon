"""Apply authored mixed-context revisions, preserving historical snapshots and IDs."""
from pathlib import Path
import json,re,copy,hashlib
R=Path(__file__).resolve().parents[1];D=R/'docs/review/CLOZE-VARIETY-2026-10-31';V='tenses-2026-10-31.5'
def read(p):return json.loads(p.read_text())
def write(p,x):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def main():
 m=read(R/'data/exercises/index.json');assert m['content_versions']['tenses']=='tenses-2026-10-31.4'
 parts={p['file']:read(R/p['file']) for p in m['parts']};bank=sum(parts.values(),[]);by={i['id']:i for i in bank}
 old=copy.deepcopy(bank);oldby={i['id']:i for i in old};changed=[]
 refs={b['tense_or_construction']:b['rule_refs'] for i in bank for b in i.get('blanks',[]) if b.get('rule_refs') and b.get('tense_or_construction')}
 def setblank(i,n,answer,tense):
  b=i['blanks'][n-1];b['answer']=answer.split('~')[0];b['accepted_answers']=answer.split('~');b['tense_or_construction']=tense;b['rule_refs']=refs[tense];b['base_verb']=dict((int(n),base) for n,base in re.findall(r'\{\{(\d+):([^}]+)\}\}',i['prompt']))[n].removeprefix('not ')
  anchors={'past_simple':'Закрытый момент или период в прошлом: событие рассказывается как факт.','past_continuous':'Процесс шёл в указанный прошлый момент или служил фоном для другого события.','present_simple':'Состояние или обычная ситуация в настоящем.','present_continuous':'Процесс происходит сейчас; на это прямо указывает контекст.','present_perfect':'Период продолжается до настоящего; важен накопленный результат.','past_perfect':'Действие уже завершилось до другого указанного события в прошлом.'}
  b['explanation_ru']=anchors[tense]+' Основной ответ: '+b['answer']+'.'+((' Также принимается: '+b['accepted_answers'][1]+'.') if len(b['accepted_answers'])==2 else '')
 for line in (D/'authored-tails.txt').read_text().splitlines():
  if not line or line.startswith('#'):continue
  fields=line.split('|');suffix,tail=fields[:2];family,number=suffix.rsplit('-',1);i=by[f'ext-20261030-{family}-cl-{number}']
  match=re.search(r'\{\{2:[^}]+\}\}',i['prompt']);i['prompt']=i['prompt'][:match.end()]+tail
  assert len(fields)==2+2*(len(i['blanks'])-2),i['id']
  for n in range(3,len(i['blanks'])+1):setblank(i,n,fields[2+(n-3)*2],fields[3+(n-3)*2])
  changed.append(i['id'])
 for id,prompt,updates in [
 ('new-cloze-002','When Leo {{1:arrive}} at the office, everyone {{2:look}} for the presentation file. Maya {{3:save}} it to a shared folder the night before, but someone {{4:move}} it. The team {{5:search}} for nearly half an hour before Leo {{6:notice}} an unfamiliar folder name. He {{7:open}} it. Inside, a message {{8:flash}} on his screen as he clicked the missing file: \'Access denied\'.',[(8,'was flashing~flashed','past_continuous')]),
 ('adv-cloze-001','When the product team {{1:meet}} on Monday morning, they discovered that the supplier {{2:not deliver}} a critical component. At ten the previous Friday, they {{3:wait}} for it at the loading bay. Before the delay, they {{4:plan}} to begin testing over the weekend. By Monday, the engineers {{5:work}} on the release for six months. The director said the company {{6:postpone}} the launch if the part did not arrive by noon. It finally {{7:turn up}} at eleven, just as the team {{8:prepare}} the delay notice.',[(3,'were waiting','past_continuous')]),
 ('adv-cloze-005','In January, the council announced that the bridge {{1:close}} for repairs in June. Engineers {{2:complete}} preliminary surveys the previous November. Under the January plan, the main contractor {{3:start}} work on 2 June. However, two days before that date, the mayor {{4:inspect}} the bridge and found unexpected damage. Under the original plan, local buses {{5:use}} a temporary route during the repairs. Nobody {{6:anticipate}} the damage before the inspection. The council {{7:be about to}} issue the final notice when it decided the bridge {{8:remain}} closed for a full year instead.',[(2,'had completed~completed','past_perfect'),(4,'inspected','past_simple')]),
 ('mix-20261030-009','Yesterday I {{1:make}} a cake when the phone {{2:ring}}. I {{3:talk}} to the caller when I smelt smoke. When I finally {{4:open}} the oven door, the cake {{5:turn}} black.',[(3,'was talking','past_continuous')]),
 ]:
  i=by[id];i['prompt']=prompt
  for n,a,t in updates:setblank(i,n,a,t)
  changed.append(id)
 assert len(changed)==120 and len(set(changed))==120
 for id in changed:
  i=by[id];i['content_version']=V
  assert len(re.findall(r'\{\{\d+:[^}]+\}\}',i['prompt']))==len(i['blanks']),id
  keys=iter(b['answer'] for b in i['blanks']);i['answer_text']=re.sub(r'\{\{\d+:[^}]+\}\}',lambda _:next(keys),i['prompt'])
  i['explanation_ru']=' '.join(f"{n}) {b['explanation_ru']}" for n,b in enumerate(i['blanks'],1))
  topics=list(dict.fromkeys(b['tense_or_construction'] for b in i['blanks']));i['practice_tenses']=topics;i['tags']=topics;i['rule_refs']=list(dict.fromkeys(r for b in i['blanks'] for r in b['rule_refs']))
  assert not any(len({b['tense_or_construction'] for b in i['blanks'][n:n+3]})==1 for n in range(len(i['blanks'])-2)),id
 for f,items in parts.items():write(R/f,items)
 m['content_version']=V;m['content_versions']['tenses']=V;write(R/'data/exercises/index.json',m);write(D/'corrected/data/exercises/index.json',m)
 write(D/'before-records.json',[oldby[id] for id in changed]);write(D/'patch-records.json',[by[id] for id in changed]);write(D/'bank.json',bank)
 prev=R/'docs/review/FUTURE-REFERENCE-2026-10-31';overlay={i['id']:i for i in read(prev/'corrected-records.json')};overlay.update({id:by[id] for id in changed});write(D/'corrected-records.json',list(overlay.values()))
 proof=read(prev/'import-proof.json');proof['parts_sha256']={f:hashlib.sha256((R/f).read_bytes()).hexdigest() for f in parts};proof['manifest_sha256']=hashlib.sha256((R/'data/exercises/index.json').read_bytes()).hexdigest();proof['content_versions']=m['content_versions'];write(D/'import-proof.json',proof)
 print(len(changed),'texts revised, field counts unchanged')
if __name__=='__main__':main()
