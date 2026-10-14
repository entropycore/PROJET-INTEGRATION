-- CreateTable
CREATE TABLE "uploaded_files" (
  "id_uploaded_file" TEXT NOT NULL,
  "owner_user_id" TEXT,
  "storage_provider" VARCHAR(50) NOT NULL DEFAULT 's3',
  "bucket" VARCHAR(120) NOT NULL,
  "object_key" TEXT NOT NULL,
  "original_name" VARCHAR(255) NOT NULL,
  "mime_type" VARCHAR(150) NOT NULL,
  "size_bytes" INTEGER NOT NULL,
  "checksum_sha256" VARCHAR(64),
  "access" VARCHAR(30) NOT NULL DEFAULT 'PRIVATE',
  "entity_type" VARCHAR(80),
  "entity_id" TEXT,
  "purpose" VARCHAR(80),
  "public_url" TEXT,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" TIMESTAMP(3),

  CONSTRAINT "uploaded_files_pkey" PRIMARY KEY ("id_uploaded_file")
);

-- CreateIndex
CREATE UNIQUE INDEX "uploaded_files_object_key_key" ON "uploaded_files"("object_key");

-- CreateIndex
CREATE INDEX "uploaded_files_owner_user_id_idx" ON "uploaded_files"("owner_user_id");

-- CreateIndex
CREATE INDEX "uploaded_files_entity_type_entity_id_idx" ON "uploaded_files"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "uploaded_files_purpose_idx" ON "uploaded_files"("purpose");

-- CreateIndex
CREATE INDEX "uploaded_files_deleted_at_idx" ON "uploaded_files"("deleted_at");

-- AddForeignKey
ALTER TABLE "uploaded_files"
ADD CONSTRAINT "uploaded_files_owner_user_id_fkey"
FOREIGN KEY ("owner_user_id") REFERENCES "users"("id_user")
ON DELETE SET NULL ON UPDATE CASCADE;
