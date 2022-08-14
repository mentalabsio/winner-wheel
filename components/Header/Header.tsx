/** @jsxImportSource theme-ui */
import Link from 'next/link'
import { Button, Container, Flex, Text, Box } from '@theme-ui/components'

import WalletManager from '@/components/WalletManager/WalletManager'
import { useState } from 'react'
import { CloseIcon, MenuIcon, MoonLogo, ProfileLogo, SunLogo } from '../icons'
import { useColorMode } from 'theme-ui'

const Header = () => {
	const [isMobileMenuActive, setIsMobileMenuActive] = useState(false)

	return (
		<Flex
			sx={{
				position: 'absolute',
				width: '100%',
				top: 0,
				zIndex: 9,
				background: 'transparent',
				alignItems: 'flex-end',
				justifyContent: 'flex-end',
				maxWidth: '1300px',
			}}
		>
			<Flex
				sx={{
					alignItems: 'center',
					justifyContent: 'flex-end',
					padding: '1.6rem 1.6rem 0',
					height: '8rem',
				}}
			>
				<Flex
					as='nav'
					sx={{
						gap: '1.6rem',
						display: 'none',
						alignItems: 'center',
						alignSelf: 'stretch',

						/** Mobile styles when the menu is active */
						...(isMobileMenuActive && {
							display: 'flex',
							position: 'fixed',
							flexDirection: 'column',
							alignItems: 'center',
							top: '0',
							left: '0',
							width: '100vw',
							height: '100vh',
							transition:
								'opacity 0.125s cubic-bezier(0.175, 0.885, 0.32, 1.275),visibility 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
							backgroundColor: 'background',
							zIndex: 99,

							'& > a': {
								marginBottom: '.8rem',
							},

							'&.active': {
								visibility: 'visible',
								opacity: 1,
							},
						}),

						/** Desktop styles (reset mobile) */
						'@media (min-width: 768px)': {
							display: 'flex',
							flexDirection: 'row',
							padding: 0,
							position: 'relative',
						},
					}}
				>
					<Flex
						sx={{
							alignSelf: 'stretch',
							justifyContent: 'flex-end',
							borderBottom: '1px solid',
							borderColor: 'background2',
							padding: '1.6rem',
							height: '8rem',
							alignItems: 'center',
							...(!isMobileMenuActive && { display: 'none' }),
						}}
					>
						<Button
							sx={{
								padding: '.8rem',
							}}
							onClick={() => setIsMobileMenuActive(false)}
						>
							<CloseIcon />
						</Button>
					</Flex>
					{/* Change theme-ui color mode */}
					<Flex
						sx={{
							alignItems: 'center',
							justifyContent: 'center',
							alignSelf: 'stretch',

							'&:hover': {
								borderBottomWidth: '1px',
								borderBottomStyle: 'solid',
								borderBottomColor: 'text',
							},
						}}
					></Flex>
					{/* Finish menu items */}
					<WalletManager />
				</Flex>
				<Button
					sx={{
						padding: '.8rem',
						'@media(min-width: 768px)': {
							display: 'none',
						},
					}}
					onClick={() => setIsMobileMenuActive(true)}
				>
					<MenuIcon />
				</Button>
			</Flex>
		</Flex>
	)
}

export default Header
