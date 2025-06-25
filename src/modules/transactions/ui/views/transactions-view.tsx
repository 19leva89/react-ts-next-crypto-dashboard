'use client'

import { useRouter } from 'next/navigation'
import { useSuspenseQuery } from '@tanstack/react-query'

import { useTRPC } from '@/trpc/client'
import { ErrorState, LoadingState } from '@/components/shared'
import { DataTable } from '@/modules/transactions/ui/components/table-data'
import { columns } from '@/modules/transactions/ui/components/table-columns'

export const TransactionsView = () => {
	const trpc = useTRPC()
	const router = useRouter()

	const { data: transactions } = useSuspenseQuery(trpc.transactions.getAll.queryOptions())

	const handleCoinClick = (coinId: string) => {
		router.push(`/coins/${coinId}`)
	}

	return (
		<DataTable
			columns={columns}
			data={transactions}
			onRowClick={(rowData) => handleCoinClick(rowData.userCoin.coin.id)}
		/>
	)
}

export const TransactionsViewLoading = () => {
	return <LoadingState title='Loading transactions' description='This may take a few seconds' />
}

export const TransactionsViewError = () => {
	return <ErrorState title='Failed to load transactions' description='Please try again later' />
}
