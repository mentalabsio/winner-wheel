import * as BetResult from "./BetResult"

export { BetResult }

export type BetResultKind =
  | BetResult.Retry
  | BetResult.LoseAll
  | BetResult.Duplicate
  | BetResult.Triplicate
export type BetResultJSON =
  | BetResult.RetryJSON
  | BetResult.LoseAllJSON
  | BetResult.DuplicateJSON
  | BetResult.TriplicateJSON
