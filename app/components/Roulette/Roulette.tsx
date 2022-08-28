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
    id: 0,
    option: '0',
    style: {
      backgroundColor: '#E71A1A',
      textColor: '#fff',
    },
  },
  {
    id: 1,
    option: '⟳',
    style: {
      backgroundColor: '#1A1A1A',
      textColor: '#fff',
    },
  },
  {
    id: 2,
    option: '2X',
    style: {
      backgroundColor: '#E71A1A',
      textColor: '#fff',
    },
  },
  {
    id: 3,
    option: '0',
    style: {
      backgroundColor: '#1A1A1A',
      textColor: '#fff',
    },
  },
  {
    id: 4,
    option: '⟳',
    style: {
      backgroundColor: '#E71A1A',
      textColor: '#fff',
    },
  },
  {
    id: 5,
    option: '2X',
    style: {
      backgroundColor: '#1A1A1A',
      textColor: '#fff',
    },
  },
  {
    id: 6,
    option: '0',
    style: {
      backgroundColor: '#E71A1A',
      textColor: '#fff',
    },
  },
  {
    id: 7,
    option: '3X',
    style: {
      backgroundColor: '#D1AD6B',
      textColor: '#fff',
    },
  },
  {
    id: 8,
    option: '0',
    style: {
      backgroundColor: '#E71A1A',
      textColor: '#fff',
    },
  },
  {
    id: 9,
    option: '2X',
    style: {
      backgroundColor: '#1A1A1A',
      textColor: '#fff',
    },
  },
  {
    id: 10,
    option: '0',
    style: {
      backgroundColor: '#E71A1A',
      textColor: '#fff',
    },
  },
  {
    id: 11,
    option: '⟳',
    style: {
      backgroundColor: '#1A1A1A',
      textColor: '#fff',
    },
  },
]

const parseResultKind = (kind: string): number => {
  console.log('kind:', kind)
  switch (kind) {
    case 'Triplicate':
      return 7
    case 'Duplicate':
      const duplicateIndexes = data.filter(({ option }) => option === '2X')

      const randomDuplicateElement =
        duplicateIndexes[Math.floor(Math.random() * duplicateIndexes.length)]

      return randomDuplicateElement.id
    case 'Retry':
      const retryIndexes = data.filter(({ option }) => option === '⟳')

      const randomRetryElement =
        retryIndexes[Math.floor(Math.random() * retryIndexes.length)]

      return randomRetryElement.id
    case 'LoseAll':
      const LoseAllIndexes = data.filter(({ option }) => option === '0')

      const randomLoseAllElement =
        LoseAllIndexes[Math.floor(Math.random() * LoseAllIndexes.length)]

      return randomLoseAllElement.id
    default:
      return 0
  }
}

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

    if (!betProof?.betProofAccount?.toJSON().result) {
      alert(
        'Transaction not confirmed. Check your recent transactions to see the results.'
      )
      return null
    }

    const parsedResult = parseResultKind(
      betProof?.betProofAccount?.toJSON().result.kind
    )

    console.log('parsedResult:', parsedResult)

    setPrizeNumber(parsedResult)
    setMustSpin(true)
    console.log('winner option:', data[parsedResult])
    setTimeout(() => setShouldTestBetProof(true), 1000)
  }

  useEffect(() => {}, [mustSpin])

	return (
		<>
			<Box
				onClick={() => handleStartSpinning()}
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
			</Box>
		</>
	)
}
