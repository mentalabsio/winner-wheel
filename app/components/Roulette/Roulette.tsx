import useWinnerWheel from '@/hooks/useWinnerWheel'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useEffect, useState } from 'react'
import { Box } from 'theme-ui'
import { Wheel } from '../Wheel'
import { BetProof } from 'lib/gen/accounts'
import { PublicKey } from '@solana/web3.js'
import { findBetProofAddress } from 'lib/pda'
import { Button } from 'theme-ui'

export interface StyleType {
  backgroundColor?: string
  textColor?: string
}

export interface WheelData {
  option: string
  style?: StyleType
}

const data = [
  {
    option: '0',
    style: {
      backgroundColor: '#E71A1A',
      textColor: '#fff',
    },
  },
  {
    option: '⟳',
    style: {
      backgroundColor: '#1A1A1A',
      textColor: '#fff',
    },
  },
  {
    option: '2X',
    style: {
      backgroundColor: '#E71A1A',
      textColor: '#fff',
    },
  },
  {
    option: '0',
    style: {
      backgroundColor: '#1A1A1A',
      textColor: '#fff',
    },
  },
  {
    option: '⟳',
    style: {
      backgroundColor: '#E71A1A',
      textColor: '#fff',
    },
  },
  {
    option: '2X',
    style: {
      backgroundColor: '#1A1A1A',
      textColor: '#fff',
    },
  },
  {
    option: '0',
    style: {
      backgroundColor: '#E71A1A',
      textColor: '#fff',
    },
  },
  {
    option: '3X',
    style: {
      backgroundColor: '#D1AD6B',
      textColor: '#fff',
    },
  },
  {
    option: '0',
    style: {
      backgroundColor: '#E71A1A',
      textColor: '#fff',
    },
  },
  {
    option: '2X',
    style: {
      backgroundColor: '#1A1A1A',
      textColor: '#fff',
    },
  },
  {
    option: '0',
    style: {
      backgroundColor: '#E71A1A',
      textColor: '#fff',
    },
  },
  {
    option: '⟳',
    style: {
      backgroundColor: '#1A1A1A',
      textColor: '#fff',
    },
  },
]

export interface RouletteProps {
  selectedBet: number
}

export default (props: RouletteProps) => {
  const { selectedBet } = props
  const [mustSpin, setMustSpin] = useState(false)
  const [prizeNumber, setPrizeNumber] = useState(0)
  const { publicKey } = useWallet()
  const { connection } = useConnection()
  const { createBetProof, claimBet } = useWinnerWheel()
  const [isClaimAvailable, setIsClaimAvailable] = useState<boolean>(false)
  const [shouldTestBetProof, setShouldTestBetProof] = useState<boolean>(false)

  useEffect(() => {
    if (publicKey) {
      const betProof = findBetProofAddress({
        user: publicKey,
        house: new PublicKey(process.env.NEXT_PUBLIC_HOUSE_PUBLIC_KEY),
      })

      const getBetProof = async () => {
        const betProofAccount = await BetProof.fetch(connection, betProof).then(
          (res) => (res ? res.toJSON() : null)
        )
        if (betProofAccount) setIsClaimAvailable(true)
      }
      getBetProof().catch(console.error)
    }
  }, [publicKey, shouldTestBetProof])

  console.log(isClaimAvailable)

  const handleStartSpinning = async () => {
    if (!publicKey) return null

    const betProof = await createBetProof(selectedBet)

    if (betProof.error) {
      alert(betProof.error)
      return null
    }

    console.log('betProof Roulette:', betProof?.betProofAccount?.toJSON())

    setPrizeNumber(1)
    setMustSpin(true)
    console.log('winner option:', data[1])
    setTimeout(() => setShouldTestBetProof(true), 1000)
  }

  useEffect(() => {}, [mustSpin])

  return (
    <>
      <Box
        sx={{
          cursor: 'pointer',
          marginBottom: '2rem',
        }}
      >
        <Wheel
          mustStartSpinning={mustSpin}
          prizeNumber={prizeNumber}
          data={data}
          radiusLineWidth={0}
          innerRadius={10}
          innerBorderWidth={2}
          innerBorderColor={'#E1CA39'}
          outerBorderWidth={2}
          textDistance={80}
          onStopSpinning={() => {
            setMustSpin(false)
          }}
        />
        <Button onClick={handleStartSpinning}>Spin</Button>
        {isClaimAvailable && (
          <Button
            onClick={async () => {
              const result = await claimBet()

              if (result.error) alert(result.error)

              alert(result.sig)

              setShouldTestBetProof(true)
            }}
          >
            Claim
          </Button>
        )}
      </Box>
    </>
  )
}
