import { Metadata } from 'next'
import { Suspense } from 'react'

import { Skeleton } from '@/components/ui'
import { DataTableSection } from './_components/table-data-section'
import { CategoriesData, CoinsListData, TrendingData } from '@/app/api/types'
import { AccountTrendingSection } from './_components/account-trending-section'
import { fetchCategories, fetchCoinsList, fetchTrendingData } from '@/app/api/actions'

export const metadata: Metadata = {
	title: 'Dashboard',
}

const DashboardPage = async () => {
	const categories = (await fetchCategories()) ?? ([] as CategoriesData)
	const coinsList = (await fetchCoinsList()) ?? ([] as CoinsListData)
	const trendingData = (await fetchTrendingData()) ?? ({} as TrendingData)

	return (
		<div className="space-y-14">
			<AccountTrendingSection trendingData={trendingData} />

			<Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
				<DataTableSection categories={categories} initialCoins={coinsList} />
			</Suspense>
		</div>
	)
}

export default DashboardPage
