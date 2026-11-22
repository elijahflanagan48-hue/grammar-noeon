#!/usr/bin/env python3
"""Apply Claude's editorial review to Gemini output: raw/Bxx.jsonl → final/Bxx.jsonl.

Patches live in content/passive-bank/v7/review/patches_*.py (dict P keyed by item id).
Ops: add/rm {blank: [answers]}, acc {blank: [answers]} (replace), ans {blank: answer},
     rep [(old, new)] in prompt (cues are then re-synced from brackets), opt {i: text},
     opt_all [4 options] + correct, add_fix [sentences], fix_answer, voice/cons {blank: ...},
     expl (new explanation_ru), reject (reason).
Generic normalisation for every item: cue order "to not / x" → "not / to x", missing "to"
in single-verb cues, lowercase "(To x)", 1-gap minis become gaps, active gaps never carry
pv_* constructions, accepted answers deduplicated case-insensitively.
"""
import glob, importlib.util, json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
V7 = ROOT / "content/passive-bank/v7"
GAP = re.compile(r"\(([^()]+)\)")
PARTICIPLE_TO_VERB = {"stuck": "stick"}


def load_patches():
    P = {}
    for f in sorted(glob.glob(str(V7 / "review/patches_*.py"))):
        spec = importlib.util.spec_from_file_location(Path(f).stem, f)
        m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
        dup = set(P) & set(m.P)
        assert not dup, f"duplicate patches {dup}"
        P.update(m.P)
    return P


def norm_cue(c):
    c = c.strip()
    m = re.fullmatch(r"to not / (.+)", c)
    if m:
        c = f"not / to {m[1]}"
    if c[:3] == "To ":
        c = "to " + c[3:]
    if "/" not in c and c != "preposition" and not c.startswith("to ") and re.fullmatch(r"[a-z][a-z\- ]*", c):
        w = c.split()
        w[0] = PARTICIPLE_TO_VERB.get(w[0], w[0])
        c = "to " + " ".join(w)
    return c


def dedupe(xs):
    out, seen = [], set()
    for x in xs:
        k = x.strip().lower()
        if k and k not in seen:
            seen.add(k); out.append(x.strip())
    return out


def apply(it, p):
    for old, new in p.get("rep", []):
        assert old in it["prompt"], (it["id"], old)
        it["prompt"] = it["prompt"].replace(old, new)
    bl = it.get("blanks", [])
    for i, v in p.get("acc", {}).items(): bl[i]["accepted_answers"] = list(v)
    for i, v in p.get("ans", {}).items(): bl[i]["answer"] = v
    for i, v in p.get("add", {}).items(): bl[i]["accepted_answers"] += v
    for i, v in p.get("rm", {}).items():
        bl[i]["accepted_answers"] = [a for a in bl[i]["accepted_answers"] if a not in v]
    for i, v in p.get("voice", {}).items(): bl[i]["voice"] = v
    for i, v in p.get("cons", {}).items(): bl[i]["construction"] = v
    for i, v in p.get("opt", {}).items(): it["options"][i] = v
    if "opt_all" in p:
        it["options"] = list(p["opt_all"]); it["correct_option_index"] = p["correct"]
    if "fix_answer" in p:
        it["answer"] = p["fix_answer"]; it["accepted_answers"] = [p["fix_answer"]]
    if "add_fix" in p:
        it["accepted_answers"] += p["add_fix"]
    if "expl" in p:
        it["explanation_ru"] = p["expl"]


def normalise(it):
    if it["format"] in ("gap", "mini"):
        # lowercase sentence-initial "(To x)" and normalise every cue in the prompt
        it["prompt"] = GAP.sub(lambda m: f"({norm_cue(m[1])})", it["prompt"])
        cues = GAP.findall(it["prompt"])
        for i, b in enumerate(it["blanks"]):
            if i < len(cues):
                b["cue"] = cues[i]
            b["accepted_answers"] = dedupe([b["answer"]] + b["accepted_answers"])
            if b.get("voice") == "active" and str(b.get("construction", "")).startswith("pv_"):
                b["construction"] = "active_other"
        if it["format"] == "mini" and len(it["blanks"]) == 1:
            it["format"] = "gap"
    elif it["format"] == "fix":
        if it["answer"] not in it["accepted_answers"]:
            it["accepted_answers"].insert(0, it["answer"])
        it["accepted_answers"] = dedupe(it["accepted_answers"])
        if it.get("has_error") is False:
            it["answer"] = it["prompt"]; it["accepted_answers"] = dedupe([it["prompt"]] + it["accepted_answers"])


def main():
    P = load_patches()
    (V7 / "final").mkdir(exist_ok=True)
    used, rejected, kept = set(), [], 0
    for f in sorted(glob.glob(str(V7 / "raw/B*.jsonl"))):
        out = []
        for line in open(f, encoding="utf-8"):
            if not line.startswith("{"):
                continue
            it = json.loads(line)
            p = P.get(it["id"], {})
            used.add(it["id"])
            if "reject" in p:
                rejected.append((it["id"], p["reject"])); continue
            apply(it, p)
            normalise(it)
            out.append(json.dumps(it, ensure_ascii=False))
        (V7 / "final" / Path(f).name).write_text("\n".join(out) + "\n", encoding="utf-8")
        kept += len(out)
    unknown = set(P) - used
    assert not unknown, f"patches for unknown ids: {unknown}"
    (V7 / "review/rejected.txt").write_text("".join(f"{i}\t{r}\n" for i, r in rejected))
    print(f"final items: {kept}, rejected: {len(rejected)}, patched: {len(P) - len(rejected)}")


if __name__ == "__main__":
    main()
