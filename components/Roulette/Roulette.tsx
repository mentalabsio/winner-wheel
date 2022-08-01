import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { Button } from 'theme-ui'

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
	{ option: '1' },
	{ option: '2' },
	{ option: '3' },
	{ option: '4' },
	{ option: '5' },
	{ option: '6' },
	{ option: '7' },
	{ option: '8' },
	{ option: '9' },
	{ option: '10' },
	{ option: '11' },
	{ option: '12' },
]

export default () => {
	const [mustSpin, setMustSpin] = useState(false)
	const [prizeNumber, setPrizeNumber] = useState(0)

	console.log(mustSpin)

	const handleStartSpinning = () => {
		console.log('started')
		const newPrizeNumber = Math.floor(Math.random() * data.length)
		setPrizeNumber(newPrizeNumber)
		setMustSpin(true)
	}

	useEffect(() => {}, [mustSpin])

	return (
		<>
			<Wheel
				mustStartSpinning={mustSpin}
				prizeNumber={prizeNumber}
				data={data}
				onStopSpinning={() => {
					setMustSpin(false)
				}}
			/>
			<Button onClick={handleStartSpinning}>SPIN</Button>
		</>
	)
}
