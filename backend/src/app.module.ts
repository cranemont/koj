import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { PrismaModule } from './prisma/prisma.module'
import { TestcaseModule } from './testcase/testcase.module'
import { ProblemService } from './problem/problem.service'
import { ProblemController } from './problem/problem.controller'
import { ProblemModule } from './problem/problem.module'
import { SubmissionModule } from './submission/submission.module'

@Module({
  imports: [PrismaModule, TestcaseModule, ProblemModule, SubmissionModule],
  controllers: [AppController, ProblemController],
  providers: [AppService, ProblemService]
})
export class AppModule {}
