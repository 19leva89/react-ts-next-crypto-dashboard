import { WALLETS } from '@/modules/coins/schema'
import { WALLET_DISPLAY_NAMES } from '@/constants/wallet'

export const getWalletDisplayName = (wallet: keyof typeof WALLETS): string => {
	return WALLET_DISPLAY_NAMES[wallet] || wallet
}
