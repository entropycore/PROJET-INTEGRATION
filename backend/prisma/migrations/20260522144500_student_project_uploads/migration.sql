ALTER TYPE "ValidationStatus" ADD VALUE IF NOT EXISTS 'DRAFT';

ALTER TABLE "projects"
ADD COLUMN "team_size" VARCHAR(80),
ADD COLUMN "validator_professor_id" TEXT;

ALTER TABLE "project_media"
ADD COLUMN "file_name" VARCHAR(255),
ADD COLUMN "mime_type" VARCHAR(120),
ADD COLUMN "file_size" INTEGER,
ADD COLUMN "storage_path" TEXT;

CREATE INDEX "projects_validator_professor_id_idx" ON "projects"("validator_professor_id");

ALTER TABLE "projects"
ADD CONSTRAINT "projects_validator_professor_id_fkey"
FOREIGN KEY ("validator_professor_id")
REFERENCES "professors"("id_professor")
ON DELETE SET NULL
ON UPDATE CASCADE;
