import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
// import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { constructMetadata } from '@/lib'
import { CardsView, CardsViewError, CardsViewLoading } from '@/modules/cards/ui/views/cards-view'

export const metadata = constructMetadata({ title: 'Cards' })

const CardsPage = () => {
	return (
		// <HydrationBoundary state={dehydrate(queryClient)}>
		<Suspense fallback={<CardsViewLoading />}>
			<ErrorBoundary fallback={<CardsViewError />}>
				<CardsView />
			</ErrorBoundary>
		</Suspense>
		// </HydrationBoundary>
	)
}

export default CardsPage
