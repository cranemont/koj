import {
  Body,
  Controller,
  InternalServerErrorException,
  Post,
  Req
} from '@nestjs/common'
import { CreateSubmissionDto } from './dto/create-submission.dto'
import { SubmissionService } from './submission.service'
import e, { Request } from 'express'

@Controller('submission')
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Post()
  async createSubmission(
    @Req() req: Request,
    @Body() createSubmissionDto: CreateSubmissionDto
  ) {
    try {
      await this.submissionService.createSubmission(
        req.ip.slice(7),
        createSubmissionDto
      )
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException()
    }
  }
}
