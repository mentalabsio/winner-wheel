import * as anchor from "@project-serum/anchor";
import { Keypair, Transaction, TransactionInstruction } from "@solana/web3.js";
import { expect } from "chai";
import { WinnerWheelProgram } from "../app/lib";
import { House } from "../app/lib/gen/accounts";
import { fromTxError } from "../app/lib/gen/errors";
import { findHouseAddress } from "../app/lib/pda";

const send = async (
  provider: anchor.AnchorProvider,
  signers: [],
  ...ixs: TransactionInstruction[]
): Promise<string> => {
  try {
    const tx = new Transaction().add(...ixs);

    // provider.wallet automatically signs.
    const sig = await provider.sendAndConfirm(tx, signers);

    return sig;
  } catch (err) {
    const parsed = fromTxError(err);

    if (parsed !== null) {
      throw parsed;
    }

    throw err;
  }
};

describe("winner-wheel", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const connection = provider.connection;
  const program = WinnerWheelProgram();

  const authority = provider.wallet;

  // TODO: turn into PDAs;
  const treasuryAccount = Keypair.generate();
  const feeVaultOne = Keypair.generate();
  const feeVaultTwo = Keypair.generate();

  it("should be able to initialize a house", async () => {
    const ix = program.createHouseInstruction({
      // Unique ID (0 - 65535)
      id: 0,
      // 1 bps <-> 0.01%
      // 1.25% * 100 = 125 bps
      feeBasisPoints: 125,
      // How many lamports to send from `authority`to `treasuryAccount`.
      initialFunds: new anchor.BN(100e9),
      treasuryAccount: treasuryAccount.publicKey,
      vaultOne: feeVaultOne.publicKey,
      vaultTwo: feeVaultTwo.publicKey,
      authority: authority.publicKey,
    });

    await send(provider, [], ix);

    const houseAddress = findHouseAddress({
      id: 0,
      authority: authority.publicKey,
    });
    const houseAccount = await House.fetch(connection, houseAddress);

    expect(houseAccount.feeBasisPoints).to.equal(125);
  });

  it("should be able to create a bet proof", async () => {
    throw "Unimplemented";
  });

  it("should be able to set a bet's result", async () => {
    throw "Unimplemented";
  });

  it("should be able to claim a bet", async () => {
    throw "Unimplemented";
  });
});
