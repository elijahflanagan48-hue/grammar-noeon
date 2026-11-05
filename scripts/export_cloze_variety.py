"""Export complete reviewed data and changed files for local acceptance."""
import json
import export_future_reference as pack
R=pack.ROOT
D=R/'docs/review/CLOZE-VARIETY-2026-10-31'
pack.D=D
m=json.loads((R/'data/exercises/index.json').read_text())
assert m['content_versions']['tenses']=='tenses-2026-10-31.5'
data=[R/'data/exercises/index.json']+[R/p['file'] for p in m['parts']]
review=[p for p in D.rglob('*') if p.is_file() and p.name!='archives.json']
support=[R/p for p in ['scripts/agreement_check.mjs','scripts/replay_v8_review.py','cloudflare/generated/checker.mjs']]
notice='# Grammar NOEON — локальная редакция 2026-10-31.5\n\n120 текстов со смешанными временными контекстами. 4649 заданий / 6107 полей. Не опубликовано.\nОтчёт, полные записи до/после, CSV и проверки: docs/review/CLOZE-VARIETY-2026-10-31/.\nСодержит ключи для редакторской проверки; не размещать архив целиком на публичном хостинге.\nSHA256.json — контрольные суммы всех файлов.\n'
result=[pack.archive('grammar-noeon-bank-2026-10-31.5.zip',data+review+support+list((R/'content/theory').glob('*.md')),notice)]
source=[R/p for p in ['README.md','PROJECT-STATUS.md','docs/CHANGELOG.md','docs/current-review.json','scripts/rewrite_cloze_variety.py','scripts/review-snapshots.mjs','scripts/export_cloze_variety.py','scripts/export_future_reference.py','scripts/build_cloudflare.py','scripts/update_docs.py','tests/cloze-variety.mjs','tests/course-context.mjs','tests/future-reference.mjs','tests/temporal-context.mjs','tests/practice-formats.mjs','tests/tense-balance.mjs','tests/tense-balance-browser.cjs']]
generated=[p for p in (R/'cloudflare/generated').rglob('*') if p.is_file()]+list((R/'cloudflare/public/data/exercises').glob('*.json'))
result.append(pack.archive('grammar-noeon-cloze-variety-files-2026-10-31.zip',data+review+support+source+generated,notice+'\nПолные итоговые файлы этой правки; не весь проект. cloudflare/public — собираемая копия.\n'))
(D/'archives.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(result,ensure_ascii=False,indent=2))
