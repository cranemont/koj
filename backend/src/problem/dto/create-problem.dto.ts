import { Prisma, Language } from '@prisma/client'

export class CreateProblemDto implements Prisma.ProblemCreateInput {
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
  shared?: boolean
  submissionNum?: number
  acceptedNum?: number
  score?: number
  ProblemTestcase?: Prisma.ProblemTestcaseCreateNestedManyWithoutProblemInput
  Submission?: Prisma.SubmissionCreateNestedManyWithoutProblemInput
}