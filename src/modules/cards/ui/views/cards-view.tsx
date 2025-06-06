'use client'

import { ErrorState, LoadingState } from '@/components/shared'

export const CardsView = () => {
	return <h1 className='text-center'>Cards</h1>
}

export const CardsViewLoading = () => {
	return <LoadingState title='Loading cards' description='This may take a few seconds' />
}

export const CardsViewError = () => {
	return <ErrorState title='Failed to load cards' description='Please try again later' />
}
