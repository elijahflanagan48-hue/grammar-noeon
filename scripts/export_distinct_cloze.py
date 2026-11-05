"""Export the distinct-tense cloze bank and complete changed files."""
import json
import export_future_reference as pack
R=pack.ROOT;D=R/'docs/review/DISTINCT-CLOZE-2026-10-31';pack.D=D
m=json.loads((R/'data/exercises/index.json').read_text());assert m['content_versions']['tenses']=='tenses-2026-10-31.6'
data=[R/'data/exercises/index.json']+[R/p['file'] for p in m['parts']]
review=[p for p in D.rglob('*') if p.is_file() and p.name!='archives.json']
support=[R/p for p in ['scripts/agreement_check.mjs','scripts/replay_v8_review.py','cloudflare/generated/checker.mjs']]
notice='# Grammar NOEON — локально 2026-10-31.6\n\n166 текстов переписаны. Все 182 текста Tenses имеют разные канонические времена в каждом поле. 4649 заданий / 6107 полей. Не опубликовано.\nОтчёт и полные записи до/после: docs/review/DISTINCT-CLOZE-2026-10-31/.\nСодержит ключи для редакторской проверки, не для публичного хостинга. SHA256.json содержит хэши всех файлов.\n'
result=[pack.archive('grammar-noeon-bank-2026-10-31.6.zip',data+review+support+list((R/'content/theory').glob('*.md')),notice)]
source=[R/p for p in ['README.md','PROJECT-STATUS.md','docs/CHANGELOG.md','docs/current-review.json','scripts/rewrite_distinct_cloze.py','scripts/review-snapshots.mjs','scripts/export_distinct_cloze.py','scripts/export_future_reference.py','scripts/build_cloudflare.py','scripts/update_docs.py','tests/distinct-cloze.mjs','tests/cloze-variety.mjs','tests/tense-clarity.mjs','tests/tense-balance.mjs']]
generated=[p for p in (R/'cloudflare/generated').rglob('*') if p.is_file()]+list((R/'cloudflare/public/data/exercises').glob('*.json'))
result.append(pack.archive('grammar-noeon-distinct-cloze-files-2026-10-31.zip',data+review+support+source+generated,notice+'\nПолные итоговые файлы этой правки; не весь проект.\n'))
(D/'archives.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print(json.dumps(result,ensure_ascii=False,indent=2))
