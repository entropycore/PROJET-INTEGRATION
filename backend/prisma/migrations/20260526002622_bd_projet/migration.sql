-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'PROFESSOR', 'ADMINISTRATOR', 'PROFESSIONAL');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING');

-- CreateEnum
CREATE TYPE "SkillType" AS ENUM ('TECHNICAL', 'SOFT_SKILL');

-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('MODULE', 'INTEGRATION', 'HACKATHON', 'PERSONAL', 'INTERNSHIP');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PUBLIC', 'PRIVATE', 'TEACHERS', 'SHARED_LINK');

-- CreateEnum
CREATE TYPE "ValidationStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('CLUB', 'EVENT', 'HACKATHON', 'COMPETITION', 'ASSOCIATIVE_ENGAGEMENT', 'CONFERENCE', 'VOLUNTEERING', 'TRAINING', 'OTHER');

-- CreateEnum
CREATE TYPE "RecommendationLetterType" AS ENUM ('DOUBLE_DEGREE', 'MASTER', 'DOCTORATE', 'INTERNSHIP', 'EMPLOYMENT', 'INTERNATIONAL_PROGRAM');

-- CreateEnum
CREATE TYPE "PortfolioStatus" AS ENUM ('DRAFT', 'ACTIVE', 'HIDDEN', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReportTargetType" AS ENUM ('PORTFOLIO', 'COMMENT', 'RECOMMENDATION', 'PROJECT', 'INTERNSHIP', 'USER', 'OTHER');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ACCESS_REQUEST', 'CERTIFICATE_VALIDATION', 'RECOMMENDATION_LETTER_VALIDATION', 'COMMENT_VALIDATION', 'RECOMMENDATION_VALIDATION', 'REPORT', 'SYSTEM');

-- CreateTable
CREATE TABLE "users" (
    "id_user" TEXT NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "phone" VARCHAR(30),
    "profile_picture" TEXT,
    "account_status" "AccountStatus" NOT NULL DEFAULT 'PENDING',
    "role" "UserRole" NOT NULL,
    "preferences" JSONB NOT NULL DEFAULT '{"schema_version": 1}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "refresh_token_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "user_agent" TEXT,
    "ip_address" VARCHAR(45),
    "is_revoked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "refresh_token_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id_student" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "apogee_code" VARCHAR(50),
    "cne" VARCHAR(50),
    "major" VARCHAR(120) NOT NULL,
    "level" VARCHAR(50) NOT NULL,
    "birth_date" DATE,
    "address" TEXT,
    "city" VARCHAR(100),
    "bio" TEXT,
    "career_objective" TEXT,
    "linkedin_url" TEXT,
    "github_access_token" TEXT,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id_student")
);

-- CreateTable
CREATE TABLE "professors" (
    "id_professor" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "employee_id" VARCHAR(50),
    "grade" VARCHAR(100),
    "specialty" VARCHAR(150),
    "department" VARCHAR(150),

    CONSTRAINT "professors_pkey" PRIMARY KEY ("id_professor")
);

-- CreateTable
CREATE TABLE "administrators" (
    "id_administrator" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "employee_id" VARCHAR(50),
    "department" VARCHAR(120),
    "admin_level" VARCHAR(50),

    CONSTRAINT "administrators_pkey" PRIMARY KEY ("id_administrator")
);

-- CreateTable
CREATE TABLE "professionals" (
    "id_professional" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "company" VARCHAR(150),
    "job_title" VARCHAR(120),
    "sector" VARCHAR(120),
    "bio" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_email_verified" BOOLEAN NOT NULL DEFAULT false,
    "email_verify_token" TEXT,
    "email_verify_expires" TIMESTAMP(3),
    "email_verified_at" TIMESTAMP(3),
    "approved_at" TIMESTAMP(3),
    "approved_by_administrator_id" TEXT,
    "rejected_at" TIMESTAMP(3),
    "rejected_by_administrator_id" TEXT,
    "rejection_reason" TEXT,
    "suspended_at" TIMESTAMP(3),
    "suspended_by_administrator_id" TEXT,
    "suspension_reason" TEXT,

    CONSTRAINT "professionals_pkey" PRIMARY KEY ("id_professional")
);

-- CreateTable
CREATE TABLE "academic_paths" (
    "id_academic_path" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "institution" VARCHAR(150) NOT NULL,
    "degree" VARCHAR(150) NOT NULL,
    "major" VARCHAR(120),
    "start_date" DATE,
    "end_date" DATE,
    "honor" VARCHAR(100),

    CONSTRAINT "academic_paths_pkey" PRIMARY KEY ("id_academic_path")
);

-- CreateTable
CREATE TABLE "skill_domains" (
    "id_skill_domain" TEXT NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "description" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "skill_domains_pkey" PRIMARY KEY ("id_skill_domain")
);

-- CreateTable
CREATE TABLE "skills" (
    "id_skill" TEXT NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "type" "SkillType" NOT NULL,
    "description" TEXT,
    "domain_id" TEXT,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id_skill")
);

-- CreateTable
CREATE TABLE "student_skills" (
    "id_student_skill" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "skill_id" TEXT NOT NULL,
    "mastery_level" VARCHAR(50),
    "skill_source" VARCHAR(100),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_skills_pkey" PRIMARY KEY ("id_student_skill")
);

-- CreateTable
CREATE TABLE "technologies" (
    "id_technology" TEXT NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "version" VARCHAR(50),
    "category" VARCHAR(100),

    CONSTRAINT "technologies_pkey" PRIMARY KEY ("id_technology")
);

-- CreateTable
CREATE TABLE "projects" (
    "id_project" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "type" "ProjectType" NOT NULL,
    "team_role" VARCHAR(120),
    "team_size" VARCHAR(80),
    "validator_professor_id" TEXT,
    "github_url" TEXT,
    "youtube_url" TEXT,
    "result" TEXT,
    "general_feedback" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submitted_at" TIMESTAMP(3),
    "validation_status" "ValidationStatus" NOT NULL DEFAULT 'DRAFT',
    "visibility" "Visibility" NOT NULL DEFAULT 'PRIVATE',

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id_project")
);

-- CreateTable
CREATE TABLE "project_media" (
    "id_project_media" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "media_type" VARCHAR(50) NOT NULL,
    "media_url" TEXT NOT NULL,
    "description" TEXT,
    "file_name" VARCHAR(255),
    "mime_type" VARCHAR(120),
    "file_size" INTEGER,
    "storage_path" TEXT,

    CONSTRAINT "project_media_pkey" PRIMARY KEY ("id_project_media")
);

-- CreateTable
CREATE TABLE "project_technologies" (
    "id_project_technology" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "technology_id" TEXT NOT NULL,

    CONSTRAINT "project_technologies_pkey" PRIMARY KEY ("id_project_technology")
);

-- CreateTable
CREATE TABLE "project_validations" (
    "id_project_validation" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "professor_id" TEXT NOT NULL,
    "decision" "ValidationStatus" NOT NULL,
    "comment" TEXT,
    "professor_feedback" TEXT,
    "decision_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_validations_pkey" PRIMARY KEY ("id_project_validation")
);

-- CreateTable
CREATE TABLE "internships" (
    "id_internship" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "supervisor_professor_id" TEXT,
    "host_organization" VARCHAR(150) NOT NULL,
    "duration" VARCHAR(100),
    "start_date" DATE,
    "end_date" DATE,
    "missions" TEXT,
    "report_url" TEXT,
    "report_file_name" VARCHAR(255),
    "report_mime_type" VARCHAR(120),
    "report_file_size" INTEGER,
    "report_storage_path" TEXT,
    "validation_status" "ValidationStatus" NOT NULL DEFAULT 'PENDING',
    "visibility" "Visibility" NOT NULL DEFAULT 'PRIVATE',

    CONSTRAINT "internships_pkey" PRIMARY KEY ("id_internship")
);

-- CreateTable
CREATE TABLE "internship_media" (
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

-- CreateTable
CREATE TABLE "internship_technologies" (
    "id_internship_technology" TEXT NOT NULL,
    "internship_id" TEXT NOT NULL,
    "technology_id" TEXT NOT NULL,

    CONSTRAINT "internship_technologies_pkey" PRIMARY KEY ("id_internship_technology")
);

-- CreateTable
CREATE TABLE "internship_validations" (
    "id_internship_validation" TEXT NOT NULL,
    "internship_id" TEXT NOT NULL,
    "professor_id" TEXT NOT NULL,
    "decision" "ValidationStatus" NOT NULL,
    "comment" TEXT,
    "decision_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "internship_validations_pkey" PRIMARY KEY ("id_internship_validation")
);

-- CreateTable
CREATE TABLE "extracurricular_activities" (
    "id_activity" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "organization" VARCHAR(150),
    "start_date" DATE,
    "end_date" DATE,
    "duration" VARCHAR(100),
    "location" VARCHAR(150),
    "validation_status" "ValidationStatus" NOT NULL DEFAULT 'DRAFT',
    "visibility" "Visibility" NOT NULL DEFAULT 'PRIVATE',

    CONSTRAINT "extracurricular_activities_pkey" PRIMARY KEY ("id_activity")
);

-- CreateTable
CREATE TABLE "certificates" (
    "id_certificate" TEXT NOT NULL,
    "activity_id" TEXT NOT NULL,
    "document_url" TEXT NOT NULL,
    "file_name" VARCHAR(255),
    "mime_type" VARCHAR(120),
    "file_size" INTEGER,
    "storage_path" TEXT,
    "validation_status" "ValidationStatus" NOT NULL DEFAULT 'PENDING',
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id_certificate")
);

-- CreateTable
CREATE TABLE "certificate_validations" (
    "id_certificate_validation" TEXT NOT NULL,
    "certificate_id" TEXT NOT NULL,
    "administrator_id" TEXT NOT NULL,
    "decision" "ValidationStatus" NOT NULL,
    "comment" TEXT,
    "decision_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "certificate_validations_pkey" PRIMARY KEY ("id_certificate_validation")
);

-- CreateTable
CREATE TABLE "recommendation_letters" (
    "id_recommendation_letter" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "author_user_id" TEXT NOT NULL,
    "validator_user_id" TEXT,
    "title" VARCHAR(200) NOT NULL,
    "content" TEXT NOT NULL,
    "type" "RecommendationLetterType" NOT NULL,
    "document_url" TEXT,
    "validation_status" "ValidationStatus" NOT NULL DEFAULT 'PENDING',
    "visibility" "Visibility" NOT NULL DEFAULT 'PRIVATE',
    "downloadable" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validated_at" TIMESTAMP(3),
    "rejection_reason" TEXT,

    CONSTRAINT "recommendation_letters_pkey" PRIMARY KEY ("id_recommendation_letter")
);

-- CreateTable
CREATE TABLE "portfolios" (
    "id_portfolio" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "public_slug" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "visibility" "Visibility" NOT NULL DEFAULT 'PRIVATE',
    "status" "PortfolioStatus" NOT NULL DEFAULT 'DRAFT',
    "target_domain" VARCHAR(120),
    "theme" VARCHAR(80) NOT NULL DEFAULT 'modern-academic',
    "included_sections" JSONB NOT NULL DEFAULT '[]',
    "included_items" JSONB NOT NULL DEFAULT '{}',
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portfolios_pkey" PRIMARY KEY ("id_portfolio")
);

-- CreateTable
CREATE TABLE "comments" (
    "id_comment" TEXT NOT NULL,
    "portfolio_id" TEXT NOT NULL,
    "author_user_id" TEXT NOT NULL,
    "validator_user_id" TEXT,
    "target_type" VARCHAR(100),
    "target_id" TEXT,
    "content" TEXT NOT NULL,
    "status" "ValidationStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validated_at" TIMESTAMP(3),
    "rejection_reason" TEXT,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id_comment")
);

-- CreateTable
CREATE TABLE "recommendations" (
    "id_recommendation" TEXT NOT NULL,
    "portfolio_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "author_user_id" TEXT NOT NULL,
    "validator_user_id" TEXT,
    "title" VARCHAR(200) NOT NULL,
    "content" TEXT NOT NULL,
    "organization" VARCHAR(150),
    "author_job_title" VARCHAR(120),
    "recommendation_type" VARCHAR(100),
    "status" "ValidationStatus" NOT NULL DEFAULT 'PENDING',
    "visibility" "Visibility" NOT NULL DEFAULT 'PRIVATE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validated_at" TIMESTAMP(3),
    "rejection_reason" TEXT,

    CONSTRAINT "recommendations_pkey" PRIMARY KEY ("id_recommendation")
);

-- CreateTable
CREATE TABLE "academic_timeline" (
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

-- CreateTable
CREATE TABLE "reports" (
    "id_report" TEXT NOT NULL,
    "reporter_user_id" TEXT,
    "reviewed_by_administrator_id" TEXT,
    "target_type" "ReportTargetType" NOT NULL,
    "target_id" TEXT,
    "reason" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMP(3),
    "resolution_note" TEXT,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id_report")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id_notification" TEXT NOT NULL,
    "administrator_id" TEXT,
    "type" "NotificationType" NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "message" TEXT NOT NULL,
    "related_type" VARCHAR(100),
    "related_id" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id_notification")
);

-- CreateTable
CREATE TABLE "badges" (
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

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_account_status_idx" ON "users"("role", "account_status");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "users"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_token_sessions_token_hash_key" ON "refresh_token_sessions"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_token_sessions_user_id_idx" ON "refresh_token_sessions"("user_id");

-- CreateIndex
CREATE INDEX "refresh_token_sessions_token_hash_idx" ON "refresh_token_sessions"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_token_sessions_expires_at_idx" ON "refresh_token_sessions"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "students_user_id_key" ON "students"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "students_apogee_code_key" ON "students"("apogee_code");

-- CreateIndex
CREATE UNIQUE INDEX "students_cne_key" ON "students"("cne");

-- CreateIndex
CREATE UNIQUE INDEX "professors_user_id_key" ON "professors"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "professors_employee_id_key" ON "professors"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "administrators_user_id_key" ON "administrators"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "administrators_employee_id_key" ON "administrators"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "professionals_user_id_key" ON "professionals"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "professionals_email_verify_token_key" ON "professionals"("email_verify_token");

-- CreateIndex
CREATE INDEX "professionals_is_email_verified_idx" ON "professionals"("is_email_verified");

-- CreateIndex
CREATE INDEX "professionals_is_verified_idx" ON "professionals"("is_verified");

-- CreateIndex
CREATE INDEX "professionals_approved_by_administrator_id_idx" ON "professionals"("approved_by_administrator_id");

-- CreateIndex
CREATE INDEX "professionals_rejected_by_administrator_id_idx" ON "professionals"("rejected_by_administrator_id");

-- CreateIndex
CREATE INDEX "professionals_suspended_by_administrator_id_idx" ON "professionals"("suspended_by_administrator_id");

-- CreateIndex
CREATE INDEX "academic_paths_student_id_idx" ON "academic_paths"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "skill_domains_name_key" ON "skill_domains"("name");

-- CreateIndex
CREATE UNIQUE INDEX "skill_domains_slug_key" ON "skill_domains"("slug");

-- CreateIndex
CREATE INDEX "skill_domains_display_order_idx" ON "skill_domains"("display_order");

-- CreateIndex
CREATE UNIQUE INDEX "skills_name_key" ON "skills"("name");

-- CreateIndex
CREATE INDEX "skills_domain_id_idx" ON "skills"("domain_id");

-- CreateIndex
CREATE INDEX "student_skills_student_id_idx" ON "student_skills"("student_id");

-- CreateIndex
CREATE INDEX "student_skills_skill_id_idx" ON "student_skills"("skill_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_skills_student_id_skill_id_key" ON "student_skills"("student_id", "skill_id");

-- CreateIndex
CREATE UNIQUE INDEX "technologies_name_version_key" ON "technologies"("name", "version");

-- CreateIndex
CREATE INDEX "projects_student_id_idx" ON "projects"("student_id");

-- CreateIndex
CREATE INDEX "projects_validation_status_idx" ON "projects"("validation_status");

-- CreateIndex
CREATE INDEX "projects_student_id_validation_status_idx" ON "projects"("student_id", "validation_status");

-- CreateIndex
CREATE INDEX "projects_validator_professor_id_idx" ON "projects"("validator_professor_id");

-- CreateIndex
CREATE INDEX "project_media_project_id_idx" ON "project_media"("project_id");

-- CreateIndex
CREATE INDEX "project_technologies_project_id_idx" ON "project_technologies"("project_id");

-- CreateIndex
CREATE INDEX "project_technologies_technology_id_idx" ON "project_technologies"("technology_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_technologies_project_id_technology_id_key" ON "project_technologies"("project_id", "technology_id");

-- CreateIndex
CREATE INDEX "project_validations_project_id_idx" ON "project_validations"("project_id");

-- CreateIndex
CREATE INDEX "project_validations_professor_id_idx" ON "project_validations"("professor_id");

-- CreateIndex
CREATE INDEX "internships_student_id_idx" ON "internships"("student_id");

-- CreateIndex
CREATE INDEX "internships_supervisor_professor_id_idx" ON "internships"("supervisor_professor_id");

-- CreateIndex
CREATE INDEX "internships_validation_status_idx" ON "internships"("validation_status");

-- CreateIndex
CREATE INDEX "internships_student_id_validation_status_idx" ON "internships"("student_id", "validation_status");

-- CreateIndex
CREATE INDEX "internship_media_internship_id_idx" ON "internship_media"("internship_id");

-- CreateIndex
CREATE INDEX "internship_technologies_internship_id_idx" ON "internship_technologies"("internship_id");

-- CreateIndex
CREATE INDEX "internship_technologies_technology_id_idx" ON "internship_technologies"("technology_id");

-- CreateIndex
CREATE UNIQUE INDEX "internship_technologies_internship_id_technology_id_key" ON "internship_technologies"("internship_id", "technology_id");

-- CreateIndex
CREATE INDEX "internship_validations_internship_id_idx" ON "internship_validations"("internship_id");

-- CreateIndex
CREATE INDEX "internship_validations_professor_id_idx" ON "internship_validations"("professor_id");

-- CreateIndex
CREATE INDEX "extracurricular_activities_student_id_idx" ON "extracurricular_activities"("student_id");

-- CreateIndex
CREATE INDEX "extracurricular_activities_validation_status_idx" ON "extracurricular_activities"("validation_status");

-- CreateIndex
CREATE INDEX "certificates_activity_id_idx" ON "certificates"("activity_id");

-- CreateIndex
CREATE INDEX "certificates_validation_status_idx" ON "certificates"("validation_status");

-- CreateIndex
CREATE INDEX "certificate_validations_certificate_id_idx" ON "certificate_validations"("certificate_id");

-- CreateIndex
CREATE INDEX "certificate_validations_administrator_id_idx" ON "certificate_validations"("administrator_id");

-- CreateIndex
CREATE INDEX "recommendation_letters_student_id_idx" ON "recommendation_letters"("student_id");

-- CreateIndex
CREATE INDEX "recommendation_letters_author_user_id_idx" ON "recommendation_letters"("author_user_id");

-- CreateIndex
CREATE INDEX "recommendation_letters_validator_user_id_idx" ON "recommendation_letters"("validator_user_id");

-- CreateIndex
CREATE INDEX "recommendation_letters_validation_status_idx" ON "recommendation_letters"("validation_status");

-- CreateIndex
CREATE UNIQUE INDEX "portfolios_student_id_key" ON "portfolios"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "portfolios_public_slug_key" ON "portfolios"("public_slug");

-- CreateIndex
CREATE INDEX "comments_portfolio_id_idx" ON "comments"("portfolio_id");

-- CreateIndex
CREATE INDEX "comments_author_user_id_idx" ON "comments"("author_user_id");

-- CreateIndex
CREATE INDEX "comments_validator_user_id_idx" ON "comments"("validator_user_id");

-- CreateIndex
CREATE INDEX "comments_status_idx" ON "comments"("status");

-- CreateIndex
CREATE INDEX "comments_target_type_target_id_idx" ON "comments"("target_type", "target_id");

-- CreateIndex
CREATE INDEX "recommendations_portfolio_id_idx" ON "recommendations"("portfolio_id");

-- CreateIndex
CREATE INDEX "recommendations_student_id_idx" ON "recommendations"("student_id");

-- CreateIndex
CREATE INDEX "recommendations_author_user_id_idx" ON "recommendations"("author_user_id");

-- CreateIndex
CREATE INDEX "recommendations_validator_user_id_idx" ON "recommendations"("validator_user_id");

-- CreateIndex
CREATE INDEX "recommendations_status_idx" ON "recommendations"("status");

-- CreateIndex
CREATE INDEX "reports_status_idx" ON "reports"("status");

-- CreateIndex
CREATE INDEX "reports_target_type_target_id_idx" ON "reports"("target_type", "target_id");

-- CreateIndex
CREATE INDEX "reports_reporter_user_id_idx" ON "reports"("reporter_user_id");

-- CreateIndex
CREATE INDEX "reports_reviewed_by_administrator_id_idx" ON "reports"("reviewed_by_administrator_id");

-- CreateIndex
CREATE INDEX "reports_created_at_idx" ON "reports"("created_at");

-- CreateIndex
CREATE INDEX "notifications_administrator_id_idx" ON "notifications"("administrator_id");

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "notifications"("type");

-- CreateIndex
CREATE INDEX "notifications_is_read_created_at_idx" ON "notifications"("is_read", "created_at");

-- CreateIndex
CREATE INDEX "notifications_related_type_related_id_idx" ON "notifications"("related_type", "related_id");

-- CreateIndex
CREATE UNIQUE INDEX "badges_name_key" ON "badges"("name");

-- CreateIndex
CREATE INDEX "badges_created_at_idx" ON "badges"("created_at");

-- AddForeignKey
ALTER TABLE "refresh_token_sessions" ADD CONSTRAINT "refresh_token_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professors" ADD CONSTRAINT "professors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "administrators" ADD CONSTRAINT "administrators_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professionals" ADD CONSTRAINT "professionals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professionals" ADD CONSTRAINT "professionals_approved_by_administrator_id_fkey" FOREIGN KEY ("approved_by_administrator_id") REFERENCES "administrators"("id_administrator") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professionals" ADD CONSTRAINT "professionals_rejected_by_administrator_id_fkey" FOREIGN KEY ("rejected_by_administrator_id") REFERENCES "administrators"("id_administrator") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professionals" ADD CONSTRAINT "professionals_suspended_by_administrator_id_fkey" FOREIGN KEY ("suspended_by_administrator_id") REFERENCES "administrators"("id_administrator") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_paths" ADD CONSTRAINT "academic_paths_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id_student") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "skill_domains"("id_skill_domain") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_skills" ADD CONSTRAINT "student_skills_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id_student") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_skills" ADD CONSTRAINT "student_skills_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id_skill") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id_student") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_validator_professor_id_fkey" FOREIGN KEY ("validator_professor_id") REFERENCES "professors"("id_professor") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_media" ADD CONSTRAINT "project_media_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id_project") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_technologies" ADD CONSTRAINT "project_technologies_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id_project") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_technologies" ADD CONSTRAINT "project_technologies_technology_id_fkey" FOREIGN KEY ("technology_id") REFERENCES "technologies"("id_technology") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_validations" ADD CONSTRAINT "project_validations_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id_project") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_validations" ADD CONSTRAINT "project_validations_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "professors"("id_professor") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internships" ADD CONSTRAINT "internships_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id_student") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internships" ADD CONSTRAINT "internships_supervisor_professor_id_fkey" FOREIGN KEY ("supervisor_professor_id") REFERENCES "professors"("id_professor") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internship_media" ADD CONSTRAINT "internship_media_internship_id_fkey" FOREIGN KEY ("internship_id") REFERENCES "internships"("id_internship") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internship_technologies" ADD CONSTRAINT "internship_technologies_internship_id_fkey" FOREIGN KEY ("internship_id") REFERENCES "internships"("id_internship") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internship_technologies" ADD CONSTRAINT "internship_technologies_technology_id_fkey" FOREIGN KEY ("technology_id") REFERENCES "technologies"("id_technology") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internship_validations" ADD CONSTRAINT "internship_validations_internship_id_fkey" FOREIGN KEY ("internship_id") REFERENCES "internships"("id_internship") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internship_validations" ADD CONSTRAINT "internship_validations_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "professors"("id_professor") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extracurricular_activities" ADD CONSTRAINT "extracurricular_activities_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id_student") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "extracurricular_activities"("id_activity") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificate_validations" ADD CONSTRAINT "certificate_validations_certificate_id_fkey" FOREIGN KEY ("certificate_id") REFERENCES "certificates"("id_certificate") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificate_validations" ADD CONSTRAINT "certificate_validations_administrator_id_fkey" FOREIGN KEY ("administrator_id") REFERENCES "administrators"("id_administrator") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendation_letters" ADD CONSTRAINT "recommendation_letters_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id_student") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendation_letters" ADD CONSTRAINT "recommendation_letters_author_user_id_fkey" FOREIGN KEY ("author_user_id") REFERENCES "users"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendation_letters" ADD CONSTRAINT "recommendation_letters_validator_user_id_fkey" FOREIGN KEY ("validator_user_id") REFERENCES "users"("id_user") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolios" ADD CONSTRAINT "portfolios_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id_student") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "portfolios"("id_portfolio") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_user_id_fkey" FOREIGN KEY ("author_user_id") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_validator_user_id_fkey" FOREIGN KEY ("validator_user_id") REFERENCES "users"("id_user") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "portfolios"("id_portfolio") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id_student") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_author_user_id_fkey" FOREIGN KEY ("author_user_id") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_validator_user_id_fkey" FOREIGN KEY ("validator_user_id") REFERENCES "users"("id_user") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_timeline" ADD CONSTRAINT "academic_timeline_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id_student") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_user_id_fkey" FOREIGN KEY ("reporter_user_id") REFERENCES "users"("id_user") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reviewed_by_administrator_id_fkey" FOREIGN KEY ("reviewed_by_administrator_id") REFERENCES "administrators"("id_administrator") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_administrator_id_fkey" FOREIGN KEY ("administrator_id") REFERENCES "administrators"("id_administrator") ON DELETE SET NULL ON UPDATE CASCADE;
