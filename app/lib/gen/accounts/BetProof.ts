import { PublicKey, Connection } from "@solana/web3.js"
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface BetProofFields {
  user: PublicKey
  house: PublicKey
  amount: BN
  result: types.BetResultKind
  reserved: Array<number>
}

export interface BetProofJSON {
  user: string
  house: string
  amount: string
  result: types.BetResultJSON
  reserved: Array<number>
}

export class BetProof {
  readonly user: PublicKey
  readonly house: PublicKey
  readonly amount: BN
  readonly result: types.BetResultKind
  readonly reserved: Array<number>

  static readonly discriminator = Buffer.from([
    245, 77, 117, 240, 27, 44, 173, 165,
  ])

  static readonly layout = borsh.struct([
    borsh.publicKey("user"),
    borsh.publicKey("house"),
    borsh.u64("amount"),
    types.BetResult.layout("result"),
    borsh.array(borsh.u8(), 32, "reserved"),
  ])

  constructor(fields: BetProofFields) {
    this.user = fields.user
    this.house = fields.house
    this.amount = fields.amount
    this.result = fields.result
    this.reserved = fields.reserved
  }

  static async fetch(
    c: Connection,
    address: PublicKey
  ): Promise<BetProof | null> {
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
  ): Promise<Array<BetProof | null>> {
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

  static decode(data: Buffer): BetProof {
    if (!data.slice(0, 8).equals(BetProof.discriminator)) {
      throw new Error("invalid account discriminator")
    }

    const dec = BetProof.layout.decode(data.slice(8))

    return new BetProof({
      user: dec.user,
      house: dec.house,
      amount: dec.amount,
      result: types.BetResult.fromDecoded(dec.result),
      reserved: dec.reserved,
    })
  }

  toJSON(): BetProofJSON {
    return {
      user: this.user.toString(),
      house: this.house.toString(),
      amount: this.amount.toString(),
      result: this.result.toJSON(),
      reserved: this.reserved,
    }
  }

  static fromJSON(obj: BetProofJSON): BetProof {
    return new BetProof({
      user: new PublicKey(obj.user),
      house: new PublicKey(obj.house),
      amount: new BN(obj.amount),
      result: types.BetResult.fromJSON(obj.result),
      reserved: obj.reserved,
    })
  }
}
