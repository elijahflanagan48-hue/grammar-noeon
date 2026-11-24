#!/usr/bin/env python3
"""Swap rare incidental words for common ones in a topic's bank-factory final batches.

usage: lexical_repairs.py <topic> <map.json>   (map: {"words": {rare: common}, "names": {rare: common}})
A word is left alone in a task if it occurs in a blank cue or in an answer (it may be the grammar target).
"""
import glob, json, re, sys
topic, mp = sys.argv[1], json.load(open(sys.argv[2]))
W = {k.lower(): v for k, v in {**mp.get('words', {}), **mp.get('names', {})}.items()}
def pat(words):
    return re.compile(r"\b(?:(an?)\s+)?(" + "|".join(sorted(map(re.escape, words), key=len, reverse=True)) + r")\b", re.I) if words else None
def art(w): return "an" if w[0].lower() in "aeiou" else "a"
def make_sub(map_):
    def sub(m):
        a, w = m.group(1), m.group(2)
        new = map_[w.lower()]
        if w[0].isupper() and not new[0].isupper(): new = new.capitalize()
        if a:
            na = art(new); na = na.capitalize() if a[0].isupper() else na
            return na + " " + new
        return new
    return sub
def strings(x):
    if isinstance(x, str): yield x
    elif isinstance(x, list):
        for i in x: yield from strings(i)
    elif isinstance(x, dict):
        for v in x.values(): yield from strings(v)
def protected(o):
    txt = []
    for b in o.get('blanks', []) or []:
        txt += list(strings([b.get('cue'), b.get('answer'), b.get('accepted')]))
    for k in ('answer', 'correct', 'accepted', 'answer_text'):
        if k in o: txt += list(strings(o[k]))
    return ' '.join(txt).lower()
def apply(x, rx, sub):
    if isinstance(x, str): return rx.sub(sub, x)
    if isinstance(x, list): return [apply(i, rx, sub) for i in x]
    if isinstance(x, dict): return {k: apply(v, rx, sub) for k, v in x.items()}
    return x
changed = 0
for f in sorted(glob.glob(f"content/bankgen/{topic}/final/*.jsonl")):
    out = []
    for line in open(f, encoding='utf-8'):
        if not line.strip(): continue
        o = json.loads(line); prot = protected(o)
        use = {w: v for w, v in W.items() if not re.search(r"\b" + re.escape(w) + r"\b", prot)}
        rx = pat(list(use))
        n = apply(o, rx, make_sub(use)) if rx else o
        if n != o: changed += 1
        out.append(json.dumps(n, ensure_ascii=False, separators=(",", ":")))
    open(f, 'w', encoding='utf-8').write("\n".join(out) + "\n")
print("changed items:", changed)
