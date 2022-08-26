import * as anchor from "@project-serum/anchor";
import {
  Connection,
  Keypair,
  PublicKey,
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
    const sig = await provider.sendAndConfirm(tx, signers, {
      commitment: "confirmed",
    });

    return sig;
  } catch (err) {
    const parsed = fromTxError(err);

    console.log(err.logs);
    if (parsed !== null) {
      throw parsed;
    }

    throw err;
  }
};

const getAccountBalanceChange = async (
  connection: Connection,
  txSig: string,
  account: PublicKey
): Promise<number> => {
  const { transaction, meta } = await connection.getParsedTransaction(
    txSig,
    "confirmed"
  );

  const accountIdx = transaction.message.accountKeys.findIndex((acc) =>
    acc.pubkey.equals(account)
  );

  return meta.postBalances[accountIdx] - meta.preBalances[accountIdx];
};

describe("winner-wheel", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const connection = provider.connection;
  const program = WinnerWheelProgram(connection);

  const authority = provider.wallet;
  const user = Keypair.generate();

  // House doesn't exist yet, but we can find it's address anyway.
  const houseAddress = findHouseAddress({
    id: 0,
    authority: authority.publicKey,
  });

  before(async () => {
    // Fund user wallet.
    await connection.confirmTransaction(
      await connection.requestAirdrop(user.publicKey, 1e9)
    );
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

    expect(houseAccount.feeBasisPoints).to.equal(125);
  });

  it("should be able to create a bet proof", async () => {
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

    console.log(betProofAccount.toJSON());
  });

  it("should be able to claim a bet", async () => {
    const betProof = findBetProofAddress({
      user: user.publicKey,
      house: houseAddress,
    });

    const ix = await program.createClaimBetInstruction({
      user: user.publicKey,
      betProof,
    });

    const txSig = await send(provider, [user], ix);

    const userAccountBalanceChange = await getAccountBalanceChange(
      connection,
      txSig,
      user.publicKey
    );
    expect(userAccountBalanceChange).to.not.equals(0);

    const betProofAccount = await BetProof.fetch(connection, betProof);
    expect(betProofAccount).to.be.null;
  });

  it("should be able to withdraw funds from the treasury account", async () => {
    const ix = await program.createWithdrawTreasuryInstruction({
      house: houseAddress,
      amount: new anchor.BN(1e9),
    });

    // Signed by house authority.
    const txSig = await send(provider, [], ix);

    const { treasury } = await House.fetch(connection, houseAddress);

    const treasuryBalanceChange = await getAccountBalanceChange(
      connection,
      txSig,
      treasury
    );

    expect(treasuryBalanceChange).to.equal(-1e9);
  });

  it("should be able to sweep house fee vaults", async () => {
    const ix = await program.createSweepVaultsInstruction({
      house: houseAddress,
    });

    // Signed by house authority.
    const txSig = await send(provider, [], ix);

    const authorityBalanceChange = await getAccountBalanceChange(
      connection,
      txSig,
      authority.publicKey
    );

    expect(authorityBalanceChange).to.be.greaterThan(0);
  });
});
