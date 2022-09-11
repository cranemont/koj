import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'
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

  async createSubmission(
    userId: number,
    ip: string,
    createSubmissionDto: CreateSubmissionDto
  ) {
    const { languages } = await this.prisma.problem.findUnique({
      where: { id: createSubmissionDto.problemId },
      select: { languages: true }
    })

    if (!languages.includes(createSubmissionDto.language)) {
      throw new Error(
        `${createSubmissionDto.language} is not allowed`
      )
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
}
