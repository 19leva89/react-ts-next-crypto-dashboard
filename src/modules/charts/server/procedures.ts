import {
	portfolioChartResponseSchema,
	UserChartDataPoint,
	type PortfolioChartResponse,
} from '@/modules/charts/schema'
import { getUserCoinsList } from '@/data/user'
import { UserCoinData } from '@/modules/coins/schema'
import { createTRPCRouter, protectedProcedure } from '@/trpc/init'

const processSparklineData = (coins: UserCoinData[]): UserChartDataPoint[] => {
	if (!coins.length) return []

	const validCoins = coins.filter((coin) => coin.sparkline_in_7d?.price?.length > 0)
	if (validCoins.length === 0) return []

	const minDataLength = Math.min(...validCoins.map((coin) => coin.sparkline_in_7d.price.length))
	const now = Date.now()
	const weekAgo = now - 7 * 24 * 60 * 60 * 1000
	const interval = (now - weekAgo) / (minDataLength - 1)

	return Array.from({ length: minDataLength }, (_, i) => {
		const timestamp = new Date(weekAgo + i * interval)
		const value = validCoins.reduce((total, coin) => {
			const price = coin.sparkline_in_7d.price[i]
			return total + price * coin.total_quantity
		}, 0)
		return { timestamp, value }
	})
}

export const chartsRouter = createTRPCRouter({
	getPortfolioData: protectedProcedure
		.output(portfolioChartResponseSchema)
		.query(async (): Promise<PortfolioChartResponse> => {
			const userCoins = await getUserCoinsList()

			const coinData = userCoins.map((userCoin) => ({
				coinId: userCoin.coin.id,
				name: userCoin.coinsListIDMap.name,
				symbol: userCoin.coinsListIDMap.symbol,
				current_price: userCoin.coin.current_price as number,
				image: userCoin.coin.image as string,
				sparkline_in_7d: userCoin.coin.sparkline_in_7d as { price: number[] },
				price_change_percentage_7d_in_currency: userCoin.coin
					.price_change_percentage_7d_in_currency as number,
				total_quantity: userCoin.total_quantity,
				total_cost: userCoin.total_cost,
				average_price: userCoin.average_price,
				desired_sell_price: userCoin.desired_sell_price as number,
				transactions: userCoin.transactions.map((transaction) => ({
					id: transaction.id,
					quantity: transaction.quantity,
					price: transaction.price,
					date: transaction.date.toISOString(),
					userCoinId: transaction.userCoinId,
				})),
			}))

			const totalInvestedValue = coinData.reduce((total, coin) => total + coin.total_cost, 0)
			const totalPortfolioValue = coinData.reduce(
				(total, coin) => total + coin.current_price * coin.total_quantity,
				0,
			)
			const plannedProfit = coinData.reduce(
				(total, coin) => total + coin.desired_sell_price * coin.total_quantity,
				0,
			)

			const lineChartData = processSparklineData(coinData).map((point) => ({
				...point,
				timestamp: point.timestamp.toISOString(),
			}))

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
				.filter((item) => item.value > 0)
				.sort((a, b) => b.value - a.value)

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
								percentage: totalPortfolioValue > 0 ? (othersTotal / totalPortfolioValue) * 100 : 0,
							},
						]
					: []),
			].map((item, index) => ({
				...item,
				fill: index < 11 ? `hsl(var(--chart-${index + 1}))` : 'hsl(var(--color-other))',
			}))

			return {
				totalInvestedValue,
				totalPortfolioValue,
				plannedProfit,
				lineChartData,
				pieChartData,
			}
		}),
})
