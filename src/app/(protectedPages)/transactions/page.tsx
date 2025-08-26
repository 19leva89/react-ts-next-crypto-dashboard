import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { ErrorBoundary } from 'react-error-boundary'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { auth } from '@/auth'
import { constructMetadata } from '@/lib'
import { getQueryClient, trpc } from '@/trpc/server'
import {
	TransactionsView,
	TransactionsViewError,
	TransactionsViewLoading,
} from '@/modules/transactions/ui/views/transactions-view'

export const metadata = constructMetadata({ title: 'Transactions' })

const TransactionsPage = async () => {
	const session = await auth()

	if (!session) {
		redirect('/auth/not-auth')
	}

	const queryClient = getQueryClient()

	void queryClient.prefetchQuery(trpc.transactions.getAll.queryOptions())

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<Suspense fallback={<TransactionsViewLoading />}>
				<ErrorBoundary fallback={<TransactionsViewError />}>
					<TransactionsView />
				</ErrorBoundary>
			</Suspense>
		</HydrationBoundary>
	)
}

export default TransactionsPage
