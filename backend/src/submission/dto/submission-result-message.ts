import { IsNotEmpty } from 'class-validator'

export class SubmissionResultMessage {
  @IsNotEmpty()
  resultCode: number

  @IsNotEmpty()
  submissionResultId: string

  @IsNotEmpty()
  error: string

  @IsNotEmpty()
  data: JudgeData
}

interface JudgeData {
  acceptedNum: number
  totalTestcase: number
  judgeResult: JudgeResult[]
}

export interface JudgeResult {
  testcaseId: string
  resultCode: number
  cpuTime: number
  realTime: number
  memory: number
  signal: number
  exitCode: number
  errorCode: number
}
