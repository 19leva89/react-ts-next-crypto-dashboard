import { toast } from 'sonner'
import { Draft, produce } from 'immer'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { cn } from '@/lib'
import { useTRPC } from '@/trpc/client'
import { ScrollArea } from '@/components/ui'
import { Transaction, UserCoinData } from '@/modules/coins/schema'
import { DataTable } from '@/components/shared/data-tables/transaction-table/data'
import { getColumns } from '@/components/shared/data-tables/transaction-table/columns'

interface Props {
	editTransactions: Transaction[]
	onChange: (transactions: Transaction[]) => void
	className?: string
}

export const TableContainer = ({ editTransactions, onChange, className }: Props) => {
	const trpc = useTRPC()
	const queryClient = useQueryClient()

	const deleteTransactionMutation = useMutation(
		trpc.coins.deleteTransactionFromUser.mutationOptions({
			onSuccess: (_, transactionId) => {
				const transaction = editTransactions.find((t) => t.id === transactionId)

				if (transaction) {
					queryClient.invalidateQueries(trpc.coins.getUserCoin.queryOptions(transaction.userCoinId))
				}

				toast.success('Transaction has been removed')
			},
			onError: (error) => {
				console.error('Delete transaction error:', error)
				toast.error('Failed to remove transaction. Please try again')
			},
		}),
	)

	const onTransactionChange = (id: string, field: keyof UserCoinData['transactions'][0], value: string) => {
		onChange(
			produce(editTransactions, (draft: Draft<Transaction[]>) => {
				const transaction = draft.find((p) => p.id === id)

				if (transaction) {
					if (field === 'date') {
						;(transaction[field] as string) = value
					} else {
						;(transaction[field] as number) = parseFloat(value) || 0
					}
				}
			}),
		)
	}

	const handleTransactionDelete = async (transactionId: string) => {
		await deleteTransactionMutation.mutateAsync(transactionId)

		onChange(editTransactions.filter((t) => t.id !== transactionId))
	}

	return (
		<ScrollArea className={cn('h-[100vh] bg-background', className)}>
			<DataTable columns={getColumns(onTransactionChange, handleTransactionDelete)} data={editTransactions} />
		</ScrollArea>
	)
}
