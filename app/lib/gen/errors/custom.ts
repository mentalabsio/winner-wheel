export type CustomError = ArithmeticError | ResultIsAlreadySet

export class ArithmeticError extends Error {
  static readonly code = 6000
  readonly code = 6000
  readonly name = "ArithmeticError"
  readonly msg = "An arithmetic error occurred."

  constructor(readonly logs?: string[]) {
    super("6000: An arithmetic error occurred.")
  }
}

export class ResultIsAlreadySet extends Error {
  static readonly code = 6001
  readonly code = 6001
  readonly name = "ResultIsAlreadySet"
  readonly msg = "Cannot change a result twice."

  constructor(readonly logs?: string[]) {
    super("6001: Cannot change a result twice.")
  }
}

export function fromCode(code: number, logs?: string[]): CustomError | null {
  switch (code) {
    case 6000:
      return new ArithmeticError(logs)
    case 6001:
      return new ResultIsAlreadySet(logs)
  }

  return null
}
