#!/usr/bin/env python3
"""Audit how varied an exercise bank is (all topics or one).

Measures what a learner actually *feels* as repetition, not just exact duplicates:
  * skeleton  — the sentence with content words masked (function words, time markers and
                the gap kept). Many items sharing one skeleton = "one pattern again".
  * opening   — first two words of the prompt.
  * cue       — the explicit time/aspect marker that gives the answer away.
  * decision  — what the learner has to decide (construction / answer form family).
  * near-dups — pairs of items with word-trigram Jaccard >= 0.45.

Usage:  python3 scripts/audit_variety.py [topic] [--md docs/variety/report.md]
"""
from __future__ import annotations
import argparse, collections, glob, json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FUNC = set("""a an the this that these those my your his her its our their i you he she it we they me him us them
is are was were be been being am has have had will would shall should can could may might must do does did not n't
to of in on at by for from with about into over after before since until while when as if than so and or but because
what who whom which whose where why how there here all every each some any no never ever already just yet still
""".split())
CUES = r"(by the time|by the end of|by next \w+|by tomorrow|yesterday|last \w+|every \w+|at the moment|right now|now|already|since|for the past|just|yet|tomorrow|next \w+|ago|in \d{4}|so far|recently|currently|tonight)"
GAP = re.compile(r"\([^()]*\)|_{2,}")


def load(topic: str | None):
    items = []
    for f in sorted(glob.glob(str(ROOT / "data/exercises/part-*.json"))):
        d = json.load(open(f))
        for x in d if isinstance(d, list) else d.get("items", []):
            t = x.get("topic") or "tenses"
            if topic in (None, t):
                items.append(x)
    return items


def skeleton(prompt: str) -> str:
    s = GAP.sub(" G ", prompt.lower())
    s = re.sub(CUES, lambda m: m[0].replace(" ", "_").upper(), s)
    out = []
    for w in re.findall(r"[A-Z_0-9]+|[a-z']+|[—?!.,:;]", s):
        if w == "G" or w.isupper() or w in FUNC or not w[0].isalpha():
            out.append(w)
        elif not out or out[-1] != "w":
            out.append("w")
    return " ".join(out)


def trigrams(text: str):
    w = re.findall(r"[a-z']+", text.lower())
    return {tuple(w[i:i + 3]) for i in range(len(w) - 2)}


def audit(items, label):
    n = len(items)
    blanks = [b for x in items for b in x.get("blanks", [])]
    sk = collections.Counter(skeleton(x["prompt"]) for x in items)
    opening = collections.Counter(" ".join(x["prompt"].split()[:2]).lower() for x in items)
    cues = collections.Counter(m.lower() for x in items for m in re.findall(CUES, x["prompt"], re.I))
    cued = sum(bool(re.search(CUES, x["prompt"], re.I)) for x in items)
    decision = collections.Counter(b.get("tense_or_construction") for b in blanks)
    verbs = collections.Counter((b.get("base_verb") or "").replace("to ", "") for b in blanks)
    types = collections.Counter(x["type"] for x in items)
    grams = [(x["id"], trigrams(x["prompt"])) for x in items]
    near = 0
    examples = []
    for i in range(len(grams)):
        a = grams[i][1]
        if len(a) < 4:
            continue
        for j in range(i + 1, len(grams)):
            b = grams[j][1]
            if len(b) < 4:
                continue
            jac = len(a & b) / len(a | b)
            if jac >= 0.45:
                near += 1
                if len(examples) < 5:
                    examples.append((grams[i][0], grams[j][0], round(jac, 2)))
    repeated_sk = sum(v for v in sk.values() if v > 1)
    lines = [f"## {label} — {n} items",
             f"- formats: {dict(types)}",
             f"- distinct decisions (constructions): {len(decision)}; top: {decision.most_common(5)}",
             f"- items with an explicit time cue: {cued} ({cued * 100 // max(n, 1)}%); top cues: {cues.most_common(6)}",
             f"- items sharing a skeleton with another item: {repeated_sk} ({repeated_sk * 100 // max(n, 1)}%)",
             f"- top skeletons: " + "; ".join(f"`{k}` ×{v}" for k, v in sk.most_common(4)),
             f"- top-10 openings cover {sum(v for _, v in opening.most_common(10)) * 100 // max(n, 1)}%: {opening.most_common(6)}",
             f"- most frequent verbs: {verbs.most_common(8)}",
             f"- near-duplicate pairs (trigram Jaccard ≥ 0.45): {near} {examples}"]
    return "\n".join(lines)


def gate(items, limits):
    """Return human-readable violations, including values and affected IDs."""
    items=[i for i in items if (i.get('topic') or 'tenses')==limits['topic'] and not (limits.get('exclude_retired') and i.get('retired'))]
    n=len(items)
    failures=[]
    if not n: return ['empty eligible bank: 0 items']
    def maximum(name, actual, limit, ids):
        if actual>limit:
            failures.append(f'{name}: actual={actual:.6g}, limit={limit:.6g}, excess={actual-limit:.6g}; items: '+', '.join(ids))
    openings=collections.defaultdict(list)
    verbs=collections.defaultdict(list)
    for item in items:
        openings[' '.join(item['prompt'].lower().split()[:2])].append(item['id'])
        for b in item.get('blanks',[]):
            cue=b.get('base_verb','')
            matches=re.findall(r'\bto\s+([a-z]+)',cue.lower())
            verb=matches[-1] if matches else cue.lower().strip()
            if verb:verbs[verb].append(item['id'])
    for opening, ids in sorted(openings.items()): maximum('opening '+repr(opening),len(ids)/n,limits['max_opening_share'],ids)
    by=[i['id'] for i in items if re.match(r'\s*(?:[—–-]\s*)?by the (?:time|end)',i['prompt'],re.I)]
    maximum('By the time/end share',len(by)/n,limits['max_by_the_share'],by)
    exempt=set(limits.get('verb_exempt',[]))
    for verb, ids in sorted(verbs.items()):
        if verb not in exempt: maximum('verb '+verb,len(ids),limits['max_verb_uses'],ids)
    timed=[i['id'] for i in items if re.search(CUES,i['prompt'],re.I)]
    maximum('time marker share',len(timed)/n,limits['max_time_marker_share'],timed)
    d2=[(i,b) for i in items if i.get('cell')=='D2' for b in i.get('blanks',[])]
    active=sum(b.get('voice')=='active' for _,b in d2)/max(1,len(d2))
    if active<limits['min_active_share_in_D2']:
        failures.append(f'D2 active share: actual={active:.6g}, minimum={limits["min_active_share_in_D2"]}, shortfall={limits["min_active_share_in_D2"]-active:.6g}; items: '+', '.join(dict.fromkeys(i['id'] for i,_ in d2)))
    for cell, target in limits['cell_shares'].items():
        ids=[i['id'] for i in items if i.get('cell','D1')==cell]
        delta=abs(len(ids)/n-target)
        maximum(f'cell {cell} deviation (share={len(ids)/n:.6g}, target={target})',delta,limits['cell_tolerance'],ids)
    grams=[(i['id'],trigrams(i['prompt'])) for i in items]
    pairs=[]
    for k,(a,ga) in enumerate(grams):
        if len(ga)<4:continue
        for b,gb in grams[k+1:]:
            if len(gb)>=4 and len(ga&gb)/len(ga|gb)>=.45:pairs.append(a+' / '+b)
    maximum('near duplicate pairs',len(pairs),limits['max_near_duplicate_pairs'],pairs)
    return failures


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("topic", nargs="?")
    ap.add_argument("--md")
    ap.add_argument("--gate", help="JSON limits; nonzero exit when any limit is broken")
    a = ap.parse_args()
    limits=json.loads(Path(a.gate).read_text()) if a.gate else None
    items = load(a.topic or (limits['topic'] if limits else None))
    if limits:
        failures=gate(items,limits)
        print('Variety gate: '+('FAIL' if failures else 'PASS'))
        for failure in failures:print('- '+failure)
        raise SystemExit(1 if failures else 0)
    groups = collections.defaultdict(list)
    for x in items:
        groups[x.get("topic") or "tenses"].append(x)
    report = "\n\n".join(audit(v, k) for k, v in groups.items())
    print(report)
    if a.md:
        Path(a.md).parent.mkdir(parents=True, exist_ok=True)
        Path(a.md).write_text("# Variety audit\n\n" + report + "\n")
