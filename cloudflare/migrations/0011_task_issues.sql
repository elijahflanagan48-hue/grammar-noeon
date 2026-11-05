-- Immutable exercise context; only its owning teacher can view/resolve the report.
CREATE TABLE IF NOT EXISTS task_issues(
 id TEXT PRIMARY KEY,
 teacher_id TEXT NOT NULL REFERENCES users(id),
 reporter_id TEXT NOT NULL REFERENCES users(id),
 practice_id TEXT NOT NULL REFERENCES practice(id),
 item_index INTEGER NOT NULL,
 item_id TEXT NOT NULL,
 item_version TEXT NOT NULL,
 snapshot TEXT NOT NULL,
 comment TEXT NOT NULL,
 request_id TEXT NOT NULL,
 created REAL NOT NULL,
 status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','resolved')),
 resolved REAL,
 UNIQUE(reporter_id,request_id)
);
CREATE INDEX IF NOT EXISTS task_issues_teacher ON task_issues(teacher_id,status,created);
