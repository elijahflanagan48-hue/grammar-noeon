-- Explicit learner-requested conversion of unanswered free-production items.
-- Prior snapshots and draft are retained; completed grades are never changed.
CREATE TABLE IF NOT EXISTS practice_format_events(id TEXT PRIMARY KEY,practice_id TEXT NOT NULL REFERENCES practice(id),items TEXT NOT NULL,draft TEXT,revision INTEGER NOT NULL,created REAL NOT NULL,guard INTEGER NOT NULL CHECK(guard=1));
