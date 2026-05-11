-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM (
  'ACCESS_REQUEST',
  'CERTIFICATE_VALIDATION',
  'RECOMMENDATION_LETTER_VALIDATION',
  'COMMENT_VALIDATION',
  'RECOMMENDATION_VALIDATION',
  'REPORT',
  'SYSTEM'
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

-- CreateIndex
CREATE INDEX "notifications_administrator_id_idx" ON "notifications"("administrator_id");

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "notifications"("type");

-- CreateIndex
CREATE INDEX "notifications_is_read_created_at_idx" ON "notifications"("is_read", "created_at");

-- CreateIndex
CREATE INDEX "notifications_related_type_related_id_idx" ON "notifications"("related_type", "related_id");

-- AddForeignKey
ALTER TABLE "notifications"
ADD CONSTRAINT "notifications_administrator_id_fkey"
FOREIGN KEY ("administrator_id") REFERENCES "administrators"("id_administrator")
ON DELETE SET NULL ON UPDATE CASCADE;
