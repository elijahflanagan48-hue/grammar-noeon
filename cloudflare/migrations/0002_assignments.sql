-- Additive migration, dedicated Grammar NOEON database only.
CREATE TABLE IF NOT EXISTS assignments(id TEXT PRIMARY KEY,teacher_id TEXT NOT NULL REFERENCES users(id),student_id TEXT NOT NULL REFERENCES users(id),practice_id TEXT NOT NULL UNIQUE REFERENCES practice(id),title TEXT NOT NULL,created REAL NOT NULL);
CREATE INDEX IF NOT EXISTS assignments_student ON assignments(student_id,created DESC);
CREATE INDEX IF NOT EXISTS assignments_teacher ON assignments(teacher_id,student_id,created DESC);
