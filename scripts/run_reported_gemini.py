#!/usr/bin/env python3
"""Generate RP01–RP21 with Antigravity/Gemini CLI, validate, repair, and export.

Run from an authenticated terminal with network access:
    python3 scripts/run_reported_gemini.py

Prefers Antigravity CLI (including the copy inside Gemini.app) and selects the
strongest advertised Gemini reasoning model. Legacy Gemini CLI is supported
with --cli gemini. Never switches to Flash. Existing batches
are validated and resumed; original responses and repair counts are retained.
"""
from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "content/bankgen/reported"
EXCHANGE = ROOT.parent / "bankgen-exchange/reported"
BATCHES = [f"RP{i:02d}" for i in range(1, 22)]
MODEL_ID = re.compile(
    r"gemini-(\d+(?:\.\d+)*)-(carbon|neon|argon|pro|hydrogen)"
    r"(?:-(xhigh|high|medium|low|preview))?"
)


def is_antigravity(cli):
    return Path(cli).name == "agy"


def find_cli(requested=None):
    if requested:
        executable = shutil.which(requested)
        if executable:
            return executable
        raise RuntimeError(f"CLI executable not found: {requested}")
    installed = shutil.which("agy")
    bundled = Path("/Applications/Gemini.app/Contents/Helpers/agy")
    if installed:
        return installed
    if bundled.is_file():
        return str(bundled)
    raise RuntimeError("Antigravity CLI not found. Install agy or specify --cli explicitly.")


def write(path, content):
    path.parent.mkdir(parents=True, exist_ok=True)
    pending = path.with_suffix(path.suffix + ".pending")
    pending.write_text(content, encoding="utf-8")
    pending.replace(path)


def save_cli_output(log, stdout, stderr):
    if log is None:
        return
    for suffix, content in [(".response.json", stdout), (".stderr.log", stderr)]:
        if isinstance(content, bytes):
            content = content.decode("utf-8", errors="replace")
        write(log.with_suffix(suffix), content or "")


def run_cli(cli, args, timeout, log=None):
    try:
        result = subprocess.run(
            [cli, *args], cwd=ROOT, stdin=subprocess.DEVNULL,
            capture_output=True, text=True, timeout=timeout,
        )
    except subprocess.TimeoutExpired as exc:
        save_cli_output(log, exc.stdout, exc.stderr)
        raise RuntimeError(f"CLI timed out after {timeout} seconds; see saved CLI logs.") from exc
    save_cli_output(log, result.stdout, result.stderr)
    if result.returncode:
        detail = result.stderr or result.stdout
        raise RuntimeError(f"{Path(cli).name} exit {result.returncode}: {detail[-2500:]}")
    return result


def select_model(cli, requested):
    if requested:
        model = requested
    else:
        if is_antigravity(cli):
            result = run_cli(cli, ["models"], 90, BASE / "reports/antigravity/models")
            text = re.sub(r"\x1b\[[0-?]*[ -/]*[@-~]", "", result.stdout)
            # `agy models` lists an id and display label on each line.
            candidates = []
            for line in text.splitlines():
                words = line.strip().split()
                if words and MODEL_ID.fullmatch(words[0]):
                    candidates.append(words[0])
        else:
            result = run_cli(cli, ["models", "list", "--output-format", "json"], 90,
                             BASE / "reports/gemini/models")
            models = json.loads(result.stdout)
            candidates = [m.get("modelId", m.get("id", "")) for m in models]
            candidates = [m for m in candidates if MODEL_ID.fullmatch(m)]
        if not candidates:
            raise RuntimeError("No supported Gemini reasoning model advertised; inspect the saved model list.")
        def strength(identifier):
            version, family, effort = MODEL_ID.fullmatch(identifier).groups()
            return (tuple(map(int, version.split("."))),
                    {"carbon": 5, "neon": 4, "argon": 3, "pro": 2, "hydrogen": 1}[family],
                    {"xhigh": 5, "high": 4, None: 3, "medium": 2, "low": 1, "preview": 0}[effort])
        model = max(candidates, key=strength)
    if not MODEL_ID.fullmatch(model):
        raise RuntimeError("Use an explicit Gemini reasoning model id; Flash and automatic routing are forbidden.")
    return model


def clean(text):
    lines = []
    ids = set()
    for line in text.splitlines():
        line = line.strip()
        if line.startswith("# check:"):
            lines.append(line)
        elif line.startswith("{"):
            row = json.loads(line)
            if not isinstance(row, dict) or not isinstance(row.get("id"), str):
                raise RuntimeError("Response contains a task without a string id.")
            if row["id"] in ids:
                raise RuntimeError(f"Duplicate response id: {row['id']}")
            ids.add(row["id"])
            lines.append(line)
    if not ids:
        raise RuntimeError("Response contains no JSONL tasks. See the saved CLI response.")
    return "\n".join(lines) + "\n"


def ask(cli, model, master, prompt, log, timeout):
    request = ("Generate response text only. Do not use tools, read or write files, "
               "run commands, or spawn agents. All necessary input follows.\n\n"
               + master + "\n\n" + prompt)
    agy = is_antigravity(cli)
    options = ["--model", model, "--output-format", "stream-json" if agy else "json",
               "--prompt", request]
    if agy:
        options += ["--mode", "plan", "--disable-slash-commands"]
    result = run_cli(cli, options, timeout, log)
    if agy:
        events = [json.loads(line) for line in result.stdout.splitlines() if line.strip()]
        initial = [event["init"] for event in events if event.get("event") == "init"]
        if len(initial) != 1 or initial[0].get("model") != model:
            raise RuntimeError("Antigravity did not confirm the requested model; inspect the saved stream.")
        results = [event["result"] for event in events if event.get("event") == "result"]
        if len(results) != 1:
            raise RuntimeError("Expected exactly one Antigravity result event.")
        envelope = results[0]
        if envelope.get("status") != "SUCCESS":
            raise RuntimeError(str(envelope.get("error") or envelope.get("status")))
    else:
        envelope = json.loads(result.stdout)
    if envelope.get("error"):
        raise RuntimeError(str(envelope["error"]))
    if not agy:
        used = envelope.get("stats", {}).get("models", {})
        if any("flash" in m.lower() for m in used):
            raise RuntimeError("CLI reports Flash usage; refusing to accept this response.")
        if not used or model not in used:
            raise RuntimeError("CLI did not confirm the requested model; inspect the saved response.")
    return clean(envelope.get("response", ""))


def validate(batch=None):
    if batch:
        # bankgen.py does not remove a stale repair prompt after a clean check.
        repair = BASE / "reports" / f"repair-{batch}.md"
        if repair.exists():
            repair.unlink()
    subprocess.run([sys.executable, "-B", str(ROOT / "scripts/bankgen.py"),
                    "validate", "reported", *([batch] if batch else [])],
                   cwd=ROOT, check=True)


def merge(original, fixed, allowed):
    replacements = {}
    for line in fixed.splitlines():
        if line.startswith("{"):
            row = json.loads(line)
            if row["id"] not in allowed:
                raise RuntimeError(f"Repair changed an unrequested id: {row['id']}")
            replacements[row["id"]] = (row, line)
    lines = []
    for line in original.splitlines():
        if line.startswith("{"):
            row = json.loads(line)
            if row["id"] in replacements:
                fixed_row, fixed_line = replacements[row["id"]]
                if fixed_row.get("seed_id") != row.get("seed_id"):
                    raise RuntimeError(f"Repair changed seed_id: {row['id']}")
                line = fixed_line
        lines.append(line)
    return "\n".join(lines) + "\n"


def summarize(selected=BATCHES):
    lines = ["| Пачка | Задания | Ошибки | Предупреждения |",
             "|---|---:|---:|---:|"]
    errors = 0
    for batch in BATCHES:
        report = BASE / "reports" / f"{batch}.md"
        match = re.search(r": (\d+) tasks, (\d+) errors, (\d+) warnings",
                          report.read_text() if report.exists() else "")
        if match:
            n, e, w = map(int, match.groups())
            lines.append(f"| {batch} | {n} | {e} | {w} |")
            if batch in selected:
                errors += e
        else:
            lines.append(f"| {batch} | — | — | — |")
            if batch in selected:
                errors += 1
    summary = "\n".join(lines) + "\n"
    write(BASE / "reports/summary.md", summary)
    print(summary, flush=True)
    return errors


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--cli", help="CLI path or command; default: installed or Gemini.app bundled agy")
    parser.add_argument("--model", help="Explicit reasoning model id; default: strongest advertised Gemini model")
    parser.add_argument("--only", help="Comma-separated batch ids (default: RP01–RP21)")
    parser.add_argument("--timeout", type=int, default=1800, help="Seconds per generation request")
    args = parser.parse_args()
    batches = args.only.split(",") if args.only else BATCHES
    if not set(batches) <= set(BATCHES) or len(batches) != len(set(batches)):
        parser.error("--only must contain distinct ids from RP01 to RP21")
    cli = find_cli(args.cli)
    print(f"CLI: {cli}", flush=True)
    model = select_model(cli, args.model)
    print(f"Model: {model}; workspace: {ROOT}", flush=True)
    master = (BASE / "master.md").read_text()
    for batch in batches:
        prompt_path = BASE / "prompts" / f"{batch}.md"
        if not prompt_path.is_file():
            raise RuntimeError(f"Missing prompt: {prompt_path}")
    failure = None
    try:
        for batch in batches:
            raw = BASE / "raw" / f"{batch}.jsonl"
            logs = BASE / "reports" / ("antigravity" if is_antigravity(cli) else "gemini") / batch
            # Preserve the two-repair cap even when switching clients.
            states = [BASE / "reports" / engine / batch / "state.json"
                      for engine in ("gemini", "antigravity", "gemini-ui")]
            states = [p for p in states if p.exists()]
            def repair_count(path):
                saved = json.loads(path.read_text())
                return saved.get("repair_requests", saved.get("repair_round", 0))
            state = max(states, key=repair_count) if states else logs / "state.json"
            rounds = repair_count(state) if state.exists() else 0
            if not raw.exists():
                print(f"Generating {batch}", flush=True)
                answer = ask(cli, model, master, (BASE / "prompts" / f"{batch}.md").read_text(),
                             logs / "initial", args.timeout)
                write(raw, answer)
            validate(batch)
            repair = BASE / "reports" / f"repair-{batch}.md"
            while repair.exists() and rounds < 2:
                rounds += 1
                write(state, json.dumps({"model": model, "repair_requests": rounds}) + "\n")
                prompt = repair.read_text()
                write(logs / f"repair-{rounds}.md", prompt)
                allowed = set(re.findall(r"^### (RP\d+-\d+)\s*$", prompt, re.M))
                print(f"Repairing {batch}, round {rounds}/2", flush=True)
                fixed = ask(cli, model, master, prompt, logs / f"repair-{rounds}", args.timeout)
                write(raw, merge(raw.read_text(), fixed, allowed))
                validate(batch)
        validate()  # Includes cross-batch seed checks.
    except (RuntimeError, OSError, ValueError, subprocess.SubprocessError) as exc:
        failure = str(exc)
        write(BASE / "reports/last-error.log", failure + "\n")
        print(f"Stopped: {failure}", file=sys.stderr, flush=True)
    errors = summarize(batches)
    for folder in ("raw", "reports"):
        source = BASE / folder
        if source.exists():
            shutil.copytree(source, EXCHANGE / folder, dirs_exist_ok=True)
    print(f"Exported raw/ and reports/ to {EXCHANGE}", flush=True)
    if failure:
        print(f"FAILED (generation incomplete): {failure}", file=sys.stderr, flush=True)
        print(f"Error saved to {BASE / 'reports/last-error.log'}", file=sys.stderr, flush=True)
    return int(bool(failure or errors))


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (RuntimeError, OSError, ValueError, subprocess.SubprocessError) as exc:
        write(BASE / "reports/last-error.log", str(exc) + "\n")
        print(f"Cannot start: {exc}", file=sys.stderr)
        sys.exit(2)
