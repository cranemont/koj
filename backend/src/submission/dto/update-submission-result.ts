import { JudgeResultCode } from '@prisma/client'

export class UpdateSubmissionResultData {
  // required
  judgeResultCode: JudgeResultCode

  // compile error of server error
  errorMessage?: string

  // else
  acceptedNum?: number
  totalTestcase?: number
  judgeResult?: string

  constructor(judgeResultCode: JudgeResultCode) {
    this.judgeResultCode = judgeResultCode
  }
}
