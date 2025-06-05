'use client'

import { useSuspenseQuery } from '@tanstack/react-query'

import { useTRPC } from '@/trpc/client'
import { ErrorState, LoadingState } from '@/components/shared'
import { CoinIdContainer } from '@/modules/coins/ui/components/coin-id-container'

export const CoinIdView = ({ coinId }: { coinId: string }) => {
	const trpc = useTRPC()

	const { data: rawCoin } = useSuspenseQuery(trpc.coins.getUserCoin.queryOptions(coinId))

	const coin = {
		...rawCoin,
		transactions: rawCoin.transactions.map((tx) => ({
			...tx,
			date: new Date(tx.date),
		})),
	}

	return <CoinIdContainer coin={coin} />
}

export const CoinIdViewLoading = () => {
	return <LoadingState title='Loading coin' description='This may take a few seconds' />
}

export const CoinIdViewError = () => {
	return <ErrorState title='Failed to load coin' description='Please try again later' />
}
