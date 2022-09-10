/*
  Warnings:

  - Added the required column `order` to the `problem_testcase` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "problem_testcase" ADD COLUMN     "order" INTEGER NOT NULL;
