import {
  Connection,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import BN from "bn.js";
import { BetProof, House } from "./gen/accounts";
import {
  claimBet,
  createBetProof,
  initializeHouse,
  setBetResult,
} from "./gen/instructions";
import { BetResultKind } from "./gen/types";
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

    return initializeHouse(
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

    return createBetProof(
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
  };

  const createSetBetResultInstruction = async ({
    result,
    betProof,
    houseAuthority,
  }: {
    result: BetResultKind;
    betProof: PublicKey;
    houseAuthority: PublicKey;
  }): Promise<TransactionInstruction> => {
    const { house } = await BetProof.fetch(connection, betProof);

    return setBetResult(
      { result },
      {
        house,
        betProof,
        authority: houseAuthority,
      }
    );
  };

  const createClaimBetInstruction = async ({
    user,
    betProof,
  }: {
    user: PublicKey;
    betProof: PublicKey;
  }): Promise<TransactionInstruction> => {
    const { house } = await BetProof.fetch(connection, betProof);
    const treasuryAccount = findVaultAddress({ house, name: "treasury" });
    return claimBet({
      house,
      user,
      betProof,
      treasuryAccount,
      systemProgram,
    });
  };

  return {
    createHouseInstruction,
    createBetProofInstruction,
    createSetBetResultInstruction,
    createClaimBetInstruction,
  };
};
