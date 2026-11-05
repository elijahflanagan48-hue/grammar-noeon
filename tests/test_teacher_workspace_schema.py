import sqlite3
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class TeacherWorkspaceSchemaTest(unittest.TestCase):
    def test_additive_migrations_preserve_attempt_and_match_fresh_database(self):
        schema = (ROOT / 'cloudflare/schema.sql').read_text()
        previous = schema.split('-- Teacher library additions (0010).')[0]
        upgraded = sqlite3.connect(':memory:')
        upgraded.executescript(previous)
        upgraded.execute("INSERT INTO users(id,email,name,role,created) VALUES('teacher','teacher@example.test','Teacher','teacher',1)")
        upgraded.execute("INSERT INTO practice(id,user_id,items,answers,created,completed,score,max_score) VALUES('old','teacher','[]','[]',1,2,7,10)")
        for name in ['0010_teacher_library.sql', '0011_task_issues.sql']:
            upgraded.executescript((ROOT / 'cloudflare/migrations' / name).read_text())
        self.assertEqual(upgraded.execute('SELECT score,max_score,completed FROM practice WHERE id=?', ['old']).fetchone(), (7, 10, 2))
        fresh = sqlite3.connect(':memory:')
        fresh.executescript(schema)
        def definitions(connection):
            return connection.execute("SELECT type,name,sql FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' ORDER BY type,name").fetchall()
        self.assertEqual(definitions(upgraded), definitions(fresh))
        upgraded.close()
        fresh.close()


if __name__ == '__main__':
    unittest.main()
