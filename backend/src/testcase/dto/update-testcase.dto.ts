export class UpdateTestCaseDto {
  id: number
  problemId: number
  order: number
  input: string
  output: string
  score?: number
}
