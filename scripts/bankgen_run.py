#!/usr/bin/env python3
"""Runs bank-factory prompts through a chat model and saves the answers (for your Mac).

  python3 scripts/bankgen_run.py seeds   <topic> --engine lmstudio --model <id>   [--only 3,4]
  python3 scripts/bankgen_run.py batches <topic> --engine deepseek [--small] [--only RP01,RP02] [--workers 4]
  python3 scripts/bankgen_run.py ping --engine lmstudio

Engines (OpenAI-compatible chat API):
  lmstudio  http://localhost:1234/v1   (start the Local Server in LM Studio; --model = the loaded model id)
  deepseek  https://api.deepseek.com   (env DEEPSEEK_API_KEY; default model deepseek-chat)
  custom    env BANKGEN_BASE_URL, BANKGEN_API_KEY (any OpenAI-compatible server)
The master prompt is sent as the system message, the stage prompt as the user message.
After each batch the answer is validated and up to 2 repair rounds are run automatically.
Resumable: files that already exist are skipped. Needs only `requests`.
"""
from __future__ import annotations
import argparse, concurrent.futures as cf, json, os, re, sys, time
from pathlib import Path
import requests

sys.path.insert(0, str(Path(__file__).resolve().parent))
import bankgen as bg  # noqa: E402

ENGINES = {"lmstudio": ("http://localhost:1234/v1", None, "local-model"),
           "deepseek": ("https://api.deepseek.com", "DEEPSEEK_API_KEY", "deepseek-chat"),
           "custom": (os.environ.get("BANKGEN_BASE_URL", ""), "BANKGEN_API_KEY", "model")}


def chat(engine, model, system, user, temperature=0.8, timeout=1800):
    base, keyenv, dmodel = ENGINES[engine]
    key = os.environ.get(keyenv or "", "") if keyenv else ""
    if keyenv and not key and engine != "lmstudio":
        sys.exit(f"set {keyenv}")
    for attempt in range(3):
        try:
            r = requests.post(base.rstrip("/") + "/chat/completions", timeout=timeout,
                              headers={"Authorization": "Bearer " + (key or "lm-studio")},
                              json=dict(model=model or dmodel, temperature=temperature, max_tokens=8000,
                                        messages=[{"role": "system", "content": system}, {"role": "user", "content": user}]))
            r.raise_for_status()
            return r.json()["choices"][0]["message"]["content"]
        except Exception as ex:
            print("  retry", attempt + 1, ex, file=sys.stderr); time.sleep(5 * (attempt + 1))
    raise SystemExit("model call failed")


def clean(text):
    text = re.sub(r"<think>.*?</think>", "", text, flags=re.S)
    return "\n".join(l for l in text.splitlines() if l.strip() and not l.strip().startswith("```"))


def run_seeds(a):
    d = bg.base(a.topic)
    system = (d / "master.md").read_text()
    files = sorted((d / "seed-prompts").glob("seeds-*.md"))
    only = {int(x) for x in a.only.split(",")} if a.only else None
    for f in files:
        part = int(f.stem.split("-")[1])
        out = d / "seeds" / f"seeds-{part:02d}.jsonl"
        if out.exists() or (only and part not in only): continue
        print("seeds part", part)
        out.parent.mkdir(exist_ok=True)
        out.write_text(clean(chat(a.engine, a.model, system, f.read_text(), a.temp)) + "\n")
    bg.cmd_seeds_check(a.topic)


def run_batches(a):
    d = bg.base(a.topic)
    system = (d / "master.md").read_text()
    pdir = d / ("prompts-small" if a.small else "prompts")
    only = set(a.only.split(",")) if a.only else None
    todo = [f for f in sorted(pdir.glob("*.md")) if not (only and f.stem.rstrip("abcdefghij") not in only and f.stem not in only)]
    (d / "raw").mkdir(exist_ok=True)

    def one(f):
        out = d / "raw" / f"{f.stem}.jsonl"
        if out.exists(): return f.stem, "skip"
        print("batch", f.stem, flush=True)
        text = clean(chat(a.engine, a.model, system, f.read_text(), a.temp))
        out.write_text(text + "\n")
        for rnd in range(2):
            bg.cmd_validate(a.topic, [f.stem])
            rp = d / "reports" / f"repair-{f.stem}.md"
            if not rp.exists(): break
            fixed = clean(chat(a.engine, a.model, system, rp.read_text(), 0.3))
            rows, _ = bg.read_jsonl(out)
            by = {r.get("id"): r for r in rows}
            tmp = d / "raw" / "_tmp.jsonl"; tmp.write_text(fixed); new, _ = bg.read_jsonl(tmp); tmp.unlink()
            for r in new: by[r.get("id")] = r
            order = [r.get("id") for r in rows]
            out.write_text("\n".join(json.dumps(by[i], ensure_ascii=False) for i in order) + "\n")
            rp.unlink()
        for line in [out]:
            rows, _ = bg.read_jsonl(line)
            line.write_text("\n".join(json.dumps(dict(r, engine=a.engine), ensure_ascii=False) for r in rows) + "\n")
        bg.cmd_validate(a.topic, [f.stem])
        return f.stem, "done"

    with cf.ThreadPoolExecutor(a.workers) as ex:
        for name, st in ex.map(one, todo): pass


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("cmd", choices=["seeds", "batches", "ping"])
    ap.add_argument("topic", nargs="?")
    ap.add_argument("--engine", default="lmstudio", choices=list(ENGINES))
    ap.add_argument("--model"); ap.add_argument("--only"); ap.add_argument("--small", action="store_true")
    ap.add_argument("--workers", type=int, default=1); ap.add_argument("--temp", type=float, default=0.8)
    a = ap.parse_args()
    if a.cmd == "ping":
        print(chat(a.engine, a.model, "Reply with the single word OK.", "ping", 0)); return
    {"seeds": run_seeds, "batches": run_batches}[a.cmd](a)


if __name__ == "__main__":
    main()
