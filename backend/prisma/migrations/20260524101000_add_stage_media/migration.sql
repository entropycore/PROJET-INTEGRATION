-- AlterTable
ALTER TABLE "internships" ADD COLUMN "report_file_name" VARCHAR(255);
ALTER TABLE "internships" ADD COLUMN "report_mime_type" VARCHAR(120);
ALTER TABLE "internships" ADD COLUMN "report_file_size" INTEGER;
ALTER TABLE "internships" ADD COLUMN "report_storage_path" TEXT;

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

-- CreateIndex
CREATE INDEX "internship_media_internship_id_idx" ON "internship_media"("internship_id");

-- AddForeignKey
ALTER TABLE "internship_media" ADD CONSTRAINT "internship_media_internship_id_fkey" FOREIGN KEY ("internship_id") REFERENCES "internships"("id_internship") ON DELETE CASCADE ON UPDATE CASCADE;
