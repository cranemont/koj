/*
  Warnings:

  - The `language` column on the `submission` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Language" AS ENUM ('C', 'Cpp', 'Python2', 'Python3', 'Golang', 'Java');

-- AlterTable
ALTER TABLE "submission" DROP COLUMN "language",
ADD COLUMN     "language" "Language"[];
