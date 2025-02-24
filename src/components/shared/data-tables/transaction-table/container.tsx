import { Draft, produce } from 'immer'

import { cn } from '@/lib'
import { useToast } from '@/hooks'
import { DataTable } from './data'
import { getColumns } from './columns'
import { ScrollArea } from '@/components/ui'
import { Transaction, UserCoinData } from '@/app/api/types'
import { deleteTransactionFromUser } from '@/app/api/actions'

interface Props {
	editTransactions: Transaction[]
	setEditTransactions: (transactions: Transaction[]) => void
	className?: string
}

export const TableContainer = ({ editTransactions, setEditTransactions, className }: Props) => {
	const { toast } = useToast()

	const onTransactionChange = (id: string, field: keyof UserCoinData['transactions'][0], value: string) => {
		setEditTransactions(
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
		// If the transaction is temporary, remove it from the state immediately
		if (transactionId.startsWith('temp-')) {
			setEditTransactions(editTransactions.filter((t) => t.id !== transactionId))

			toast({
				title: '✅ Success',
				description: 'Transaction has been removed',
				variant: 'default',
			})

			return
		}

		try {
			await deleteTransactionFromUser(transactionId)

			toast({
				title: '✅ Success',
				description: 'Transaction has been removed',
				variant: 'default',
			})
		} catch (error) {
			console.error('Error removing transaction:', error)

			toast({
				title: '🚨 Error',
				description:
					error instanceof Error ? error.message : 'Failed to remove transaction. Please try again',
				variant: 'destructive',
			})
		}
	}

	return (
		<ScrollArea className={cn('h-[100vh] bg-background', className)}>
			<DataTable columns={getColumns(onTransactionChange, handleTransactionDelete)} data={editTransactions} />
		</ScrollArea>
	)
}
