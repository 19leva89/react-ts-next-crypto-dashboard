import Image from 'next/image'

import { cn } from '@/lib'
import { TWallet } from '@/modules/coins/schema'
import { WALLET_DISPLAY_NAMES, WALLET_ICONS } from '@/constants/wallet'

interface Props {
	wallet: TWallet
	className?: string
}

export const WalletIcon = ({ wallet, className = 'size-5' }: Props) => {
	const isLedger = wallet === 'LEDGER'

	const iconSrc = WALLET_ICONS[wallet]
	const displayName = WALLET_DISPLAY_NAMES[wallet]

	return (
		<Image
			src={iconSrc}
			alt={`${displayName} icon`}
			width={24}
			height={24}
			onError={(e) => {
				e.currentTarget.src = '/svg/coin-not-found.svg'
			}}
			className={cn('flex-shrink-0', isLedger && 'dark:invert', className)}
		/>
	)
}
