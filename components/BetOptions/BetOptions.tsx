import { getGradient } from '@/styles/theme'
import { Dispatch, SetStateAction } from 'react'
import { Button, Flex } from 'theme-ui'

const betOptions = [0.05, 0.1, 0.25, 0.5, 1]

export interface BetOptionsProps {
	selectedBet: number
	setSelectedBet: Dispatch<SetStateAction<number>>
}

export const BetOptions = ({
	selectedBet,
	setSelectedBet,
}: BetOptionsProps) => {
	return (
		<Flex
			sx={{
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: 'center',
				flexWrap: 'wrap',
				maxWidth: '26rem',
			}}
		>
			{betOptions.map((value) => (
				<Button
					sx={{
						marginRight: '2rem',
						marginBottom: '1rem',
						color: '#000',
						background: getGradient('rgb(213, 184, 255)'),
						border: 'none',
					}}
				>
					{value} SOL
				</Button>
			))}
		</Flex>
	)
}
