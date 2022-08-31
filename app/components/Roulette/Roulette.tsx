import useWinnerWheel from '@/hooks/useWinnerWheel'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
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
	id: number
	option: string
	style?: StyleType
}

export interface RouletteProps {
	selectedBet: number
	prizeNumber: number
	mustSpin: boolean
	setMustSpin: Dispatch<SetStateAction<boolean>>
	data: WheelData[]
}

export default (props: RouletteProps) => {
	const { selectedBet, prizeNumber, mustSpin, setMustSpin, data } = props
	return (
		<>
			<Flex
				sx={{
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
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
