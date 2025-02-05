import { Metadata } from 'next'
import { Suspense } from 'react'

import { auth } from '@/auth'
import { Skeleton } from '@/components/ui'
import { DataTableSection } from './_components/table-data-section'
import { AccountTrendingSection } from './_components/account-trending-section'
import { getCategories, getCoinsList, getTrendingData, getUserCryptos } from '@/app/api/actions'

export const metadata: Metadata = {
	title: 'Dashboard',
}

// The page must be rendered on the server side
export const dynamic = 'force-dynamic'

const DashboardPage = async () => {
	const session = await auth()

	const categories = await getCategories()
	const coinsList = await getCoinsList()
	const trendingData = await getTrendingData()
	const userCryptos = session ? await getUserCryptos() : []

	// Вычисляем общую стоимость портфеля
	const totalPortfolioValue = userCryptos.reduce((total, crypto) => {
		return total + (crypto.coin.current_price as number) * (crypto.quantity as number)
	}, 0)

	return (
		<div className="space-y-14">
			<AccountTrendingSection
				trendingData={trendingData}
				totalPortfolioValue={session ? totalPortfolioValue : 0}
			/>

			<Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
				<DataTableSection categories={categories} initialCoins={coinsList} />
			</Suspense>
		</div>
	)
}

export default DashboardPage
