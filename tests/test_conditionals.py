import json
import unittest
from pathlib import Path

from server.grading import grade
from server.app import learner_item


class ConditionalsGradingTest(unittest.TestCase):
    def test_exact_profile_does_not_invent_variants(self):
        item = dict(id='strict', type='error_fix', answer_profile='conditionals-exact-v1',
                    answer='They would have come.', accepted_answers=['They would have come.'])
        self.assertTrue(grade(item, 'THEY would have come')['correct'])
        for wrong in ["They'd have come.", 'They would already have come.', 'They would come.', 'They would not have come.']:
            self.assertFalse(grade(item, wrong)['correct'], wrong)
        item['accepted_answers'].append("They'd have come.")
        self.assertTrue(grade(item, 'They’d have come.')['correct'])

    def test_every_conditionals_key_and_field_negative(self):
        root = Path(__file__).resolve().parents[1]
        manifest = json.loads((root / 'data/exercises/index.json').read_text())
        for part in manifest['parts']:
            if part.get('section') != 'conditionals':
                continue
            for item in json.loads((root / part['file']).read_text()):
                public = learner_item(item)
                self.assertEqual(public['topic'], 'conditionals')
                for key in ('answer', 'accepted_answers', 'fixes', 'explanation_ru', 'correct_option_index'):
                    self.assertNotIn(key, public)
                if item['type'] in ('match', 'sort', 'bank', 'hunt'):
                    key = dict(match='starts', sort='sort_items', bank='word_bank', hunt='sentences')[item['type']]
                    self.assertEqual(public[key], item[key])
                if item.get('options'):
                    for n in range(len(item['options'])):
                        self.assertEqual(grade(item, n)['correct'], n == item['correct_option_index'], item['id'])
                    continue
                fields = item.get('blanks') or [item]
                canonical = [b['answer'] for b in fields]
                for n, field in enumerate(fields):
                    for answer in field['accepted_answers']:
                        values = canonical.copy()
                        values[n] = answer
                        self.assertTrue(grade(item, values if item.get('blanks') else answer)['correct'], item['id'])
                    values = canonical.copy()
                    values[n] = 'not a grammatical answer'
                    result = grade(item, values if item.get('blanks') else values[0])
                    self.assertFalse(result['correct'], item['id'])
                    self.assertTrue(all(f['verified'] for f in result['fields']), item['id'])
