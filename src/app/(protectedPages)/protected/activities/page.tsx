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
		totalQuantity: userCoin.total_quantity,
		totalCost: userCoin.total_cost,
		averagePrice: userCoin.average_price,
		sellPrice: userCoin.desired_sell_price as number,
		image: userCoin.coin.image as string,
		transactions: userCoin.transactions.map((transaction) => ({
			id: transaction.id,
			quantity: transaction.quantity,
			price: transaction.price,
			date: transaction.date,
			userCoinId: transaction.userCoinId,
		})),
	}))

	// Calculate the total invested value of the portfolio
	const totalInvestedValue = cryptoData.reduce((total, crypto) => {
		return total + crypto.totalCost
	}, 0)

	// Calculate the total value of the portfolio
	const totalPortfolioValue = cryptoData.reduce((total, crypto) => {
		return total + crypto.currentPrice * crypto.totalQuantity
	}, 0)

	// Calculate the total future profit of the portfolio
	const plannedProfit = cryptoData.reduce((total, crypto) => {
		return total + crypto.sellPrice * crypto.totalQuantity
	}, 0)

	return (
		<ActivitiesContainer
			cryptoData={cryptoData}
			totalInvestedValue={totalInvestedValue}
			totalValue={totalPortfolioValue}
			plannedProfit={plannedProfit}
		/>
	)
}

export default ActivitiesPage
