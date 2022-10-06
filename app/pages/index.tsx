/** @jsxImportSource theme-ui */
import Head from 'next/head'

import Header from '@/components/Header/Header'
import Roulette from '@/components/Roulette/Roulette'
import { BetOptions } from '@/components/BetOptions/BetOptions'
import { useEffect, useState } from 'react'
import { Box, Button, Flex } from 'theme-ui'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import useWinnerWheel from '@/hooks/useWinnerWheel'
import { findBetProofAddress } from 'lib/pda'
import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import { BetProof } from 'lib/gen/accounts'
import { message } from 'antd'
import { data } from 'static/rouletteDataConfig'

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

const buttonMessageType = {
	Triplicate: 'CLAIM',
	Duplicate: 'CLAIM',
	Retry: 'CLAIM',
	LoseAll: 'Start over',
}

export default function Home() {
	const { publicKey } = useWallet()
	const { connection } = useConnection()
	const { createBetProof, claimBet } = useWinnerWheel()
	const [selectedBet, setSelectedBet] = useState<number>(0.05)
	const [prizeNumber, setPrizeNumber] = useState(0)
	const [mustSpin, setMustSpin] = useState(false)
	const [betProofAccountState, setBetProofAccountState] =
		useState<BetProof | null>(null)
	const [refetchTrigger, setRefetchTrigger] = useState<boolean>(false)
	const [isButtonHidden, setIsButtonHidden] = useState<boolean>(false)

	console.log(refetchTrigger)

	useEffect(() => {
		const getBetProofAccount = async () => {
			if (!publicKey) return null
			const betProof = findBetProofAddress({
				user: publicKey,
				house: new PublicKey(process.env.NEXT_PUBLIC_HOUSE_PUBLIC_KEY),
			})

			const betProofAccount = await BetProof.fetch(connection, betProof)
			setBetProofAccountState(betProofAccount)
		}
		getBetProofAccount()
	}, [publicKey, refetchTrigger])

	const handleStartSpinning = async () => {
		if (!publicKey) return null

		setIsButtonHidden(true)

		const balance = await connection.getBalance(publicKey)

		if (selectedBet > balance / LAMPORTS_PER_SOL) {
			message.error('User has insufficient balance.')
			setIsButtonHidden(false)
			return null
		}

		const createdBetProof = await createBetProof(selectedBet)

		if (createdBetProof.error) {
			message.error(createdBetProof.error)
			setIsButtonHidden(false)
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
			setIsButtonHidden(false)
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
			setRefetchTrigger(!refetchTrigger)
			setIsButtonHidden(false)
		}, 11000)
		console.log('winner option:', data[parsedResult])
	}

	const handleClaim = async (e: any) => {
		const result = await claimBet()
		if (result.error) {
			message.error(result.error)
			setTimeout(() => {
				setRefetchTrigger(!refetchTrigger)
				setIsButtonHidden(false)
			}, 11000)
			return null
		}

		e.target.innerText === 'Start over'
			? message.info('You have closed your bet.')
			: message.info('You have claimed your reward.')
		setIsButtonHidden(true)
		setTimeout(() => {
			setRefetchTrigger(!refetchTrigger)
			setIsButtonHidden(false)
		}, 11000)
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
					backgroundPosition: 'unset',
					backgroundSize: 'cover',
					padding: '15px',
					backgroundImage: 'url(images/background4.jpeg)',
					backgroundRepeat: 'no-repeat',
					paddingBottom: '100px',
					backgroundRepeatY: 'repeat',
					minHeight: '100vh',
				}}
			>
				<Box
					sx={{
						zIndex: '2',
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
						{
							<Button
								variant='secondary'
								onClick={
									betProofAccountState
										? (e) => handleClaim(e)
										: () => handleStartSpinning()
								}
								disabled={isButtonHidden}
								sx={{
									':disabled': {},
								}}
							>
								{betProofAccountState
									? buttonMessageType[betProofAccountState.toJSON().result.kind]
									: 'SPIN'}
							</Button>
						}
					</Flex>
				</Box>
			</main>
		</>
	)
}
