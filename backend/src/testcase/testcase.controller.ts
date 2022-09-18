import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post
} from '@nestjs/common'
import { CreateTestcaseDto } from './dto/create-testcase.dto'
import { CreateTestcasesDto } from './dto/create-testcases.dto'
import { TestcaseService } from './testcase.service'
@Controller()
export class TestcaseController {
  constructor(private readonly testcaseService: TestcaseService) {}

  @Get('testcase/:id')
  async getTestcase(@Param('id') id: string) {
    return this.testcaseService.getTestcase({ id })
  }

  @Get('testcase/problem/:id')
  async getTestcasesByProblemId(@Param('id', ParseIntPipe) id: number) {
    return this.testcaseService.getTestcases({ where: { problemId: id } })
  }

  @Post('testcase')
  async createTestcase(@Body() createstcaseDto: CreateTestcaseDto) {
    return this.testcaseService.createTestcase(createstcaseDto)
  }

  @Post('testcases')
  async createTestCases(@Body() createTestcasesDto: CreateTestcasesDto) {
    return this.testcaseService.createTestcases(createTestcasesDto)
  }
}
