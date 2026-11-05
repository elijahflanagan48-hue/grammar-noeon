-- Events derive from committed assignments/completions; only receipts are stored.
CREATE TABLE IF NOT EXISTS notification_reads(user_id TEXT NOT NULL REFERENCES users(id),event_id TEXT NOT NULL,read_at REAL NOT NULL,PRIMARY KEY(user_id,event_id));
