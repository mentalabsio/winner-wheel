import { PublicKey, Connection } from "@solana/web3.js"
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface VaultFields {
  house: PublicKey
  bump: Array<number>
}

export interface VaultJSON {
  house: string
  bump: Array<number>
}

export class Vault {
  readonly house: PublicKey
  readonly bump: Array<number>

  static readonly discriminator = Buffer.from([
    211, 8, 232, 43, 2, 152, 117, 119,
  ])

  static readonly layout = borsh.struct([
    borsh.publicKey("house"),
    borsh.array(borsh.u8(), 1, "bump"),
  ])

  constructor(fields: VaultFields) {
    this.house = fields.house
    this.bump = fields.bump
  }

  static async fetch(c: Connection, address: PublicKey): Promise<Vault | null> {
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
  ): Promise<Array<Vault | null>> {
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

  static decode(data: Buffer): Vault {
    if (!data.slice(0, 8).equals(Vault.discriminator)) {
      throw new Error("invalid account discriminator")
    }

    const dec = Vault.layout.decode(data.slice(8))

    return new Vault({
      house: dec.house,
      bump: dec.bump,
    })
  }

  toJSON(): VaultJSON {
    return {
      house: this.house.toString(),
      bump: this.bump,
    }
  }

  static fromJSON(obj: VaultJSON): Vault {
    return new Vault({
      house: new PublicKey(obj.house),
      bump: obj.bump,
    })
  }
}
