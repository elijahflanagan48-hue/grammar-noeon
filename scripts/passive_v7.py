#!/usr/bin/env python3
"""Passive Voice v7 pipeline: seed assignment, Gemini batch prompts, validation.

  python3 scripts/passive_v7.py seeds-check            # check the seed catalogue
  python3 scripts/passive_v7.py prompts [B01 ...]      # write ready Gemini prompts
  python3 scripts/passive_v7.py validate [B01 ...]     # check Gemini output, write report + repair prompts

Files
  docs/variety/passive-v7/plan.json                    batch plan
  docs/variety/passive-v7/gemini/*.md                  master prompt, cell guides, templates
  content/passive-bank/v7/seeds/seeds-*.jsonl          seed catalogue (Gemini, stage 0)
  content/passive-bank/v7/prompts/Bxx.md               generated batch prompts
  content/passive-bank/v7/raw/Bxx.jsonl                Gemini output, as pasted
  content/passive-bank/v7/reports/Bxx.md|repair-Bxx.md validation report and repair prompt
"""
from __future__ import annotations
import collections, glob, json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOC = ROOT / "docs/variety/passive-v7"
BANK = ROOT / "content/passive-bank/v7"
PLAN = json.loads((DOC / "plan.json").read_text())
BATCHES = {b["batch"]: b for b in PLAN["batches"]}
CELLS = {f"D{i}" for i in range(1, 12)}
FORMATS = {"gap", "mini", "mc", "fix", "which"}
LEVELS = {"basic", "medium", "advanced"}
GENRES = set("news notice instructions recipe process history report review dialogue chat email school work travel sport tech health nature arts science home city shopping food".split())
CONSTRUCTIONS = set("""pv_present_simple pv_present_continuous pv_present_perfect pv_past_simple pv_past_continuous pv_past_perfect
pv_future_simple pv_future_perfect pv_modal pv_modal_perfect pv_going_to pv_infinitive pv_perfect_infinitive pv_gerund
pv_perfect_participle pv_reporting_it pv_reporting_inf pv_two_objects pv_prepositional pv_get pv_causative pv_make_allow
pv_perception pv_state pv_need_ing pv_born pv_agent pv_question pv_negative active_present_simple active_present_continuous
active_present_perfect active_present_perfect_continuous active_past_simple active_past_continuous active_past_perfect
active_future_simple active_future_perfect active_other""".split())
TIME = re.compile(r"\b(yesterday|last (?:night|week|month|year|summer|winter|spring|autumn|weekend|time)|every (?:day|week|month|year|morning|evening|night|summer)|"
                  r"at the moment|right now|now|already|since|for the past|just|yet|tomorrow|next (?:week|month|year|time|day|summer|season|spring)|"
                  r"ago|so far|by the time|by the end of|by (?:next|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)|currently|tonight|recently)\b", re.I)
BANNED_FRAME = re.compile(r"\b(repair|repaint|paint|renovat|rebuil|built|build|demolish|pull(?:ed)? down|knock(?:ed)? down|clean|wash|redecorat|restor)\w*\b[^.]{0,60}?"
                          r"\b(bridge|school|museum|house|road|building|church|station|library|hospital|castle|tower|stadium|cinema|window|dishes|room)s?\b"
                          r"|\b(bridge|school|museum|house|road|building|church|station|library|hospital|castle|tower|stadium|cinema|window|dishes|room)s?\b[^.]{0,40}?\((?:[^)]*/ )?to (repair|paint|build|clean|wash|renovate|rebuild|demolish|restore|redecorate)\)"
                          r"|\b(english|rice|tea|coffee) \(to (speak|grow)\)|\bletters? \(to deliver\)|\(to cancel\)|\bcake \(to eat\)|\bcar \(to steal\)|\bhomework \(to do\)", re.I)
OLD_NAMES = {"Nora", "Maya", "Nina", "Mia", "Tom", "Anna", "John", "Mary", "Bob"}
NOT_NAMES = set("""I I'm I've I'd I'll Monday Tuesday Wednesday Thursday Friday Saturday Sunday January February March April May June July
August September October November December English British Scottish Welsh Irish French German Spanish Italian Russian Polish Chinese
Japanese Indian London Leeds Manchester Edinburgh Glasgow Cardiff Bristol Oxford Cambridge Brighton York Liverpool UK US Mr Mrs Ms Dr
Christmas Easter TV OK IT AI""".split())
GAP = re.compile(r"\(([^()]+)\)")


def read_jsonl(path: Path):
    rows, bad = [], []
    for n, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        line = line.strip()
        if not line or line.startswith("#") or line.startswith("```"):
            continue
        try:
            rows.append(json.loads(line))
        except json.JSONDecodeError as e:
            bad.append(f"{path.name}:{n}: not valid JSON ({e.msg})")
    return rows, bad


def seeds():
    out = {}
    for f in sorted(glob.glob(str(BANK / "seeds/seeds-*.jsonl"))):
        rows, _ = read_jsonl(Path(f))
        for s in rows:
            out[s["seed_id"]] = s
    return out


def raw_items(only=None):
    items = []
    for f in sorted(glob.glob(str(BANK / "raw/B*.jsonl"))):
        b = Path(f).stem
        if only and b not in only:
            continue
        rows, bad = read_jsonl(Path(f))
        for r in rows:
            r["_batch"] = b
        items.append((b, rows, bad))
    return items


def trigrams(text):
    w = re.findall(r"[a-z']+", text.lower())
    return {tuple(w[i:i + 3]) for i in range(len(w) - 2)}


def opening(text):
    t = re.sub(r"^[—–\-\s]+", "", text)
    return " ".join(re.findall(r"[A-Za-z']+", t)[:2]).lower()


def cue_verbs(item):
    out = []
    for b in item.get("blanks", []):
        words = [w.strip() for w in b.get("cue", "").split("/")]
        out += [w[3:].split()[0] for w in words if w.startswith("to ")]
        out += [w.split()[0] for w in words if w and not w.startswith("to ") and w.split()[0] in {"wash", "clean", "wait", "wear", "leave", "use", "climb", "sing", "go"}]
    return out


def names(text):
    toks = re.findall(r"(?<![.!?—]\s)(?<!^)\b([A-Z][a-z]{2,})\b", text)
    return {t for t in toks if t not in NOT_NAMES}


def old_bank_prompts():
    out = []
    for f in sorted(glob.glob(str(ROOT / "data/exercises/part-*.json"))):
        d = json.load(open(f))
        out += [x["prompt"] for x in (d if isinstance(d, list) else d.get("items", [])) if x.get("topic") == "passive"]
    return out


# ---------------------------------------------------------------- validation

def check_item(it, seen_seeds, seed_db):
    e, w = [], []
    fmt, cell = it.get("format"), it.get("cell")
    for k in ("id", "seed_id", "cell", "format", "genre", "level", "prompt", "explanation_ru"):
        if not it.get(k):
            e.append(f"no field `{k}`")
    if cell not in CELLS: e.append(f"unknown cell {cell}")
    if fmt not in FORMATS: e.append(f"unknown format {fmt}")
    if it.get("level") not in LEVELS: e.append(f"unknown level {it.get('level')}")
    if it.get("genre") and it["genre"] not in GENRES: w.append(f"genre `{it['genre']}` is not in the list")
    if it.get("explanation_ru") and not re.search("[а-яА-Я]", it["explanation_ru"]): e.append("explanation_ru is not in Russian")
    sid = it.get("seed_id")
    if sid:
        if seed_db and sid not in seed_db: e.append(f"seed {sid} is not in the catalogue")
        if sid in seen_seeds and seen_seeds[sid] != it.get("id"): e.append(f"seed {sid} already used in {seen_seeds[sid]}")
        seen_seeds.setdefault(sid, it.get("id"))
    p = it.get("prompt", "")
    if fmt in ("gap", "mini"):
        bl = it.get("blanks") or []
        cues = GAP.findall(p)
        if len(cues) != len(bl): e.append(f"brackets in prompt: {len(cues)}, blanks: {len(bl)}")
        if fmt == "gap" and not 1 <= len(bl) <= 2: e.append("gap: 1–2 gaps required")
        if fmt == "mini" and not 2 <= len(bl) <= 4: e.append("mini: 2–4 gaps required")
        if fmt == "mini" and len(re.findall(r"[.!?…](?:\s|$)", p)) < 3: w.append("mini: fewer than 3 sentences")
        for i, b in enumerate(bl):
            if i < len(cues) and cues[i].strip() != b.get("cue", "").strip(): e.append(f"gap {i+1}: cue `{b.get('cue')}` ≠ bracket `({cues[i]})`")
            if re.search(r"\b(be|been|being|by)\b", b.get("cue", "")): e.append(f"gap {i+1}: the bracket gives a hint (`{b.get('cue')}`)")
            acc = b.get("accepted_answers") or []
            if b.get("answer") not in acc: e.append(f"gap {i+1}: answer is not in accepted_answers")
            if b.get("voice") not in ("active", "passive"): e.append(f"gap {i+1}: voice must be active/passive")
            if b.get("construction") not in CONSTRUCTIONS: e.append(f"gap {i+1}: unknown construction `{b.get('construction')}`")
            if b.get("voice") == "active" and str(b.get("construction", "")).startswith("pv_") and b.get("construction") not in ("pv_need_ing", "pv_state", "pv_agent", "pv_question"):
                w.append(f"gap {i+1}: voice=active but construction={b.get('construction')}")
    elif fmt in ("mc", "which"):
        o = it.get("options") or []
        if len(o) != 4 or len(set(o)) != 4: e.append("4 distinct options required")
        if it.get("correct_option_index") not in range(4): e.append("correct_option_index must be 0–3")
        if fmt == "mc" and "___" not in p: e.append("mc: prompt has no ___")
        if it.get("construction") not in CONSTRUCTIONS: e.append(f"unknown construction `{it.get('construction')}`")
    elif fmt == "fix":
        if not isinstance(it.get("has_error"), bool): e.append("fix: has_error must be true/false")
        if it.get("answer") not in (it.get("accepted_answers") or []): e.append("fix: answer is not in accepted_answers")
        if it.get("has_error") is False and it.get("answer") != p: e.append("fix without error: answer must equal prompt")
        if it.get("has_error") and it.get("answer") == p: e.append("fix: has_error=true, but the answer equals the prompt")
        if it.get("construction") not in CONSTRUCTIONS: e.append(f"unknown construction `{it.get('construction')}`")
    if BANNED_FRAME.search(p): w.append("banned storyline (repair/building/default)")
    if names(p) & OLD_NAMES: w.append(f"overused name: {names(p) & OLD_NAMES}")
    if re.match(r"\s*(—\s*)?by the (time|end)", p, re.I): e.append("opening with By the time / By the end is banned")
    return e, w


def validate(only=None):
    seed_db = seeds()
    data = raw_items(only)
    all_items = [it for _, rows, _ in raw_items() for it in rows]
    old = [(f"old:{i}", trigrams(t)) for i, t in enumerate(old_bank_prompts())]
    seen_seeds = {}
    for it in all_items:  # seeds from batches not under review count as used
        if it.get("_batch") not in (only or []) and it.get("seed_id"):
            seen_seeds.setdefault(it["seed_id"], it.get("id"))
    glob_open = collections.Counter(opening(it.get("prompt", "")) for it in all_items)
    glob_verbs = collections.Counter(v for it in all_items for v in cue_verbs(it))
    glob_names = collections.Counter(n for it in all_items for n in names(it.get("prompt", "")))
    pool = [(it.get("id"), trigrams(it.get("prompt", ""))) for it in all_items] + old
    total_err = 0
    (BANK / "reports").mkdir(parents=True, exist_ok=True)
    for b, rows, bad in data:
        plan = BATCHES.get(b, {})
        per = collections.OrderedDict()
        batch_e, batch_w = list(bad), []
        for it in rows:
            e, w = check_item(it, seen_seeds, seed_db)
            if plan and it.get("cell") != plan["cell"]: e.append(f"cell {it.get('cell')}, but batch {b} is {plan['cell']}")
            g = trigrams(it.get("prompt", ""))
            if len(g) >= 4:
                for oid, og in pool:
                    if oid != it.get("id") and len(og) >= 4 and len(g & og) / len(g | og) >= 0.45:
                        e.append(f"too similar to {oid}"); break
            per[it.get("id", "?")] = (e, w, it)
        # batch-level quotas
        if plan:
            if len(rows) != plan["size"]: batch_e.append(f"tasks: {len(rows)}, expected {plan['size']}")
            fc = collections.Counter(it.get("format") for it in rows)
            for k, v in plan["formats"].items():
                if fc.get(k, 0) != v: batch_w.append(f"format {k}: {fc.get(k, 0)}, expected {v}")
            lc = collections.Counter(it.get("level") for it in rows)
            for k, v in plan["levels"].items():
                if abs(lc.get(k, 0) - v) > 2: batch_w.append(f"level {k}: {lc.get(k, 0)}, expected {v}")
        gaps = [bl for it in rows for bl in it.get("blanks", [])]
        if plan.get("cell") == "D2" and gaps:
            share = sum(g.get("voice") == "active" for g in gaps) / len(gaps)
            if not 0.38 <= share <= 0.52: batch_e.append(f"D2: active share {share:.0%}, required 40–50%")
        tm = sum(bool(TIME.search(it.get("prompt", ""))) for it in rows)
        if rows and tm / len(rows) > 0.35: batch_e.append(f"explicit time markers in {tm}/{len(rows)} tasks (> 35%)")
        op = collections.Counter(opening(it.get("prompt", "")) for it in rows if it.get("format") != "which")
        for o, c in op.items():
            if c > 1 and o: batch_e.append(f"opening «{o}» repeated {c} times in the batch")
            if glob_open[o] > 24: batch_w.append(f"opening «{o}» appears {glob_open[o]} times in the bank (> 2%)")
        vc = collections.Counter(v for it in rows for v in cue_verbs(it))
        for v, c in vc.items():
            if c > 2: batch_w.append(f"verb {v} {c} times in the batch (> 2)")
            if glob_verbs[v] > 6: batch_w.append(f"verb {v} {glob_verbs[v]} times in the bank (> 6)")
        nc = collections.Counter(n for it in rows for n in names(it.get("prompt", "")))
        rep = [n for n, c in nc.items() if c > 1]
        if rep: batch_w.append(f"words/names repeated in the batch: {', '.join(rep[:12])}")
        frames = [i for i, (e, w, _) in per.items() if any("banned storyline" in x for x in w)]
        if len(frames) > 1: batch_e.append(f"default storylines: {len(frames)} ({', '.join(frames)}) — at most 1 allowed")
        doms = collections.Counter(seed_db.get(it.get("seed_id"), {}).get("domain") for it in rows)
        genres = collections.Counter(it.get("genre") for it in rows)
        if len(genres) < 8: batch_w.append(f"only {len(genres)} genres (need ≥ 8)")
        n_err = sum(bool(e) for e, _, _ in per.values()) + len(batch_e)
        total_err += n_err
        lines = [f"# {b} — {plan.get('cell', '?')} — validation report", "",
                 f"Tasks: {len(rows)} · with errors: {sum(bool(e) for e, _, _ in per.values())} · with remarks: {sum(bool(w) for _, w, _ in per.values())}",
                 f"Time markers: {tm}/{len(rows)} · genres: {len(genres)} · seed domains: {len(doms)}", ""]
        if batch_e or batch_w:
            lines += ["## Batch as a whole", *[f"- ❌ {x}" for x in batch_e], *[f"- ⚠️ {x}" for x in batch_w], ""]
        lines += ["## Tasks"]
        for i, (e, w, it) in per.items():
            if e or w:
                lines.append(f"- **{i}** {it.get('prompt', '')[:120]}")
                lines += [f"  - ❌ {x}" for x in e] + [f"  - ⚠️ {x}" for x in w]
        (BANK / f"reports/{b}.md").write_text("\n".join(lines) + "\n")
        broken = [(i, e + w, it) for i, (e, w, it) in per.items() if e or any("storyline" in x or "name" in x for x in w)]
        if broken or batch_e:
            rp = [f"# Repair batch {b}", "", "Below are the problems found by the automatic check. Correct **only** the listed tasks, keeping their `id` and `seed_id` (you may replace a seed with an unused one from the same batch's list if the storyline is the problem). Reply with JSONL only: the corrected lines, nothing else. The master instruction still applies.", ""]
            if batch_e:
                rp += ["Problems of the batch as a whole (fix them by changing the tasks listed below or by choosing other tasks):", *[f"- {x}" for x in batch_e], ""]
            for i, probs, it in broken:
                clean = {k: v for k, v in it.items() if not k.startswith("_")}
                rp += [f"- {i}: " + "; ".join(probs), "  " + json.dumps(clean, ensure_ascii=False)]
            (BANK / f"reports/repair-{b}.md").write_text("\n".join(rp) + "\n")
        print(f"{b}: tasks {len(rows)}, errors {n_err} → content/passive-bank/v7/reports/{b}.md")
    return total_err


# ---------------------------------------------------------------- prompts

HOOKS = {
    "D1": ["agent unknown/unimportant", "focus on affected person", "process/steps"],
    "D2": ["something happened by itself", "agent unknown/unimportant", "focus on affected person"],
    "D3": ["rule/obligation", "deduction about the past"],
    "D4": ["focus on affected person"],
    "D5": ["report/rumour"],
    "D6": ["two objects (give/offer/send)", "phrasal/prepositional verb"],
    "D7": ["service by someone else", "focus on affected person"],
    "D8": ["rule/obligation", "focus on affected person"],
    "D9": ["state vs action", "something happened by itself"],
    "D10": ["agent unknown/unimportant", "process/steps"],
    "D11": [],
}


def assign_seeds():
    db = seeds()
    if not db:
        sys.exit("No seeds: put Gemini's output into content/passive-bank/v7/seeds/seeds-1.jsonl … seeds-5.jsonl")
    used = {it.get("seed_id") for _, rows, _ in raw_items() for it in rows}
    path = BANK / "seed-assignment.json"
    fixed = json.loads(path.read_text()) if path.exists() else {}
    done_batches = {b for b, rows, _ in raw_items() if rows}
    # seeds of finished batches that were not used become free again
    taken = set(used) | {s for b, v in fixed.items() if b not in done_batches for s in v}
    for b in PLAN["batches"]:
        need = max(b["size"] + 2, round(b["size"] * PLAN["seeds_per_item"]))
        if b["batch"] in fixed and len(fixed[b["batch"]]) >= b["size"]:
            continue
        free = [s for s in db.values() if s["seed_id"] not in taken]
        want = set(HOOKS[b["cell"]])
        free.sort(key=lambda s: (0 if not want or want & set(s.get("hooks", [])) else 1))
        pick, per_dom = [], collections.Counter()
        cap = max(2, need // 20 + 1)
        for s in free:
            if len(pick) >= need: break
            if per_dom[s.get("domain")] < cap:
                pick.append(s); per_dom[s.get("domain")] += 1
        for s in free:  # top up if domains were too narrow
            if len(pick) >= need: break
            if s not in pick: pick.append(s)
        fixed[b["batch"]] = [s["seed_id"] for s in pick]
        taken |= set(fixed[b["batch"]])
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(fixed, ensure_ascii=False, indent=1))
    return fixed, db


def cell_guide(cell):
    text = (DOC / "gemini/02-cells.md").read_text()
    m = re.search(rf"<!-- CELL {cell} -->\n(.*?)(?=<!-- CELL|<!-- END)", text, re.S)
    return m[1].strip()


def prompts(only=None):
    assignment, db = assign_seeds()
    tpl = (DOC / "gemini/03-batch-template.md").read_text()
    tpl = tpl.split("\n", 2)[2] if tpl.startswith("# Batch") else tpl
    done = [it for _, rows, _ in raw_items() for it in rows]
    used_open = sorted({o for o in (opening(it.get("prompt", "")) for it in done) if o})
    vc = collections.Counter(v for it in done for v in cue_verbs(it))
    used_names = sorted({n for it in done for n in names(it.get("prompt", ""))} | OLD_NAMES)
    out = BANK / "prompts"; out.mkdir(parents=True, exist_ok=True)
    fmt_ru = {"gap": "single sentence", "mini": "mini-text", "mc": "4-option choice", "fix": "error correction", "which": "which sentence fits"}
    for b in PLAN["batches"]:
        if only and b["batch"] not in only: continue
        seeds_txt = "\n".join(json.dumps({k: db[s][k] for k in ("seed_id", "domain", "place", "who", "situation", "hooks", "tone", "register") if k in db[s]}, ensure_ascii=False) for s in assignment[b["batch"]])
        text = (f"# Batch {b['batch']} · cell {b['cell']} · {b['size']} tasks\n\n" + tpl) \
            .replace("{{BATCH}}", b["batch"]).replace("{{CELL}}", b["cell"]).replace("{{SIZE}}", str(b["size"])) \
            .replace("{{FORMATS}}", ", ".join(f"{fmt_ru[k]} (`{k}`) — {v}" for k, v in b["formats"].items() if v)) \
            .replace("{{LEVELS}}", ", ".join(f"{k} — {v}" for k, v in b["levels"].items())) \
            .replace("{{CELL_GUIDE}}", cell_guide(b["cell"])) \
            .replace("{{SEED_COUNT}}", str(len(assignment[b["batch"]]))).replace("{{SEEDS}}", seeds_txt) \
            .replace("{{USED_OPENINGS}}", ", ".join(used_open) or "—") \
            .replace("{{USED_VERBS}}", ", ".join(v for v, c in vc.items() if c >= 4) or "—") \
            .replace("{{USED_NAMES}}", ", ".join(used_names))
        master = (DOC / "gemini/00-master.md").read_text().split("\n", 3)[3]
        text = text.replace("> Paste after `00-master.md` (it can be in the same chat as the previous batches, but if the chat already has more than 6 batches, open a new one and paste `00-master.md` again).\n\n", "")
        full = (f"# Grammar NOEON — Passive Voice v7 · batch {b['batch']}\n\n## PART A. General instruction (read it all)\n{master}\n\n"
                f"## PART B. Task for this message\n\n" + text.split("\n", 1)[1] +
                "\nIf the answer does not fit in one reply, stop after a complete line; I will write «continue».\n")
        (out / f"{b['batch']}.md").write_text(full)
        print(f"{b['batch']} ({b['cell']}, {b['size']}) → content/passive-bank/v7/prompts/{b['batch']}.md")


def seeds_check():
    db = seeds()
    print(f"seeds: {len(db)}")
    dom = collections.Counter(s.get("domain") for s in db.values())
    hooks = collections.Counter(h for s in db.values() for h in s.get("hooks", []))
    print("domains:", len(dom), dom.most_common(40))
    print("hooks:", hooks.most_common())
    grams = [(k, trigrams(s.get("situation", ""))) for k, s in db.items()]
    dup = [(a, b) for i, (a, ga) in enumerate(grams) for b, gb in grams[i + 1:] if ga and gb and len(ga & gb) / len(ga | gb) >= 0.35]
    print("similar seed pairs:", len(dup), dup[:20])
    banned = [k for k, s in db.items() if BANNED_FRAME.search(s.get("situation", ""))]
    print("default storylines:", banned)


if __name__ == "__main__":
    cmd, *args = sys.argv[1:] or ["help"]
    if cmd == "validate": sys.exit(1 if validate(set(args) or None) else 0)
    elif cmd == "prompts": prompts(set(args) or None)
    elif cmd == "seeds-check": seeds_check()
    else: print(__doc__)
