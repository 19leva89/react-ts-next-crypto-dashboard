import { useState } from 'react'

import { ChartConfig } from '@/components/ui'
import { MONTH_OPTIONS } from '@/constants/chart'
import { MarketChartData, UserCoinData } from '@/app/api/types'

interface Props {
	coinData: UserCoinData[]
	totalInvestedValue: number
	totalValue: number
	plannedProfit: number
}

export const ChartsContainer = ({ coinData, totalInvestedValue, totalValue, plannedProfit }: Props) => {
	const [days, setDays] = useState<number>(1)
	const [coinMarketChartData, setCoinMarketChartData] = useState<MarketChartData>()

	const chartConfig = {
		prices: {
			label: 'Price',
			color: 'hsl(var(--chart-2))',
		},
	} satisfies ChartConfig

	// Sort transactions by date (oldest to newest)
	const sortedTransactions = [...coinData.flatMap((coin) => coin.transactions)].sort(
		(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
	)

	const formattedData =
		coinMarketChartData?.prices.map(([timestamp, price]) => {
			const date = new Date(timestamp)
			let label = ''

			switch (true) {
				case days === 1:
					// Show time, day and month for "1 day" (e.g., 15:45, 15 Mar)
					const hours = date.getHours().toString().padStart(2, '0')
					const minutes = date.getMinutes().toString().padStart(2, '0')
					const day = date.getDate()
					const month = MONTH_OPTIONS[date.getMonth()]
					label = `${hours}:${minutes}, ${day} ${month}`
					break

				case days <= 30:
					// Show day and month for "1 week" and "1 month" (e.g., 15 Mar)
					const monthDay = date.getDate()
					const monthName = MONTH_OPTIONS[date.getMonth()]
					label = `${monthDay} ${monthName}`
					break

				case days <= 365:
					// Show month and year for "1 year" (e.g., Mar 2025)
					const monthYear = MONTH_OPTIONS[date.getMonth()]
					const year = date.getFullYear()
					label = `${monthYear} ${year}`
					break

				default:
					// For other cases, use the year only (e.g., 2025)
					label = date.getFullYear().toString()
					break
			}

			// Find the current totalQuantity at this point in time
			const currentQuantity = sortedTransactions
				.filter((transaction) => new Date(transaction.date).getTime() <= timestamp)
				.reduce((sum, transaction) => sum + transaction.quantity, 0)

			return {
				Label: label,
				Price: price,
				TotalValue: currentQuantity * price, // Take the current number of coins and multiply it by the price
			}
		}) || []

	const minValue = Math.min(...formattedData.map((h) => h.TotalValue))
	const maxValue = Math.max(...formattedData.map((h) => h.TotalValue))

	return <div>ChartsContainer</div>
}
