"""Package complete local bank and changed files for the future-reference review."""
from pathlib import Path
import hashlib
import json
import zipfile

ROOT = Path(__file__).resolve().parents[1]
D = ROOT / 'docs/review/FUTURE-REFERENCE-2026-10-31'
EXPORTS = ROOT.parents[1] / 'exports'

def archive(name, files, notice):
    payload = {('bank.json' if p == D/'bank.json' else str(p.relative_to(ROOT))): p.read_bytes() for p in files}
    payload['ARCHIVE-README.md'] = notice.encode()
    checksums = {name: hashlib.sha256(data).hexdigest() for name, data in payload.items()}
    payload['SHA256.json'] = (json.dumps(checksums, ensure_ascii=False, indent=2)+'\n').encode()
    target = EXPORTS / name
    with zipfile.ZipFile(target, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for member, data in sorted(payload.items()):
            z.writestr(member, data)
    with zipfile.ZipFile(target) as z:
        assert z.testzip() is None
        for member, digest in checksums.items():
            assert hashlib.sha256(z.read(member)).hexdigest() == digest, member
    return dict(file=str(target), sha256=hashlib.sha256(target.read_bytes()).hexdigest(), bytes=target.stat().st_size, members=len(payload), checksums='passed')

def main():
    EXPORTS.mkdir(exist_ok=True)
    m = json.loads((ROOT/'data/exercises/index.json').read_text())
    assert m['content_versions']['tenses']=='tenses-2026-10-31.4'
    bank = [i for p in m['parts'] for i in json.loads((ROOT/p['file']).read_text())]
    assert bank == json.loads((D/'bank.json').read_text())
    review_files = [p for p in D.rglob('*') if p.is_file() and p.name!='archives.json']
    data = [ROOT/'data/exercises/index.json'] + [ROOT/p['file'] for p in m['parts']]
    support = [ROOT/p for p in ['scripts/agreement_check.mjs','scripts/replay_v8_review.py','cloudflare/generated/checker.mjs']]
    theory = list((ROOT/'content/theory').glob('*.md'))
    notice = '# Grammar NOEON — локальная редакция 2026-10-31.4\n\n4649 заданий / 6107 полей, 47 частей. Не опубликовано.\n92 дополнительных уточнения будущей точки отсчёта; предыдущая правка train сохранена. Ключи и ID прежние.\nОтчёт, CSV, полные записи до/после и проверки: docs/review/FUTURE-REFERENCE-2026-10-31/.\nАрхив содержит ключи для редакторской проверки, не для публичного хостинга. Публикацию выполняют из проекта штатной сборкой, которая отделяет публичные данные от ключей.\nSHA256.json содержит хэши каждого вложенного файла.\n'
    result = [archive('grammar-noeon-bank-2026-10-31.4.zip', data+support+theory+review_files, notice)]
    changed = [ROOT/p for p in ['README.md','PROJECT-STATUS.md','docs/CHANGELOG.md','docs/current-review.json','scripts/patch_future_reference.py','scripts/export_future_reference.py','scripts/build_cloudflare.py','scripts/update_docs.py','tests/future-reference.mjs','tests/tense-balance.mjs','tests/tense-balance-browser.cjs','tests/temporal-context.mjs','tests/practice-formats.mjs']]
    generated = [p for p in (ROOT/'cloudflare/generated').rglob('*') if p.is_file()]
    public_data = [p for p in (ROOT/'cloudflare/public/data/exercises').glob('*.json')]
    result.append(archive('grammar-noeon-future-reference-files-2026-10-31.zip', data+support+review_files+changed+generated+public_data,notice+'\nПолные итоговые файлы этой правки, а не весь проект. cloudflare/public — результат сборки; руками не править.\n'))
    (D/'archives.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(result,ensure_ascii=False,indent=2))

if __name__=='__main__':
    main()
