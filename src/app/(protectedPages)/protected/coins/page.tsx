import { constructMetadata } from '@/lib'
import { getUserCoinsList } from '@/app/api/actions'
import { CoinsContainer } from './_components/container'

export const metadata = constructMetadata({ title: 'Coins' })

// The page must be rendered on the server side
export const dynamic = 'force-dynamic'

const CoinsPage = async () => {
	const userCoins = await getUserCoinsList()

	const coinData = userCoins.map((userCoin) => ({
		coinId: userCoin.coin.id,
		name: userCoin.coinsListIDMap.name,
		symbol: userCoin.coinsListIDMap.symbol,
		current_price: userCoin.coin.current_price as number,
		total_quantity: userCoin.total_quantity,
		total_cost: userCoin.total_cost,
		average_price: userCoin.average_price,
		desired_sell_price: userCoin.desired_sell_price as number,
		image: userCoin.coin.image as string,
		sparkline_in_7d: userCoin.coin.sparkline_in_7d as { price: number[] },
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
		return total + coin.total_cost
	}, 0)

	// Calculate the total value of the portfolio
	const totalPortfolioValue = coinData.reduce((total, coin) => {
		return total + coin.current_price * coin.total_quantity
	}, 0)

	// Calculate the total future profit of the portfolio
	const plannedProfit = coinData.reduce((total, coin) => {
		return total + coin.desired_sell_price * coin.total_quantity
	}, 0)

	return (
		<CoinsContainer
			coinData={coinData}
			totalInvestedValue={totalInvestedValue}
			totalValue={totalPortfolioValue}
			plannedProfit={plannedProfit}
		/>
	)
}

export default CoinsPage
