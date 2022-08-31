import useWinnerWheel from '@/hooks/useWinnerWheel'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useEffect, useState } from 'react'
import { Box, Flex, Text } from 'theme-ui'
import { Wheel } from '../Wheel'
import { BetProof } from 'lib/gen/accounts'
import { PublicKey } from '@solana/web3.js'
import { findBetProofAddress } from 'lib/pda'
import { message } from 'antd'
import Image from 'next/image'

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
					message.info(
						'You triplicated your bet. Congrats!!! Click on the wheel to claim.'
					)
					break
				case 'Duplicate':
					message.info(
						'You duplicated Your bet. Congrats!!! Click on the wheel to claim.'
					)
					break
				case 'Retry':
					message.info(
						'You received your money back. Click on the wheel to claim.'
					)
					break
				case 'LoseAll':
					message.info(
						'You lost your bet ;(. Click on the wheel to close the account.'
					)
			}
		}, 11000)
		console.log('winner option:', data[parsedResult])
	}

	useEffect(() => {}, [mustSpin])

	return (
		<>
			<Flex
				onClick={() => handleStartSpinning()}
				sx={{
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					cursor: 'pointer',
					marginBottom: '2rem',
				}}
			>
				<Box
					sx={{
						'@media screen and (min-width: 768px)': {
							marginLeft: '38px',
						},
					}}
				>
					<Image width={346.5} height={238.25} src={'/images/crown.png'} />
				</Box>
				<Flex
					sx={{
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',

						'@media screen and (min-width: 768px)': {
							flexDirection: 'row',
						},
					}}
				>
					<Text
						sx={{
							fontFamily: 'Windsor Light BT',
							fontSize: '72px',
							backgroundImage: 'radial-gradient(#ccab67, #85591b)',
							// background: '-webkit-linear-gradient(#ccab67, #85591b)',
							'-webkit-background-clip': 'text',
							'-webkit-text-fill-color': 'transparent',
							fontWeight: '200',
							letterSpacing: '0.1px',
						}}
					>
						WINNER
					</Text>
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
					<Text
						sx={{
							fontFamily: 'Windsor Light BT',
							fontSize: '72px',
							backgroundImage: 'radial-gradient(#ccab67, #85591b)',
							// background: '-webkit-linear-gradient(#ccab67, #85591b)',
							'-webkit-background-clip': 'text',
							'-webkit-text-fill-color': 'transparent',
							fontWeight: '200',
							letterSpacing: '0.1px',
						}}
					>
						WHEEL
					</Text>
				</Flex>
			</Flex>
		</>
	)
}
