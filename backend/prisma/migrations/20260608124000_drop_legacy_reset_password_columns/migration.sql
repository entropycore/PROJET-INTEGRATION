ALTER TABLE "users"
  DROP COLUMN IF EXISTS "reset_password_expires",
  DROP COLUMN IF EXISTS "reset_password_token";
