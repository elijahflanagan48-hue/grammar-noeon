"""Export the published assignment-preview release and its unchanged reviewed bank."""
import json
import export_future_reference as pack
R=pack.ROOT;B=R/'docs/review/DISTINCT-CLOZE-2026-10-31';D=R/'docs/review/RANDOM-ASSIGNMENT-2026-10-31';release=R/'docs/releases/assignment-preview-2026-10-31';pack.D=B
m=json.loads((R/'data/exercises/index.json').read_text());meta=json.loads((R/'docs/current-release.json').read_text());assert meta['version']=='dacda33f-50ae-4974-b72f-8130506f08c5'
data=[R/'data/exercises/index.json']+[R/p['file'] for p in m['parts']]
notice='# Grammar NOEON — published 2026-10-31\n\nWorker dacda33f-50ae-4974-b72f-8130506f08c5. Bank tenses-2026-10-31.6 / comparison-2026-10-31.1, 4649 exercises / 6107 fields.\nIncludes answer keys for private editorial/project use. Do not publish this archive as a static site.\nSHA256.json checksums cover each included file. Release report: docs/reports/RELEASE-ASSIGNMENT-PREVIEW-2026-10-31.md.\n'
report=[R/'docs/reports/RELEASE-ASSIGNMENT-PREVIEW-2026-10-31.md',R/'docs/current-release.json',release/'release.json']
review=[B/p for p in ['bank.json','patch-records.json','before-records.json','corrected-records.json','import-proof.json','corrected/data/exercises/index.json','changes.csv','REPORT.md']]
support=[R/p for p in ['cloudflare/generated/checker.mjs','scripts/agreement_check.mjs','scripts/replay_v8_review.py']]
result=[pack.archive('grammar-noeon-bank-published-2026-10-31.6.zip',data+report+review+support+list((R/'content/theory').glob('*.md')),notice)]
source=[R/p for p in ['app.js','accounts.js','styles.css','index.html','sw.js','pwa.js','theme-boot.js','notifications.js','practice-report.js','manifest.webmanifest','_headers','cloudflare/worker.mjs','cloudflare/wrangler.jsonc','README.md','PROJECT-STATUS.md','docs/README.template.md','docs/CHANGELOG.md','docs/current-review.json','scripts/build_cloudflare.py','scripts/cloudflare.mjs','scripts/export_future_reference.py','scripts/export_assignment_release.py','tests/assignment-preview.mjs','tests/assignment-preview.cjs']]
other=[p for directory in [D,release,R/'cloudflare/generated',R/'cloudflare/public'] for p in directory.rglob('*') if p.is_file() and p.name!='archives.json']
result.append(pack.archive('grammar-noeon-assignment-preview-published-files-2026-10-31.zip',data+source+report+other,notice+'\nComplete final files for this release; not a full Git repository. Root files are authoritative; cloudflare/public is generated. No database backups or credentials included.\n'))
(release/'archives.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(json.dumps(result,ensure_ascii=False,indent=2))
