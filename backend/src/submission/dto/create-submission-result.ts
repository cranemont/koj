import { ResultCode } from '@prisma/client'

export class CreateSubmissionResultData {
  // required
  submissionId: number
  resultCode: ResultCode

  // compile error of server error
  errorMessage?: string

  // else
  acceptedNum?: number
  totalTestcase?: number
  judgeResult?: string

  constructor(submissionId: number, resultCode: ResultCode) {
    this.submissionId = submissionId
    this.resultCode = resultCode
  }
}
