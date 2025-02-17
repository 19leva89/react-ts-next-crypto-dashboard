import { Draft, produce } from 'immer'
import { ChangeEvent, useState } from 'react'

import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	Input,
	Label,
} from '@/components/ui'
import { useToast } from '@/hooks'
import { DataTable } from './transaction-table-data'
import { CryptoData, Transaction } from './crypto-card'
import { getColumns } from './transaction-table-columns'
import { deleteTransactionFromUser } from '@/app/api/actions'

interface Props {
	coin: CryptoData
	isOpen: boolean
	onClose: () => void
	onSave: (sellPrice: string) => void
	editTransactions: Transaction[]
	setEditTransactions: (transactions: Transaction[]) => void
}

export const EditCrypto = ({
	coin,
	isOpen,
	onClose,
	onSave,
	editTransactions,
	setEditTransactions,
}: Props) => {
	const { toast } = useToast()

	const [editSellPrice, setEditSellPrice] = useState<string>(String(coin.sellPrice || ''))

	const handleNumberInput = (setter: (value: string) => void) => (e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.replace(/,/g, '.')

		if (/^[0-9]*\.?[0-9]*$/.test(value)) {
			setter(value)
		}
	}

	const handleSellPriceChange = handleNumberInput(setEditSellPrice)

	const onTransactionChange = (id: string, field: keyof CryptoData['transactions'][0], value: string) => {
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

	const handleAddTransaction = () => {
		const newTransaction: Transaction = {
			id: `temp-${Math.random().toString(36).substring(2)}`,
			quantity: 0,
			price: 0,
			date: new Date(),
			userCoinId: coin.coinId,
		}
		console.log('newTransaction:', newTransaction)

		setEditTransactions([...editTransactions, newTransaction])
	}

	const handleTransactionDelete = async (transactionId: string) => {
		// Если транзакция временная, удаляем сразу из состояния
		if (transactionId.startsWith('temp-')) {
			setEditTransactions(editTransactions.filter((t) => t.id !== transactionId))

			toast({
				title: 'Success ✅',
				description: 'Transaction has been removed',
				variant: 'default',
			})

			return
		}

		try {
			// Вызываем функцию для удаления транзакции
			await deleteTransactionFromUser(transactionId)

			// Уведомляем пользователя об успехе
			toast({
				title: 'Success ✅',
				description: 'Transaction has been removed',
				variant: 'default',
			})
		} catch (error) {
			// Уведомляем пользователя об ошибке
			console.error('Error removing transaction:', error)

			toast({
				title: 'Error 🚨',
				description:
					error instanceof Error ? error.message : 'Failed to remove transaction. Please try again',
				variant: 'destructive',
			})
		}
	}

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="rounded-xl max-w-2xl max-[450px]:px-1">
				<DialogHeader className="px-4">
					<DialogTitle>Edit quantity, price or date</DialogTitle>

					<DialogDescription>Update values of {coin.name} in your portfolio</DialogDescription>
				</DialogHeader>

				<div className="flex flex-col gap-4 py-4">
					<div className="flex items-center justify-start gap-4 px-4">
						<Label htmlFor="sell-price" className="w-[20%]">
							Sell Price
						</Label>

						<Input
							id="sell-price"
							type="number"
							min={0}
							step={0.01}
							value={editSellPrice}
							onChange={handleSellPriceChange}
							className="w-[80%] rounded-xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
						/>
					</div>

					{/* Section for displaying transactions and sales */}
					<div className="mt-6">
						<h3 className="text-lg font-semibold mb-4 px-4">Transaction History</h3>

						<DataTable
							columns={getColumns(onTransactionChange, handleTransactionDelete)}
							data={editTransactions}
						/>
					</div>
				</div>

				<DialogFooter className="flex-row justify-end gap-3 px-4">
					<Button variant={'outline'} onClick={handleAddTransaction} className="rounded-xl text-white">
						Add transaction
					</Button>

					<Button onClick={() => onSave(editSellPrice)} className="rounded-xl text-white">
						Save changes
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
