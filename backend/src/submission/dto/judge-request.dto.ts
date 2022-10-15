import { Language } from '@prisma/client'
export class JudgeRequestDto {
  submissionId: number
  code: string
  language: Language
  problemId: number
  timeLimit: number
  memoryLimit: number
  judgeMode: string

  constructor(id, code, language, problemId, timeLimit, memoryLimit) {
    this.submissionId = id
    this.code = code
    this.language = language
    this.problemId = problemId
    this.timeLimit = timeLimit
    this.memoryLimit = memoryLimit
  }
}
