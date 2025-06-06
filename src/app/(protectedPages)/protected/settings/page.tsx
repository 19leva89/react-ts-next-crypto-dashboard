import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { ErrorBoundary } from 'react-error-boundary'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { auth } from '@/auth'
import { constructMetadata } from '@/lib'
import { getQueryClient, trpc } from '@/trpc/server'
import { ProfileView, ProfileViewError, ProfileViewLoading } from '@/modules/settings/ui/views/profile-view'

export const metadata = constructMetadata({ title: 'Settings' })

const SettingsPage = async () => {
	const session = await auth()

	if (!session) {
		redirect('/not-auth')
	}

	const queryClient = getQueryClient()
	void queryClient.prefetchQuery(trpc.settings.getProfile.queryOptions())

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<Suspense fallback={<ProfileViewLoading />}>
				<ErrorBoundary fallback={<ProfileViewError />}>
					<ProfileView />
				</ErrorBoundary>
			</Suspense>
		</HydrationBoundary>
	)
}

export default SettingsPage
