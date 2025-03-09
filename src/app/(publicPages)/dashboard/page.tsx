import { Suspense } from 'react'

import { constructMetadata } from '@/lib'
import { Skeleton } from '@/components/ui'
import { DataTableContainer } from './_components/table-data-container'
import { AccountTrendingSection } from './_components/account-trending-section'
import { getCategories, getCoinsList, getTrendingData } from '@/app/api/actions'

export const metadata = constructMetadata({ title: 'Dashboard' })

// The page must be rendered on the server side
export const dynamic = 'force-dynamic'

const DashboardPage = async () => {
	const categories = await getCategories()
	const coinsList = await getCoinsList()
	const trendingData = await getTrendingData()

	return (
		<div className="sm:mx-0 md:mx-2 lg:mx-4 xl:mx-6 2xl:mx-8">
			<AccountTrendingSection trendingData={trendingData} />

			<Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
				<DataTableContainer categories={categories} initialCoins={coinsList} />
			</Suspense>
		</div>
	)
}

export default DashboardPage
