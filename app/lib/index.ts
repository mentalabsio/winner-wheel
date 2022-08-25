import { Connection, Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import BN from "bn.js";
import { initializeHouse } from "./gen/instructions";
import { findHouseAddress } from "./pda";

export const WinnerWheelProgram = () => {
  const systemProgram = SystemProgram.programId;

  const createHouseInstruction = ({
    id,
    initialFunds,
    feeBasisPoints,
    authority,
    vaultOne,
    vaultTwo,
    treasuryAccount,
  }: {
    id: number;
    initialFunds: BN;
    feeBasisPoints: number;
    authority: PublicKey;
    vaultOne: PublicKey;
    vaultTwo: PublicKey;
    treasuryAccount: PublicKey;
  }) => {
    const house = findHouseAddress({ authority, id });

    const ix = initializeHouse(
      { feeBasisPoints, funds: initialFunds, id },
      {
        house,
        authority,
        treasuryAccount,
        vaultOne,
        vaultTwo,

        systemProgram,
      }
    );

    return ix;
  };

  return {
    createHouseInstruction,
  };
};
