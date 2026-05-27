ALTER TYPE "ActivityType" ADD VALUE IF NOT EXISTS 'VOLUNTEERING';
ALTER TYPE "ActivityType" ADD VALUE IF NOT EXISTS 'TRAINING';
ALTER TYPE "ActivityType" ADD VALUE IF NOT EXISTS 'OTHER';

ALTER TABLE "extracurricular_activities" ADD COLUMN "duration" VARCHAR(100);
ALTER TABLE "extracurricular_activities" ADD COLUMN "location" VARCHAR(150);
ALTER TABLE "extracurricular_activities" ADD COLUMN "validation_status" "ValidationStatus" NOT NULL DEFAULT 'DRAFT';

CREATE INDEX "extracurricular_activities_validation_status_idx" ON "extracurricular_activities"("validation_status");

ALTER TABLE "certificates" ADD COLUMN "file_name" VARCHAR(255);
ALTER TABLE "certificates" ADD COLUMN "mime_type" VARCHAR(120);
ALTER TABLE "certificates" ADD COLUMN "file_size" INTEGER;
ALTER TABLE "certificates" ADD COLUMN "storage_path" TEXT;
