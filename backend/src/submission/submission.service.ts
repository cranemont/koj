import { SubmissionResultMessage } from './dto/submission-result-message'
import { JudgeRequestDto } from './dto/judge-request.dto'
import {
  AmqpConnection,
  Nack,
  RabbitSubscribe
} from '@golevelup/nestjs-rabbitmq'
import { Injectable, Res } from '@nestjs/common'
import {
  Problem,
  Submission,
  Language,
  Result,
  SubmissionResult
} from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateSubmissionDto } from './dto/create-submission.dto'
import {
  EXCHANGE,
  SUBMISSION_KEY,
  RESULT_KEY,
  RESULT_QUEUE,
  CONSUME_CHANNEL
} from './constants/rabbitmq.constants'
import { serverStatusCode } from './constants/judgeResult.constants'

@Injectable()
export class SubmissionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly amqpConnection: AmqpConnection
  ) {}

  async createSubmission(ip: string, createSubmissionDto: CreateSubmissionDto) {
    const { languages } = await this.prisma.problem.findUnique({
      where: { id: createSubmissionDto.problemId },
      select: { languages: true }
    })

    if (!languages.includes(createSubmissionDto.language)) {
      throw new Error(`${createSubmissionDto.language} is not allowed`)
    }

    const submission: Submission = await this.prisma.submission.create({
      data: {
        problem: {
          connect: { id: createSubmissionDto.problemId }
        },
        code: createSubmissionDto.code,
        language: createSubmissionDto.language,
        ipAddr: ip
      }
    })

    const problem: Partial<Problem> = await this.prisma.problem.findUnique({
      where: { id: submission.problemId },
      select: {
        timeLimit: true,
        memoryLimit: true
      }
    })

    const judgeRequest = new JudgeRequestDto(
      submission.id,
      submission.code,
      submission.language,
      submission.problemId,
      this.calculateTimeLimit(submission.language, problem.timeLimit),
      this.calculateMemoryLimit(submission.language, problem.memoryLimit)
    )

    this.amqpConnection.publish(EXCHANGE, SUBMISSION_KEY, judgeRequest, {
      persistent: true
    })

    return submission
  }

  private readonly cpuLimitTable = {
    [Language.C]: (t: number) => t,
    [Language.Cpp]: (t: number) => t,
    [Language.Golang]: (t: number) => t + 2000,
    [Language.Java]: (t: number) => t * 2 + 1000,
    [Language.Python2]: (t: number) => t * 3 + 2000,
    [Language.Python3]: (t: number) => t * 3 + 200
  }
  private calculateTimeLimit(language: Language, time: number): number {
    return this.cpuLimitTable[language](time)
  }

  private readonly memoryLimitTable = {
    [Language.C]: (m: number) => 1024 * 1024 * m,
    [Language.Cpp]: (m: number) => 1024 * 1024 * m,
    [Language.Golang]: (m: number) => 1024 * 1024 * (m * 2 + 512),
    [Language.Java]: (m: number) => 1024 * 1024 * (m * 2 + 16),
    [Language.Python2]: (m: number) => 1024 * 1024 * (m * 2 + 32),
    [Language.Python3]: (m: number) => 1024 * 1024 * (m * 2 + 32)
  }
  private calculateMemoryLimit(language: Language, memory: number): number {
    return this.memoryLimitTable[language](memory)
  }

  @RabbitSubscribe({
    exchange: EXCHANGE,
    routingKey: RESULT_KEY,
    queue: RESULT_QUEUE,
    queueOptions: {
      channel: CONSUME_CHANNEL
    }
  })
  public async submissionResultHandler(message) {
    console.log(`Received message: ${JSON.stringify(message)}`)
    let result: SubmissionResultMessage

    try {
      result = JSON.parse(message)
    } catch (error) {
      // TODO: response error to user
      // not requeue
      return new Nack()
    }

    try {
      const data: any = {
        submissionId: result.data.submissionId,
        acceptedNum: result.data.acceptedNum,
        totalTestcase: result.data.totalTestcase,
        judgeResult: message
      }

      if (result.serverStatusCode == serverStatusCode.COMPILE_ERROR) {
        data.result = Result.COMPILE_ERROR
        data.compileErrorMessage = result.data.compileError
      } else if (result.serverStatusCode === serverStatusCode.SUCCESS) {
        data.result = this.matchResultCode(result.data.judgeResultCode)
      } else {
        data.result = Result.SYSTEM_ERROR
      }

      await this.prisma.submissionResult.create({
        data
      })
    } catch (error) {
      // requeue
      return new Nack(true)
    }

    //TODO: server push하는 코드(user id에게)
  }

  private matchResultCode(code: number): Result {
    switch (code) {
      case 0:
        return Result.ACCEPTED
      case 1:
        return Result.WRONG_ANSWER
      case 2:
        return Result.CPU_TIME_LIMIT_EXCEEDED
      case 3:
        return Result.REAL_TIME_LIMIT_EXCEEDED
      case 4:
        return Result.MEMORY_LIMIT_EXCEEDED
      case 5:
        return Result.RUNTIME_ERROR
      default:
        return Result.SYSTEM_ERROR
    }
  }
}
