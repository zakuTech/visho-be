/*
  Warnings:

  - You are about to drop the column `profile_picture` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "profile_picture",
ADD COLUMN     "Photo_profile_path" VARCHAR(225),
ADD COLUMN     "cover_profile" VARCHAR(225),
ADD COLUMN     "cover_profile_path" VARCHAR(225),
ADD COLUMN     "photo_profile" VARCHAR(225);
