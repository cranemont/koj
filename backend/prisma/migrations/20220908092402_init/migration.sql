-- CreateTable
CREATE TABLE "problem" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "input_description" TEXT NOT NULL,
    "output_description" TEXT NOT NULL,
    "hint" TEXT NOT NULL,
    "languages" JSONB NOT NULL,
    "time_limit" INTEGER NOT NULL,
    "memory_limit" INTEGER NOT NULL,
    "difficulty" TEXT NOT NULL,
    "source" JSONB NOT NULL,
    "shared" BOOLEAN NOT NULL DEFAULT false,
    "submission_num" INTEGER NOT NULL DEFAULT 0,
    "accepted_num" INTEGER NOT NULL DEFAULT 0,
    "score" INTEGER NOT NULL DEFAULT 0,
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "problem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "problem_testcase" (
    "id" SERIAL NOT NULL,
    "problem_id" INTEGER NOT NULL,
    "input" TEXT NOT NULL,
    "output" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "problem_testcase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submission" (
    "id" SERIAL NOT NULL,
    "problem_id" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "shared" BOOLEAN NOT NULL DEFAULT false,
    "ip_addr" TEXT NOT NULL,
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submssion_result" (
    "id" SERIAL NOT NULL,
    "submission_id" INTEGER NOT NULL,
    "result" TEXT NOT NULL,
    "accepted_num" INTEGER NOT NULL,
    "total_score" INTEGER NOT NULL,
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "submssion_result_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "problem_testcase" ADD CONSTRAINT "problem_testcase_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission" ADD CONSTRAINT "submission_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submssion_result" ADD CONSTRAINT "submssion_result_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "submission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
