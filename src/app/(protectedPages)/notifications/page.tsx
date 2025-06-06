import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { ErrorBoundary } from 'react-error-boundary'
// import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { auth } from '@/auth'
import { constructMetadata } from '@/lib'
import {
	NotificationsView,
	NotificationsViewError,
	NotificationsViewLoading,
} from '@/modules/notifications/ui/views/notifications-view'

export const metadata = constructMetadata({ title: 'Notifications' })

const NotificationsPage = async () => {
	const session = await auth()

	if (!session) {
		redirect('/not-auth')
	}

	return (
		// <HydrationBoundary state={dehydrate(queryClient)}>
		<Suspense fallback={<NotificationsViewLoading />}>
			<ErrorBoundary fallback={<NotificationsViewError />}>
				<NotificationsView />
			</ErrorBoundary>
		</Suspense>
		// </HydrationBoundary>
	)
}

export default NotificationsPage
