'use client'

import { Suspense } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'

import { useTRPC } from '@/trpc/client'
import { Skeleton } from '@/components/ui'
import { ErrorState, LoadingState } from '@/components/shared'
import { DataTableContainer } from '@/modules/dashboard/ui/components/table-data-container'
import { AccountTrendingSection } from '@/modules/dashboard/ui/components/account-trending-section'

export const DashboardView = () => {
	const trpc = useTRPC()

	const { data: categories } = useSuspenseQuery(trpc.dashboard.getCategories.queryOptions())
	const { data: trendingData } = useSuspenseQuery(trpc.dashboard.getTrending.queryOptions())
	const { data: initialCoins } = useSuspenseQuery(trpc.dashboard.getCoinsList.queryOptions())

	return (
		<div className='sm:mx-0 md:mx-2 lg:mx-4 xl:mx-6 2xl:mx-8'>
			<AccountTrendingSection trendingData={trendingData} />

			<Suspense fallback={<Skeleton className='h-96 w-full rounded-xl' />}>
				<DataTableContainer categories={categories} initialCoins={initialCoins} />
			</Suspense>
		</div>
	)
}

export const DashboardViewLoading = () => {
	return <LoadingState title='Loading dashboard' description='This may take a few seconds' />
}

export const DashboardViewError = () => {
	return <ErrorState title='Failed to load dashboard' description='Please try again later' />
}
