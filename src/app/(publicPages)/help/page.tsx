import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
// import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { constructMetadata } from '@/lib'
import { HelpView, HelpViewError, HelpViewLoading } from '@/modules/help/ui/views/help-view'

export const metadata = constructMetadata({ title: 'Help center' })

const HelpPage = () => {
	return (
		// <HydrationBoundary state={dehydrate(queryClient)}>
		<Suspense fallback={<HelpViewLoading />}>
			<ErrorBoundary fallback={<HelpViewError />}>
				<HelpView />
			</ErrorBoundary>
		</Suspense>
		// </HydrationBoundary>
	)
}

export default HelpPage
