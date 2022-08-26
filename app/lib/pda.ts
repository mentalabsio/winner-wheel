import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { PROGRAM_ID } from "./gen/programId";

export const findHouseAddress = ({
  id,
  authority,
}: {
  id: number;
  authority: PublicKey;
}): PublicKey =>
  findProgramAddressSync(
    [
      Buffer.from("house"),
      authority.toBuffer(),
      new BN(id).toArrayLike(Buffer, "le", 2),
    ],
    PROGRAM_ID
  )[0];

export const findBetProofAddress = ({
  user,
  house,
}: {
  user: PublicKey;
  house: PublicKey;
}): PublicKey =>
  findProgramAddressSync(
    [Buffer.from("betproof"), house.toBuffer(), user.toBuffer()],
    PROGRAM_ID
  )[0];

export const findVaultAddress = ({
  house,
  name,
}: {
  house: PublicKey;
  name: string;
}): PublicKey =>
  findProgramAddressSync(
    [Buffer.from("vault"), Buffer.from(name), house.toBuffer()],
    PROGRAM_ID
  )[0];
