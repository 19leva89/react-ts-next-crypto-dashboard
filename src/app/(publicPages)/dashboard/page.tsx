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
		<>
			<AccountTrendingSection trendingData={trendingData} />

			{/* <Suspense fallback={<Skeleton className="h-96 rounded-xl" />}>
				<DataTableContainer categories={categories} initialCoins={coinsList} />
			</Suspense> */}
		</>
	)
}

export default DashboardPage
