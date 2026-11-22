#!/usr/bin/env python3
"""Student-view (no keys) file for blind-solving. Usage: make_blind.py raw.jsonl out.json"""
import json,sys
out=[]
for l in open(sys.argv[1]):
    if not l.startswith("{"): continue
    t=json.loads(l);f=t['format'];o={"id":t['id'],"format":f,"prompt":t['prompt']}
    if f in('gap','mini'): o['blanks']=[b['cue'] for b in t['blanks']]
    elif f in('mc','which','fact'): o['options']=t['options']
    elif f=='order': o['words']=t['words']
    elif f=='sort': o['groups']=t['groups']; o['items']=[i['text'] for i in t['items']]
    elif f=='match': o['beginnings']=[p[0] for p in t['pairs']]; o['endings']=sorted(p[1] for p in t['pairs'])
    elif f=='hunt': o['sentences']=t['sentences']
    elif f=='bank': o['bank']=t['bank']
    out.append(o)
json.dump(out,open(sys.argv[2],"w"),ensure_ascii=False,indent=0)
