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
  sweepVaults,
  withdrawTreasury,
} from "./gen/instructions";
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
    const house = findHouseAddress({ id, authority });

    const treasury = findVaultAddress({ house, name: "treasury" });
    const vaultOne = findVaultAddress({ house, name: "vault_one" });
    const vaultTwo = findVaultAddress({ house, name: "vault_two" });

    return initializeHouse(
      { feeBasisPoints, funds: initialFunds, id },
      {
        house,
        authority,
        treasury,
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

  const createClaimBetInstruction = async ({
    user,
    betProof,
  }: {
    user: PublicKey;
    betProof: PublicKey;
  }): Promise<TransactionInstruction> => {
    const { house } = await BetProof.fetch(connection, betProof);
    const treasury = findVaultAddress({ house, name: "treasury" });
    return claimBet({
      house,
      user,
      betProof,
      treasury,
      systemProgram,
    });
  };

  const createWithdrawTreasuryInstruction = async ({
    house,
    amount,
    receiver,
  }: {
    house: PublicKey;
    amount: BN;
    receiver?: PublicKey;
  }): Promise<TransactionInstruction> => {
    const { treasury, authority } = await House.fetch(connection, house);

    return withdrawTreasury(
      { amount },
      {
        house,
        treasury,
        receiver: receiver ?? authority,
        authority,
      }
    );
  };

  const createSweepVaultsInstruction = async ({
    house,
    receiver,
  }: {
    house: PublicKey;
    receiver?: PublicKey;
  }): Promise<TransactionInstruction> => {
    const {
      feeVaults: [vaultOne, vaultTwo],
      authority,
    } = await House.fetch(connection, house);

    return sweepVaults({
      house,
      vaultOne,
      vaultTwo,
      authority,
      receiver: receiver ?? authority,
    });
  };

  return {
    createHouseInstruction,
    createBetProofInstruction,
    createClaimBetInstruction,
    createWithdrawTreasuryInstruction,
    createSweepVaultsInstruction,
  };
};
