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
		<div className="mx-40 max-[1500px]:mx-20 max-[1300px]:mx-10 max-[1200px]:mx-0">
			<AccountTrendingSection trendingData={trendingData} />

			<Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
				<DataTableContainer categories={categories} initialCoins={coinsList} />
			</Suspense>
		</div>
	)
}

export default DashboardPage
