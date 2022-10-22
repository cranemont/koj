export class MessageFormatError extends Error {
  constructor(error: any) {
    super(`Invalid message format: ${JSON.stringify(error)}`)
  }
}
