import { constructMetadata } from '@/lib'
import { getUserCoinsList } from '@/app/api/actions'
import { formatPrice } from '@/constants/format-price'
import { UserChartDataPoint, UserCoinData } from '@/app/api/types'
import { PieChartContainer } from './_components/pie-chart-container'
import { LineChartContainer } from './_components/line-chart-container'

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

	// Calculate the line chart data
	const lineChartData = processSparklineData(coinData)

	// Calculate the pie chart data
	const portfolioData = coinData
		.map((coin) => {
			const coinValue = coin.current_price * coin.total_quantity

			return {
				name: coin.name,
				value: coinValue,
				symbol: coin.symbol,
				percentage: totalPortfolioValue > 0 ? (coinValue / totalPortfolioValue) * 100 : 0,
			}
		})
		.filter((item) => item.value > 0) // Filter out coins with zero value
		.sort((a, b) => b.value - a.value)

	// Split into top 11 and others
	const top11 = portfolioData.slice(0, 11)
	const others = portfolioData.slice(11)
	const othersTotal = others.reduce((sum, item) => sum + item.value, 0)

	const pieChartData = [
		...top11,
		...(othersTotal > 0
			? [
					{
						name: 'Other',
						value: othersTotal,
						symbol: 'Other',
						percentage: (othersTotal / totalPortfolioValue) * 100,
					},
				]
			: []),
	].map((item, index) => ({
		...item,
		fill: index < 11 ? `hsl(var(--chart-${index + 1}))` : 'hsl(var(--color-other))',
	}))

	return (
		<div className="flex flex-col gap-4 mx-0 xl:mx-10 2xl:mx-20 3xl:mx-30">
			<div className="flex flex-row items-center gap-3 max-[600px]:flex-col max-[600px]:items-start max-[600px]:gap-1">
				<p>Total invested: ${formatPrice(totalInvestedValue, false)}</p>

				<p>Total value: ${formatPrice(totalPortfolioValue, false)}</p>

				<p>Planned profit: ${formatPrice(plannedProfit, false)}</p>
			</div>

			{/* Charts */}
			<div className="flex flex-row gap-4 max-[1200px]:flex-col max-[1200px]:items-center">
				<LineChartContainer chartData={lineChartData} />

				<PieChartContainer chartData={pieChartData} />
			</div>
		</div>
	)
}

export default ChartsPage
