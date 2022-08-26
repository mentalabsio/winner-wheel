import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import BN from "bn.js";
import { House } from "./gen/accounts";
import { createBetProof, initializeHouse } from "./gen/instructions";
import { findBetProofAddress, findHouseAddress, findVaultAddress } from "./pda";

export const WinnerWheelProgram = (connection: Connection) => {
  const systemProgram = SystemProgram.programId;

  const createHouseInstruction = ({
    id,
    initialFunds,
    feeBasisPoints,
    authority,
  }: {
    id: number;
    initialFunds: BN;
    feeBasisPoints: number;
    authority: PublicKey;
  }) => {
    const house = findHouseAddress({ authority, id });

    const treasuryAccount = findVaultAddress({ house, name: "treasury" });
    const vaultOne = findVaultAddress({ house, name: "vault_one" });
    const vaultTwo = findVaultAddress({ house, name: "vault_two" });

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

  const createBetProofInstruction = async ({
    house,
    user,
    betValue,
  }: {
    house: PublicKey;
    user: PublicKey;
    betValue: BN;
  }) => {
    const [feeVaultOne, feeVaultTwo] = (await House.fetch(connection, house))
      .feeVaults;
    const betProof = findBetProofAddress({ user, house });

    const ix = createBetProof(
      { betValue },
      {
        user,
        house,
        betProof,
        feeVaultOne,
        feeVaultTwo,
        systemProgram,
      }
    );

    return ix;
  };

  return {
    createHouseInstruction,
    createBetProofInstruction,
  };
};
