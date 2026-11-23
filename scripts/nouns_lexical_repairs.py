#!/usr/bin/env python3
"""Swap rare incidental words in the nouns final batches for common ones (keeps grammar targets)."""
import glob, json, re, sys
MAP = {
 "guesthouses": "hotels", "guesthouse": "hotel", "homemade": "simple", "glue": "paint",
 "courtyard": "garden", "oats": "rice", "pier": "beach", "secondhand": "book",
 "caretaker": "cleaner", "compass": "watch", "flasks": "cups", "flask": "cup",
 "interns": "students", "intern": "student", "crumbs": "bits", "crumb": "bit",
 "noodles": "rice", "pouch": "bag", "kiosk": "shop", "dough": "mix",
 # round 2
 "orchard": "farm", "tacos": "burgers", "pigeon": "bird", "teapot": "pot", "grandad": "uncle",
 "dunes": "hills", "crossword": "word", "puppet": "magic", "hamsters": "rabbits", "waffles": "cakes",
 "crates": "boxes", "crate": "box", "lanterns": "flags", "rooftop": "roof", "driveway": "gate",
 "loft": "brown", "firewood": "wood", "rink": "park", "buffet": "restaurant", "seafront": "beach",
 "skaters": "children", "shoelace": "shoe", "fizzy": "cold", "halted": "stopped", "pastries": "cakes",
 "handwritten": "written", "hikers": "visitors", "spotless": "clean", "courier": "driver",
 "hillside": "hill", "miriam": "Mary", "vito": "Nick", "malcolm": "Mark", "laure": "Lucy",
}
PAT = re.compile(r"\b(?:(an?)\s+)?(" + "|".join(sorted(MAP, key=len, reverse=True)) + r")\b", re.I)
def art(word):
    return "an" if word[0].lower() in "aeiou" else "a"
def sub(m):
    a, w = m.group(1), m.group(2)
    new = MAP[w.lower()]
    if w[0].isupper(): new = new.capitalize()
    if a:
        na = art(new)
        if a[0].isupper(): na = na.capitalize()
        return na + " " + new
    return new
def walk(x):
    if isinstance(x, str): return PAT.sub(sub, x)
    if isinstance(x, list): return [walk(i) for i in x]
    if isinstance(x, dict): return {k: walk(v) for k, v in x.items()}
    return x
changed = 0
for f in sorted(glob.glob("content/bankgen/nouns/final/NN*.jsonl")):
    out = []
    for line in open(f, encoding="utf-8"):
        if not line.strip(): continue
        o = json.loads(line); n = walk(o)
        if n != o: changed += 1
        out.append(json.dumps(n, ensure_ascii=False, separators=(",", ":")))
    open(f, "w", encoding="utf-8").write("\n".join(out) + "\n")
print("changed items:", changed)
