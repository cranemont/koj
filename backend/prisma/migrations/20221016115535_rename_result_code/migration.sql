/*
  Warnings:

  - You are about to drop the column `judge_result_code` on the `submssion_result` table. All the data in the column will be lost.
  - Added the required column `result_code` to the `submssion_result` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ResultCode" AS ENUM ('JUDGING', 'ACCEPTED', 'WRONG_ANSWER', 'CPU_TIME_LIMIT_EXCEEDED', 'REAL_TIME_LIMIT_EXCEEDED', 'MEMORY_LIMIT_EXCEEDED', 'RUNTIME_ERROR', 'COMPILE_ERROR', 'SERVER_ERROR');

-- AlterTable
ALTER TABLE "submssion_result" DROP COLUMN "judge_result_code",
ADD COLUMN     "result_code" "ResultCode" NOT NULL;

-- DropEnum
DROP TYPE "JudgeResultCode";
