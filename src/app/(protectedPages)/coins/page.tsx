import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { ErrorBoundary } from 'react-error-boundary'
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'

import { auth } from '@/auth'
import { constructMetadata } from '@/lib'
import { getQueryClient, trpc } from '@/trpc/server'
import { CoinsView, CoinsViewError, CoinsViewLoading } from '@/modules/coins/ui/views/coins-view'

export const metadata = constructMetadata({ title: 'Coins' })

const CoinsPage = async () => {
	const session = await auth()

	if (!session) {
		redirect('/not-auth')
	}

	const queryClient = getQueryClient()

	void queryClient.prefetchQuery(trpc.coins.getUserCoins.queryOptions())

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<Suspense fallback={<CoinsViewLoading />}>
				<ErrorBoundary fallback={<CoinsViewError />}>
					<CoinsView />
				</ErrorBoundary>
			</Suspense>
		</HydrationBoundary>
	)
}

export default CoinsPage
