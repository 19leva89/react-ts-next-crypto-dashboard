import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { ErrorBoundary } from 'react-error-boundary'
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'

import { auth } from '@/auth'
import { constructMetadata } from '@/lib'
import { getQueryClient, trpc } from '@/trpc/server'
import { CoinIdView, CoinIdViewError, CoinIdViewLoading } from '@/modules/coins/ui/views/coin-id-view'

interface Props {
	params: Promise<{ coinId: string }>
}

/**
 * Generates metadata for the coin page
 * @param props - The props object
 * @param props.params - Route parameters containing coinId
 * @returns Metadata object with formatted coin name as title
 */
export async function generateMetadata({ params }: Props) {
	const { coinId } = await params

	const formattedCoinId =
		coinId.charAt(0).toUpperCase() +
		coinId
			.slice(1) // First letter is capitalized
			.replace(/-/g, ' ') // Replace all "-" with spaces " "

	return constructMetadata({ title: `${formattedCoinId}` })
}

const CoinIdPage = async ({ params }: Props) => {
	const session = await auth()

	const { coinId } = await params

	if (!session) {
		redirect('/auth/not-auth')
	}

	if (!coinId) {
		return <div>Invalid coin ID</div>
	}

	const queryClient = getQueryClient()

	await queryClient.prefetchQuery(trpc.coins.getUserCoin.queryOptions(coinId))

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<Suspense fallback={<CoinIdViewLoading />}>
				<ErrorBoundary fallback={<CoinIdViewError />}>
					<CoinIdView coinId={coinId} />
				</ErrorBoundary>
			</Suspense>
		</HydrationBoundary>
	)
}

export default CoinIdPage
