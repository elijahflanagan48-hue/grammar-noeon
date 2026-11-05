-- Default deny: only the owning teacher may enable new independent sessions.
CREATE TABLE student_practice_settings(student_id TEXT PRIMARY KEY REFERENCES users(id),allowed INTEGER NOT NULL DEFAULT 0 CHECK(allowed IN (0,1)));
ALTER TABLE practice ADD COLUMN source TEXT NOT NULL DEFAULT 'teacher' CHECK(source IN ('teacher','self'));
