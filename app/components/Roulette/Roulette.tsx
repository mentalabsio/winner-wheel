import { getGradient } from '@/styles/theme'
import { web3 } from '@project-serum/anchor'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { LAMPORTS_PER_SOL, Transaction } from '@solana/web3.js'
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

export interface RouletteProps {
	selectedBet: number
}

export default (props: RouletteProps) => {
	const { selectedBet } = props
	const [mustSpin, setMustSpin] = useState(false)
	const [prizeNumber, setPrizeNumber] = useState(0)
	const { signTransaction, publicKey } = useWallet()
	const { connection } = useConnection()

	const handleStartSpinning = async () => {
		if (!publicKey) return null

		let blockhash = (await connection.getLatestBlockhash('finalized')).blockhash

		const tx = new Transaction({
			feePayer: publicKey,
			recentBlockhash: blockhash,
		})

		tx.add(
			web3.SystemProgram.transfer({
				fromPubkey: publicKey,
				toPubkey: new web3.PublicKey(
					'ATVgGHUBn1dCvuMAm25NjgHBVuR8dPtpT2brkQ1F6V8M'
				),
				lamports: selectedBet * LAMPORTS_PER_SOL,
			})
		)

		// ask for user to sign transaction
		const signedTransaction = await signTransaction(tx)

		if (!signedTransaction) return null

		const res = await (
			await fetch('/api/transactions/getPrize', {
				method: 'POST',
				body: JSON.stringify({
					serializedTx: signedTransaction.serialize(),
					data,
					publicKey,
					selectedBet,
				}),
			})
		).json()

		setPrizeNumber(res.data.number)
		setMustSpin(true)
		console.log('winner option:', data[res.data.number])
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
