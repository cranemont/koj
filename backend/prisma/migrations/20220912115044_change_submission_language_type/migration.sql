/*
  Warnings:

  - Added the required column `language` to the `submission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "submission" ADD COLUMN     "language" "Language" NOT NULL;
