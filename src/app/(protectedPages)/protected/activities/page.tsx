import { Metadata } from 'next'

import { getUserCoinsList } from '@/app/api/actions'
import { AddCrypto } from './_components/add-crypto'
import { CryptoCard } from './_components/crypto-card'
import { AllCryptoPrices } from './_components/all-crypto-prices'

export const metadata: Metadata = {
	title: 'Activities',
}

// The page must be rendered on the server side
export const dynamic = 'force-dynamic'

const ActivitiesPage = async () => {
	const userCryptos = await getUserCoinsList()

	const cryptoData = userCryptos.map((userCoin) => ({
		coinId: userCoin.coin.id,
		name: userCoin.coinsListIDMap.name,
		symbol: userCoin.coinsListIDMap.symbol,
		currentPrice: userCoin.coin.current_price as number,
		quantity: userCoin.quantity as number,
		image: userCoin.coin.image as string,
	}))

	// Вычисляем общую стоимость портфеля
	const totalPortfolioValue = cryptoData.reduce((total, crypto) => {
		return total + crypto.currentPrice * crypto.quantity
	}, 0)

	return (
		<div className="flex flex-col w-full">
			<div className="flex items-center justify-between">
				<AllCryptoPrices totalValue={totalPortfolioValue} />

				<AddCrypto />
			</div>

			<div className="flex flex-raw flex-wrap gap-4 items-start justify-start w-full p-6">
				{cryptoData.length === 0 && (
					<h2 className="flex justify-center w-full">No cryptos added. Add your first crypto!</h2>
				)}

				{cryptoData
					.sort((a, b) => b.currentPrice - a.currentPrice)
					.map((coin) => {
						return <CryptoCard key={coin.coinId} coin={coin} />
					})}
			</div>
		</div>
	)
}

export default ActivitiesPage
