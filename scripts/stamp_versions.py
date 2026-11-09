"""Stamp ?v= in index.html with a hash of each file's content, so a changed file always gets a new URL.

Files with ?v= are served as immutable for a year (cloudflare/worker.mjs). A hand-written version string that
is forgotten after an edit leaves browsers on the old file forever; a content hash cannot be forgotten.
"""
import hashlib
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REF = re.compile(r'((?:src|href)="([^"?#:]+)\?v=)[^"]*(")')


def digest(path: Path) -> str:
    return hashlib.sha1(path.read_bytes()).hexdigest()[:10]


def stamp_index(index: Path, root: Path = ROOT) -> bool:
    html = index.read_text(encoding='utf-8')

    def replace(match):
        file = root / match.group(2)
        return f'{match.group(1)}{digest(file)}{match.group(3)}' if file.is_file() else match.group(0)

    updated = REF.sub(replace, html)
    if updated != html:
        index.write_text(updated, encoding='utf-8')
    return updated != html


def stamp_service_worker(sw: Path, root: Path, tag: str) -> None:
    """Give every deploy with changed files a new cache name, so the worker updates and clients reload."""
    text = sw.read_text(encoding='utf-8')
    sw.write_text(re.sub(r"const CACHE = '(grammar-v\d+)[^']*';", lambda m: f"const CACHE = '{m.group(1)}-{tag}';", text, count=1), encoding='utf-8')


def release_tag(root: Path) -> str:
    names = sorted(p for p in root.rglob('*') if p.is_file() and p.name != 'sw.js' and not p.name.startswith('_'))
    h = hashlib.sha1()
    for p in names:
        h.update(str(p.relative_to(root)).encode())
        h.update(p.read_bytes())
    return h.hexdigest()[:8]


if __name__ == '__main__':
    print('index.html updated' if stamp_index(ROOT / 'index.html') else 'index.html already current')
