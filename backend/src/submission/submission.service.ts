import {
  AmqpConnection,
  Nack,
  RabbitSubscribe
} from '@golevelup/nestjs-rabbitmq'
import { Injectable } from '@nestjs/common'
import { Submission } from '@prisma/client'
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

    this.amqpConnection.publish(EXCHANGE, SUBMISSION_KEY, submission, {
      persistent: true
    })

    return submission
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
