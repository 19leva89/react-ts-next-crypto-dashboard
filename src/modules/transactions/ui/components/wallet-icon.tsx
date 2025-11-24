import Image from 'next/image'
import { useTheme } from 'next-themes'

import { cn } from '@/lib'
import { TWallet, WALLETS } from '@/modules/coins/schema'
import { WALLET_ICONS, WALLET_ICONS_DARK } from '@/constants/wallet'

interface Props {
	wallet: TWallet
	className?: string
}

export const WalletIcon = ({ wallet, className }: Props) => {
	const { theme } = useTheme()

	const isDark = theme === 'dark'
	const key = wallet as keyof typeof WALLETS

	const displayName = WALLETS[key]
	const iconSrc = isDark ? WALLET_ICONS[key] : WALLET_ICONS_DARK[key]

	return (
		<Image
			src={iconSrc}
			alt={`${displayName} icon`}
			width={24}
			height={24}
			onError={(e) => (e.currentTarget.src = '/svg/coin-not-found.svg')}
			className={cn('size-5 shrink-0', className)}
		/>
	)
}
