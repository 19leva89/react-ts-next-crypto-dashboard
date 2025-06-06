'use client'

import { ErrorState, LoadingState } from '@/components/shared'

export const NotificationsView = () => {
	return <h1 className='text-center'>Notifications</h1>
}

export const NotificationsViewLoading = () => {
	return <LoadingState title='Loading notifications' description='This may take a few seconds' />
}

export const NotificationsViewError = () => {
	return <ErrorState title='Failed to load notifications' description='Please try again later' />
}
