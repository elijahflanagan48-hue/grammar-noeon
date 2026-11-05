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
