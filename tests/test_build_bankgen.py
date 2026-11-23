import copy
import hashlib
import json
from pathlib import Path
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path[:0] = [str(ROOT / 'scripts'), str(ROOT / 'server')]
import build_bankgen as builder
from grading import grade


class BankgenBuildTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.rows = builder.read_final(ROOT, 'reported')

    def test_all_approved_answers_and_unchanged_editorial_fields(self):
        mapping = {}
        items = builder.convert(self.rows, 'reported', mapping, 'reported-2026-11-23.1')
        self.assertEqual(len(items), 1000)
        self.assertEqual(len(mapping), 1000)
        for row, item in zip(self.rows, items):
            self.assertEqual(item['prompt'], row['prompt'])
            self.assertEqual(item['explanation_ru'], row['explanation_ru'])
            targets = item.get('blanks') or [item]
            sources = row.get('blanks') or [row]
            if item.get('options'):
                self.assertEqual(item['options'], row['options'])
                for ix in range(4):
                    self.assertEqual(grade(item, ix)['correct'], ix == row['correct_option_index'])
                continue
            canonical = [f['answer'] for f in targets]
            for n, (source, field) in enumerate(zip(sources, targets)):
                self.assertEqual(field['answer'], source['answer'])
                self.assertEqual(field['accepted_answers'], source['accepted_answers'])
                for answer in field['accepted_answers']:
                    values = canonical[:]
                    values[n] = answer
                    self.assertTrue(grade(item, values)['correct'], row['id'] + ': ' + answer)
                values = canonical[:]
                values[n] = 'this is a deliberately wrong answer'
                self.assertFalse(grade(item, values)['correct'], row['id'])
        backwards = builder.convert(list(reversed(self.rows)), 'reported', mapping, 'reported-2026-11-23.1')
        self.assertEqual({i['bankgen_id']: i['id'] for i in items},
                         {i['bankgen_id']: i['id'] for i in backwards})
        extra = copy.deepcopy(self.rows[0])
        extra['id'] = 'RP99-99'
        mapping['withdrawn-source'] = 'rp-R1-900'
        self.assertEqual(builder.convert([extra], 'reported', mapping, 'reported-2026-11-23.1')[0]['id'], 'rp-R1-901')

    def fixture(self, root):
        base = root / 'content/bankgen/reported'
        (base / 'final').mkdir(parents=True)
        samples = [copy.deepcopy(next(r for r in self.rows if r['format'] == f))
                   for f in ('gap', 'mini', 'mc', 'fix', 'which', 'transform')]
        for n, row in enumerate(samples, 1):
            row['id'] = f'RP99-{n:02d}'
        (base / 'final/RP99.jsonl').write_text('\n'.join(json.dumps(r) for r in samples)+'\n# check: fixture\n')
        other = dict(id='other-1', topic='nouns', type='open_brackets', level='basic')
        legacy = dict(id='legacy-1', topic='reported', type='direct_to_reported', level='basic')
        builder.dump(root / 'data/exercises/part-01.json', [other])
        builder.dump(root / 'data/exercises/part-02.json', [legacy, dict(legacy, id='legacy-2')])
        builder.dump(root / 'data/exercises/index.json', dict(
            parts=[dict(file='data/exercises/part-01.json', count=1), dict(file='data/exercises/part-02.json', count=2)],
            sections=dict(nouns=1, reported=2), section_types={}, levels={},
            content_versions=dict(reported='reported-2026-11-05.1')))
        builder.dump(root / 'docs/current-release.json', dict(passive_v7_status='pending passive verification'))
        builder.dump(root / 'data/theory.json', [dict(id='reported', file='content/theory/08-reported.md')])
        (root / 'content/theory').mkdir(parents=True)
        anchors = {a for refs in builder.REPORTED_REFS.values() for a in refs}
        (root / 'content/theory/08-reported.md').write_text('Theory stays intact.\n' +
            '\n'.join(f'<a id="{a}"></a>' for a in sorted(anchors)))
        (base / 'keep.txt').write_text('legacy-1\n')
        return base, samples

    def test_rebuild_retirement_keep_withdrawal_and_other_topic_preservation(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            base, samples = self.fixture(root)
            before = (root / 'data/exercises/part-01.json').read_bytes()
            original_final = (base / 'final/RP99.jsonl').read_bytes()
            items = builder.build('reported', '2026-11-23', root)
            first = {str(p): p.read_bytes() for p in root.rglob('*') if p.is_file()}
            builder.build('reported', '2026-11-23', root)
            self.assertEqual(first, {str(p): p.read_bytes() for p in root.rglob('*') if p.is_file()})
            self.assertEqual(before, (root / 'data/exercises/part-01.json').read_bytes())
            self.assertEqual(original_final, (base / 'final/RP99.jsonl').read_bytes())
            output = json.loads((root / 'data/exercises/part-02.json').read_text())
            self.assertNotIn('retired', output[0])
            self.assertEqual(output[1]['retired'], 'reported-bankgen')
            self.assertEqual(json.loads((root / 'docs/current-release.json').read_text())['passive_v7_status'],
                             'pending passive verification')
            # A withdrawn approved item keeps its ID and historical keys.
            (base / 'final/RP99.jsonl').write_text('\n'.join(json.dumps(r) for r in samples[1:])+'\n')
            builder.build('reported', '2026-11-23', root)
            output = {i['id']: i for i in json.loads((root / 'data/exercises/part-02.json').read_text())}
            self.assertTrue(output[items[0]['id']]['retired'])
            self.assertEqual(output[items[0]['id']]['blanks'], items[0]['blanks'])

    def test_invalid_final_fails_before_bank_writes(self):
        for mutation in ('duplicate', 'missing-answer', 'bad-json', 'unknown-keep', 'mixed-part'):
            with self.subTest(mutation=mutation), tempfile.TemporaryDirectory() as tmp:
                root = Path(tmp)
                base, samples = self.fixture(root)
                if mutation == 'duplicate':
                    samples[1]['seed_id'] = samples[0]['seed_id']
                elif mutation == 'missing-answer':
                    samples[0]['blanks'][0]['accepted_answers'] = []
                elif mutation == 'unknown-keep':
                    (base / 'keep.txt').write_text('missing-id\n')
                elif mutation == 'mixed-part':
                    builder.dump(root / 'data/exercises/part-02.json', [dict(id='legacy-1', topic='reported'), dict(id='n-2', topic='nouns')])
                final = base / 'final/RP99.jsonl'
                final.write_text('{broken' if mutation == 'bad-json' else '\n'.join(json.dumps(r) for r in samples)+'\n')
                before = {str(p): p.read_bytes() for p in root.rglob('*') if p.is_file()}
                with self.assertRaises(ValueError):
                    builder.build('reported', '2026-11-23', root)
                self.assertEqual(before, {str(p): p.read_bytes() for p in root.rglob('*') if p.is_file()})


if __name__ == '__main__':
    unittest.main()
