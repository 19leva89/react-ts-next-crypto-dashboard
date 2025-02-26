'use client'

import { useState } from 'react'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'

import { UserCoinData } from '@/app/api/types'
import { formatPrice } from '@/constants/format-price'
import { DAY_OPTIONS, MONTH_OPTIONS } from '@/constants/chart'
import { Button, ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui'

interface Props {
	coinData: UserCoinData[]
	totalInvestedValue: number
	totalValue: number
	plannedProfit: number
}

export const ChartsContainer = ({ coinData, totalInvestedValue, totalValue, plannedProfit }: Props) => {
	const [days, setDays] = useState<number>(1)

	const chartConfig = {
		prices: {
			label: 'Price',
			color: 'hsl(var(--chart-2))',
		},
	} satisfies ChartConfig

	const sortedTransactions = coinData
		.flatMap((coin) => coin.transactions)
		.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

	const generateTimePointsAndValues = () => {
		const timePoints: { timestamp: number; totalValue: number }[] = []
		const interval = days === 1 ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000
		const totalSteps = days === 1 ? 24 : days

		for (let i = totalSteps - 1; i >= 0; i--) {
			const timestamp = Date.now() - i * interval

			let totalValue = 0

			coinData.forEach((coin) => {
				// Filter transactions by coin and date
				const coinTransactions = sortedTransactions.filter(
					(tx) => tx.userCoinId === coin.coinId && new Date(tx.date).getTime() <= timestamp,
				)

				// Calculate total quantity
				const totalQuantity = coinTransactions.reduce((sum, tx) => sum + tx.quantity, 0)

				// Calculate total value
				totalValue += totalQuantity * coin.currentPrice
			})

			timePoints.push({ timestamp, totalValue })
		}

		return timePoints
	}

	const formattedData =
		generateTimePointsAndValues().map(({ timestamp, totalValue }) => {
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

			return {
				Label: label,
				TotalValue: totalValue,
			}
		}) || []

	const minValue = Math.min(...formattedData.map((h) => h.TotalValue))
	const maxValue = Math.max(...formattedData.map((h) => h.TotalValue))

	return (
		<div className="flex flex-col gap-4 mx-72 max-[1700px]:mx-40 max-[1500px]:mx-20 max-[1300px]:mx-10 max-[1200px]:mx-0">
			<div className="flex flex-row items-center gap-3 max-[600px]:flex-col max-[600px]:items-start max-[600px]:gap-1">
				<p>Total invested: ${formatPrice(totalInvestedValue, false)}</p>

				<p>Total value: ${formatPrice(totalValue, false)}</p>

				<p>Planned profit: ${formatPrice(plannedProfit, false)}</p>
			</div>

			{/* Chart */}
			<div>
				<div className="flex items-center justify-center gap-2 m-4 mb-2">
					{DAY_OPTIONS.map(({ label, value }) => (
						<Button
							key={value}
							variant="outline"
							onClick={() => setDays(value)}
							className={`px-2 py-1 h-6 rounded-xl ${days === value ? 'bg-blue-500 hover:bg-blue-500' : ''}`}
						>
							{/* Full text for screens > 640px */}
							<span className="hidden sm:inline">{label}</span>

							{/* Shortened text for screens < 640px */}
							<span className="inline sm:hidden">
								{label === '1 day' ? '1d' : label === '1 week' ? '1w' : label === '1 month' ? '1m' : '1y'}
							</span>
						</Button>
					))}
				</div>

				<ChartContainer config={chartConfig} style={{ overflow: 'hidden' }}>
					<LineChart
						accessibilityLayer
						data={formattedData}
						margin={{
							left: 12,
							right: 12,
						}}
					>
						{/* Grid */}
						<CartesianGrid vertical={true} strokeDasharray="4 4" />

						{/* Axis X */}
						<XAxis
							dataKey="Label"
							tickLine={false}
							axisLine={false}
							tick={true}
							tickMargin={10}
							tickFormatter={(value) => value}
						/>

						{/* Axis Y */}
						<YAxis
							dataKey="TotalValue"
							domain={[minValue * 0.98, maxValue * 1.02]}
							axisLine={false}
							tickLine={false}
							tick={true}
							tickMargin={4}
							tickFormatter={(value) => {
								if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
								if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
								if (value >= 1) return value.toFixed(2)

								return value.toFixed(5)
							}}
						/>

						{/* Popup tooltip */}
						<ChartTooltip
							cursor={true}
							content={
								<ChartTooltipContent
									formatter={(value, name) => {
										const numericValue = typeof value === 'number' ? value : parseFloat(value as string)

										const formattedValue =
											!isNaN(numericValue) && numericValue >= 1
												? numericValue.toFixed(2)
												: numericValue.toFixed(5)

										if (name === 'TotalValue') return ['Total value: ', formattedValue]
										return [name, formattedValue]
									}}
								/>
							}
						/>

						{/* Line on chart */}
						<Line
							dataKey="TotalValue"
							type="natural"
							stroke="var(--color-prices)"
							strokeWidth={2}
							dot={false}
						/>
					</LineChart>
				</ChartContainer>
			</div>
		</div>
	)
}
