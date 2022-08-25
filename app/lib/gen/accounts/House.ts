import { PublicKey, Connection } from "@solana/web3.js"
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface HouseFields {
  /** Numerical unique ID (range 0-65535) */
  id: number
  /** Account where the prizes are taken from. */
  treasuryAccount: PublicKey
  /**
   * Fee price in basis points. This will be charged on every bet proof creation for every
   * account passed as fee vault.
   */
  feeBasisPoints: number
  /** Wallet allowed to withdraw and deposit from vaults. */
  authority: PublicKey
  /** Vaults (2) to where the fees go. */
  feeVaults: Array<PublicKey>
  bump: Array<number>
  reserved: Array<number>
}

export interface HouseJSON {
  /** Numerical unique ID (range 0-65535) */
  id: number
  /** Account where the prizes are taken from. */
  treasuryAccount: string
  /**
   * Fee price in basis points. This will be charged on every bet proof creation for every
   * account passed as fee vault.
   */
  feeBasisPoints: number
  /** Wallet allowed to withdraw and deposit from vaults. */
  authority: string
  /** Vaults (2) to where the fees go. */
  feeVaults: Array<string>
  bump: Array<number>
  reserved: Array<number>
}

export class House {
  /** Numerical unique ID (range 0-65535) */
  readonly id: number
  /** Account where the prizes are taken from. */
  readonly treasuryAccount: PublicKey
  /**
   * Fee price in basis points. This will be charged on every bet proof creation for every
   * account passed as fee vault.
   */
  readonly feeBasisPoints: number
  /** Wallet allowed to withdraw and deposit from vaults. */
  readonly authority: PublicKey
  /** Vaults (2) to where the fees go. */
  readonly feeVaults: Array<PublicKey>
  readonly bump: Array<number>
  readonly reserved: Array<number>

  static readonly discriminator = Buffer.from([
    21, 145, 94, 109, 254, 199, 210, 151,
  ])

  static readonly layout = borsh.struct([
    borsh.u16("id"),
    borsh.publicKey("treasuryAccount"),
    borsh.u16("feeBasisPoints"),
    borsh.publicKey("authority"),
    borsh.array(borsh.publicKey(), 2, "feeVaults"),
    borsh.array(borsh.u8(), 1, "bump"),
    borsh.array(borsh.u8(), 64, "reserved"),
  ])

  constructor(fields: HouseFields) {
    this.id = fields.id
    this.treasuryAccount = fields.treasuryAccount
    this.feeBasisPoints = fields.feeBasisPoints
    this.authority = fields.authority
    this.feeVaults = fields.feeVaults
    this.bump = fields.bump
    this.reserved = fields.reserved
  }

  static async fetch(c: Connection, address: PublicKey): Promise<House | null> {
    const info = await c.getAccountInfo(address)

    if (info === null) {
      return null
    }
    if (!info.owner.equals(PROGRAM_ID)) {
      throw new Error("account doesn't belong to this program")
    }

    return this.decode(info.data)
  }

  static async fetchMultiple(
    c: Connection,
    addresses: PublicKey[]
  ): Promise<Array<House | null>> {
    const infos = await c.getMultipleAccountsInfo(addresses)

    return infos.map((info) => {
      if (info === null) {
        return null
      }
      if (!info.owner.equals(PROGRAM_ID)) {
        throw new Error("account doesn't belong to this program")
      }

      return this.decode(info.data)
    })
  }

  static decode(data: Buffer): House {
    if (!data.slice(0, 8).equals(House.discriminator)) {
      throw new Error("invalid account discriminator")
    }

    const dec = House.layout.decode(data.slice(8))

    return new House({
      id: dec.id,
      treasuryAccount: dec.treasuryAccount,
      feeBasisPoints: dec.feeBasisPoints,
      authority: dec.authority,
      feeVaults: dec.feeVaults,
      bump: dec.bump,
      reserved: dec.reserved,
    })
  }

  toJSON(): HouseJSON {
    return {
      id: this.id,
      treasuryAccount: this.treasuryAccount.toString(),
      feeBasisPoints: this.feeBasisPoints,
      authority: this.authority.toString(),
      feeVaults: this.feeVaults.map((item) => item.toString()),
      bump: this.bump,
      reserved: this.reserved,
    }
  }

  static fromJSON(obj: HouseJSON): House {
    return new House({
      id: obj.id,
      treasuryAccount: new PublicKey(obj.treasuryAccount),
      feeBasisPoints: obj.feeBasisPoints,
      authority: new PublicKey(obj.authority),
      feeVaults: obj.feeVaults.map((item) => new PublicKey(item)),
      bump: obj.bump,
      reserved: obj.reserved,
    })
  }
}
