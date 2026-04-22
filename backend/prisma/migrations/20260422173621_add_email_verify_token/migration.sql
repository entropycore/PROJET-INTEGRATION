/*
  Warnings:

  - A unique constraint covering the columns `[email_verify_token]` on the table `professionals` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "professionals" ADD COLUMN     "email_verify_expires" TIMESTAMP(3),
ADD COLUMN     "email_verify_token" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "professionals_email_verify_token_key" ON "professionals"("email_verify_token");
