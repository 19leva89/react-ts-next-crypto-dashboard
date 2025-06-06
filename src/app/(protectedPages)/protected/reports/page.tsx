import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
// import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { constructMetadata } from '@/lib'
import { ReportsView, ReportsViewError, ReportsViewLoading } from '@/modules/reports/ui/views/reports-view'

export const metadata = constructMetadata({ title: 'Reports' })

const ReportsPage = () => {
	return (
		// <HydrationBoundary state={dehydrate(queryClient)}>
		<Suspense fallback={<ReportsViewLoading />}>
			<ErrorBoundary fallback={<ReportsViewError />}>
				<ReportsView />
			</ErrorBoundary>
		</Suspense>
		// </HydrationBoundary>
	)
}

export default ReportsPage
