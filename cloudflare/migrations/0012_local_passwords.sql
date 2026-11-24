-- Собственные пароли: хеш PBKDF2 в users и одноразовые ссылки восстановления от учителя.
ALTER TABLE users ADD COLUMN pass_hash TEXT;
ALTER TABLE users ADD COLUMN pass_salt TEXT;
ALTER TABLE users ADD COLUMN pass_iter INTEGER;
CREATE TABLE IF NOT EXISTS password_resets(token TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),expires REAL NOT NULL,used INTEGER NOT NULL DEFAULT 0);
CREATE INDEX IF NOT EXISTS password_resets_user ON password_resets(user_id);
