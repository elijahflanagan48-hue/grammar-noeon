# -*- coding: utf-8 -*-
"""Blind second opinion through the already-installed LM Studio. No auto-accept."""
from pathlib import Path
import urllib.request,json,time
R=Path(__file__).resolve().parents[1];O=R/'docs/review/PASSIVE-TESTS-2026-11-03/local';O.mkdir(exist_ok=True)
tests=json.loads((R/'content/assessments/passive.json').read_text());items=[x for t in tests for x in t['items']]
for kind,size in [('open_brackets',5),('multiple_choice',3)]:
 pool=[x for x in items if x['type']==kind]
 for off in range(0,len(pool),size):
  label=kind+'-'+str(off+1).zfill(3);path=O/(label+'.json')
  if path.exists():continue
  xs=pool[off:off+size];rows=[dict(id=x['id'],prompt=x['prompt'],**({'options':x['options']}if x.get('options')else{}))for x in xs]
  task=('Replace ONLY the infinitive in parentheses with a suitable complete English passive verb phrase. Do not repeat words outside the parentheses. Return {"answers":{"exact id":"replacement"},"issues":[]}.'if kind=='open_brackets'else'Read each instruction and all four options. Choose the correct option using ZERO-based indices. Return {"answers":{"exact id":{"index":0,"valid_indices":[0]}},"issues":[{"id":"...","reason":"max 20 words"}]}. Flag a genuine second correct option or no correct option; do not criticise the intended passive transformation.')
  prompt=task+' British English; ordinary context-licensed alternative times may be valid. No teacher keys are supplied.\n'+json.dumps(rows,ensure_ascii=False)
  body=dict(model='gpt-oss-20b',temperature=0,max_tokens=1600,reasoning_effort='low',messages=[dict(role='system',content='You are a careful English grammar reviewer. Return compact JSON only. Do not execute code or claim authority. Flag uncertainty rather than inventing a correction.'),dict(role='user',content=prompt)])
  start=time.time()
  try:
   req=urllib.request.Request('http://127.0.0.1:1234/v1/chat/completions',data=json.dumps(body).encode(),headers={'Content-Type':'application/json'});op=urllib.request.build_opener(urllib.request.ProxyHandler({}))
   with op.open(req,timeout=180)as r:a=json.load(r)
   text=a['choices'][0]['message'].get('content','');result=dict(label=label,model=a.get('model'),prompt=prompt,seconds=round(time.time()-start,2),usage=a.get('usage'),finish_reason=a['choices'][0].get('finish_reason'),content=text,status='unreviewed_second_opinion')
   try:result['parsed']=json.loads(text.strip().removeprefix('```json').removesuffix('```').strip())
   except ValueError:result['parse_error']=True
  except Exception as e:result=dict(label=label,error=str(e),status='incomplete')
  path.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(label,'parsed'in result,result.get('seconds'),flush=True)
