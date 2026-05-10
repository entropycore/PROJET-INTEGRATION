-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReportTargetType" AS ENUM ('PORTFOLIO', 'COMMENT', 'RECOMMENDATION', 'PROJECT', 'INTERNSHIP', 'USER', 'OTHER');

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

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_user_id_fkey" FOREIGN KEY ("reporter_user_id") REFERENCES "users"("id_user") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reviewed_by_administrator_id_fkey" FOREIGN KEY ("reviewed_by_administrator_id") REFERENCES "administrators"("id_administrator") ON DELETE SET NULL ON UPDATE CASCADE;
