import { toast } from 'sonner'
import { Draft, produce } from 'immer'
import { useMutation } from '@tanstack/react-query'

import { cn } from '@/lib'
import { DataTable } from './data'
import { getColumns } from './columns'
import { useTRPC } from '@/trpc/client'
import { ScrollArea } from '@/components/ui'
import { Transaction, UserCoinData } from '@/app/api/types'

interface Props {
	editTransactions: Transaction[]
	onChange: (transactions: Transaction[]) => void
	className?: string
}

export const TableContainer = ({ editTransactions, onChange, className }: Props) => {
	const trpc = useTRPC()

	const deleteTransactionMutation = useMutation(
		trpc.coins.deleteTransactionFromUser.mutationOptions({
			onSuccess: () => {
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
						;(transaction[field] as Date) = new Date(value)
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
