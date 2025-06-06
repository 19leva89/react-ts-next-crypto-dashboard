import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { ErrorBoundary } from 'react-error-boundary'
// import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { auth } from '@/auth'
import { constructMetadata } from '@/lib'
import { ReportsView, ReportsViewError, ReportsViewLoading } from '@/modules/reports/ui/views/reports-view'

export const metadata = constructMetadata({ title: 'Reports' })

const ReportsPage = async () => {
	const session = await auth()

	if (!session) {
		redirect('/not-auth')
	}

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
