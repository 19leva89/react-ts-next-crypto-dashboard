import { Metadata } from 'next'

import { AddCrypto } from './_components/add-crypto'
import { CryptoCard } from './_components/crypto-card'
import { AllCryptoPrices } from './_components/all-crypto-prices'
import { fetchCoinData, fetchCoinsList, getUserCryptos } from '@/app/api/actions'

export const metadata: Metadata = {
	title: 'Activities',
}

const ActivitiesPage = async () => {
	const userCryptos = await getUserCryptos()
	const coinsList = await fetchCoinsList()

	const cryptoData = await Promise.all(
		userCryptos.map(async (userCoin) => {
			const coinData = await fetchCoinData(userCoin.coin.coinId)
			if (!coinData) {
				console.warn(`Failed to fetch data for coinId: ${userCoin.coin.coinId}`)
				return null
			}

			return {
				name: coinData.name,
				symbol: coinData.symbol,
				currentPrice: coinData.market_data.current_price.usd,
				image: coinData.image.thumb ?? '/svg/coin-not-found.svg',
				quantity: userCoin.quantity,
			}
		}),
	)

	// Фильтруем null значения из cryptoData
	const validCryptoData = cryptoData.filter((crypto) => crypto !== null)

	// Вычисляем общую стоимость портфеля
	const totalPortfolioValue = validCryptoData.reduce((total, crypto) => {
		return total + crypto.currentPrice * crypto.quantity
	}, 0)

	return (
		<div className="flex flex-col w-full">
			<div className="flex items-center justify-between">
				<AllCryptoPrices totalValue={totalPortfolioValue} />

				<AddCrypto initialCoins={coinsList} />
			</div>

			<div className="flex flex-raw flex-wrap gap-4 items-start justify-start w-full p-6">
				{validCryptoData.map((crypto, index) => (
					<CryptoCard
						key={index}
						name={crypto.name}
						symbol={crypto.symbol}
						currentPrice={crypto.currentPrice}
						quantity={crypto.quantity}
						image={crypto.image}
					/>
				))}
			</div>
		</div>
	)
}

export default ActivitiesPage
