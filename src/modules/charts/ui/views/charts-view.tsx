'use client'

import { useSuspenseQuery } from '@tanstack/react-query'

import { useTRPC } from '@/trpc/client'
import { ErrorState, LoadingState } from '@/components/shared'
import { useFormatUSDPrice } from '@/hooks/use-format-usd-price'
import { PieChartContainer } from '@/modules/charts/ui/components/pie-chart-container'
import { LineChartContainer } from '@/modules/charts/ui/components/line-chart-container'

export const ChartsView = () => {
	const trpc = useTRPC()

	const formatUSDPrice = useFormatUSDPrice()

	const { data } = useSuspenseQuery(trpc.charts.getPortfolioData.queryOptions())

	return (
		<div className='3xl:mx-30 mx-0 flex flex-col gap-4 xl:mx-10 2xl:mx-20'>
			<div className='flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-3'>
				<p>Total invested: {formatUSDPrice(data.totalInvestedValue, false)}</p>
				<p>Total value: {formatUSDPrice(data.totalPortfolioValue, false)}</p>
				<p>Planned profit: {formatUSDPrice(data.plannedProfit, false)}</p>
			</div>

			<div className='flex flex-col items-center gap-4 xl:flex-row xl:items-stretch'>
				<LineChartContainer chartData={data.lineChartData} />

				<PieChartContainer chartData={data.pieChartData} />
			</div>
		</div>
	)
}

export const ChartsViewLoading = () => {
	return <LoadingState title='Loading charts' description='This may take a few seconds' />
}

export const ChartsViewError = () => {
	return <ErrorState title='Failed to load charts' description='Please try again later' />
}
