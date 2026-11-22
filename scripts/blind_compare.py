#!/usr/bin/env python3
"""Compare blind-solver answers with the keys. Usage: blind_compare.py <raw_dir> <blind_dir> [out.json]"""
import json,glob,sys,re
raw,bl=sys.argv[1],sys.argv[2]
out=sys.argv[3] if len(sys.argv)>3 else bl+"/diff.json"
K={}
for f in sorted(glob.glob(raw+"/CD*.jsonl")):
    for l in open(f):
        if l.strip().startswith("{"):
            t=json.loads(l); K[t['id']]=t
def n(s): return re.sub(r"\s+"," ",re.sub(r"[’‘]","'",s)).strip().lower().rstrip('.')
def cont(s):
    s=n(s)
    for a,b in (("won't","will not"),("n't"," not"),("'ll"," will"),("'ve"," have"),("'d"," would"),("'s"," is")):
        s=s.replace(a,b)
    return s
S={}
for f in sorted(glob.glob(bl+"/solved-*.json")):
    for s in json.load(open(f)): S[s['id']]=s
bad=[];flags=[]
for i,k in K.items():
    s=S.get(i)
    if not s: bad.append((i,"NO SOLUTION"));continue
    if s.get('flag'): flags.append((i,s['flag']))
    f=k['format']; ok=True; why=""
    if f in('gap','mini'):
        for j,b in enumerate(k['blanks']):
            got=s['blanks'][j] if j<len(s.get('blanks',[])) else ''
            alts=[got]+list((s.get('alt') or [[]]*9)[j] if s.get('alt') and j<len(s['alt']) else [])
            if not any(cont(a) in {cont(x) for x in b['accepted_answers']} for a in alts):
                ok=False;why+=f"blank{j+1}: key={b['accepted_answers']} solver={alts}; "
            else:
                # solver accepted forms not in key
                extra=[a for a in alts if cont(a) not in {cont(x) for x in b['accepted_answers']}]
                if extra: flags.append((i,f"solver also accepts {extra} (blank{j+1}, key={b['accepted_answers']})"))
    elif f in('mc','which','fact'):
        c=s.get('choice'); 
        if c!=k['correct_option_index']: ok=False;why=f"key={k['correct_option_index']} solver={c} also={s.get('also_correct')}"
        elif s.get('also_correct'): ok=False;why=f"solver says also correct: {s['also_correct']} (key={c})"
    elif f=='fix':
        if bool(s.get('has_error'))!=bool(k.get('has_error')): ok=False;why=f"has_error key={k.get('has_error')} solver={s.get('has_error')}"
        elif n(s.get('answer',''))!=n(k['answer']) and cont(s.get('answer','')) not in {cont(x) for x in k['accepted_answers']}: ok=False;why=f"key={k['answer']!r} solver={s.get('answer')!r}"
    elif f in('transform','order'):
        ans=[s.get('answer','')]+list(s.get('alt') or [])
        if not any(cont(a) in {cont(x) for x in k['accepted_answers']} for a in ans): ok=False;why=f"key={k['accepted_answers']} solver={ans}"
        else:
            extra=[a for a in ans if cont(a) not in {cont(x) for x in k['accepted_answers']}]
            if extra: flags.append((i,f"solver also accepts {extra}"))
    elif f=='bank':
        if [n(x) for x in s.get('answers',[])]!=[n(x) for x in k['answers']]: ok=False;why=f"key={k['answers']} solver={s.get('answers')}"
    elif f=='sort':
        g={n(it['text']):it['group'] for it in k['items']}
        sg={n(a):b for a,b in (s.get('assign') or {}).items()}
        if g!=sg: ok=False;why="sort: "+"; ".join(f"{t}: key={g[t]} solver={sg.get(t)}" for t in g if sg.get(t)!=g[t])
    elif f=='match':
        if {(n(a),n(b)) for a,b in k['pairs']}!={(n(a),n(b)) for a,b in s.get('pairs',[])}: ok=False;why=f"match solver={s.get('pairs')}"
    elif f=='hunt':
        if sorted(s.get('wrong',[]))!=sorted(k['wrong']): ok=False;why=f"key={k['wrong']} solver={s.get('wrong')}"
    if not ok: bad.append((i,why))
json.dump({"mismatch":bad,"flags":flags},open(out,"w"),ensure_ascii=False,indent=1)
print(len(K),"tasks;",len(bad),"mismatches;",len(flags),"flags/extra-accepts")
