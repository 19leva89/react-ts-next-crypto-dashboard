'use client'

import { Pie, PieChart } from 'recharts'

import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from '@/components/ui'
import { formatPrice } from '@/constants/format-price'

interface PieChartData {
	name: string
	value: number
	percentage: number
	fill: string
	symbol?: string
}

interface Props {
	chartData: PieChartData[]
}

export const PieChartContainer = ({ chartData }: Props) => {
	const chartConfig = {
		value: {
			label: 'Value',
		},
		...Object.fromEntries(
			chartData.map((item) => [
				item.name,
				{
					color: item.fill,
					label: item.name,
				},
			]),
		),
	} satisfies ChartConfig

	return (
		<Card className="flex flex-col rounded-xl w-1/3 max-[1200px]:w-1/2 max-[700px]:w-3/4 max-[450px]:w-full">
			<CardHeader className="items-center pb-4 max-[600px]:px-1 max-[600px]:py-3">
				<CardTitle>Coins distribution</CardTitle>
			</CardHeader>

			<CardContent className="pb-4 max-[600px]:px-1 max-[600px]:py-3">
				<ChartContainer
					config={chartConfig}
					className="mx-auto aspect-square max-h-[250px] pb-0 [&_.recharts-pie-label-text]:fill-foreground"
				>
					<PieChart>
						<ChartTooltip
							cursor={false}
							content={
								<ChartTooltipContent
									formatter={(value, name) => {
										const numericValue = typeof value === 'number' ? value : parseFloat(value as string)

										const formattedValue = `: $${formatPrice(numericValue)}`

										return [name, formattedValue]
									}}
									hideLabel
								/>
							}
						/>

						<Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} />
					</PieChart>
				</ChartContainer>
			</CardContent>

			<CardFooter className="flex-col gap-2 text-sm">
				<div className="grid grid-cols-2 gap-2 w-full">
					{chartData.map((item) => (
						<div key={item.name} className="flex items-center gap-2 truncate">
							<div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: item.fill }} />

							<span className="truncate uppercase">{item.symbol || item.name}</span>

							<span className="shrink-0">({item.percentage.toFixed(1)}%)</span>
						</div>
					))}
				</div>
			</CardFooter>
		</Card>
	)
}
