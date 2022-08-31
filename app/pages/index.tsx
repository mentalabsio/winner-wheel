/** @jsxImportSource theme-ui */
import Head from 'next/head'

import Header from '@/components/Header/Header'
import Roulette from '@/components/Roulette/Roulette'
import { BetOptions } from '@/components/BetOptions/BetOptions'
import { useState } from 'react'
import { Button, Flex } from 'theme-ui'

export default function Home() {
	const [selectedBet, setSelectedBet] = useState<number>(0.05)
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
				<Roulette selectedBet={selectedBet} />
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
					<Button variant='secondary'>SPIN</Button>
				</Flex>
			</main>
		</>
	)
}
