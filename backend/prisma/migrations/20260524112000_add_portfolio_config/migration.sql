ALTER TABLE "portfolios" ADD COLUMN "theme" VARCHAR(80) NOT NULL DEFAULT 'modern-academic';
ALTER TABLE "portfolios" ADD COLUMN "included_sections" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "portfolios" ADD COLUMN "included_items" JSONB NOT NULL DEFAULT '{}';
