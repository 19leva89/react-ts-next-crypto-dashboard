import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { ErrorBoundary } from 'react-error-boundary'
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'

import { auth } from '@/auth'
import { constructMetadata } from '@/lib'
import { getQueryClient, trpc } from '@/trpc/server'
import { ChartsView, ChartsViewError, ChartsViewLoading } from '@/modules/charts/ui/views/charts-view'

export const metadata = constructMetadata({ title: 'Charts' })

const ChartsPage = async () => {
	const session = await auth()

	if (!session) {
		redirect('/not-auth')
	}

	const queryClient = getQueryClient()

	void queryClient.prefetchQuery(trpc.charts.getPortfolioData.queryOptions())

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<Suspense fallback={<ChartsViewLoading />}>
				<ErrorBoundary fallback={<ChartsViewError />}>
					<ChartsView />
				</ErrorBoundary>
			</Suspense>
		</HydrationBoundary>
	)
}

export default ChartsPage
