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
import { formatPrice } from '@/lib'

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
		<Card className='flex w-1/3 flex-col gap-0 rounded-xl py-1 max-[1200px]:w-1/2 max-[700px]:w-3/4 max-[450px]:w-full'>
			<CardHeader className='items-center p-4 max-[600px]:px-1 max-[600px]:py-3'>
				<CardTitle>Coins distribution</CardTitle>
			</CardHeader>

			<CardContent className='pb-4 max-[600px]:px-1 max-[600px]:py-3'>
				<ChartContainer
					config={chartConfig}
					className='mx-auto aspect-square max-h-[250px] pb-0 [&_.recharts-pie-label-text]:fill-foreground'
				>
					<PieChart>
						<ChartTooltip
							cursor={false}
							content={({ active, payload, coordinate }) => (
								<ChartTooltipContent
									active={active}
									payload={payload}
									coordinate={coordinate}
									accessibilityLayer={true}
									formatter={(value, name) => {
										const numericValue = typeof value === 'number' ? value : parseFloat(value as string)

										const formattedValue = `: $${formatPrice(numericValue)}`

										return [name, formattedValue]
									}}
									hideLabel
								/>
							)}
						/>

						<Pie data={chartData} dataKey='value' nameKey='name' cx='50%' cy='50%' innerRadius={40} />
					</PieChart>
				</ChartContainer>
			</CardContent>

			<CardFooter className='flex-col gap-2 pb-4 text-sm max-[600px]:py-3'>
				<div className='mx-auto grid w-fit grid-cols-2 gap-2'>
					{chartData.map((item) => (
						<div key={item.name} className='flex items-center gap-2 truncate'>
							<div className='size-3 shrink-0 rounded-full' style={{ backgroundColor: item.fill }} />

							<span className='truncate uppercase'>{item.symbol || item.name}</span>

							<span className='shrink-0'>({item.percentage.toFixed(1)}%)</span>
						</div>
					))}
				</div>
			</CardFooter>
		</Card>
	)
}
