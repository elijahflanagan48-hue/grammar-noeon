import sys
from pathlib import Path
import unittest
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from bank_versions import VERSIONS, validate_version

class BankVersionsTest(unittest.TestCase):
    def test_manifest_versions_and_numeric_revisions(self):
        for section, current in VERSIONS.items():
            item = {'id': 'cmp-fixture' if section == 'comparison' else 'fixture', 'content_version': current, 'topic': section}
            validate_version(item, VERSIONS)
            prefix = current.rsplit('.', 1)[0]
            item['content_version'] = prefix + '.2'
            validate_version(item, {section: prefix + '.10'})
            item['content_version'] = prefix + '.11'
            with self.assertRaises(AssertionError):
                validate_version(item, {section: prefix + '.10'})
