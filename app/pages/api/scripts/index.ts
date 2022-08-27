import * as anchor from '@project-serum/anchor'
import { AuthorityType } from '@solana/spl-token'
import {
  Connection,
  Keypair,
  PublicKey,
  Signer,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import { expect } from 'chai'
import { WinnerWheelProgram } from 'lib'
import { House } from 'lib/gen/accounts'
import { fromTxError } from 'lib/gen/errors'
import { findHouseAddress } from 'lib/pda'

const send = async (
  provider: anchor.AnchorProvider,
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

  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)

  const connection = provider.connection
  const program = WinnerWheelProgram(connection)

  const authority = provider.wallet

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
          initialFunds: new anchor.BN(100e9),
          authority: authority.publicKey,
        })

        await send(provider, [], ix)

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
