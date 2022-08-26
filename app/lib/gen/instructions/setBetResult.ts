import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface SetBetResultArgs {
  result: types.BetResultKind
}

export interface SetBetResultAccounts {
  betProof: PublicKey
  house: PublicKey
  authority: PublicKey
}

export const layout = borsh.struct([types.BetResult.layout("result")])

export function setBetResult(
  args: SetBetResultArgs,
  accounts: SetBetResultAccounts
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.betProof, isSigner: false, isWritable: true },
    { pubkey: accounts.house, isSigner: false, isWritable: false },
    { pubkey: accounts.authority, isSigner: true, isWritable: false },
  ]
  const identifier = Buffer.from([0, 153, 73, 31, 123, 253, 17, 197])
  const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
      result: args.result.toEncodable(),
    },
    buffer
  )
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len)
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data })
  return ix
}
