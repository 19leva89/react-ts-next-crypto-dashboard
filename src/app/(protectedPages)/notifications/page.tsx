import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { ErrorBoundary } from 'react-error-boundary'

import { auth } from '@/auth'
import { constructMetadata } from '@/lib'
import { getQueryClient, trpc } from '@/trpc/server'

import { DEFAULT_LIMIT } from '@/constants/default-limit'
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

	const queryClient = getQueryClient()

	void queryClient.prefetchInfiniteQuery(
		trpc.notifications.getNotifications.infiniteQueryOptions({ limit: DEFAULT_LIMIT }),
	)

	return (
		<Suspense fallback={<NotificationsViewLoading />}>
			<ErrorBoundary fallback={<NotificationsViewError />}>
				<NotificationsView />
			</ErrorBoundary>
		</Suspense>
	)
}

export default NotificationsPage
