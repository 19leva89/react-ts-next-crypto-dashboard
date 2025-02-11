import { constructMetadata } from '@/lib'
import { getUserCoinsList } from '@/app/api/actions'
import { ActivitiesContainer } from './_components/activities-container'

export const metadata = constructMetadata({ title: 'Activities' })

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
		buyPrice: userCoin.buy_price as number,
		sellPrice: userCoin.sell_price as number,
		image: userCoin.coin.image as string,
	}))

	// Calculate the total value of the portfolio
	const totalPortfolioValue = cryptoData.reduce((total, crypto) => {
		return total + crypto.currentPrice * crypto.quantity
	}, 0)

	// Calculate the total future profit of the portfolio
	const plannedProfit = cryptoData.reduce((total, crypto) => {
		return total + (crypto.sellPrice - crypto.buyPrice) * crypto.quantity
	}, 0)

	return (
		<ActivitiesContainer
			cryptoData={cryptoData}
			totalValue={totalPortfolioValue}
			plannedProfit={plannedProfit}
		/>
	)
}

export default ActivitiesPage
