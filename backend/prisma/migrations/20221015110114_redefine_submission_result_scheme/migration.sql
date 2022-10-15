/*
  Warnings:

  - You are about to drop the column `compile_error_message` on the `submssion_result` table. All the data in the column will be lost.
  - You are about to drop the column `result` on the `submssion_result` table. All the data in the column will be lost.
  - Added the required column `judge_result_code` to the `submssion_result` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "JudgeResultCode" AS ENUM ('JUDGING', 'ACCEPTED', 'WRONG_ANSWER', 'CPU_TIME_LIMIT_EXCEEDED', 'REAL_TIME_LIMIT_EXCEEDED', 'MEMORY_LIMIT_EXCEEDED', 'RUNTIME_ERROR', 'COMPILE_ERROR', 'SERVER_ERROR');

-- AlterTable
ALTER TABLE "submssion_result" DROP COLUMN "compile_error_message",
DROP COLUMN "result",
ADD COLUMN     "error_message" TEXT,
ADD COLUMN     "judge_result_code" "JudgeResultCode" NOT NULL,
ALTER COLUMN "accepted_num" DROP NOT NULL,
ALTER COLUMN "total_testcase" DROP NOT NULL;

-- DropEnum
DROP TYPE "Result";
