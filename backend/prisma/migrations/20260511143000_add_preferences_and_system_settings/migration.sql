-- AlterTable
ALTER TABLE "users"
ADD COLUMN "preferences" JSONB NOT NULL DEFAULT '{"schema_version": 1}';

-- CreateTable
CREATE TABLE "system_settings" (
    "id_system_settings" TEXT NOT NULL,
    "institution_name" VARCHAR(150) NOT NULL DEFAULT 'ENSA Tanger',
    "email_domain" VARCHAR(100) NOT NULL DEFAULT '@ensa.ac.ma',
    "require_project_validation" BOOLEAN NOT NULL DEFAULT true,
    "enable_github_sync" BOOLEAN NOT NULL DEFAULT true,
    "allow_pro_registration" BOOLEAN NOT NULL DEFAULT true,
    "score_weights" JSONB NOT NULL DEFAULT '{"projects": 30, "internships": 25, "github": 10, "recos": 20, "certs": 15}',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id_system_settings")
);
