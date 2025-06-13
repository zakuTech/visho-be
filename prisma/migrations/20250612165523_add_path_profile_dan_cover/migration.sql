/*
  Warnings:

  - You are about to drop the column `Photo_profile_path` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "Photo_profile_path",
ADD COLUMN     "photo_profile_path" VARCHAR(225);
