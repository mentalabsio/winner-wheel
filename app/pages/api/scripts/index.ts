import { AnchorProvider, BN, web3 } from '@project-serum/anchor'
import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Signer,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import { WinnerWheelProgram } from 'lib'
import { House } from 'lib/gen/accounts'
import { fromTxError } from 'lib/gen/errors'
import { findHouseAddress } from 'lib/pda'

const send = async (
  provider: AnchorProvider,
  signers: Signer[],
  ...ixs: TransactionInstruction[]
): Promise<string> => {
  try {
    const tx = new Transaction().add(...ixs)

    // provider.wallet automatically signs.
    const sig = await provider.sendAndConfirm(tx, signers, {
      commitment: 'confirmed',
    })

    return sig
  } catch (err) {
    const parsed = fromTxError(err)

    console.log(err.logs)
    if (parsed !== null) {
      throw parsed
    }

    throw err
  }
}

export default async function handler(req: any, res: any) {
  if (process.env.NODE_ENV === 'production') return res.status(404).end()

  const endpoint =
    process.env.NEXT_PUBLIC_CONNECTION_NETWORK == "devnet"
      ? process.env.NEXT_PUBLIC_SOLANA_RPC_HOST_DEVNET
      : process.env.NEXT_PUBLIC_SOLANA_RPC_HOST_MAINNET_BETA

  const connection = new Connection(endpoint)

  const program = WinnerWheelProgram(connection)

  const keypair_string = process.env.HOUSE_PRIVATE_KEY

  const keypair_array = JSON.parse(keypair_string)

  const keypair = new Uint8Array(keypair_array)

  const authority = web3.Keypair.fromSecretKey(keypair)

  switch (req.query.task) {
    case 'initialize-house':
      // code
      try {
        // House doesn't exist yet, but we can find it's address anyway.
        const houseAddress = findHouseAddress({
          id: 0,
          authority: authority.publicKey,
        })

        const ix = program.createHouseInstruction({
          // Unique ID (0 - 65535)
          id: 0,
          // 1 bps <-> 0.01%
          // 1.25% * 100 = 125 bps
          feeBasisPoints: 125,
          // How many lamports to send from `authority`to `treasuryAccount`.
          initialFunds: new BN(0),
          authority: authority.publicKey,
        })

        const blockhash = (await connection.getLatestBlockhash('confirmed')).blockhash
        const transaction = new Transaction(
          {
            blockhash,
            lastValidBlockHeight: 1
          }

        )

        transaction.add(ix)

        await sendAndConfirmTransaction(connection, transaction, [authority], {
          commitment: 'confirmed'
        })

        const houseAccount = await House.fetch(connection, houseAddress)

        console.log(houseAccount)

        return res.status(200).json({
          status: 'Ok',
          data: houseAccount,
        })
      } catch (e) {
        console.log(e)
        return res.status(400).json({
          status: 'Error' + e,
          data: null,
        })
      }

    case 'get-house-address':
      try {
        const houseAddress = findHouseAddress({
          id: 0,
          authority: authority.publicKey,
        })

        console.log('House address:', houseAddress.toString())

        return res.status(200).json({
          status: 'Ok',
          data: houseAddress.toString(),
        })
      } catch (e) {
        console.log(e)
        return res.status(400).json({
          status: 'Error' + e,
          data: null,
        })
      }
  }
}
