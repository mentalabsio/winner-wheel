import { useWallet } from '@solana/wallet-adapter-react'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { Box, Button } from 'theme-ui'

export interface StyleType {
	backgroundColor?: string
	textColor?: string
}

export interface WheelData {
	option: string
	style?: StyleType
}

const Wheel = dynamic<{
	mustStartSpinning: boolean
	prizeNumber: number
	data: WheelData[]
	onStopSpinning?: () => any
	backgroundColors?: string[]
	textColors?: string[]
	outerBorderColor?: string
	outerBorderWidth?: number
	innerRadius?: number
	innerBorderColor?: string
	innerBorderWidth?: number
	radiusLineColor?: string
	radiusLineWidth?: number
	fontSize?: number
	perpendicularText?: boolean
	textDistance?: number
	spinDuration?: number
}>(() => import('react-custom-roulette').then((mod) => mod.Wheel), {
	ssr: false,
})

const data = [
	{
		option: '⟳',
		style: {
			backgroundColor: '#494646',
			textColor: '#000',
		},
	},
	{
		option: '0',
		style: {
			backgroundColor: '#CF2424',
			textColor: '#000',
		},
	},
	{
		option: '⟳',
		style: {
			backgroundColor: '#494646',
			textColor: '#000',
		},
	},
	{
		option: '2X',
		style: {
			backgroundColor: '#E1CA39',
			textColor: '#000',
		},
	},
	{
		option: '0',
		style: {
			backgroundColor: '#CF2424',
			textColor: '#000',
		},
	},
	{
		option: '⟳',
		style: {
			backgroundColor: '#494646',
			textColor: '#000',
		},
	},
	{
		option: '2X',
		style: {
			backgroundColor: '#E1CA39',
			textColor: '#000',
		},
	},
	{
		option: '0',
		style: {
			backgroundColor: '#CF2424',
			textColor: '#000',
		},
	},
	{
		option: '3X',
		style: {
			backgroundColor: '#A822AD',
			textColor: '#000',
		},
	},
	{
		option: '0',
		style: {
			backgroundColor: '#CF2424',
			textColor: '#000',
		},
	},
	{
		option: '2X',
		style: {
			backgroundColor: '#E1CA39',
			textColor: '#000',
		},
	},
	{
		option: '0',
		style: {
			backgroundColor: '#CF2424',
			textColor: '#000',
		},
	},
]

export default () => {
	const [mustSpin, setMustSpin] = useState(false)
	const [prizeNumber, setPrizeNumber] = useState(0)
	const { signTransaction } = useWallet()

	console.log(mustSpin)

	const handleStartSpinning = async () => {
		console.log('started')
		// const tx = new Transaction()

		// transfer from user to house
		// const ix = new Transfer({})

		// const signed = signTransaction(tx)

		// handleTransfer (API)
		const newPrizeNumber = await (
			await fetch('/api/transactions/getPrize', {
				// body: signed.serialize(),
				method: 'POST',
				body: JSON.stringify({
					dataLength: data.length,
				}),
			})
		).json()

		setPrizeNumber(newPrizeNumber.data)
		setMustSpin(true)
		console.log('winner index:', newPrizeNumber.data)
		console.log('winner option:', data[newPrizeNumber.data])
	}

	useEffect(() => {}, [mustSpin])

	return (
		<>
			<Box
				sx={{
					cursor: 'pointer',
					marginBottom: '2rem',
				}}
				onClick={handleStartSpinning}
			>
				<Wheel
					mustStartSpinning={mustSpin}
					prizeNumber={prizeNumber}
					data={data}
					onStopSpinning={() => {
						setMustSpin(false)
					}}
				/>
			</Box>
		</>
	)
}
