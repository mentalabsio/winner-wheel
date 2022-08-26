import * as anchor from "@project-serum/anchor";
import {
  Keypair,
  Signer,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { expect } from "chai";
import { WinnerWheelProgram } from "../app/lib";
import { BetProof, House } from "../app/lib/gen/accounts";
import { fromTxError } from "../app/lib/gen/errors";
import { findBetProofAddress, findHouseAddress } from "../app/lib/pda";

const send = async (
  provider: anchor.AnchorProvider,
  signers: Signer[],
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
  const program = WinnerWheelProgram(connection);

  const authority = provider.wallet;

  // House doesn't exist yet, but we can find it's address anyway.
  const houseAddress = findHouseAddress({
    id: 0,
    authority: authority.publicKey,
  });

  it("should be able to initialize a house", async () => {
    const ix = program.createHouseInstruction({
      // Unique ID (0 - 65535)
      id: 0,
      // 1 bps <-> 0.01%
      // 1.25% * 100 = 125 bps
      feeBasisPoints: 125,
      // How many lamports to send from `authority`to `treasuryAccount`.
      initialFunds: new anchor.BN(100e9),
      authority: authority.publicKey,
    });

    await send(provider, [], ix);

    const houseAccount = await House.fetch(connection, houseAddress);

    console.log(houseAccount.toJSON());
    expect(houseAccount.feeBasisPoints).to.equal(125);
  });

  it("should be able to create a bet proof", async () => {
    const user = Keypair.generate();

    await connection.confirmTransaction(
      await connection.requestAirdrop(user.publicKey, 1e9)
    );

    const ix = await program.createBetProofInstruction({
      house: houseAddress,
      user: user.publicKey,
      betValue: new anchor.BN(0.5e9),
    });

    await send(provider, [user], ix);

    const betProof = findBetProofAddress({
      user: user.publicKey,
      house: houseAddress,
    });

    const betProofAccount = await BetProof.fetch(connection, betProof);

    expect(betProofAccount.result.kind).to.equal("Unset");
  });

  it.skip("should be able to set a bet's result", async () => {
    throw "Unimplemented";
  });

  it.skip("should be able to claim a bet", async () => {
    throw "Unimplemented";
  });
});
