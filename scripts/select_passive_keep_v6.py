#!/usr/bin/env python3
"""Pick the old v6 passive items that stay in rotation next to v7 (content/passive-bank/v7/keep-v6.txt).

Quota: 150 open_brackets (sentences + mini-texts), 50 translations, 50 Active→Passive.
Rejects anything with an explicit time cue, a banned default storyline or a 'By the …' opening,
then greedily maximises variety: distinct openings, verbs, tenses and subjects; people as subjects preferred.
"""
import collections, glob, json, re
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parent))
from passive_v7 import BANNED_FRAME, TIME, opening

ROOT = Path(__file__).resolve().parents[1]
items = [i for f in sorted(glob.glob(str(ROOT / "data/exercises/part-*.json"))) for i in json.load(open(f))
         if i.get("topic") == "passive" and not i["id"].startswith("pv7-")]
new_openings, new_verbs = collections.Counter(), collections.Counter()
lemma = lambda cue: (re.findall(r"\bto\s+([a-z]+)", cue.lower()) or [cue.lower().strip()])[-1]
for f in glob.glob(str(ROOT / "content/passive-bank/v7/final/B*.jsonl")):
    for l in open(f):
        x = json.loads(l)
        new_openings[opening(x["prompt"])] += 1
        for b in x.get("blanks", []):
            new_verbs[lemma(b["cue"])] += 1
used_verbs = collections.Counter(new_verbs)
PEOPLE = re.compile(r"^(— )?(I|We|You|He|She|They|My|Our|His|Her|Their|The (?:students|players|children|guests|staff|team|passengers|winners|pupils|workers))\b")

def ok(i):
    p = i["prompt"]
    return not TIME.search(p) and not BANNED_FRAME.search(p) and not re.match(r"\s*(—\s*)?by the", p, re.I)

def pick(pool, n):
    chosen, opens, verbs, tenses = [], collections.Counter(new_openings), collections.Counter(), collections.Counter()
    pool = [i for i in pool if ok(i)]
    def fits(i):
        return all(used_verbs[lemma(b.get("base_verb", ""))] < 10 for b in i.get("blanks", []) if b.get("base_verb"))
    while len(chosen) < n and pool:
        def score(i):
            vb = [b.get("base_verb", "") for b in i.get("blanks", [])]
            ts = [b.get("tense_or_construction") for b in i.get("blanks", [])]
            s = 3 * opens[opening(i["prompt"])] + 2 * sum(verbs[v] for v in vb) + sum(tenses[t] for t in ts) / 4
            s -= 2 if PEOPLE.match(i["prompt"]) else 0
            return s
        cands = [i for i in pool if fits(i)]
        if not cands:
            break
        best = min(cands, key=score)
        for b in best.get("blanks", []):
            used_verbs[lemma(b.get("base_verb", ""))] += 1
        pool.remove(best); chosen.append(best)
        opens[opening(best["prompt"])] += 1
        for b in best.get("blanks", []):
            verbs[b.get("base_verb", "")] += 1; tenses[b.get("tense_or_construction")] += 1
    return chosen

ob = pick([i for i in items if i["type"] == "open_brackets"], 150)
tr = pick([i for i in items if i["type"] == "translation_ru_en"], 50)
rw = pick([i for i in items if i["type"] not in ("open_brackets", "translation_ru_en")], 50)
out = ROOT / "content/passive-bank/v7/keep-v6.txt"
out.write_text("# Old v6 items kept in rotation (scripts/select_passive_keep_v6.py)\n" + "".join(i["id"] + "\n" for i in ob + tr + rw))
print(len(ob), len(tr), len(rw), collections.Counter(i.get("layout") for i in ob))
