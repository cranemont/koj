/*
  Warnings:

  - You are about to drop the column `total_score` on the `submssion_result` table. All the data in the column will be lost.
  - Added the required column `judge_result` to the `submssion_result` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_testcase` to the `submssion_result` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `result` on the `submssion_result` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Result" AS ENUM ('ACCEPTED', 'WRONG_ANSWER', 'CPU_TIME_LIMIT_EXCEEDED', 'REAL_TIME_LIMIT_EXCEEDED', 'MEMORY_LIMIT_EXCEEDED', 'RUNTIME_ERROR', 'SYSTEM_ERROR', 'COMPILE_ERROR');

-- AlterTable
ALTER TABLE "submssion_result" DROP COLUMN "total_score",
ADD COLUMN     "judge_result" JSONB NOT NULL,
ADD COLUMN     "total_testcase" INTEGER NOT NULL,
DROP COLUMN "result",
ADD COLUMN     "result" "Result" NOT NULL;
