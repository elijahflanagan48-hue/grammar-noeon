#!/usr/bin/env python3
"""Remove the later seed of every near-duplicate pair (Jaccard>0.55 on 4+-letter words). usage: <topic>"""
import json, re, glob, sys, pathlib
topic = sys.argv[1]
base = pathlib.Path(__file__).resolve().parents[1] / "content/bankgen" / topic
rows = []
for f in sorted(glob.glob(str(base / "seeds/seeds-*.jsonl"))):
    for l in open(f, encoding="utf-8"):
        if l.strip().startswith("{"):
            rows.append(json.loads(l))
toks = lambda s: set(re.findall(r"[a-z]{4,}", s.lower()))
T = [toks(r["situation"]) for r in rows]
drop = set()
for i in range(len(rows)):
    if rows[i]["seed_id"] in drop: continue
    for j in range(i + 1, len(rows)):
        if rows[j]["seed_id"] in drop: continue
        if T[i] and T[j] and len(T[i] & T[j]) / len(T[i] | T[j]) > .55:
            drop.add(rows[j]["seed_id"])
for f in sorted(glob.glob(str(base / "seeds/seeds-*.jsonl"))):
    keep = [l for l in open(f, encoding="utf-8") if l.strip().startswith("{") and json.loads(l)["seed_id"] not in drop]
    open(f, "w", encoding="utf-8").writelines(keep)
json.dump(sorted(drop), open(base / "seeds-dropped.json", "w"))
print("dropped", len(drop))
