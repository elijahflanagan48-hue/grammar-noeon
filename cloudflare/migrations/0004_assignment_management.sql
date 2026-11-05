-- Reversible cancellation and an immutable audit of assignment edits.
CREATE TABLE IF NOT EXISTS assignment_controls(assignment_id TEXT PRIMARY KEY REFERENCES assignments(id),cancelled INTEGER NOT NULL DEFAULT 0 CHECK(cancelled IN (0,1)),version INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS assignment_events(id TEXT PRIMARY KEY,assignment_id TEXT NOT NULL REFERENCES assignments(id),action TEXT NOT NULL,title TEXT NOT NULL,items TEXT NOT NULL,created REAL NOT NULL,guard INTEGER NOT NULL CHECK(guard=1));
CREATE INDEX IF NOT EXISTS assignment_events_owner ON assignment_events(assignment_id,created);
