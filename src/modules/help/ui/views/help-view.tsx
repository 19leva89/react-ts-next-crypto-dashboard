'use client'

import { ErrorState, LoadingState } from '@/components/shared'

export const HelpView = () => {
	return <h1 className='text-center'>Help</h1>
}

export const HelpViewLoading = () => {
	return <LoadingState title='Loading help' description='This may take a few seconds' />
}

export const HelpViewError = () => {
	return <ErrorState title='Failed to load help' description='Please try again later' />
}
