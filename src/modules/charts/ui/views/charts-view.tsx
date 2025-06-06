'use client'

import { useSuspenseQuery } from '@tanstack/react-query'

import { useTRPC } from '@/trpc/client'
import { formatPrice } from '@/constants/format-price'
import { ErrorState, LoadingState } from '@/components/shared'
import { PieChartContainer } from '@/modules/charts/ui/components/pie-chart-container'
import { LineChartContainer } from '@/modules/charts/ui/components/line-chart-container'

export const ChartsView = () => {
	const trpc = useTRPC()

	const { data } = useSuspenseQuery(trpc.charts.getPortfolioData.queryOptions())

	return (
		<div className='3xl:mx-30 mx-0 flex flex-col gap-4 xl:mx-10 2xl:mx-20'>
			<div className='flex flex-row items-center gap-3 max-[600px]:flex-col max-[600px]:items-start max-[600px]:gap-1'>
				<p>Total invested: ${formatPrice(data.totalInvestedValue, false)}</p>
				<p>Total value: ${formatPrice(data.totalPortfolioValue, false)}</p>
				<p>Planned profit: ${formatPrice(data.plannedProfit, false)}</p>
			</div>

			<div className='flex flex-row gap-4 max-[1200px]:flex-col max-[1200px]:items-center'>
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
