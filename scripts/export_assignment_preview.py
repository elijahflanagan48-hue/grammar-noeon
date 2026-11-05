"""Package full final files for the local assignment-preview change; no deploy."""
from pathlib import Path
import hashlib,json,zipfile
R=Path(__file__).resolve().parents[1];D=R/'docs/review/ASSIGNMENT-PREVIEW-2026-10-31';out=R.parents[1]/'exports/grammar-noeon-assignment-preview-files-2026-10-31.zip'
files=[R/p for p in ['app.js','accounts.js','styles.css','index.html','sw.js','cloudflare/worker.mjs','README.md','PROJECT-STATUS.md','docs/README.template.md','docs/CHANGELOG.md','docs/current-review.json','scripts/build_cloudflare.py','scripts/export_assignment_preview.py','tests/assignment-preview.mjs','tests/assignment-preview.cjs']]
files += [p for root in [D,R/'cloudflare/generated',R/'cloudflare/public'] for p in root.rglob('*') if p.is_file() and p.name!='archives.json']
payload={str(p.relative_to(R)):p.read_bytes() for p in files}
payload['ARCHIVE-README.md']=b'# Grammar NOEON: assignment preview (local, not deployed)\n\nComplete final files for this change; not a full repository. Root files are authoritative. Run scripts/build_cloudflare.py after applying. Includes generated exercise keys for private project use; do not publish this archive as a static site. No private database, credentials, node_modules or Git files included. See docs/review/ASSIGNMENT-PREVIEW-2026-10-31/REPORT.md.\n'
checks={name:hashlib.sha256(data).hexdigest() for name,data in payload.items()};payload['SHA256.json']=(json.dumps(checks,indent=2)+'\n').encode()
out.parent.mkdir(exist_ok=True)
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for name,data in sorted(payload.items()):z.writestr(name,data)
with zipfile.ZipFile(out) as z:
 assert z.testzip() is None
 for name,sha in checks.items():assert hashlib.sha256(z.read(name)).hexdigest()==sha
info=dict(file=str(out),sha256=hashlib.sha256(out.read_bytes()).hexdigest(),bytes=out.stat().st_size,members=len(payload),checksums='passed')
(D/'archives.json').write_text(json.dumps(info,ensure_ascii=False,indent=2)+'\n');print(json.dumps(info,ensure_ascii=False,indent=2))
