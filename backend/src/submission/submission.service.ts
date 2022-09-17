import { JudgeRequestDto } from './dto/judge-request.dto'
import {
  AmqpConnection,
  Nack,
  RabbitSubscribe
} from '@golevelup/nestjs-rabbitmq'
import { Injectable } from '@nestjs/common'
import { Problem, Submission, Language } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateSubmissionDto } from './dto/create-submission.dto'
import {
  EXCHANGE,
  SUBMISSION_KEY,
  RESULT_KEY,
  RESULT_QUEUE,
  CONSUME_CHANNEL
} from './rabbitmq.constants'

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
      this.getTimeLimitForLanguage(submission.language, problem.timeLimit),
      this.getMemoryLimitForLanguage(submission.language, problem.memoryLimit)
    )

    this.amqpConnection.publish(EXCHANGE, SUBMISSION_KEY, judgeRequest, {
      persistent: true
    })

    return submission
  }

  getTimeLimitForLanguage(language: Language, time: number): number {
    const table = {
      [Language.C]: (t: number) => t,
      [Language.Cpp]: (t: number) => t,
      [Language.Golang]: (t: number) => t + 2000,
      [Language.Java]: (t: number) => t * 2 + 1000,
      [Language.Python2]: (t: number) => t * 3 + 2000,
      [Language.Python3]: (t: number) => t * 3 + 200
    }

    return table[language](time)
  }

  getMemoryLimitForLanguage(language: Language, memory: number): number {
    const table = {
      [Language.C]: (m: number) => 1024 * 1024 * m,
      [Language.Cpp]: (m: number) => 1024 * 1024 * m,
      [Language.Golang]: (m: number) => 1024 * 1024 * (m * 2 + 512),
      [Language.Java]: (m: number) => 1024 * 1024 * (m * 2 + 16),
      [Language.Python2]: (m: number) => 1024 * 1024 * (m * 2 + 32),
      [Language.Python3]: (m: number) => 1024 * 1024 * (m * 2 + 32)
    }

    return table[language](memory)
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

    try {
      await this.prisma.submissionResult.create({
        data: {
          submissionId: 1,
          result: 'result',
          acceptedNum: 1,
          totalScore: 1
        }
      })
    } catch (error) {
      // requeue
      return new Nack(true)
    }

    //TODO: server push하는 코드(user id에게)
  }
}
