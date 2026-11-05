-- Additive library; snapshots are immutable and separate from student results.
CREATE TABLE teacher_sets(id TEXT PRIMARY KEY,teacher_id TEXT NOT NULL REFERENCES users(id),title TEXT NOT NULL,items TEXT NOT NULL,filters TEXT NOT NULL,created REAL NOT NULL);
CREATE INDEX teacher_sets_owner ON teacher_sets(teacher_id,created DESC);
CREATE TABLE teacher_set_deliveries(id TEXT PRIMARY KEY,teacher_id TEXT NOT NULL REFERENCES users(id),set_id TEXT NOT NULL REFERENCES teacher_sets(id),fingerprint TEXT NOT NULL,result TEXT NOT NULL,created REAL NOT NULL,guard INTEGER NOT NULL CHECK(guard=1));
CREATE INDEX teacher_set_deliveries_owner ON teacher_set_deliveries(teacher_id,set_id,created DESC);
CREATE TABLE teacher_set_drafts(teacher_id TEXT NOT NULL REFERENCES users(id),student_id TEXT NOT NULL REFERENCES users(id),title TEXT NOT NULL,items TEXT NOT NULL,filters TEXT NOT NULL,revision INTEGER NOT NULL DEFAULT 1,updated REAL NOT NULL,PRIMARY KEY(teacher_id,student_id));
