-- CreateTable
CREATE TABLE "skill_domains" (
    "id_skill_domain" TEXT NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "description" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "skill_domains_pkey" PRIMARY KEY ("id_skill_domain")
);

-- AlterTable
ALTER TABLE "skills" ADD COLUMN "domain_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "skill_domains_name_key" ON "skill_domains"("name");

-- CreateIndex
CREATE UNIQUE INDEX "skill_domains_slug_key" ON "skill_domains"("slug");

-- CreateIndex
CREATE INDEX "skill_domains_display_order_idx" ON "skill_domains"("display_order");

-- CreateIndex
CREATE INDEX "skills_domain_id_idx" ON "skills"("domain_id");

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "skill_domains"("id_skill_domain") ON DELETE SET NULL ON UPDATE CASCADE;
