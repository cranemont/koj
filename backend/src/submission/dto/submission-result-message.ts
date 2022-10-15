export class SubmissionResultMessage {
  judgeResultCode: number
  submissionResultId: number
  error: string
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
