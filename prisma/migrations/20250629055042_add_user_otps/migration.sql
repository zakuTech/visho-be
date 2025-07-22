/*
  Warnings:

  - Made the column `verified` on table `user_otp` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "user_otp" ALTER COLUMN "expires_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "verified" SET NOT NULL;
