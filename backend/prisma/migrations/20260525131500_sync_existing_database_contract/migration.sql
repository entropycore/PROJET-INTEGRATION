-- Keep Prisma's datamodel aligned with the database contract currently used by the app.
-- The statements are idempotent so this migration is safe on the existing dev DB
-- and still builds the missing objects on a fresh database.

ALTER TYPE "ValidationStatus" ADD VALUE IF NOT EXISTS 'DRAFT' BEFORE 'PENDING';
ALTER TYPE "ActivityType" ADD VALUE IF NOT EXISTS 'VOLUNTEERING';
ALTER TYPE "ActivityType" ADD VALUE IF NOT EXISTS 'TRAINING';
ALTER TYPE "ActivityType" ADD VALUE IF NOT EXISTS 'OTHER';

ALTER TABLE "projects"
  ADD COLUMN IF NOT EXISTS "team_size" VARCHAR(80),
  ADD COLUMN IF NOT EXISTS "validator_professor_id" TEXT;

ALTER TABLE "projects"
  ALTER COLUMN "validation_status" SET DEFAULT 'DRAFT';

ALTER TABLE "project_media"
  ADD COLUMN IF NOT EXISTS "file_name" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "mime_type" VARCHAR(120),
  ADD COLUMN IF NOT EXISTS "file_size" INTEGER,
  ADD COLUMN IF NOT EXISTS "storage_path" TEXT;

ALTER TABLE "internships"
  ADD COLUMN IF NOT EXISTS "report_file_name" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "report_mime_type" VARCHAR(120),
  ADD COLUMN IF NOT EXISTS "report_file_size" INTEGER,
  ADD COLUMN IF NOT EXISTS "report_storage_path" TEXT;

ALTER TABLE "extracurricular_activities"
  ADD COLUMN IF NOT EXISTS "duration" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "location" VARCHAR(150),
  ADD COLUMN IF NOT EXISTS "validation_status" "ValidationStatus" NOT NULL DEFAULT 'DRAFT';

ALTER TABLE "certificates"
  ADD COLUMN IF NOT EXISTS "file_name" VARCHAR(255),
  ADD COLUMN IF NOT EXISTS "mime_type" VARCHAR(120),
  ADD COLUMN IF NOT EXISTS "file_size" INTEGER,
  ADD COLUMN IF NOT EXISTS "storage_path" TEXT;

ALTER TABLE "portfolios"
  ADD COLUMN IF NOT EXISTS "theme" VARCHAR(80) NOT NULL DEFAULT 'modern-academic',
  ADD COLUMN IF NOT EXISTS "included_sections" JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS "included_items" JSONB NOT NULL DEFAULT '{}';

CREATE TABLE IF NOT EXISTS "academic_timeline" (
  "id" SERIAL NOT NULL,
  "student_id" TEXT NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "institution" VARCHAR(255) NOT NULL,
  "start_date" DATE NOT NULL,
  "end_date" DATE,
  "description" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "academic_timeline_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "badges" (
  "id_badge" TEXT NOT NULL,
  "name" VARCHAR(120) NOT NULL,
  "description" TEXT,
  "rule" TEXT NOT NULL,
  "icon_url" TEXT,
  "tone" VARCHAR(50) NOT NULL DEFAULT 'blue',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "badges_pkey" PRIMARY KEY ("id_badge")
);

CREATE TABLE IF NOT EXISTS "internship_media" (
  "id_internship_media" TEXT NOT NULL,
  "internship_id" TEXT NOT NULL,
  "media_type" VARCHAR(50) NOT NULL,
  "media_url" TEXT NOT NULL,
  "description" TEXT,
  "file_name" VARCHAR(255),
  "mime_type" VARCHAR(120),
  "file_size" INTEGER,
  "storage_path" TEXT,
  CONSTRAINT "internship_media_pkey" PRIMARY KEY ("id_internship_media")
);

CREATE TABLE IF NOT EXISTS "skill_domains" (
  "id_skill_domain" TEXT NOT NULL,
  "name" VARCHAR(120) NOT NULL,
  "slug" VARCHAR(120) NOT NULL,
  "description" TEXT,
  "display_order" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "skill_domains_pkey" PRIMARY KEY ("id_skill_domain")
);

ALTER TABLE "skills"
  ADD COLUMN IF NOT EXISTS "domain_id" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "badges_name_key" ON "badges"("name");
CREATE INDEX IF NOT EXISTS "badges_created_at_idx" ON "badges"("created_at");
CREATE INDEX IF NOT EXISTS "academic_timeline_student_id_idx" ON "academic_timeline"("student_id");
CREATE INDEX IF NOT EXISTS "internship_media_internship_id_idx" ON "internship_media"("internship_id");
CREATE UNIQUE INDEX IF NOT EXISTS "skill_domains_name_key" ON "skill_domains"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "skill_domains_slug_key" ON "skill_domains"("slug");
CREATE INDEX IF NOT EXISTS "skill_domains_display_order_idx" ON "skill_domains"("display_order");
CREATE INDEX IF NOT EXISTS "skills_domain_id_idx" ON "skills"("domain_id");
CREATE INDEX IF NOT EXISTS "projects_validator_professor_id_idx" ON "projects"("validator_professor_id");
CREATE INDEX IF NOT EXISTS "extracurricular_activities_validation_status_idx" ON "extracurricular_activities"("validation_status");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'academic_timeline_student_id_fkey'
  ) THEN
    ALTER TABLE "academic_timeline"
      ADD CONSTRAINT "academic_timeline_student_id_fkey"
      FOREIGN KEY ("student_id") REFERENCES "students"("id_student")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'internship_media_internship_id_fkey'
  ) THEN
    ALTER TABLE "internship_media"
      ADD CONSTRAINT "internship_media_internship_id_fkey"
      FOREIGN KEY ("internship_id") REFERENCES "internships"("id_internship")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'projects_validator_professor_id_fkey'
  ) THEN
    ALTER TABLE "projects"
      ADD CONSTRAINT "projects_validator_professor_id_fkey"
      FOREIGN KEY ("validator_professor_id") REFERENCES "professors"("id_professor")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'skills_domain_id_fkey'
  ) THEN
    ALTER TABLE "skills"
      ADD CONSTRAINT "skills_domain_id_fkey"
      FOREIGN KEY ("domain_id") REFERENCES "skill_domains"("id_skill_domain")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
