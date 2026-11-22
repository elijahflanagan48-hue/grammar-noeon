#!/usr/bin/env python3
"""Lexical difficulty audit.

Grammar drills must not be made hard by vocabulary: the learner is practising grammar, not words.
A word is "hard" for an item when its CEFR level (cefrpy) is above the cap for the item's level
and it is not a really frequent word (wordfreq Zipf >= 4.3).  Words unknown to both lists count as
hard only when they are also rare (Zipf < 3.8).  Proper names, contractions and grammar terms
that the exercise itself needs (preposition, quantifier...) are ignored.

Level caps: basic -> A2, medium -> B1, advanced -> B2.  Hard words allowed per item: 0 / 0 / 1.

Usage: python3 scripts/lexical_audit.py [topic] [--list N] [--json out.json] [--gate]
"""
from __future__ import annotations
import argparse, collections, glob, json, re, sys
from pathlib import Path
try:
    from cefrpy import CEFRAnalyzer
    from wordfreq import zipf_frequency as zf
except ImportError:  # the check is optional where the word lists are not installed
    print("SKIP lexical audit: pip install wordfreq cefrpy")
    sys.exit(0)

ROOT = Path(__file__).resolve().parents[1]
CAP = {"basic": 2, "medium": 3, "advanced": 4}      # A1=1 A2=2 B1=3 B2=4 C1=5 C2=6
RARE_ALLOWED = {"basic": 0, "medium": 1, "advanced": 2}   # C1/C2/unknown-and-rare words
SOFT_ALLOWED = {"basic": 2, "medium": 3, "advanced": 4}   # words above the level cap
RESCUE = 4.3
# ordinary words that the CEFR list rates too high
OK_WORDS = set("upside halfway hallway seventeenth commuters commuter grocery groceries pianist amateur swap volunteer volunteers laptop flatmate flatmates".split())
LEVEL = {"A1": 1, "A2": 2, "B1": 3, "B2": 4, "C1": 5, "C2": 6}
GRAMMAR_TERMS = set("""preposition prepositions quantifier quantifiers adjective adverb gerund infinitive participle
passive active clause modal auxiliary pronoun noun verb tense article countable uncountable comparative superlative""".split())
BRIT = [("our", "or"), ("ise", "ize"), ("ised", "ized"), ("ising", "izing"), ("tre", "ter"), ("ogue", "og"), ("ll", "l"), ("ence", "ense"), ("yse", "yze")]
WORD = re.compile(r"[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ'’-]*")
_an = CEFRAnalyzer()


def forms(w: str):
    import unicodedata
    w = unicodedata.normalize("NFKD", w.lower()).encode("ascii", "ignore").decode()
    out = {w}
    for suf, rep in (("ies", "y"), ("ied", "y"), ("es", ""), ("s", ""), ("ed", ""), ("ed", "e"), ("ing", ""), ("ing", "e"), ("ly", ""), ("er", ""), ("est", ""), ("ier", "y")):
        if w.endswith(suf) and len(w) - len(suf) >= 3:
            out.add(w[: -len(suf)] + rep)
    for s in list(out):
        if len(s) > 3 and s[-1] == s[-2]:
            out.add(s[:-1])
        for a, b in BRIT:
            if a in s:
                out.add(s.replace(a, b))
        out.add(s.replace("ll", "l"))
    return out


def cefr(w: str):
    best = None
    for f in forms(w):
        try:
            v = _an.get_average_word_level_CEFR(f)
        except Exception:
            v = None
        if v is not None:
            n = LEVEL[str(v)]
            best = n if best is None else min(best, n)
    return best


def zipf(w: str) -> float:
    return max(zf(f, "en") for f in forms(w))


def load_items(topic=None, include_retired=False):
    items = []
    for f in sorted(glob.glob(str(ROOT / "data/exercises/part-*.json"))):
        d = json.load(open(f))
        for x in d if isinstance(d, list) else d.get("items", []):
            if x.get("retired") and not include_retired:
                continue
            t = x.get("topic") or "tenses"
            if topic in (None, t):
                items.append((t, x))
    return items


def lexical_text(x):
    text = x['prompt']
    if x.get('topic') == 'conditionals':
        text += ' ' + ' '.join(v for k in ('options', 'starts', 'endings', 'sort_items', 'word_bank', 'sentences') for v in x.get(k, []))
    return text


def find_names(items):
    names = collections.Counter()
    for _, x in items:
        p = lexical_text(x)
        for m in WORD.finditer(p):
            w = m.group(0)
            if w[0].isupper() and m.start() > 0 and p[max(0, m.start() - 2):m.start()].strip() not in {"", ".", "?", "!", ":", "“", '"', "(", "—"}:
                names[w] += 1
        for m in re.finditer(r"\b([A-Z][a-z]+)(?: to [A-Z][a-z]+)?\s*[:→]", p):
            names[m.group(1)] += 2
    return set(names)


def hard_words(x, names, extra_ok=frozenset()):
    level = x.get("level", "medium")
    cap = CAP.get(level, 3)
    text = lexical_text(x) + " " + " ".join((b.get("base_verb") or b.get("cue") or "") for b in x.get("blanks", []))
    res = []
    for m in WORD.finditer(text):
        w = m.group(0)
        if "'" in w or "’" in w or "-" in w:
            parts = [p for p in re.split(r"['’-]", w) if len(p) > 3]
            if "'" in w or "’" in w:
                parts = parts[:1] if re.split(r"['’]", w)[1:2] == ["s"] else []
        else:
            parts = [w]
        for p in parts:
            lw = p.lower()
            if len(lw) < 3 or p in names or lw in GRAMMAR_TERMS or lw in extra_ok or lw in OK_WORDS:
                continue
            c = cefr(lw)
            z = zipf(lw)
            if p[0].isupper() and c is None:
                continue  # unknown capitalised word = a name
            if c is None:
                if z < 3.8:
                    res.append((lw, "?", round(z, 1), True))
            elif c > cap and z < RESCUE:
                res.append((lw, [k for k, v in LEVEL.items() if v == c][0], round(z, 1), c >= 5))
    return res


def over_limit(x, hw):
    lv = x.get("level", "medium")
    rare = sum(1 for h in hw if h[3])
    return rare > RARE_ALLOWED.get(lv, 0) or len(hw) - rare > SOFT_ALLOWED.get(lv, 2)


def run(topic=None, include_retired=False):
    items = load_items(topic, include_retired)
    names = find_names(load_items(None, True))
    rows = collections.defaultdict(list)
    for t, x in items:
        rows[t].append((x, hard_words(x, names)))
    return rows


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("topic", nargs="?")
    ap.add_argument("--list", type=int, default=0)
    ap.add_argument("--json")
    ap.add_argument("--gate", type=float, help="fail if share of over-limit items in any topic exceeds this (0..1)")
    a = ap.parse_args()
    rows = run(a.topic)
    if a.topic and not rows:
        sys.exit("No exercises found for topic: " + a.topic)
    out, bad = {}, False
    for t, rs in rows.items():
        n = len(rs)
        over = [(x, hw) for x, hw in rs if over_limit(x, hw)]
        cnt = collections.Counter(h[0] for _, hw in rs for h in hw if h[3])
        print(f"## {t}: {n} items | OVER limit {len(over)} ({len(over)*100//n}%)")
        print("   top hard words:", cnt.most_common(20))
        for lv in ("basic", "medium", "advanced"):
            r = [(x, hw) for x, hw in rs if x.get("level") == lv]
            if r:
                o = sum(over_limit(x, hw) for x, hw in r)
                print(f"   {lv}: {len(r)} items, over limit {o} ({o*100//len(r)}%)")
        out[t] = [{"id": x["id"], "level": x.get("level"), "hard": hw, "prompt": x["prompt"]} for x, hw in over]
        for x, hw in over[: a.list]:
            print("   -", x["id"], x.get("level"), hw, x["prompt"][:120])
        if a.gate is not None and len(over) / n > a.gate:
            bad = True
    if a.json:
        json.dump(out, open(a.json, "w"), ensure_ascii=False, indent=1)
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
