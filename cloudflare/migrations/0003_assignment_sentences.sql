-- Per-student reservations; old assignments are registered lazily and atomically.
CREATE TABLE IF NOT EXISTS assignment_sentences(student_id TEXT NOT NULL REFERENCES users(id),sentence_key TEXT NOT NULL,assignment_id TEXT NOT NULL REFERENCES assignments(id),PRIMARY KEY(student_id,sentence_key));
CREATE INDEX IF NOT EXISTS assignment_sentences_owner ON assignment_sentences(student_id,assignment_id);
