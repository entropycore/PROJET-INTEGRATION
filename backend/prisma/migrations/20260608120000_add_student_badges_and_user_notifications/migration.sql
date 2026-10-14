-- Link user-facing notifications to any authenticated user, not only admins.
ALTER TABLE "notifications"
ADD COLUMN IF NOT EXISTS "user_id" TEXT;

CREATE INDEX IF NOT EXISTS "notifications_user_id_idx"
ON "notifications"("user_id");

CREATE INDEX IF NOT EXISTS "notifications_user_id_is_read_created_at_idx"
ON "notifications"("user_id", "is_read", "created_at");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'notifications_user_id_fkey'
  ) THEN
    ALTER TABLE "notifications"
    ADD CONSTRAINT "notifications_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id_user")
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Persist student badge progress and awards.
CREATE TABLE IF NOT EXISTS "student_badges" (
  "id_student_badge" TEXT NOT NULL,
  "student_id" TEXT NOT NULL,
  "badge_id" TEXT NOT NULL,
  "is_obtained" BOOLEAN NOT NULL DEFAULT false,
  "progress_current" INTEGER NOT NULL DEFAULT 0,
  "progress_target" INTEGER NOT NULL DEFAULT 1,
  "obtained_at" TIMESTAMP(3),
  "last_evaluated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "student_badges_pkey" PRIMARY KEY ("id_student_badge")
);

CREATE UNIQUE INDEX IF NOT EXISTS "student_badges_student_id_badge_id_key"
ON "student_badges"("student_id", "badge_id");

CREATE INDEX IF NOT EXISTS "student_badges_student_id_idx"
ON "student_badges"("student_id");

CREATE INDEX IF NOT EXISTS "student_badges_badge_id_idx"
ON "student_badges"("badge_id");

CREATE INDEX IF NOT EXISTS "student_badges_is_obtained_idx"
ON "student_badges"("is_obtained");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'student_badges_student_id_fkey'
  ) THEN
    ALTER TABLE "student_badges"
    ADD CONSTRAINT "student_badges_student_id_fkey"
    FOREIGN KEY ("student_id") REFERENCES "students"("id_student")
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'student_badges_badge_id_fkey'
  ) THEN
    ALTER TABLE "student_badges"
    ADD CONSTRAINT "student_badges_badge_id_fkey"
    FOREIGN KEY ("badge_id") REFERENCES "badges"("id_badge")
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
