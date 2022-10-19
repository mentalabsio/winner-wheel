import { BN } from "@project-serum/anchor";
import { Connection, Keypair, PublicKey, sendAndConfirmTransaction, Transaction } from "@solana/web3.js"
import { WinnerWheelProgram } from "../app/lib";

const withdrawFunds = async () => {
  try {
    const connection = new Connection('https://ssc-dao.genesysgo.net/', 'confirmed')

    const program = WinnerWheelProgram(connection)

    const houseAddress = new PublicKey('Ds9QTn2xTKg1CHzymCcH7nzWQ1WufZsNZi9751Mw65Pg')

    const keypair = (new Uint8Array(JSON.parse('SECRET_KEY')))

    const authority = Keypair.fromSecretKey(keypair)

    const ix = await program.createWithdrawTreasuryInstruction({
      house: houseAddress,
      amount: new BN(5.2e9),
      receiver: new PublicKey('GkwtCtQ8HCtX4SJH9bxPzT2Up88AY9qVFKPbGTFBkHjz')
    });

    const tx = new Transaction()

    tx.add(ix)

    // Signed by house authority.
    const txSig = await sendAndConfirmTransaction(connection, tx, [authority]);

    console.log(txSig)

  } catch (e) {
    console.log(e)
  }
}

withdrawFunds()