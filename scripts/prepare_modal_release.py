"""Create the modal release while retaining unrelated unpublished local work."""
from pathlib import Path
import shutil
ROOT=Path(__file__).resolve().parents[1]
DEST=ROOT.parent/'grammar-noeon-modals-release'
DEST.mkdir(exist_ok=True)
# Release contains application sources, not local credentials or bulky QA archives.
for path in ROOT.iterdir():
    if path.name in {'.git','.wrangler','node_modules','docs','__pycache__'}:continue
    target=DEST/path.name
    if path.is_dir():
        shutil.copytree(path,target,dirs_exist_ok=True,ignore=shutil.ignore_patterns('__pycache__','public','generated'))
    else:shutil.copy2(path,target)
if not (DEST/'node_modules').exists():(DEST/'node_modules').symlink_to(ROOT/'node_modules',target_is_directory=True)
(DEST/'docs').mkdir(exist_ok=True)
for p in (ROOT/'docs').iterdir():
    if p.is_file():shutil.copy2(p,DEST/'docs'/p.name)
# The teacher's local deletion feature has its own separate, unpublished review.
p=DEST/'accounts.js';s=p.read_text();start=s.index('function bindOwnWorkDeletion()');end=s.index('function accountHistory(',start);s=s[:start]+s[end:]
s=s.replace("    return owner&&endpoint==='account'&&account.user?.role==='teacher'&&!assigned?`<div class=\"own-work-row\">${card}<button type=\"button\" class=\"button own-work-delete\" data-delete-own-work=\"${escapeHtml(a.id)}\" aria-label=\"Удалить работу: ${escapeHtml(title)}\">Удалить</button></div>`:card;",'    return card;')
s=s.replace('  bindOwnWorkDeletion();\n','');assert 'delete-own-work' not in s;p.write_text(s)
p=DEST/'cloudflare/worker.mjs';s=p.read_text();start=s.index('  const deleteOwn=');end=s.index('  const match = path.match',start);s=s[:start]+s[end:];assert 'const deleteOwn=' not in s;p.write_text(s)
print(DEST)
