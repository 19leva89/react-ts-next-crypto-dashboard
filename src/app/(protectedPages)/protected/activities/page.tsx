import { Metadata } from 'next'

import { AddCrypto } from './_components/add-crypto'
import { CryptoCard } from './_components/crypto-card'
import { AllCryptoPrices } from './_components/all-crypto-prices'
import { fetchCoinsListIDMap, fetchUserCoinsList, getUserCryptos } from '@/app/api/actions'

export const metadata: Metadata = {
	title: 'Activities',
}

// The page must be rendered on the server side
export const dynamic = 'force-dynamic'

const ActivitiesPage = async () => {
	const coinsList = await fetchCoinsListIDMap()
	const userCryptos = await getUserCryptos()
	await fetchUserCoinsList()

	const cryptoData = userCryptos.map((userCoin) => ({
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

				<AddCrypto initialCoins={coinsList} />
			</div>

			<div className="flex flex-raw flex-wrap gap-4 items-start justify-start w-full p-6">
				{cryptoData.length === 0 && (
					<h2 className="flex justify-center w-full">No cryptos added. Add your first crypto!</h2>
				)}

				{cryptoData.map((crypto) => {
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
