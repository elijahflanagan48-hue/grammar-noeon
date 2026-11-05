import sys
import unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
from content_repairs import repair_item

class ContentRepairsTest(unittest.TestCase):
    def test_completed_sentence_and_unchanged_key(self):
        item={'id':'sample','type':'open_brackets','prompt':'He already (to translate) the document.', 'blanks':[{'answer':'had already translated'}]}
        repair_item(item)
        self.assertEqual(item['prompt'],'He (already / to translate) the document.')
        self.assertEqual(item['answer_text'],'He had already translated the document.')
        self.assertEqual(item['blanks'][0]['answer'],'had already translated')
        once=repr(item)
        repair_item(item)
        self.assertEqual(repr(item),once)

    def test_multiple_slots_and_fixed_adverb(self):
        item={'id':'sample','type':'open_brackets','prompt':'They already (to finish), but she still (to work). He always (to walk).', 'blanks':[{'answer':'have already finished'},{'answer':'is still working'},{'answer':'walks'}]}
        repair_item(item)
        self.assertEqual(item['answer_text'],'They have already finished, but she is still working. He always walks.')
