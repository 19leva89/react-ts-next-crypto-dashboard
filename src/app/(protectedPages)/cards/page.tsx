import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { ErrorBoundary } from 'react-error-boundary'
// import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { auth } from '@/auth'
import { constructMetadata } from '@/lib'
import { CardsView, CardsViewError, CardsViewLoading } from '@/modules/cards/ui/views/cards-view'

export const metadata = constructMetadata({ title: 'Cards' })

const CardsPage = async () => {
	const session = await auth()

	if (!session) {
		redirect('auth/not-auth')
	}

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
