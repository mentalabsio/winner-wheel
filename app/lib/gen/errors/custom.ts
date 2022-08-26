export type CustomError = ArithmeticError | ResultIsAlreadySet | ResultNotSet

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

export class ResultNotSet extends Error {
  static readonly code = 6002
  readonly code = 6002
  readonly name = "ResultNotSet"
  readonly msg = "Bet result was not set yet."

  constructor(readonly logs?: string[]) {
    super("6002: Bet result was not set yet.")
  }
}

export function fromCode(code: number, logs?: string[]): CustomError | null {
  switch (code) {
    case 6000:
      return new ArithmeticError(logs)
    case 6001:
      return new ResultIsAlreadySet(logs)
    case 6002:
      return new ResultNotSet(logs)
  }

  return null
}
