export class UpdateTestCaseDto {
  id: string
  problemId: number
  order: number
  input: string
  output: string
  score?: number
}
