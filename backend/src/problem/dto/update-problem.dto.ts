import { Language, Prisma } from '@prisma/client'

export class UpdateProblemDto {
  id: number
  title: string
  description: string
  inputDescription: string
  outputDescription: string
  hint: string
  languages: Language[]
  timeLimit: number
  memoryLimit: number
  difficulty: string
  source: Prisma.NullTypes.JsonNull | Prisma.InputJsonValue
  shared: boolean
  submissionNum: number
  acceptedNum: number
  score: number
}
