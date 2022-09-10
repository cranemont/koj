/*
  Warnings:

  - You are about to drop the `problem_testcase` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "problem_testcase" DROP CONSTRAINT "problem_testcase_problem_id_fkey";

-- DropTable
DROP TABLE "problem_testcase";

-- CreateTable
CREATE TABLE "testcase" (
    "id" SERIAL NOT NULL,
    "problem_id" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "input" TEXT NOT NULL,
    "output" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "testcase_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "testcase" ADD CONSTRAINT "testcase_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
