/** @jsxImportSource theme-ui */
import Head from 'next/head'

import { Heading, Text } from '@theme-ui/components'

import Header from '@/components/Header/Header'
import Roulette from '@/components/Roulette/Roulette'

export default function Home() {
	return (
		<>
			<Head>
				<title>Winner Wheel</title>
				<meta
					name='description'
					content='Spin and try your best luck on the official Winner Wheel game.'
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
					marginTop: '4rem',
				}}
			>
				<Roulette />
			</main>

			<footer
				sx={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					margin: '4rem 0',
				}}
			>
				Powered by
				<a
					href='https://twitter.com/mentaworks'
					target='_blank'
					rel='noopener noreferrer'
					sx={{
						display: 'flex',
						alignItems: 'center',
						marginLeft: '0.2em',
					}}
				>
					<Text
						variant='small'
						sx={{
							display: 'flex',
							alignItems: 'center',
						}}
					>
						menta.works
					</Text>
				</a>
			</footer>
		</>
	)
}
