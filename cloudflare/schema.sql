-- Apply only to a NEW dedicated Grammar NOEON D1 database.
CREATE TABLE app_meta (name TEXT PRIMARY KEY, value TEXT NOT NULL);
INSERT INTO app_meta VALUES ('application', 'grammar-noeon'), ('schema', '1');
CREATE TABLE users(id TEXT PRIMARY KEY,email TEXT UNIQUE NOT NULL,name TEXT NOT NULL,role TEXT NOT NULL CHECK(role IN ('teacher','student')),teacher_id TEXT REFERENCES users(id),active INTEGER NOT NULL DEFAULT 1,created REAL NOT NULL);
CREATE UNIQUE INDEX one_teacher ON users(role) WHERE role='teacher';
CREATE INDEX owned_students ON users(teacher_id,role);
CREATE TABLE sessions(token TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),csrf TEXT NOT NULL,expires REAL NOT NULL);
CREATE INDEX session_expiry ON sessions(expires);
CREATE TABLE invites(token TEXT PRIMARY KEY,teacher_id TEXT NOT NULL REFERENCES users(id),email TEXT NOT NULL,name TEXT NOT NULL,expires REAL NOT NULL,used INTEGER NOT NULL DEFAULT 0);
CREATE INDEX invite_owner_email ON invites(teacher_id,email);
CREATE TABLE practice(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),items TEXT NOT NULL,answers TEXT NOT NULL DEFAULT '[]',draft TEXT,revision INTEGER NOT NULL DEFAULT 0,created REAL NOT NULL,completed REAL,score INTEGER NOT NULL DEFAULT 0,max_score INTEGER NOT NULL DEFAULT 0,pending_count INTEGER NOT NULL DEFAULT 0);
CREATE INDEX practice_owner ON practice(user_id,created DESC);
CREATE TABLE limits(key TEXT PRIMARY KEY,attempts INTEGER NOT NULL,until_time REAL NOT NULL);

-- Additive migration, dedicated Grammar NOEON database only.
CREATE TABLE IF NOT EXISTS assignments(id TEXT PRIMARY KEY,teacher_id TEXT NOT NULL REFERENCES users(id),student_id TEXT NOT NULL REFERENCES users(id),practice_id TEXT NOT NULL UNIQUE REFERENCES practice(id),title TEXT NOT NULL,created REAL NOT NULL);
CREATE INDEX IF NOT EXISTS assignments_student ON assignments(student_id,created DESC);
CREATE INDEX IF NOT EXISTS assignments_teacher ON assignments(teacher_id,student_id,created DESC);

-- Per-student reservations; old assignments are registered lazily and atomically.
CREATE TABLE IF NOT EXISTS assignment_sentences(student_id TEXT NOT NULL REFERENCES users(id),sentence_key TEXT NOT NULL,assignment_id TEXT NOT NULL REFERENCES assignments(id),PRIMARY KEY(student_id,sentence_key));
CREATE INDEX IF NOT EXISTS assignment_sentences_owner ON assignment_sentences(student_id,assignment_id);

-- Reversible cancellation and an immutable audit of assignment edits.
CREATE TABLE IF NOT EXISTS assignment_controls(assignment_id TEXT PRIMARY KEY REFERENCES assignments(id),cancelled INTEGER NOT NULL DEFAULT 0 CHECK(cancelled IN (0,1)),version INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS assignment_events(id TEXT PRIMARY KEY,assignment_id TEXT NOT NULL REFERENCES assignments(id),action TEXT NOT NULL,title TEXT NOT NULL,items TEXT NOT NULL,created REAL NOT NULL,guard INTEGER NOT NULL CHECK(guard=1));
CREATE INDEX IF NOT EXISTS assignment_events_owner ON assignment_events(assignment_id,created);
CREATE TABLE IF NOT EXISTS notification_reads(user_id TEXT NOT NULL REFERENCES users(id),event_id TEXT NOT NULL,read_at REAL NOT NULL,PRIMARY KEY(user_id,event_id));
CREATE TABLE IF NOT EXISTS practice_format_events(id TEXT PRIMARY KEY,practice_id TEXT NOT NULL REFERENCES practice(id),items TEXT NOT NULL,draft TEXT,revision INTEGER NOT NULL,created REAL NOT NULL,guard INTEGER NOT NULL CHECK(guard=1));

-- Default deny: only the owning teacher may enable new independent sessions.
CREATE TABLE student_practice_settings(student_id TEXT PRIMARY KEY REFERENCES users(id),allowed INTEGER NOT NULL DEFAULT 0 CHECK(allowed IN (0,1)));
ALTER TABLE practice ADD COLUMN source TEXT NOT NULL DEFAULT 'teacher' CHECK(source IN ('teacher','self'));

-- Additive only. NULL summary marks a legacy row awaiting lazy materialization.
ALTER TABLE practice ADD COLUMN total_items INTEGER;
ALTER TABLE practice ADD COLUMN answered_count INTEGER;
ALTER TABLE practice ADD COLUMN topic_summary TEXT;
ALTER TABLE practice ADD COLUMN levels_json TEXT;
ALTER TABLE practice ADD COLUMN types_json TEXT;
ALTER TABLE users ADD COLUMN teacher_name TEXT;
ALTER TABLE users ADD COLUMN last_active REAL;
ALTER TABLE invites ADD COLUMN created REAL;
ALTER TABLE invites ADD COLUMN revoked INTEGER NOT NULL DEFAULT 0;
-- Old links always used the same seven-day lifetime; retain their creation estimate.
UPDATE invites SET created=expires-604800 WHERE created IS NULL;
CREATE INDEX invites_expiry ON invites(expires);
CREATE INDEX limits_expiry ON limits(until_time);
CREATE INDEX practice_legacy_summary ON practice(user_id,created DESC) WHERE topic_summary IS NULL;
-- Older deployed code can still write during a rollout. Invalidate stale materialized data.
CREATE TRIGGER practice_summary_invalidate AFTER UPDATE OF items,answers ON practice
WHEN (NEW.items<>OLD.items OR NEW.answers<>OLD.answers)
 AND NEW.total_items IS OLD.total_items AND NEW.answered_count IS OLD.answered_count
 AND NEW.topic_summary IS OLD.topic_summary
BEGIN
 UPDATE practice SET total_items=NULL,answered_count=NULL,topic_summary=NULL,levels_json=NULL,types_json=NULL WHERE id=NEW.id;
END;

-- Teacher library additions (0010).
-- Additive library; snapshots are immutable and separate from student results.
CREATE TABLE teacher_sets(id TEXT PRIMARY KEY,teacher_id TEXT NOT NULL REFERENCES users(id),title TEXT NOT NULL,items TEXT NOT NULL,filters TEXT NOT NULL,created REAL NOT NULL);
CREATE INDEX teacher_sets_owner ON teacher_sets(teacher_id,created DESC);
CREATE TABLE teacher_set_deliveries(id TEXT PRIMARY KEY,teacher_id TEXT NOT NULL REFERENCES users(id),set_id TEXT NOT NULL REFERENCES teacher_sets(id),fingerprint TEXT NOT NULL,result TEXT NOT NULL,created REAL NOT NULL,guard INTEGER NOT NULL CHECK(guard=1));
CREATE INDEX teacher_set_deliveries_owner ON teacher_set_deliveries(teacher_id,set_id,created DESC);
CREATE TABLE teacher_set_drafts(teacher_id TEXT NOT NULL REFERENCES users(id),student_id TEXT NOT NULL REFERENCES users(id),title TEXT NOT NULL,items TEXT NOT NULL,filters TEXT NOT NULL,revision INTEGER NOT NULL DEFAULT 1,updated REAL NOT NULL,PRIMARY KEY(teacher_id,student_id));

-- Task issue reporting additions (0011).
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
