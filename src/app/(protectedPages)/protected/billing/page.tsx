import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
// import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { constructMetadata } from '@/lib'
import { BillingView, BillingViewError, BillingViewLoading } from '@/modules/billing/ui/views/billing-view'

export const metadata = constructMetadata({ title: 'Billing' })

const BillingPage = () => {
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
