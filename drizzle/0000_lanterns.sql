CREATE TABLE lanterns (id TEXT PRIMARY KEY NOT NULL, visitor_key TEXT UNIQUE NOT NULL, name TEXT NOT NULL, created_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE INDEX lanterns_created_at_idx ON lanterns (created_at);
