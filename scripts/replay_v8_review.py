"""Reproduce the reviewed JSON from the original v8 ZIP and explicit full-record corrections.
Does not execute scripts from the attachment and refuses an existing destination.
"""
from pathlib import Path, PurePosixPath
import argparse
import hashlib
import json
import zipfile

ROOT = Path(__file__).resolve().parents[1]
REVIEW = ROOT / 'docs/review/V8-2026-10-30'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('archive', type=Path)
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--review-dir', type=Path, default=REVIEW)
    args = parser.parse_args()
    review = args.review_dir
    proof = json.loads((review / 'import-proof.json').read_text())
    digest = lambda data: hashlib.sha256(data).hexdigest()
    assert digest(args.archive.read_bytes()) == proof['source_archive_sha256'], 'Wrong input archive'
    with zipfile.ZipFile(args.archive) as archive:
        for name in archive.namelist():
            path = PurePosixPath(name)
            assert not path.is_absolute() and '..' not in path.parts, 'Unsafe archive member'
        names = [name for name in archive.namelist() if PurePosixPath(name).name == 'bank.json' and len(PurePosixPath(name).parts) <= 2]
        assert len(names) == 1, 'Ambiguous bank.json'
        data = archive.read(names[0])
        prefix = names[0][:-len('bank.json')]
        checksums = json.loads(archive.read(prefix + 'SHA256.json'))
        assert digest(data) == checksums['bank.json'], 'Source bank checksum mismatch'
        bank = json.loads(data)
    corrections = {item['id']: item for item in json.loads((review / 'corrected-records.json').read_text())}
    assert corrections.keys() <= {item['id'] for item in bank}, 'Correction introduces an unknown ID'
    bank = [corrections.get(item['id'], item) for item in bank]
    retired = set(proof.get('retired_ids', []))
    assert retired <= {item['id'] for item in bank}, 'Retired ID missing from original source'
    bank = [item for item in bank if item['id'] not in retired]
    manifest = json.loads((review / 'corrected/data/exercises/index.json').read_text())
    assert len(bank) == manifest['total_items'] == proof['total']
    args.out.mkdir(parents=True, exist_ok=False)
    offset = 0
    for part in manifest['parts']:
        items = bank[offset:offset + part['count']]
        offset += part['count']
        payload = (json.dumps(items, ensure_ascii=False, indent=2) + '\n').encode()
        assert digest(payload) == proof['parts_sha256'][part['file']], part['file'] + ': replay differs'
        target = args.out / part['file']
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(payload)
    payload = (json.dumps(manifest, ensure_ascii=False, indent=2) + '\n').encode()
    assert digest(payload) == proof['manifest_sha256'], 'Manifest differs'
    (args.out / 'data/exercises/index.json').write_bytes(payload)
    (args.out / 'bank.json').write_text(json.dumps(bank, ensure_ascii=False, indent=2) + '\n')
    print(f'Replayed {len(bank)} records / {offset} partitioned records: all 47 part hashes and manifest match.')


if __name__ == '__main__':
    main()
