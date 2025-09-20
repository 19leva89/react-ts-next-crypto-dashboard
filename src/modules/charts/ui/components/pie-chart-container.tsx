'use client'

import { ReactNode } from 'react'
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
import { TPieChartData } from '@/modules/charts/schema'

import { useFormatUSDPrice } from '@/hooks/use-format-usd-price'

interface Props {
	chartData: TPieChartData[]
}

export const PieChartContainer = ({ chartData }: Props) => {
	const formatUSDPrice = useFormatUSDPrice()

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

	const formatTooltipValue = (value: unknown, name: unknown): [ReactNode, string] => {
		const numericValue = typeof value === 'number' ? value : parseFloat(value as string)

		const formattedValue = `: ${formatUSDPrice(numericValue)}`

		return [name as string, formattedValue]
	}

	return (
		<Card className='flex w-full flex-col gap-0 rounded-xl py-1 sm:w-3/4 md:w-1/2 xl:w-1/3'>
			<CardHeader className='items-center px-1 py-3 sm:p-4'>
				<CardTitle>Coins distribution</CardTitle>
			</CardHeader>

			<CardContent className='px-1 py-3 sm:px-6 sm:pb-4'>
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
									formatter={formatTooltipValue}
									hideLabel
								/>
							)}
						/>

						<Pie data={chartData} dataKey='value' nameKey='name' cx='50%' cy='50%' innerRadius={40} />
					</PieChart>
				</ChartContainer>
			</CardContent>

			<CardFooter className='flex-col gap-2 py-3 text-sm sm:pb-4'>
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
