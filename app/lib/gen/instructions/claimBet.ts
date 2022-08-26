import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface ClaimBetAccounts {
  house: PublicKey
  betProof: PublicKey
  treasuryAccount: PublicKey
  user: PublicKey
  systemProgram: PublicKey
}

export function claimBet(accounts: ClaimBetAccounts) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.house, isSigner: false, isWritable: false },
    { pubkey: accounts.betProof, isSigner: false, isWritable: true },
    { pubkey: accounts.treasuryAccount, isSigner: false, isWritable: true },
    { pubkey: accounts.user, isSigner: true, isWritable: true },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([60, 61, 185, 215, 180, 119, 174, 126])
  const data = identifier
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data })
  return ix
}
