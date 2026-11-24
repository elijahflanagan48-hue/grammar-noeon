import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

SCRIPT = Path(__file__).resolve().parents[1] / 'scripts/lexical_repairs.py'


class LexicalRepairsTest(unittest.TestCase):
    def test_protects_all_accepted_keys_and_stable_metadata(self):
        rows = [
            dict(id='CP31-01', seed_id='cl-canopy', construction='cp_canopy',
                 prompt='A canopy looks nice.', answer='nice', accepted_answers=['nice', 'canopy']),
            dict(id='CP31-02', seed_id='cl-canopy', construction='cp_canopy',
                 prompt='A canopy looks (nice).',
                 blanks=[dict(cue='nice', answer='nice', accepted_answers=['nice', 'canopy'])]),
            dict(id='CP31-03', seed_id='cl-canopy', construction='cp_canopy',
                 prompt='A canopy looks nice.', options=['canopy', 'roof', 'room', 'tent'], correct_option_index=0),
            dict(id='CP31-04', seed_id='cl-canopy', construction='cp_canopy',
                 prompt='A canopy looks (nice).',
                 blanks=[dict(cue='nice', answer='nice', accepted_answers=['nice'])]),
        ]
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            final = root / 'content/bankgen/comparison/final/CP31.jsonl'
            final.parent.mkdir(parents=True)
            final.write_text(''.join(json.dumps(r)+'\n' for r in rows))
            mapping = root / 'map.json'
            mapping.write_text(json.dumps(dict(words={'canopy':'roof'}, names={})))
            subprocess.run([sys.executable, str(SCRIPT), 'comparison', str(mapping)], cwd=root, check=True, capture_output=True)
            repaired = [json.loads(l) for l in final.read_text().splitlines()]
        self.assertEqual(repaired[:3], rows[:3])
        self.assertEqual(repaired[3]['prompt'], 'A roof looks (nice).')
        for old, new in zip(rows, repaired):
            for field in ('id', 'seed_id', 'construction'):
                self.assertEqual(new[field], old[field])


if __name__ == '__main__':
    unittest.main()
