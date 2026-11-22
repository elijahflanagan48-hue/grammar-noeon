#!/usr/bin/env python3
"""Split multi-part seed files from Gemini (one big JSONL) into seeds-NN.jsonl by seed_id part.
usage: bankgen_split_seeds.py <topic> <file>...   (writes content/bankgen/<topic>/seeds/seeds-NN.jsonl)"""
import json, re, sys, pathlib
topic = sys.argv[1]
out = pathlib.Path(__file__).resolve().parents[1] / "content/bankgen" / topic / "seeds"
out.mkdir(parents=True, exist_ok=True)
parts = {}
bad = 0
for f in sys.argv[2:]:
    for line in open(f, encoding="utf-8"):
        line = line.strip()
        if not line.startswith("{"):
            continue
        try:
            o = json.loads(line)
        except Exception:
            bad += 1; continue
        m = re.match(r"^[a-z]+-(\d\d)(\d\d)$", o.get("seed_id", ""))
        if not m:
            bad += 1; continue
        parts.setdefault(m.group(1), {})[o["seed_id"]] = o
for n, d in sorted(parts.items()):
    with open(out / f"seeds-{n}.jsonl", "w", encoding="utf-8") as fh:
        for k in sorted(d):
            fh.write(json.dumps(d[k], ensure_ascii=False) + "\n")
    print(n, len(d))
print("unparsable:", bad)
