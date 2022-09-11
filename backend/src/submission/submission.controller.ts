import { Body, Controller, InternalServerErrorException, Post } from '@nestjs/common'
import { CreateSubmissionDto } from './dto/create-submission.dto'
import { SubmissionService } from './submission.service'

@Controller('submission')
export class SubmissionController {
    constructor(private readonly submissionService: SubmissionService) {}

    @Post('problem/:problem_id/submission')
    async createSubmission(
      @Body() createSubmissionDto: CreateSubmissionDto
    ) {
      try {
        await this.submissionService.createSubmission(
          1,
          "user-ip",
          createSubmissionDto
        )
      } catch (error) {
        throw new InternalServerErrorException()
      }
    }
}
