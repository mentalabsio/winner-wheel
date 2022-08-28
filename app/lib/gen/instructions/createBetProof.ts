import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface CreateBetProofArgs {
  betValue: BN
}

export interface CreateBetProofAccounts {
  house: PublicKey
  betProof: PublicKey
  feeVaultOne: PublicKey
  feeVaultTwo: PublicKey
  user: PublicKey
  systemProgram: PublicKey
}

export const layout = borsh.struct([borsh.u64("betValue")])

export function createBetProof(
  args: CreateBetProofArgs,
  accounts: CreateBetProofAccounts
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.house, isSigner: false, isWritable: true },
    { pubkey: accounts.betProof, isSigner: false, isWritable: true },
    { pubkey: accounts.feeVaultOne, isSigner: false, isWritable: true },
    { pubkey: accounts.feeVaultTwo, isSigner: false, isWritable: true },
    { pubkey: accounts.user, isSigner: true, isWritable: true },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([184, 57, 191, 101, 166, 193, 68, 144])
  const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
      betValue: args.betValue,
    },
    buffer
  )
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len)
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data })
  return ix
}
