import { AmqpConnection, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq'
import { Injectable } from '@nestjs/common'
import { Submission } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateSubmissionDto } from './dto/create-submission.dto'

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

    this.amqpConnection.publish(
      'submission-exchange',
      'submission',
      submission,
      { persistent: true }
    )

    return submission
  }

  @RabbitSubscribe({
    exchange: 'result-exchange',
    routingKey: 'result',
    queue: 'result-queue',
    queueOptions: {
      channel: 'result-consume-channel'
    }
  })
  public async submissionResultHandler(message) {
    console.log(`Received message: ${JSON.stringify(message)}`)
    // 이 handler(method) 종료되면 ack 보냄
    // 예외 상황 발생할 경우 requeue할 수 있음
    // requeue: return new Nack(true)
    // no requeue: return new Nack()

    //TODO: submission result 업데이트 하는 코드
    //TODO: server push하는 코드(user id에게)
  }
}
