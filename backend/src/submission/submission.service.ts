import { UpdateSubmissionResultData } from './dto/update-submission-result'
import { SubmissionResultMessage } from './dto/submission-result-message'
import { JudgeRequestDto } from './dto/judge-request.dto'
import { AmqpConnection, Nack } from '@golevelup/nestjs-rabbitmq'
import { Injectable } from '@nestjs/common'
import { Problem, Submission, Language, JudgeResultCode, SubmissionResult } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateSubmissionDto } from './dto/create-submission.dto'
import {
  EXCHANGE,
  SUBMISSION_KEY,
  RESULT_KEY,
  RESULT_QUEUE,
  CONSUME_CHANNEL
} from './constants/rabbitmq.constants'

@Injectable()
export class SubmissionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly amqpConnection: AmqpConnection
  ) {
    if (process.env?.ENABLE_SUBSCRIBER === 'true') {
      this.amqpConnection.createSubscriber(
        async (msg) => {
          try {
            await this.submissionResultHandler(msg)
          } catch (error) {
            console.log(
              'requeue submission-result message: %s with %s',
              msg,
              error
            )
            return new Nack(true)
          }
        },
        {
          exchange: EXCHANGE,
          routingKey: RESULT_KEY,
          queue: RESULT_QUEUE,
          queueOptions: {
            channel: CONSUME_CHANNEL
          }
        },
        'original Handler Name'
      )
    }
  }

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

    const result = await this.createSubmissionResult(submission.id)
    await this.publishJudgeRequestMessage(submission, result.id)

    return submission
  }

  private async createSubmissionResult(submissionId: number) {
    const submissionResult = await this.prisma.submissionResult.create({
      data: {
        submission: {
          connect: { id: submissionId }
        },
        judgeResultCode: JudgeResultCode.JUDGING
      }
    })

    return submissionResult
  }

  private async publishJudgeRequestMessage(
    submission: Submission,
    resultId: number
  ) {
    const problem: Partial<Problem> = await this.prisma.problem.findUnique({
      where: { id: submission.problemId },
      select: {
        timeLimit: true,
        memoryLimit: true
      }
    })

    const judgeRequest = new JudgeRequestDto(
      submission.code,
      submission.language,
      submission.problemId,
      this.calculateTimeLimit(submission.language, problem.timeLimit),
      this.calculateMemoryLimit(submission.language, problem.memoryLimit)
    )

    this.amqpConnection.publish(EXCHANGE, SUBMISSION_KEY, judgeRequest, {
      persistent: true,
      messageId: resultId,
      type: 'Judge'
    })
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

  public async submissionResultHandler(msg: any) {
    console.log(`Received message: ${JSON.stringify(msg)}`)
    // message validation
    const message: SubmissionResultMessage = msg
    const judgeResultCode: JudgeResultCode = this.matchJudgeResultCode(
      message.judgeResultCode
    )

    const data = new UpdateSubmissionResultData(judgeResultCode)

    switch (judgeResultCode) {
      case JudgeResultCode.SERVER_ERROR:
      case JudgeResultCode.COMPILE_ERROR:
        data.errorMessage = message.error
        break
      default:
        data.acceptedNum = message.data.acceptedNum
        data.totalTestcase = message.data.totalTestcase
        data.judgeResult = JSON.stringify(message.data.judgeResult)
    }

    await this.updateSubmissionResult(message.submissionResultId, data)

    //TODO: server push하는 코드(user id에게)
  }

  private matchJudgeResultCode(code: number): JudgeResultCode {
    switch (code) {
      case 0:
        return JudgeResultCode.ACCEPTED
      case 1:
        return JudgeResultCode.WRONG_ANSWER
      case 2:
        return JudgeResultCode.CPU_TIME_LIMIT_EXCEEDED
      case 3:
        return JudgeResultCode.REAL_TIME_LIMIT_EXCEEDED
      case 4:
        return JudgeResultCode.MEMORY_LIMIT_EXCEEDED
      case 5:
        return JudgeResultCode.RUNTIME_ERROR
      case 6:
        return JudgeResultCode.COMPILE_ERROR
      default:
        return JudgeResultCode.SERVER_ERROR
    }
  }

  private async updateSubmissionResult(
    id: number,
    data: UpdateSubmissionResultData
  ): Promise<SubmissionResult> {
    return await this.prisma.submissionResult.update({
      where: {
        id
      },
      data: {
        ...data
      }
    })
  }
}
