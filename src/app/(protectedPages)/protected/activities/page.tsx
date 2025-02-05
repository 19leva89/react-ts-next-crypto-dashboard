import dynamic from 'next/dynamic'
import { Metadata } from 'next'
import { Suspense } from 'react'

import { AddCrypto } from './_components/add-crypto'
import { AllCryptoPrices } from './_components/all-crypto-prices'
import { getUserCoinsList, getUserCryptos } from '@/app/api/actions'

// Lazy loading
const CryptoCard = dynamic(() => import('./_components/crypto-card'))

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
	let userCryptos, userCoins

	try {
		;[userCryptos, userCoins] = await Promise.all([getUserCryptos(), getUserCoinsList()])
	} catch (error) {
		console.error('Failed to fetch data:', error)

		return (
			<div className="flex justify-center items-center h-screen">
				<p className="text-red-500">Failed to load data. Please try again later.</p>
			</div>
		)
	}

	const cryptoData: CryptoData[] = userCryptos.map((userCoin) => ({
		coinId: userCoin.coin.id,
		name: userCoin.coin.coinsListIDMap.name,
		symbol: userCoin.coin.coinsListIDMap.symbol,
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
