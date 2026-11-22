#!/usr/bin/env python3
"""Combine master + N batch prompts into single attachable files for the Gemini app.
usage: bankgen_combine.py <topic> [N=2]  -> content/bankgen/<topic>/combined/<CODE><a>-<b>.md"""
import sys, glob, re, pathlib
topic = sys.argv[1]; n = int(sys.argv[2]) if len(sys.argv) > 2 else 2
base = pathlib.Path(__file__).resolve().parents[1] / "content/bankgen" / topic
master = (base / "master.md").read_text(encoding="utf-8")
files = sorted(glob.glob(str(base / "prompts/*.md")))
out = base / "combined"; out.mkdir(exist_ok=True)
for f in out.glob("*.md"): f.unlink()
for i in range(0, len(files), n):
    grp = files[i:i + n]
    names = [pathlib.Path(g).stem for g in grp]
    txt = ("# ATTACHED FILE\n\nPART 1 is the MASTER INSTRUCTIONS. " +
           ("PART 2 is the TASK. Write the batch described in PART 2." if len(grp) == 1 else
            f"The following parts are TASKS: write each of the batches {', '.join(names)}. "
            "Output ALL of them in ONE single JSONL code block, one task per line, batches in order, nothing else "
            "(no explanations, no comments, no text after the code block). Do not skip any batch and do not shorten.") +
           "\n\n---\n# PART 1 — MASTER INSTRUCTIONS\n\n" + master)
    for k, g in enumerate(grp, 2):
        txt += f"\n\n---\n# PART {k} — TASK {names[k-2]}\n\n" + pathlib.Path(g).read_text(encoding="utf-8")
    (out / f"{names[0]}{'' if len(grp)==1 else '_' + names[-1]}.md").write_text(txt, encoding="utf-8")
print(len(list(out.glob('*.md'))), "files in", out)
