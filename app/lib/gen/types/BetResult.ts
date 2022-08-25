import { PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"

export interface UnsetJSON {
  kind: "Unset"
}

export class Unset {
  static readonly discriminator = 0
  static readonly kind = "Unset"
  readonly discriminator = 0
  readonly kind = "Unset"

  toJSON(): UnsetJSON {
    return {
      kind: "Unset",
    }
  }

  toEncodable() {
    return {
      Unset: {},
    }
  }
}

export interface RetryJSON {
  kind: "Retry"
}

export class Retry {
  static readonly discriminator = 1
  static readonly kind = "Retry"
  readonly discriminator = 1
  readonly kind = "Retry"

  toJSON(): RetryJSON {
    return {
      kind: "Retry",
    }
  }

  toEncodable() {
    return {
      Retry: {},
    }
  }
}

export interface LoseAllJSON {
  kind: "LoseAll"
}

export class LoseAll {
  static readonly discriminator = 2
  static readonly kind = "LoseAll"
  readonly discriminator = 2
  readonly kind = "LoseAll"

  toJSON(): LoseAllJSON {
    return {
      kind: "LoseAll",
    }
  }

  toEncodable() {
    return {
      LoseAll: {},
    }
  }
}

export interface DuplicateJSON {
  kind: "Duplicate"
}

export class Duplicate {
  static readonly discriminator = 3
  static readonly kind = "Duplicate"
  readonly discriminator = 3
  readonly kind = "Duplicate"

  toJSON(): DuplicateJSON {
    return {
      kind: "Duplicate",
    }
  }

  toEncodable() {
    return {
      Duplicate: {},
    }
  }
}

export interface TriplicateJSON {
  kind: "Triplicate"
}

export class Triplicate {
  static readonly discriminator = 4
  static readonly kind = "Triplicate"
  readonly discriminator = 4
  readonly kind = "Triplicate"

  toJSON(): TriplicateJSON {
    return {
      kind: "Triplicate",
    }
  }

  toEncodable() {
    return {
      Triplicate: {},
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromDecoded(obj: any): types.BetResultKind {
  if (typeof obj !== "object") {
    throw new Error("Invalid enum object")
  }

  if ("Unset" in obj) {
    return new Unset()
  }
  if ("Retry" in obj) {
    return new Retry()
  }
  if ("LoseAll" in obj) {
    return new LoseAll()
  }
  if ("Duplicate" in obj) {
    return new Duplicate()
  }
  if ("Triplicate" in obj) {
    return new Triplicate()
  }

  throw new Error("Invalid enum object")
}

export function fromJSON(obj: types.BetResultJSON): types.BetResultKind {
  switch (obj.kind) {
    case "Unset": {
      return new Unset()
    }
    case "Retry": {
      return new Retry()
    }
    case "LoseAll": {
      return new LoseAll()
    }
    case "Duplicate": {
      return new Duplicate()
    }
    case "Triplicate": {
      return new Triplicate()
    }
  }
}

export function layout(property?: string) {
  const ret = borsh.rustEnum([
    borsh.struct([], "Unset"),
    borsh.struct([], "Retry"),
    borsh.struct([], "LoseAll"),
    borsh.struct([], "Duplicate"),
    borsh.struct([], "Triplicate"),
  ])
  if (property !== undefined) {
    return ret.replicate(property)
  }
  return ret
}
