import Image from 'next/image'
import { useTheme } from 'next-themes'

import { cn } from '@/lib'
import { TWallet } from '@/modules/coins/schema'
import { WALLET_DISPLAY_NAMES, WALLET_ICONS, WALLET_ICONS_DARK } from '@/constants/wallet'

interface Props {
	wallet: TWallet
	className?: string
}

export const WalletIcon = ({ wallet, className }: Props) => {
	const { theme } = useTheme()

	const isDark = theme === 'dark'

	const displayName = WALLET_DISPLAY_NAMES[wallet]
	const iconSrc = isDark ? WALLET_ICONS[wallet] : WALLET_ICONS_DARK[wallet]

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
