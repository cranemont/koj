import { Injectable } from '@nestjs/common'
import { Prisma, Problem } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateProblemDto } from './dto/create-problem.dto'
import { UpdateProblemDto } from './dto/update-problem.dto'

@Injectable()
export class ProblemService {
  constructor(private readonly prisma: PrismaService) {}

  async getProblem(
    problemWhereUniqueInput: Prisma.ProblemWhereUniqueInput
  ): Promise<Problem | null> {
    return await this.prisma.problem.findUnique({
      where: problemWhereUniqueInput
    })
  }

  async getProblems(params: {
    skip?: number
    take?: number
    cursor?: Prisma.ProblemWhereUniqueInput
    where?: Prisma.ProblemWhereInput
    orderBy?: Prisma.ProblemOrderByWithRelationInput
  }): Promise<Problem[]> {
    const { skip, take, cursor, where, orderBy } = params
    return await this.prisma.problem.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy
    })
  }

  async createProblem(dto: CreateProblemDto) {
    return await this.prisma.problem.create({
      data: dto
    })
  }

  async updateProblem(dto: UpdateProblemDto) {
    return await this.prisma.problem.update({
      where: { id: dto.id },
      data: dto
    })
  }
}
