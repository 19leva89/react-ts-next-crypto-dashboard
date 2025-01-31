import { Metadata } from 'next'

import { auth } from '@/auth'
import { CoinData, CoinListData } from '@/app/api/types'
import { fetchCoinData, fetchCoinsList, getUserCryptos } from '@/app/api/actions'
import { AddCrypto } from './_components/add-crypto'
import { CryptoCard } from './_components/crypto-card'
import { AllCryptoPrices } from './_components/all-crypto-prices'

export const metadata: Metadata = {
	title: 'Activities',
}

const ActivitiesPage = async () => {
	const session = await auth()

	// Проверяем, авторизован ли пользователь
	if (!session?.user) {
		throw new Error('User not authenticated')
	}

	const userCryptos = (await getUserCryptos()) ?? ({} as CoinData)
	const coinsList = (await fetchCoinsList()) ?? ([] as CoinListData)

	const cryptoData = await Promise.all(
		userCryptos.map(async (userCoin) => {
			if (userCoin.coin.coinId === null) {
				console.warn(`Skipping crypto with null coinId: ${userCoin.coin.key}`)
				return null
			}

			const coinData = await fetchCoinData(userCoin.coin.coinId)
			if (!coinData) {
				console.warn(`Failed to fetch data for coinId: ${userCoin.coin.coinId}`)
				return null
			}

			return {
				name: coinData.name ?? 'Unknown',
				symbol: coinData.symbol ?? 'UNK',
				currentPrice: coinData.market_data?.current_price?.usd ?? 0,
				image: coinData.image?.thumb ?? '/svg/coin-not-found.svg',
				quantity: userCoin.quantity,
			}
		}),
	)

	// Фильтруем null значения
	const filteredCryptoData = cryptoData.filter((crypto) => crypto !== null)

	// Вычисляем общую стоимость портфеля
	const totalPortfolioValue = filteredCryptoData.reduce((total, crypto) => {
		return total + (crypto?.currentPrice ?? 0) * (crypto?.quantity ?? 0)
	}, 0)

	return (
		<div className="flex flex-col w-full">
			<div className="flex items-center justify-between">
				<AllCryptoPrices totalValue={totalPortfolioValue} />

				<AddCrypto initialCoins={coinsList} />
			</div>

			<div className="flex flex-raw flex-wrap gap-4 items-start justify-start w-full p-6">
				{cryptoData.map((crypto, index) => (
					<CryptoCard
						key={index}
						name={crypto?.name ?? 'Unknown'}
						symbol={crypto?.symbol ?? 'UNK'}
						currentPrice={crypto?.currentPrice ?? 0}
						quantity={crypto?.quantity ?? 0}
						image={crypto?.image ?? '/svg/coin-not-found.svg'}
					/>
				))}
			</div>
		</div>
	)
}

export default ActivitiesPage
