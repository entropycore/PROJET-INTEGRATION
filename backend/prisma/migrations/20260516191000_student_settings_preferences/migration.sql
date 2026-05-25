ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "preferences" JSONB NOT NULL DEFAULT '{"schema_version": 1}';
