import { Metadata } from 'next'
import { Suspense } from 'react'

import { getUserCoinsList } from '@/app/api/actions'
import { AddCrypto } from './_components/add-crypto'
import { CryptoCard } from './_components/crypto-card'
import { AllCryptoPrices } from './_components/all-crypto-prices'

export const metadata: Metadata = {
	title: 'Activities',
}

interface CryptoData {
	coinId: string
	name: string
	symbol: string
	currentPrice: number
	quantity: number
	image: string
}

const ActivitiesPage = async () => {
	const userCoins = await getUserCoinsList()

	const cryptoData: CryptoData[] = userCoins.map((coin) => ({
		coinId: coin.coin.id,
		name: coin.coinsListIDMap.name,
		symbol: coin.coinsListIDMap.symbol,
		currentPrice: coin.coin.current_price as number,
		quantity: coin.quantity as number,
		image: coin.coin.image as string,
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

			<Suspense fallback={<div>Loading cryptos...</div>}>
				<div className="flex flex-row flex-wrap gap-4 items-start justify-start w-full p-6">
					{cryptoData.length === 0 ? (
						<div className="flex flex-col items-center justify-center w-full py-12">
							<h2 className="text-xl font-semibold text-gray-600 mb-4">No cryptos added yet</h2>

							<p className="text-gray-500 mb-6">
								Start by adding your first cryptocurrency to track its performance
							</p>
						</div>
					) : (
						cryptoData
							.sort((a, b) => b.currentPrice * b.quantity - a.currentPrice * a.quantity)
							.map((crypto) => <CryptoCard key={crypto.coinId} {...crypto} />)
					)}
				</div>
			</Suspense>
		</div>
	)
}

export default ActivitiesPage
