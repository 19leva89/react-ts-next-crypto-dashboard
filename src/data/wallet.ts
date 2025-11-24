import { WALLETS } from '@/modules/coins/schema'

export const getWalletDisplayName = (wallet: keyof typeof WALLETS): string => {
	return WALLETS[wallet]
}
