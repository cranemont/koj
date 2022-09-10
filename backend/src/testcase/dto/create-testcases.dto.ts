import { Expose } from 'class-transformer'
import { CreateTestcaseDto } from './create-testcase.dto'
@Expose()
export class TestcaseData {
  input: string
  output: string
  score?: number
}

@Expose()
export class CreateTestcasesDto {
  problemId: number
  testcases: TestcaseData[]
}
