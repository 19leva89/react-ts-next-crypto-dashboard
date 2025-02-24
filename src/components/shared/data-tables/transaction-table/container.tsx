import { Draft, produce } from 'immer'

import { cn } from '@/lib'
import { DataTable } from './data'
import { getColumns } from './columns'
import { useCoinActions } from '@/hooks'
import { ScrollArea } from '@/components/ui'
import { Transaction, UserCoinData } from '@/app/api/types'
import { deleteTransactionFromUser } from '@/app/api/actions'

interface Props {
	editTransactions: Transaction[]
	onChange: (transactions: Transaction[]) => void
	className?: string
}

export const TableContainer = ({ editTransactions, onChange, className }: Props) => {
	const { handleAction } = useCoinActions()

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
		await handleAction(
			async () => {
				await deleteTransactionFromUser(transactionId)

				onChange(editTransactions.filter((t) => t.id !== transactionId))
			},
			'Transaction has been removed',
			'Failed to remove transaction. Please try again',
		)
	}

	return (
		<ScrollArea className={cn('h-[100vh] bg-background', className)}>
			<DataTable columns={getColumns(onTransactionChange, handleTransactionDelete)} data={editTransactions} />
		</ScrollArea>
	)
}
