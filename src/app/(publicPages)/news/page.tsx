import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { constructMetadata } from '@/lib'
import { getQueryClient, trpc } from '@/trpc/server'
import { NewsView, NewsViewError, NewsViewLoading } from '@/modules/news/ui/views/news-view'

export const metadata = constructMetadata({ title: 'News' })

const NewsPage = () => {
	const queryClient = getQueryClient()

	void queryClient.prefetchQuery(trpc.news.getCryptoNews.queryOptions({ page: 1 }))

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<Suspense fallback={<NewsViewLoading />}>
				<ErrorBoundary fallback={<NewsViewError />}>
					<NewsView />
				</ErrorBoundary>
			</Suspense>
		</HydrationBoundary>
	)
}

export default NewsPage
