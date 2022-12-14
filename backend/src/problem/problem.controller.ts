import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put
} from '@nestjs/common'
import { CreateProblemDto } from './dto/create-problem.dto'
import { UpdateProblemDto } from './dto/update-problem.dto'
import { ProblemService } from './problem.service'

@Controller()
export class ProblemController {
  constructor(private readonly problemService: ProblemService) {}

  @Get('problem/:id')
  async getProblemById(@Param('id', ParseIntPipe) id: number) {
    return this.problemService.getProblem({ id })
  }

  @Get('problems')
  async getAllProblems() {
    return this.problemService.getProblems({})
  }

  @Post('problem')
  async createProblem(@Body() createProblemDto: CreateProblemDto) {
    return this.problemService.createProblem(createProblemDto)
  }

  @Put('problem/:id')
  async updateProblem(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProblemDto: UpdateProblemDto
  ) {
    return this.problemService.updateProblem(updateProblemDto)
  }

  @Delete('problem/:id')
  async deleteProblem(@Param('id', ParseIntPipe) id: number) {
    return this.problemService.deleteProblem({ id })
  }
}
