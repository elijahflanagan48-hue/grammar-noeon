#!/usr/bin/env python3
"""Bank factory: the passive-v7 pipeline made generic for every topic.

  python3 scripts/bankgen.py list                         # topics, targets, progress
  python3 scripts/bankgen.py plan <topic> [--batch N]     # cells -> batches (plan.json)
  python3 scripts/bankgen.py master <topic>               # master prompt for the topic
  python3 scripts/bankgen.py seed-prompts <topic> [--per 50]
  python3 scripts/bankgen.py seeds-check <topic>
  python3 scripts/bankgen.py prompts <topic> [--chunk N]  # batch prompts with assigned seeds (chunk = split for small models)
  python3 scripts/bankgen.py validate <topic> [batch ...] [--stage final]  # report + repair prompt
  python3 scripts/bankgen.py all <topic>                  # plan + master + seed-prompts

Files (per topic, in content/bankgen/<topic>/):
  plan.json  master.md  seed-prompts/  seeds/*.jsonl  prompts/<batch>.md  raw/<batch>.jsonl  reports/  final/<batch>.jsonl
Seeds are shared inside a topic: one seed = one task, never reused (checked by validate).
"""
from __future__ import annotations
import collections, glob, json, math, re, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from bankgen_specs import SPECS, GENERIC_FORMATS, check_specs  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
TPL = ROOT / "docs/variety/bankgen/master-template.md"
LEVELS = {"basic": .30, "medium": .40, "advanced": .30}  # default; a spec can override with levels=
BASE_FORMATS = {"gap", "mini", "mc", "fix", "which", "transform"}
EXTRA_FORMATS = {"fact", "match", "sort", "bank", "hunt", "order"}  # opt-in per topic via spec["extra_formats"]
FORMATS = BASE_FORMATS | EXTRA_FORMATS
FORMAT_DOCS = {
    "fact": ("| `fact` | One sentence about an unreal situation; 4 statements of what REALLY is or was true: «what is the real situation?» | `prompt` = the conditional / wish sentence; exactly one option states the real facts; distractors are tempting reversals (wrong time, wrong polarity, real-world reading); `options`, `correct_option_index` |",
             '{"id":"<batch>-06","seed_id":"…","cell":"…","format":"fact","genre":"…","level":"medium","prompt":"If Lena had set an alarm, she would not have missed the bus.","options":["Lena set an alarm and missed the bus.","Lena did not set an alarm and missed the bus.","Lena did not set an alarm and caught the bus.","Lena set an alarm and caught the bus."],"correct_option_index":1,"construction":"<tag>","explanation_ru":"…"}'),
    "match": ("| `match` | Four left halves and four right halves; the learner joins them | `pairs` = 4 `[left, right]` pairs; each left half fits **exactly one** right half in form AND meaning (the lefts must differ in form, e.g. `If I see her,` / `If I saw her,` / `If I had seen her,` / `Unless I see her,`); `prompt` = a short instruction in English |",
              '{"id":"<batch>-07","seed_id":"…","cell":"…","format":"match","genre":"…","level":"medium","prompt":"Match the halves.","pairs":[["If the shop is open,","I will buy some milk."],["If the shop were open,","I would buy some milk."],["If the shop had been open,","I would have bought some milk."],["Unless the shop is open,","I will not get any milk."]],"construction":"<tag>","explanation_ru":"…"}'),
    "sort": ("| `sort` | 6–8 sentences; the learner puts each into a group (e.g. «Reality» / «Inside-out» or type 1 / 2 / 3) | `groups` = 2–3 names; `items` = `[{text, group}, …]`, every group has at least 2 items; each sentence belongs to exactly one group by its form and meaning; `prompt` = a short instruction |",
             '{"id":"<batch>-08","seed_id":"…","cell":"…","format":"sort","genre":"…","level":"basic","prompt":"Which world is each sentence about?","groups":["Reality","Inside-out"],"items":[{"text":"If it rains, we stay at home.","group":"Reality"},{"text":"If I had a car, I would drive you.","group":"Inside-out"}],"construction":"<tag>","explanation_ru":"…"}'),
    "bank": ("| `bank` | A short text with 4–5 `___` and a word bank (2 extra words); each word is used once | `prompt` = the text with `___`; `bank` = the words/short phrases (blanks + 2 extras, all distinct); `answers` = the correct word for each blank in order; every blank has only one possible bank word |",
             '{"id":"<batch>-09","seed_id":"…","cell":"…","format":"bank","genre":"…","level":"medium","prompt":"Take a coat ___ it rains. You can borrow my bike ___ you bring it back. I will go ___ you come with me. We will go out ___ the weather is bad.","bank":["in case","as long as","unless","even if","whether","otherwise"],"answers":["in case","as long as","unless","even if"],"construction":"<tag>","explanation_ru":"…"}'),
    "hunt": ("| `hunt` | A mini-text of 4–6 sentences; the learner taps the sentence(s) with a mistake | `sentences` = the list; `wrong` = indices (from 0) of the 1–2 wrong sentences; `fixes` = `{index: corrected sentence}`; each wrong sentence has exactly one typical mistake; the other sentences are fully correct; `prompt` = a short title or situation |",
             '{"id":"<batch>-10","seed_id":"…","cell":"…","format":"hunt","genre":"…","level":"advanced","prompt":"A message to a friend.","sentences":["If I had known about the party, I would have come.","If you would have called me, I would have told you.","Anyway, I hope we meet soon."],"wrong":[1],"fixes":{"1":"If you had called me, I would have told you."},"construction":"<tag>","explanation_ru":"…"}'),
    "order": ("| `order` | Words in random order; the learner builds the sentence | `words` = the tokens (5–12, punctuation attached to the word); `answer` = the correct sentence; `accepted_answers` = all correct orders, each using **exactly** the same words; the sentence must have one natural order, or all orders must be listed |",
              '{"id":"<batch>-11","seed_id":"…","cell":"…","format":"order","genre":"…","level":"advanced","prompt":"Build the sentence.","words":["Had","I","known,","I","would","have","helped."],"answer":"Had I known, I would have helped.","accepted_answers":["Had I known, I would have helped."],"construction":"<tag>","explanation_ru":"…"}'),
}
GENRES = set("news notice instructions recipe process history report review dialogue chat email school work travel sport tech health nature arts science home city shopping food".split())
DOMAINS = """weather and nature|animals and pets|food and restaurants|cooking and recipes|school life|university and exams|work and the office|jobs and interviews|shopping and online orders|travel and airports|hotels and holidays|transport and roads|sport and competitions|music and concerts|film, TV and theatre|museums and art|science and discoveries|health and clinics (no diagnoses)|technology, apps and social media|crime and police (no violence)|history and archaeology|family and home|friends and celebrations|city life and local news|environment, farming and space""".split("|")
TIME = re.compile(r"\b(yesterday|last (?:night|week|month|year|summer|winter|weekend|time)|every (?:day|week|month|year|morning|evening|night)|at the moment|right now|now|already|since|for the past|just|yet|tomorrow|next (?:week|month|year|time|day)|ago|so far|by the time|by the end of|currently|tonight|recently)\b", re.I)
OLD_NAMES = {"Nora", "Maya", "Nina", "Mia", "Tom", "Anna", "John", "Mary", "Bob", "Ben"}
NOT_NAMES = set("""I Monday Tuesday Wednesday Thursday Friday Saturday Sunday January February March April May June July August September October November December
English British Scottish Welsh Irish French German Spanish Italian Russian Polish Chinese Japanese Indian London Leeds Manchester Edinburgh Glasgow Cardiff Bristol Oxford Cambridge
Brighton York Liverpool UK US Mr Mrs Ms Dr Christmas Easter TV OK Which What Where When Why How Who Yes No Look Please Thanks Sorry Well""".split())
GAP = re.compile(r"\(([^()]+)\)")


def base(topic):
    return ROOT / "content/bankgen" / topic


def spec_of(topic):
    if topic not in SPECS:
        sys.exit(f"unknown topic {topic}; known: {', '.join(SPECS)}")
    return SPECS[topic]


def read_jsonl(path):
    rows, bad = [], []
    for n, line in enumerate(Path(path).read_text(encoding="utf-8").splitlines(), 1):
        line = line.strip()
        if not line or line.startswith("#") or line.startswith("```"):
            continue
        try:
            rows.append(json.loads(line))
        except json.JSONDecodeError as ex:
            bad.append((n, str(ex)[:80]))
    return rows, bad


def largest_remainder(total, weights):
    s = sum(weights.values())
    raw = {k: total * v / s for k, v in weights.items()}
    out = {k: int(v) for k, v in raw.items()}
    for k in sorted(raw, key=lambda k: raw[k] - out[k], reverse=True)[: total - sum(out.values())]:
        out[k] += 1
    return out


# ------------------------------------------------------------------------------------------ plan
def cmd_plan(topic, batch=None):
    sp = spec_of(topic)
    size = batch or sp["batch"]
    batches, n = [], 0
    for c in sp["cells"]:
        count = round(sp["target"] * c["share"])
        k = max(1, math.ceil(count / (size * 1.15)))
        sizes = largest_remainder(count, {i: 1 for i in range(k)})
        for i in range(k):
            n += 1
            sz = sizes[i]
            fm = largest_remainder(sz, c["formats"] or GENERIC_FORMATS)
            batches.append(dict(batch=f"{sp['code'].upper()}{n:02d}", cell=c["id"], size=sz,
                                formats={f: v for f, v in fm.items() if v},
                                levels={l: v for l, v in largest_remainder(sz, c.get("levels") or sp.get("levels", LEVELS)).items() if v}))
    plan = dict(topic=topic, version=f"{topic}-v8", target_total=sum(b["size"] for b in batches), batches=batches)
    base(topic).mkdir(parents=True, exist_ok=True)
    (base(topic) / "plan.json").write_text(json.dumps(plan, ensure_ascii=False, indent=1))
    print(f"{topic}: {len(batches)} batches, {plan['target_total']} tasks -> {base(topic)/'plan.json'}")
    return plan


def load_plan(topic):
    p = base(topic) / "plan.json"
    return json.loads(p.read_text()) if p.exists() else cmd_plan(topic)


# ------------------------------------------------------------------------------------------ master
def cell_block(c):
    mix = ", ".join(f"{k} {v}%" for k, v in (c["formats"] or GENERIC_FORMATS).items())
    return (f"### {c['id']}. {c['name']}\n\n**What is trained:** {c['what']}\n\n**The decision:** {c['decision']}\n\n"
            f"**Typical mistakes of Russian speakers (use them in `mc` distractors and `fix`):** {c['mistakes']}\n\n"
            f"**Example of the level (do not copy its storyline):** {c['example']}\n\n**Typical format mix:** {mix}\n")


def cmd_master(topic):
    sp = spec_of(topic)
    cons = sorted({t for c in sp["cells"] for t in c["cons"]})
    text = TPL.read_text()
    extra = "\n".join("- " + e for e in sp["extra"])
    if not sp.get("extra_formats"):  # topics without extra formats keep the old master byte-for-byte
        text = text.replace("{{EXTRA_FORMATS_ROWS}}\n", "").replace("{{EXTRA_FORMATS_JSON}}\n", "")
    for k, v in dict(TITLE=sp["title"], SCENE=sp["scene"], BANNED=sp["banned"], EXTRA=extra, GAP_RULE=sp["gap_rule"],
                     EXTRA_FORMATS_ROWS="\n".join(FORMAT_DOCS[f][0] for f in sp.get("extra_formats", [])),
                     EXTRA_FORMATS_JSON="\n".join(FORMAT_DOCS[f][1] for f in sp.get("extra_formats", [])),
                     CONSTRUCTIONS=", ".join(f"`{t}`" for t in cons),
                     CELLS="\n".join(cell_block(c) for c in sp["cells"])).items():
        text = text.replace("{{" + k + "}}", v)
    out = base(topic) / "master.md"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(text)
    print(f"master: {out} ({len(text)//4} tokens approx)")


# ------------------------------------------------------------------------------------------ seeds
SEED_TEMPLATE = """# Seeds for topic «{title}», part {part} of {parts}

> Send after `master.md`. Save the answer as `content/bankgen/{topic}/seeds/seeds-{part:02d}.jsonl`.

Write **{per} scenario seeds**: short, concrete situations from life. Each future task will be built on its own seed, so the storylines of the bank never repeat.

Domains for this part (about {each} seeds per domain, no more than {each2}): {domains}.

Every seed must contain a **natural reason** for one of these scene features of the topic (`hooks`): {hooks}.
Across the {per} seeds no hook may be used in more than 25% of them.

## A good seed
- Concrete: a place, people (or a role), an event, one vivid or unexpected detail. Realistic (funny is fine, nonsense is not).
- The seeds inside a domain are different: different places, ages, professions, countries, tones.
- Everyday vocabulary only (A2–B1). No jargon, no rare animals or professions. Ordinary life.
- Not a ready exercise sentence: 1–2 plain sentences, up to 30 words.
- No celebrities, politics, religion, war, deaths, injuries with details, diagnoses.
- Banned for this topic: {banned}

## Format (JSONL, one line per seed)
```
{{"seed_id":"{code}-{part:02d}01","domain":"school life","place":"a primary school in Leeds","who":"a class of nine-year-olds","situation":"…","hooks":["a question someone asked"],"tone":"funny","register":"dialogue"}}
```
- `seed_id`: `{code}-{part:02d}NN` (NN = 01…{per})
- `hooks`: 1–2 of the list above (copy the wording exactly)
- `tone`: funny | annoying | alarming | touching | neutral | good news | bad news | ironic
- `register`: dialogue | chat | email | notice | news | instructions | report | review | story

At the end one line: `# check: seeds={per}, hooks={{…}}, tones={{…}}`.
"""


def cmd_seed_prompts(topic, per=50):
    sp = spec_of(topic)
    need = math.ceil(sp["target"] * 1.3)
    parts = math.ceil(need / per)
    d = base(topic) / "seed-prompts"
    d.mkdir(parents=True, exist_ok=True)
    for part in range(1, parts + 1):
        doms = [DOMAINS[(part * 5 + i) % len(DOMAINS)] for i in range(5)]
        each = per // 5
        (d / f"seeds-{part:02d}.md").write_text(SEED_TEMPLATE.format(
            title=sp["title"], topic=topic, part=part, parts=parts, per=per, each=each, each2=each + 2, domains=" · ".join(doms),
            hooks=" | ".join(f"`{h}`" for h in sp["hooks"]), banned=sp["banned"], code=sp["code"]))
    (base(topic) / "seeds").mkdir(parents=True, exist_ok=True)
    print(f"seed prompts: {parts} files x {per} seeds = {parts*per} (need {need}) -> {d}")


def load_seeds(topic):
    seeds, bad = {}, []
    for f in sorted(glob.glob(str(base(topic) / "seeds/seeds-*.jsonl"))):
        rows, b = read_jsonl(f)
        bad += [(Path(f).name,) + x for x in b]
        for r in rows:
            if r.get("seed_id") and r.get("situation"):
                seeds[r["seed_id"]] = r
    return seeds, bad


def toks(s):
    return set(re.findall(r"[a-z]{4,}", s.lower()))


def cmd_seeds_check(topic):
    sp = spec_of(topic)
    seeds, bad = load_seeds(topic)
    print(f"{topic}: {len(seeds)} seeds loaded; unparsable lines: {len(bad)}")
    hooks = collections.Counter(h for s in seeds.values() for h in s.get("hooks", []))
    unk = [h for h in hooks if h not in sp["hooks"]]
    dom = collections.Counter(s.get("domain") for s in seeds.values())
    tone = collections.Counter(s.get("tone") for s in seeds.values())
    print("hooks:", dict(hooks)); print("unknown hooks:", unk); print("domains:", len(dom), "tones:", dict(tone))
    ids = list(seeds.values()); dup = []
    for i in range(len(ids)):
        ti = toks(ids[i]["situation"])
        for j in range(i + 1, len(ids)):
            tj = toks(ids[j]["situation"])
            if ti and tj and len(ti & tj) / len(ti | tj) > .55:
                dup.append((ids[i]["seed_id"], ids[j]["seed_id"]))
    print("near-duplicates (Jaccard>0.55):", len(dup), dup[:10])
    need = math.ceil(sp["target"] * 1.1)
    print("need ≥", need, "-> OK" if len(seeds) >= need and not dup else "-> NOT ENOUGH or duplicates")


def assign_seeds(topic, plan, seeds):
    sp = spec_of(topic)
    hooks = {c["id"]: set(c["hooks"]) for c in sp["cells"]}
    used, out = set(), {}
    total = sum(b["size"] for b in plan["batches"])
    ratio = min(1.3, len(seeds) / total)  # fewer seeds than 1.3x the target: spread them evenly
    for b in plan["batches"]:
        want = math.floor(b["size"] * ratio) if ratio < 1.3 else math.ceil(b["size"] * 1.3)
        pool = [s for s in seeds.values() if s["seed_id"] not in used and hooks[b["cell"]] & set(s.get("hooks", []))]
        rest = [s for s in seeds.values() if s["seed_id"] not in used and s not in pool]
        by = collections.defaultdict(list)
        for s in pool: by[s.get("domain")].append(s)
        picked = []
        while len(picked) < want and any(by.values()):
            for d in sorted(by):
                if by[d] and len(picked) < want: picked.append(by[d].pop(0))
        picked += rest[: max(0, want - len(picked))]
        out[b["batch"]] = [s["seed_id"] for s in picked]
        used |= set(out[b["batch"]])
    return out


# ------------------------------------------------------------------------------------------ prompts
def used_context(topic, exclude):
    ops, names, verbs = collections.Counter(), collections.Counter(), collections.Counter()
    for sub in ("final", "raw"):
        for f in glob.glob(str(base(topic) / sub / "*.jsonl")):
            if Path(f).stem in exclude: continue
            for r in read_jsonl(f)[0]:
                p = r.get("prompt", "")
                ops[" ".join(p.split()[:2]).lower()] += 1
                for n in re.findall(r"(?<!^)(?<![.!?—]\s)\b([A-Z][a-z]{2,})\b", p):
                    if n not in NOT_NAMES: names[n] += 1
                for b in r.get("blanks", []):
                    for w in b.get("cue", "").split("/"):
                        w = w.strip()
                        if w.startswith("to "): verbs[w[3:]] += 1
    return ops, names, verbs


BATCH_TEMPLATE = """# Batch {batch} · cell {cell} · {size} tasks

> Send after `master.md` (stateless API: send master as the system message and this as the user message).

Write **exactly {size} tasks** of batch {batch} for cell **{cell}**.

## Distribution (must match exactly)
- Formats: {formats}
- Levels: {levels}
- `id`: `{batch}-01` … `{batch}-{size:02d}`

{guide}

## Scenario seeds for this batch
Below are {n} seeds — more than you need. Choose the {size} that best fit cell {cell} and build **each** task on its own seed (put its `seed_id` in the task). Spread formats and levels across seeds from different domains. Use the seed as the **idea** (keep the core event and one vivid detail; drop jargon). For `basic`, simplify strongly: everyday words only, 8–14 words.

{seeds}

## Already used in earlier batches — do not repeat
- Openings (first two words): {ops}
- Verbs/words in brackets already used often (avoid unless required): {verbs}
- Names: {names}

## Final self-check (last line of the answer)
`# check: time_markers=<N>/{size}, openings_unique=<yes/no>, brackets_max=<max uses of one bracket word>, names_repeated=<N>, seeds_used={size}, formats=<{fmt_keys}>, levels=<b/m/a>`
"""


def cmd_prompts(topic, chunk=None):
    sp = spec_of(topic)
    plan = load_plan(topic)
    seeds, _ = load_seeds(topic)
    if not seeds: sys.exit("no seeds yet: run seed-prompts, send them to a model, put the answers into seeds/")
    assign = assign_seeds(topic, plan, seeds)
    cells = {c["id"]: c for c in sp["cells"]}
    d = base(topic) / ("prompts-small" if chunk else "prompts"); d.mkdir(parents=True, exist_ok=True)
    for old in d.glob("*.md"): old.unlink()
    (base(topic) / "seed-assignment.json").write_text(json.dumps(assign, indent=1))
    ops, names, verbs = used_context(topic, set())
    n = 0
    for b in plan["batches"]:
        parts = [(b["batch"], b["size"], b["formats"], b["levels"], assign[b["batch"]])]
        if chunk and b["size"] > chunk:
            k = math.ceil(b["size"] / chunk)
            sz = largest_remainder(b["size"], {i: 1 for i in range(k)})
            fm = {f: largest_remainder(b["size"], b["formats"]).get(f, 0) for f in b["formats"]}
            parts = []
            seeds_left = list(assign[b["batch"]])
            for i in range(k):
                s = sz[i]
                f = {x: 0 for x in b["formats"]}
                for x in sorted(fm, key=lambda x: -fm[x]):
                    take = min(fm[x], round(fm[x] * s / b["size"]) or (1 if fm[x] and sum(f.values()) < s else 0)); f[x] = take
                diff = s - sum(f.values()); big = max(f, key=f.get); f[big] += diff
                for x in f: fm[x] -= f[x]
                lv = largest_remainder(s, b["levels"])
                parts.append((f"{b['batch']}{chr(97+i)}", s, {x: v for x, v in f.items() if v}, {x: v for x, v in lv.items() if v}, [seeds_left.pop(0) for _ in range(min(math.ceil(s * 1.3), len(seeds_left)))]))
        for bid, size, fmts, lvls, sids in parts:
            body = "\n".join(json.dumps({k: seeds[i][k] for k in ("seed_id", "domain", "place", "who", "situation", "hooks", "tone", "register") if k in seeds[i]}, ensure_ascii=False) for i in sids)
            text = BATCH_TEMPLATE.format(batch=bid, cell=b["cell"], size=size, formats=", ".join(f"{k} {v}" for k, v in fmts.items()),
                                         levels=", ".join(f"{k} {v}" for k, v in lvls.items()), guide=cell_block(cells[b["cell"]]), n=len(sids), seeds=body,
                                         ops=", ".join(f"«{o}»" for o, c in ops.most_common(40)) or "(none yet)",
                                         verbs=", ".join(v for v, c in verbs.most_common(25) if c >= 4) or "(none yet)",
                                         names=", ".join(sorted(names)[:60]) or "(none yet)", fmt_keys="/".join(fmts))
            (d / f"{bid}.md").write_text(text); n += 1
    print(f"prompts: {n} files in {d}")


# ------------------------------------------------------------------------------------------ validation
def lex_tools():
    try:
        sys.path.insert(0, str(ROOT / "scripts"))
        import lexical_audit as la
        la.cefr("house")
        return la
    except (Exception, SystemExit):
        # lexical_audit exits when its optional dictionaries are unavailable.
        # Structural validation must still run and write the batch report.
        return None


def flat_text(it):
    """All learner-visible English text of a task (for the vocabulary check)."""
    parts = [it.get("prompt", "")] + [x for pr in it.get("pairs", []) for x in pr] + [x.get("text", "") for x in it.get("items", []) if isinstance(x, dict)] \
        + list(it.get("sentences", [])) + list(it.get("options", [])) + list(it.get("bank", [])) + list(it.get("words", []))
    return " ".join(x for x in parts if isinstance(x, str))


def check_item(it, sp, cons_ok, cells_ok, seed_db, seen_seeds):
    e, w = [], []
    fmt, p = it.get("format"), it.get("prompt", "")
    for k in ("id", "seed_id", "cell", "format", "genre", "level", "prompt", "explanation_ru"):
        if not it.get(k): e.append(f"no field `{k}`")
    if it.get("cell") not in cells_ok: e.append(f"unknown cell {it.get('cell')}")
    if fmt not in FORMATS: e.append(f"unknown format {fmt}")
    if it.get("level") not in LEVELS: e.append(f"unknown level {it.get('level')}")
    if fmt in EXTRA_FORMATS and fmt not in sp.get("extra_formats", []): e.append(f"format {fmt} is not enabled for this topic")
    if it.get("genre") and it["genre"] not in GENRES: w.append(f"genre `{it['genre']}` is not in the list")
    if it.get("explanation_ru") and not re.search("[а-яА-Я]", it["explanation_ru"]): e.append("explanation_ru is not in Russian")
    sid = it.get("seed_id")
    if sid:
        if seed_db and sid not in seed_db: e.append(f"seed {sid} is not in the catalogue")
        if sid in seen_seeds and seen_seeds[sid] != it.get("id"): e.append(f"seed {sid} already used in {seen_seeds[sid]}")
        seen_seeds.setdefault(sid, it.get("id"))
    if fmt in ("gap", "mini"):
        bl = it.get("blanks") or []; cues = GAP.findall(p)
        if len(cues) != len(bl): e.append(f"brackets in prompt: {len(cues)}, blanks: {len(bl)}")
        if fmt == "gap" and not 1 <= len(bl) <= 2: e.append("gap: 1–2 gaps required")
        if fmt == "mini" and not 2 <= len(bl) <= 4: e.append("mini: 2–4 gaps required")
        if fmt == "mini" and len(re.findall(r"[.!?…](?:\s|$)", p)) < 3: w.append("mini: fewer than 3 sentences")
        for i, b in enumerate(bl):
            if i < len(cues) and cues[i].strip() != b.get("cue", "").strip(): e.append(f"gap {i+1}: cue `{b.get('cue')}` ≠ bracket `({cues[i]})`")
            if b.get("answer") not in (b.get("accepted_answers") or []): e.append(f"gap {i+1}: answer is not in accepted_answers")
            if b.get("construction") not in cons_ok: e.append(f"gap {i+1}: unknown construction `{b.get('construction')}`")
    elif fmt in ("mc", "which"):
        o = it.get("options") or []
        if len(o) != 4 or len(set(o)) != 4: e.append("4 distinct options required")
        if it.get("correct_option_index") not in range(4): e.append("correct_option_index must be 0–3")
        if fmt == "mc" and "___" not in p: e.append("mc: prompt has no ___")
        if it.get("construction") not in cons_ok: e.append(f"unknown construction `{it.get('construction')}`")
    elif fmt in ("fix", "transform"):
        if it.get("answer") not in (it.get("accepted_answers") or []): e.append(f"{fmt}: answer is not in accepted_answers")
        if fmt == "fix":
            if not isinstance(it.get("has_error"), bool): e.append("fix: has_error must be true/false")
            if it.get("has_error") is False and it.get("answer") != p: e.append("fix without error: answer must equal prompt")
            if it.get("has_error") and it.get("answer") == p: e.append("fix: has_error=true, but answer equals prompt")
        if it.get("construction") not in cons_ok: e.append(f"unknown construction `{it.get('construction')}`")
    elif fmt == "fact":
        o = it.get("options") or []
        if len(o) != 4 or len(set(o)) != 4: e.append("4 distinct options required")
        if it.get("correct_option_index") not in range(4): e.append("correct_option_index must be 0–3")
        if it.get("construction") not in cons_ok: e.append(f"unknown construction `{it.get('construction')}`")
    elif fmt == "match":
        pr = it.get("pairs") or []
        if len(pr) != 4 or any(not isinstance(x, list) or len(x) != 2 or not all(x) for x in pr): e.append("match: 4 pairs [left, right] required")
        else:
            if len({x[0] for x in pr}) != 4 or len({x[1] for x in pr}) != 4: e.append("match: halves must be distinct")
        if it.get("construction") not in cons_ok: e.append(f"unknown construction `{it.get('construction')}`")
    elif fmt == "sort":
        g, its = it.get("groups") or [], it.get("items") or []
        if not 2 <= len(g) <= 3: e.append("sort: 2–3 groups required")
        if not 6 <= len(its) <= 8: e.append("sort: 6–8 items required")
        if any(x.get("group") not in g for x in its if isinstance(x, dict)) or any(not isinstance(x, dict) or not x.get("text") for x in its): e.append("sort: every item needs text and a group from `groups`")
        else:
            c = collections.Counter(x["group"] for x in its)
            if any(c[x] < 2 for x in g): e.append("sort: every group needs at least 2 items")
        if it.get("construction") not in cons_ok: e.append(f"unknown construction `{it.get('construction')}`")
    elif fmt == "bank":
        bk, an = it.get("bank") or [], it.get("answers") or []
        if not 4 <= len(an) <= 5: e.append("bank: 4–5 blanks required")
        if p.count("___") != len(an): e.append(f"bank: blanks in prompt {p.count('___')}, answers {len(an)}")
        if len(set(bk)) != len(bk) or len(bk) != len(an) + 2: e.append("bank: need blanks+2 distinct words")
        if any(a not in bk for a in an) or len(set(an)) != len(an): e.append("bank: answers must be distinct words from the bank")
        if it.get("construction") not in cons_ok: e.append(f"unknown construction `{it.get('construction')}`")
    elif fmt == "hunt":
        ss, wr, fx = it.get("sentences") or [], it.get("wrong") or [], it.get("fixes") or {}
        if not 4 <= len(ss) <= 6: e.append("hunt: 4–6 sentences required")
        if not 1 <= len(wr) <= 2 or any(not isinstance(i, int) or i not in range(len(ss)) for i in wr): e.append("hunt: `wrong` = 1–2 valid indices")
        elif {str(i) for i in wr} != set(fx) or any(not v or v == ss[int(k)] for k, v in fx.items()): e.append("hunt: `fixes` must cover exactly the wrong indices with a changed sentence")
        if it.get("construction") not in cons_ok: e.append(f"unknown construction `{it.get('construction')}`")
    elif fmt == "order":
        wd = it.get("words") or []
        if not 5 <= len(wd) <= 12: e.append("order: 5–12 words required")
        acc = it.get("accepted_answers") or []
        if it.get("answer") not in acc: e.append("order: answer is not in accepted_answers")
        if any(collections.Counter(a.split()) != collections.Counter(wd) for a in acc): e.append("order: every accepted answer must use exactly the given words")
        if wd and wd == (it.get("answer") or "").split(): e.append("order: words are already in the right order")
        if it.get("construction") not in cons_ok: e.append(f"unknown construction `{it.get('construction')}`")
    if {n for n in re.findall(r"(?<!^)(?<![.!?—]\s)\b([A-Z][a-z]{2,})\b", p)} & OLD_NAMES: w.append("overused name")
    if re.match(r"\s*(—\s*)?by the (time|end)", p, re.I): w.append("opening with By the time / By the end")
    return e, w


def cmd_validate(topic, only=None, stage="raw"):
    sp = spec_of(topic); plan = load_plan(topic)
    plan_b = {b["batch"]: b for b in plan["batches"]}
    cells_ok = {c["id"] for c in sp["cells"]}; cons_ok = {t for c in sp["cells"] for t in c["cons"]}
    seed_db, _ = load_seeds(topic); la = lex_tools()
    names_all = la.find_names([(topic, {"prompt": r.get("prompt", "")}) for f in glob.glob(str(base(topic) / stage / "*.jsonl")) for r in read_jsonl(f)[0]]) if la else set()
    files = sorted(glob.glob(str(base(topic) / stage / "*.jsonl")))
    if only: files = [f for f in files if Path(f).stem in only]
    (base(topic) / "reports").mkdir(parents=True, exist_ok=True)
    seen, summary = {}, []
    for f in files:
        bid = Path(f).stem; rows, bad = read_jsonl(f)
        errs, warns = collections.defaultdict(list), collections.defaultdict(list)
        if la is None:
            warns["(batch)"].append("lexical audit unavailable (install wordfreq and cefrpy)")
        for ln, msg in bad: errs["(file)"].append(f"line {ln}: not JSON ({msg})")
        ops, cnt_f, cnt_l, cnt_c = collections.Counter(), collections.Counter(), collections.Counter(), collections.Counter()
        names_seen, verbs, ids, markers, said, correct0, mcn = collections.Counter(), collections.Counter(), set(), 0, 0, 0, 0
        for it in rows:
            e, w = check_item(it, sp, cons_ok, cells_ok, seed_db, seen)
            i = it.get("id", "?")
            if i in ids: e.append("duplicate id")
            ids.add(i)
            op = " ".join(it.get("prompt", "").lower().split()[:2]); ops[op] += 1
            cnt_f[it.get("format")] += 1; cnt_l[it.get("level")] += 1; cnt_c[it.get("cell")] += 1
            if TIME.search(it.get("prompt", "")): markers += 1
            for nm in set(re.findall(r"(?<!^)(?<![.!?—]\s)\b([A-Z][a-z]{2,})\b", it.get("prompt", ""))) - NOT_NAMES: names_seen[nm] += 1
            for b in it.get("blanks", []):
                for x in b.get("cue", "").split("/"):
                    x = x.strip()
                    if x.startswith("to "): verbs[x[3:]] += 1
            if it.get("format") == "mc":
                mcn += 1; correct0 += it.get("correct_option_index") == 0
            if topic == "reported" and re.search(r"\bsaid\b", it.get("prompt", "") + " ".join(b.get("answer", "") for b in it.get("blanks", []))): said += 1
            if la:
                flat = {**it, "prompt": flat_text(it)}
                hw = la.hard_words(flat, names_all)
                if hw and la.over_limit(flat, hw): w.append("vocabulary above level: " + ", ".join(h[0] for h in hw))
            if e: errs[i] += e
            if w: warns[i] += w
        pb = plan_b.get(bid.rstrip("abcdefghij")) if stage == "raw" else None
        if stage == "raw" and pb and bid == bid.rstrip("abcdefghij"):
            if len(rows) != pb["size"]: errs["(batch)"].append(f"expected {pb['size']} tasks, got {len(rows)}")
            for k, v in pb["formats"].items():
                if cnt_f[k] != v: warns["(batch)"].append(f"format {k}: expected {v}, got {cnt_f[k]}")
            for k, v in pb["levels"].items():
                if cnt_l[k] != v: warns["(batch)"].append(f"level {k}: expected {v}, got {cnt_l[k]}")
            if any(c != pb["cell"] for c in cnt_c): errs["(batch)"].append(f"cells in batch: {dict(cnt_c)}")
        for o, c in ops.items():
            if c > 1: warns["(batch)"].append(f"opening `{o}` ×{c}")
        for nm, c in names_seen.items():
            if c > 1: warns["(batch)"].append(f"name {nm} ×{c}")
        for v, c in verbs.items():
            if c > 2: warns["(batch)"].append(f"bracket verb `{v}` ×{c}")
        if rows and markers / len(rows) > 1 / 3 + .01: warns["(batch)"].append(f"time markers in {markers}/{len(rows)} tasks (limit 1/3)")
        if mcn >= 5 and correct0 / mcn > .4: warns["(batch)"].append(f"mc: correct option is #1 in {correct0}/{mcn}")
        if topic == "reported" and rows and said / len(rows) > .25: warns["(batch)"].append(f"`said` in {said}/{len(rows)} tasks (limit 25%)")
        ne, nw = sum(len(v) for v in errs.values()), sum(len(v) for v in warns.values())
        rep = [f"# {topic} {bid}: {len(rows)} tasks, {ne} errors, {nw} warnings", ""]
        for k, v in errs.items(): rep += [f"- ERROR {k}: {m}" for m in v]
        for k, v in warns.items(): rep += [f"- warn {k}: {m}" for m in v]
        (base(topic) / "reports" / f"{bid}.md").write_text("\n".join(rep) + "\n")
        bad_ids = [k for k in errs if k not in ("(batch)", "(file)")]
        if bad_ids and stage == "raw":
            lines = {r.get("id"): r for r in rows}
            rp = [f"Fix ONLY the tasks below and return them as JSONL (same ids, same seed_id). Do not change anything else.", ""]
            for k in bad_ids:
                rp.append(f"### {k}\nProblems: " + "; ".join(errs[k])); rp.append(json.dumps(lines.get(k), ensure_ascii=False)); rp.append("")
            (base(topic) / "reports" / f"repair-{bid}.md").write_text("\n".join(rp))
        summary.append((bid, len(rows), ne, nw))
    for s in summary: print("%-8s tasks=%-3d errors=%-3d warnings=%d" % s)
    if not summary: print("nothing to validate in", base(topic) / stage)


def cmd_list():
    for p in check_specs(): print("PROBLEM", p)
    print("%-11s %6s %6s %6s %6s %6s" % ("topic", "target", "cells", "seeds", "raw", "final"))
    for t, sp in SPECS.items():
        b = base(t)
        cnt = lambda sub: sum(len(read_jsonl(f)[0]) for f in glob.glob(str(b / sub / "*.jsonl")))
        print("%-11s %6d %6d %6d %6d %6d" % (t, sp["target"], len(sp["cells"]), cnt("seeds"), cnt("raw"), cnt("final")))


def main(a):
    if not a or a[0] in ("-h", "--help"): print(__doc__); return
    c, rest = a[0], a[1:]
    opt = lambda k, d=None: int(rest[rest.index(k) + 1]) if k in rest else d
    if c == "list": return cmd_list()
    t = rest[0] if rest else sys.exit("topic required")
    if c == "plan": cmd_plan(t, opt("--batch"))
    elif c == "master": cmd_master(t)
    elif c == "seed-prompts": cmd_seed_prompts(t, opt("--per", 50))
    elif c == "seeds-check": cmd_seeds_check(t)
    elif c == "prompts": cmd_prompts(t, opt("--chunk"))
    elif c == "validate":
        stage = rest[rest.index("--stage") + 1] if "--stage" in rest else "raw"
        cmd_validate(t, [x for x in rest[1:] if not x.startswith("--") and x != stage] or None, stage)
    elif c == "all": cmd_plan(t); cmd_master(t); cmd_seed_prompts(t)
    else: sys.exit("unknown command " + c)


if __name__ == "__main__":
    main(sys.argv[1:])
