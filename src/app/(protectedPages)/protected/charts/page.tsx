import { constructMetadata } from '@/lib'
import { getUserCoinsList } from '@/app/api/actions'
import { ChartsContainer } from './_components/container'
import { UserChartDataPoint, UserCoinData } from '@/app/api/types'

export const metadata = constructMetadata({ title: 'Charts' })

// The page must be rendered on the server side
export const dynamic = 'force-dynamic'

const ChartsPage = async () => {
	const userCoins = await getUserCoinsList()

	const processSparklineData = (coins: UserCoinData[]): UserChartDataPoint[] => {
		if (!coins.length) return []

		// Filter out coins without sparkline data
		const validCoins = coins.filter((coin) => coin.sparkline_in_7d?.price?.length > 0)

		if (validCoins.length === 0) return []

		// Find the minimum length of the sparkline data
		const minDataLength = Math.min(...validCoins.map((coin) => coin.sparkline_in_7d.price.length))

		// Create an array of timestamps (7 days ago - now)
		const now = Date.now()
		const weekAgo = now - 7 * 24 * 60 * 60 * 1000
		const interval = (now - weekAgo) / (minDataLength - 1)

		return Array.from({ length: minDataLength }, (_, i) => {
			const timestamp = new Date(weekAgo + i * interval)

			// Calculate the total value of the coin at the current time
			const value = validCoins.reduce((total, coin) => {
				const price = coin.sparkline_in_7d.price[i]
				return total + price * coin.total_quantity
			}, 0)

			return { timestamp, value }
		})
	}

	const coinData = userCoins.map((userCoin) => ({
		coinId: userCoin.coin.id,
		name: userCoin.coinsListIDMap.name,
		symbol: userCoin.coinsListIDMap.symbol,
		current_price: userCoin.coin.current_price as number,
		image: userCoin.coin.image as string,
		sparkline_in_7d: userCoin.coin.sparkline_in_7d as { price: number[] },
		price_change_percentage_7d_in_currency: userCoin.coin.price_change_percentage_7d_in_currency as number,
		total_quantity: userCoin.total_quantity,
		total_cost: userCoin.total_cost,
		average_price: userCoin.average_price,
		desired_sell_price: userCoin.desired_sell_price as number,
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

	// Calculate the chart data
	const chartData = processSparklineData(coinData)

	return (
		<ChartsContainer
			coinData={coinData}
			chartData={chartData}
			totalInvestedValue={totalInvestedValue}
			totalValue={totalPortfolioValue}
			plannedProfit={plannedProfit}
		/>
	)
}

export default ChartsPage
