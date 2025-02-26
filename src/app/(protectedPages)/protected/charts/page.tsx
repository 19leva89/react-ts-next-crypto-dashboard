import { constructMetadata } from '@/lib'
import { getUserCoinsList } from '@/app/api/actions'
import { ChartsContainer } from './_components/container'

export const metadata = constructMetadata({ title: 'Charts' })

// The page must be rendered on the server side
export const dynamic = 'force-dynamic'

const ChartsPage = async () => {
	const userCoins = await getUserCoinsList()

	const coinData = userCoins.map((userCoin) => ({
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
	const totalInvestedValue = coinData.reduce((total, coin) => {
		return total + coin.totalCost
	}, 0)

	// Calculate the total value of the portfolio
	const totalPortfolioValue = coinData.reduce((total, coin) => {
		return total + coin.currentPrice * coin.totalQuantity
	}, 0)

	// Calculate the total future profit of the portfolio
	const plannedProfit = coinData.reduce((total, coin) => {
		return total + coin.sellPrice * coin.totalQuantity
	}, 0)

	return (
		<ChartsContainer
			coinData={coinData}
			totalInvestedValue={totalInvestedValue}
			totalValue={totalPortfolioValue}
			plannedProfit={plannedProfit}
		/>
	)
}

export default ChartsPage
