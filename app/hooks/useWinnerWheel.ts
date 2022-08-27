import { PublicKey, Transaction } from '@solana/web3.js'

import * as anchor from '@project-serum/anchor'
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react'
import { BetProof } from 'lib/gen/accounts'
import { fromTxError } from 'lib/gen/errors'
import { findBetProofAddress } from 'lib/pda'
import { WinnerWheelProgram } from 'lib'

const parseBetValue = (betValue: number) => {
  switch (betValue) {
    case 0.05:
      return 0.05e9
    case 0.1:
      return 0.1e9
    case 0.25:
      return 0.25e9
    case 0.5:
      return 0.5e9
    case 1:
      return 1e9
    default:
      break
  }
}

const useWinnerWheel = () => {
  const { connection } = useConnection()
  const anchorWallet = useAnchorWallet()

  const program = WinnerWheelProgram(connection)

  const createBetProof = async (
    betValue: number
  ): Promise<{
    error: string
    sig?: string
    betProofAccount?: BetProof
  }> => {
    const betProof = findBetProofAddress({
      user: anchorWallet.publicKey,
      house: new PublicKey(process.env.NEXT_PUBLIC_HOUSE_PUBLIC_KEY),
    })
    const betProofAccount = await BetProof.fetch(connection, betProof)

    console.log('betProof:', betProofAccount?.toJSON())

    if (betProofAccount) return { error: 'User has an existing bet to claim.' }

    try {
      const blockhash = (await connection.getLatestBlockhash('confirmed'))
        .blockhash

      const ix = await program.createBetProofInstruction({
        house: new PublicKey(process.env.NEXT_PUBLIC_HOUSE_PUBLIC_KEY),
        user: anchorWallet.publicKey,
        betValue: new anchor.BN(parseBetValue(betValue)),
      })

      const tx = new Transaction({
        feePayer: anchorWallet.publicKey,
        recentBlockhash: blockhash,
      })

      tx.add(ix)

      const signedTx = anchorWallet.signTransaction(tx)

      const sig = await connection.sendRawTransaction(
        (await signedTx).serialize()
      )

      const betProofAccount = await BetProof.fetch(connection, betProof)

      console.log('betProofAccount:', betProofAccount?.toJSON())

      return { error: '', sig, betProofAccount: betProofAccount }
    } catch (err) {
      const parsed = fromTxError(err)

      console.log(err.logs)
      if (parsed !== null) {
        throw parsed
      }

      throw err
    }
  }

  const claimBet = async (): Promise<{ error: string; sig?: string }> => {
    try {
      console.log('claim bet')
      const blockhash = (await connection.getLatestBlockhash('confirmed'))
        .blockhash

      const tx = new Transaction({
        feePayer: anchorWallet.publicKey,
        recentBlockhash: blockhash,
      })

      const betProof = findBetProofAddress({
        user: anchorWallet.publicKey,
        house: new PublicKey(process.env.NEXT_PUBLIC_HOUSE_PUBLIC_KEY),
      })

      if (!betProof) return { error: 'Bet already claimed.' }

      const ix = await program.createClaimBetInstruction({
        user: anchorWallet.publicKey,
        betProof,
      })

      tx.add(ix)

      const signedTx = await anchorWallet.signTransaction(tx)

      const sig = await connection.sendRawTransaction(signedTx.serialize())

      const betProofAccount = await BetProof.fetch(connection, betProof)

      console.log('bet proof:', betProofAccount)
      return { error: '', sig }
    } catch (err) {
      const parsed = fromTxError(err)

      console.log(err.logs)
      if (parsed !== null) {
        throw parsed
      }

      throw err
    }
  }

  return {
    createBetProof,
    claimBet,
  }
}

export default useWinnerWheel
