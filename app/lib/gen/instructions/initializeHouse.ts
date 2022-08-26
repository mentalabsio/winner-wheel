import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface InitializeHouseArgs {
  id: number
  funds: BN
  feeBasisPoints: number
}

export interface InitializeHouseAccounts {
  house: PublicKey
  vaultOne: PublicKey
  vaultTwo: PublicKey
  authority: PublicKey
  systemProgram: PublicKey
}

export const layout = borsh.struct([
  borsh.u16("id"),
  borsh.u64("funds"),
  borsh.u16("feeBasisPoints"),
])

export function initializeHouse(
  args: InitializeHouseArgs,
  accounts: InitializeHouseAccounts
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.house, isSigner: false, isWritable: true },
    { pubkey: accounts.vaultOne, isSigner: false, isWritable: true },
    { pubkey: accounts.vaultTwo, isSigner: false, isWritable: true },
    { pubkey: accounts.authority, isSigner: true, isWritable: true },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([180, 46, 86, 125, 135, 107, 214, 28])
  const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
      id: args.id,
      funds: args.funds,
      feeBasisPoints: args.feeBasisPoints,
    },
    buffer
  )
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len)
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data })
  return ix
}
