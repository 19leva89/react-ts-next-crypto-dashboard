'use client'

import { ErrorState, LoadingState } from '@/components/shared'

export const ReportsView = () => {
	return <h1 className='text-center'>Reports</h1>
}

export const ReportsViewLoading = () => {
	return <LoadingState title='Loading reports' description='This may take a few seconds' />
}

export const ReportsViewError = () => {
	return <ErrorState title='Failed to load reports' description='Please try again later' />
}
