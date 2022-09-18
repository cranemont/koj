/*
  Warnings:

  - The primary key for the `testcase` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "testcase" DROP CONSTRAINT "testcase_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "testcase_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "testcase_id_seq";
