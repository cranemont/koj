import { ResultCode } from '@prisma/client'

export class UpdateSubmissionResultData {
  // required
  resultCode: ResultCode

  // compile error of server error
  errorMessage?: string

  // else
  acceptedNum?: number
  totalTestcase?: number
  judgeResult?: string

  constructor(resultCode: ResultCode) {
    this.resultCode = resultCode
  }
}
