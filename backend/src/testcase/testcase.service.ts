import { Injectable } from '@nestjs/common'
import { Prisma, Testcase } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateTestcaseDto } from './dto/create-testcase.dto'
import { CreateTestcasesDto, TestcaseData } from './dto/create-testcases.dto'
import { UpdateTestCaseDto } from './dto/update-testcase.dto'

@Injectable()
export class TestcaseService {
  constructor(private readonly prisma: PrismaService) {}

  async getTestcase(
    testcaseWhereUniqueInput: Prisma.TestcaseWhereUniqueInput
  ): Promise<Testcase | null> {
    return await this.prisma.testcase.findUnique({
      where: testcaseWhereUniqueInput
    })
  }

  async getTestcases(params: {
    skip?: number
    take?: number
    cursor?: Prisma.TestcaseWhereUniqueInput
    where?: Prisma.TestcaseWhereInput
    orderBy?: Prisma.TestcaseOrderByWithRelationInput
  }): Promise<Testcase[]> {
    const { skip, take, cursor, where, orderBy } = params
    return await this.prisma.testcase.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy
    })
  }

  async createTestcase(dto: CreateTestcaseDto) {
    return await this.prisma.testcase.create({
      data: dto
    })
  }

  async createTestcases(dto: CreateTestcasesDto) {
    const { problemId, testcases } = dto
    console.log(testcases)
    const data: CreateTestcaseDto[] = testcases.map((val, idx) => {
      const ret: CreateTestcaseDto = <CreateTestcaseDto>val
      ret.order = idx
      ret.problemId = problemId
      return ret
    })
    return await this.prisma.testcase.createMany({
      data: data,
      skipDuplicates: true
    })
  }

  async updateTestcase(dto: UpdateTestCaseDto) {
    // update시 reorder
    // 선택지: https://stackoverflow.com/questions/4115053/how-to-keep-ordering-of-records-in-a-database-table
    // 만약 update하는 데이터에 order가 바뀌었으면(기존 order랑 다르면)
    // 해당하는 problem의 testcase data order 다시 수정하는 로직
    // 사이즈가 크지 않기 때문에 오히려 linked list구조보다는 이게 나을듯
    // 아니면
    // 소수로 두고 앞뒤 숫자 반으로 나눠서 설정
    return await this.prisma.testcase.update({
      where: { id: dto.id },
      data: dto
    })
  }

  async deleteTestcase(
    testcaseWhereUniqueInput: Prisma.TestcaseWhereUniqueInput
  ): Promise<Testcase | null> {
    // 여기도 reorder 로직 들어가야됨
    return await this.prisma.testcase.delete({
      where: testcaseWhereUniqueInput
    })
  }
}
