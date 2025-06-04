'use client'

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'

import {
	Button,
	Card,
	CardContent,
	CardHeader,
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from '@/components/ui'
import { MONTH_OPTIONS } from '@/constants/chart'
import { formatPrice } from '@/constants/format-price'

interface Props {
	chartData: { timestamp: string; value: number }[]
}

export const LineChartContainer = ({ chartData }: Props) => {
	const days = 7

	const chartConfig = {
		prices: {
			label: 'Price',
			color: 'hsl(var(--chart-2))',
		},
	} satisfies ChartConfig

	const formattedData =
		chartData?.map(({ timestamp, value }) => {
			const date = new Date(timestamp)
			let label = ''

			switch (true) {
				case days <= 7:
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
				TotalValue: value,
			}
		}) || []

	const minValue = Math.min(...formattedData.map((h) => h.TotalValue))
	const maxValue = Math.max(...formattedData.map((h) => h.TotalValue))

	return (
		<Card className='flex w-2/3 flex-col rounded-xl py-1 max-[1200px]:w-full'>
			<CardHeader className='items-center gap-2 space-y-0 p-4 max-[600px]:px-1 max-[600px]:py-3'>
				<Button
					variant='outline'
					size='sm'
					className='h-6 rounded-xl bg-blue-500 px-2 py-1 transition-colors duration-300 ease-in-out hover:bg-blue-400'
				>
					<span>1 week</span>
				</Button>
			</CardHeader>

			<CardContent className='pb-4 max-[600px]:px-1 max-[600px]:py-3'>
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
						<CartesianGrid vertical={true} strokeDasharray='4 4' />

						{/* Axis X */}
						<XAxis
							dataKey='Label'
							tickLine={false}
							axisLine={false}
							tick={true}
							tickMargin={10}
							tickFormatter={(value) => value}
						/>

						{/* Axis Y */}
						<YAxis
							dataKey='TotalValue'
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

										if (name === 'TotalValue') return ['Total value: $', formatPrice(numericValue)]

										return [name, numericValue]
									}}
								/>
							}
						/>

						{/* Line on chart */}
						<Line
							dataKey='TotalValue'
							type='natural'
							stroke='var(--color-prices)'
							strokeWidth={2}
							dot={false}
						/>
					</LineChart>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
