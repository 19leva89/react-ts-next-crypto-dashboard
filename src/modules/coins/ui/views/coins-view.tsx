'use client'

import { useSuspenseQuery } from '@tanstack/react-query'

import { useTRPC } from '@/trpc/client'
import { ErrorState, LoadingState } from '@/components/shared'
import { CoinsContainer } from '@/modules/coins/ui/components/container'

export const CoinsView = () => {
	const trpc = useTRPC()

	const { data: userCoins } = useSuspenseQuery(trpc.coins.getUserCoins.queryOptions())

	const transformedData = {
		...userCoins,
		coinData: userCoins.coinData.map((coin) => ({
			...coin,
			transactions: coin.transactions.map((tx) => ({
				...tx,
				date: new Date(tx.date),
			})),
		})),
	}

	return (
		<CoinsContainer
			coinData={transformedData.coinData}
			totalInvestedValue={transformedData.totalInvestedValue}
			totalValue={transformedData.totalPortfolioValue}
			plannedProfit={transformedData.plannedProfit}
		/>
	)
}

export const CoinsViewLoading = () => {
	return <LoadingState title='Loading coins' description='This may take a few seconds' />
}

export const CoinsViewError = () => {
	return <ErrorState title='Failed to load coins' description='Please try again later' />
}
