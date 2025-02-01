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

	// Получаем данные для всех монет параллельно
	const coinDataPromises = userCryptos.map((userCoin) => fetchCoinData(userCoin.coin.coinId))
	const coinDataResults = await Promise.all(coinDataPromises)

	const cryptoData = userCryptos.map((userCoin, index) => {
		const coinData = coinDataResults[index]
		if (!coinData) {
			console.warn(`Failed to fetch data for coinId: ${userCoin.coin.coinId}`)
			return null
		}

		return {
			coinId: userCoin.coinId,
			name: coinData.name,
			symbol: coinData.symbol,
			currentPrice: coinData.market_data.current_price.usd,
			image: coinData.image.thumb ?? '/svg/coin-not-found.svg',
			quantity: userCoin.quantity,
		}
	})

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
				{cryptoData.length === 0 && (
					<h2 className="flex justify-center w-full">No cryptos added. Add your first crypto!</h2>
				)}

				{validCryptoData.map((crypto) => {
					const { coinId, name, symbol, currentPrice, quantity, image } = crypto

					return (
						<CryptoCard
							key={coinId}
							coinId={coinId}
							name={name}
							symbol={symbol}
							currentPrice={currentPrice}
							quantity={quantity}
							image={image}
						/>
					)
				})}
			</div>
		</div>
	)
}

export default ActivitiesPage
