import * as BetResult from "./BetResult"

export { BetResult }

export type BetResultKind =
  | BetResult.Unset
  | BetResult.Retry
  | BetResult.LoseAll
  | BetResult.Duplicate
  | BetResult.Triplicate
export type BetResultJSON =
  | BetResult.UnsetJSON
  | BetResult.RetryJSON
  | BetResult.LoseAllJSON
  | BetResult.DuplicateJSON
  | BetResult.TriplicateJSON
