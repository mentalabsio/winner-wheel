/** @jsxImportSource theme-ui */
import Head from 'next/head'

import Header from '@/components/Header/Header'
import Roulette from '@/components/Roulette/Roulette'
import { BetOptions } from '@/components/BetOptions/BetOptions'
import { useState } from 'react'
import { Button, Flex } from 'theme-ui'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import useWinnerWheel from '@/hooks/useWinnerWheel'
import { findBetProofAddress } from 'lib/pda'
import { PublicKey } from '@solana/web3.js'
import { BetProof } from 'lib/gen/accounts'
import { message } from 'antd'

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

export default function Home() {
	const { publicKey } = useWallet()
	const { connection } = useConnection()
	const { createBetProof, claimBet } = useWinnerWheel()
	const [selectedBet, setSelectedBet] = useState<number>(0.05)
	const [prizeNumber, setPrizeNumber] = useState(0)
	const [mustSpin, setMustSpin] = useState(false)

	const handleStartSpinning = async () => {
		if (!publicKey) return null

		const betProof = findBetProofAddress({
			user: publicKey,
			house: new PublicKey(process.env.NEXT_PUBLIC_HOUSE_PUBLIC_KEY),
		})

		const betProofAccount = await BetProof.fetch(connection, betProof)

		// if bet proof account exists, call claimBet
		if (betProofAccount) {
			const result = await claimBet()
			if (result.error) {
				message.error(result.error)
				return null
			}

			message.info(`Signature: ${result.sig}`)
			return null
		}

		const createdBetProof = await createBetProof(selectedBet)

		if (createdBetProof.error) {
			message.error(createdBetProof.error)
			return null
		}

		console.log(
			'betProof Roulette:',
			createdBetProof?.betProofAccount?.toJSON()
		)

		if (!createdBetProof?.betProofAccount?.toJSON().result) {
			message.error(
				'Transaction not confirmed. Check your recent transactions to see the results.'
			)
			return null
		}

		const resultKind = createdBetProof?.betProofAccount?.toJSON().result.kind

		const parsedResult = parseResultKind(resultKind)

		console.log('parsedResult:', parsedResult)

		setPrizeNumber(parsedResult)
		setMustSpin(true)
		setTimeout(() => {
			switch (resultKind) {
				case 'Triplicate':
					message.info('You triplicated your bet. Congrats!!!')
					break
				case 'Duplicate':
					message.info('You duplicated Your bet. Congrats!!!')
					break
				case 'Retry':
					message.info('You received your money back.')
					break
				case 'LoseAll':
					message.info('You lost your bet ;(')
			}
		}, 11000)
		console.log('winner option:', data[parsedResult])
	}

	return (
		<>
			<Head>
				<title>Winner Wheel</title>
				<meta
					name='description'
					content='Spin and try your best of luck on the official Winner Wheel game.'
				/>
				<link rel='icon' href='/favicon.ico' />
			</Head>

			<Header />
			<main
				sx={{
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					alignItems: 'center',
					background: 'url(images/background4.jpeg)',
					backgroundPosition: 'unset',
					backgroundSize: 'cover',
					padding: '15px',

					'@media screen and (min-width: 768px)': {
						height: '100vh',
					},
				}}
			>
				<Roulette
					selectedBet={selectedBet}
					prizeNumber={prizeNumber}
					mustSpin={mustSpin}
					setMustSpin={setMustSpin}
					data={data}
				/>
				<Flex
					sx={{
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',

						'@media screen and (min-width: 768px)': {
							marginLeft: '38px',
						},
					}}
				>
					<BetOptions
						selectedBet={selectedBet}
						setSelectedBet={setSelectedBet}
					/>
					<Button variant='secondary' onClick={() => handleStartSpinning()}>
						SPIN
					</Button>
				</Flex>
			</main>
		</>
	)
}
