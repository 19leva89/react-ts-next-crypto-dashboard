import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { ErrorBoundary } from 'react-error-boundary'
// import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { auth } from '@/auth'
import { constructMetadata } from '@/lib'
import { BillingView, BillingViewError, BillingViewLoading } from '@/modules/billing/ui/views/billing-view'

export const metadata = constructMetadata({ title: 'Billing' })

const BillingPage = async () => {
	const session = await auth()

	if (!session) {
		redirect('/not-auth')
	}

	return (
		// <HydrationBoundary state={dehydrate(queryClient)}>
		<Suspense fallback={<BillingViewLoading />}>
			<ErrorBoundary fallback={<BillingViewError />}>
				<BillingView />
			</ErrorBoundary>
		</Suspense>
		// </HydrationBoundary>
	)
}

export default BillingPage
