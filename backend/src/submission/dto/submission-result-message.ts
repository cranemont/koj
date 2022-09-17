export class SubmissionResultMessage {
  serverStatusCode: number
  data: JudgeData
}

interface JudgeData {
  submissionId: number
  compileError: string
  acceptedNum: number
  totalTestcase: number
  judgeResultCode: number
  runResult: RunResult[]
}

interface RunResult {
  testcaseId: string
  resultCode: number
  cpuTime: number
  realTime: number
  memory: number
  signal: number
  exitCode: number
  errorCode: number
}
