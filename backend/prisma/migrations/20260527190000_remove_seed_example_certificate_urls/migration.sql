DELETE FROM "certificates"
WHERE "document_url" LIKE 'https://example.com/%'
  AND "storage_path" IS NULL;
