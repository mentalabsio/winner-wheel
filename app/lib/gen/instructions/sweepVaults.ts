import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface SweepVaultsAccounts {
  house: PublicKey
  vaultOne: PublicKey
  vaultTwo: PublicKey
  receiver: PublicKey
  authority: PublicKey
}

export function sweepVaults(accounts: SweepVaultsAccounts) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.house, isSigner: false, isWritable: false },
    { pubkey: accounts.vaultOne, isSigner: false, isWritable: true },
    { pubkey: accounts.vaultTwo, isSigner: false, isWritable: true },
    { pubkey: accounts.receiver, isSigner: false, isWritable: true },
    { pubkey: accounts.authority, isSigner: true, isWritable: false },
  ]
  const identifier = Buffer.from([179, 223, 60, 155, 238, 212, 69, 57])
  const data = identifier
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data })
  return ix
}
