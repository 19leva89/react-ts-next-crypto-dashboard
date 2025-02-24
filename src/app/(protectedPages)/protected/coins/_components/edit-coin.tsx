import { Plus } from 'lucide-react'
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

import { formatPrice } from '@/constants/format-price'
import { Transaction, UserCoinData } from '@/app/api/types'
import { TableContainer } from '@/components/shared/data-tables/transaction-table'

interface Props {
	coin: UserCoinData
	isOpen: boolean
	onClose: () => void
	onSave: (sellPrice: string) => void
	editTransactions: Transaction[]
	setEditTransactions: (transactions: Transaction[]) => void
}

export const EditCoin = ({ coin, isOpen, onClose, onSave, editTransactions, setEditTransactions }: Props) => {
	const [editSellPrice, setEditSellPrice] = useState<string>(String(coin.sellPrice || ''))

	const totalValue = coin.currentPrice * coin.totalQuantity

	const handleNumberInput = (setter: (value: string) => void) => (e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.replace(/,/g, '.')

		if (/^[0-9]*\.?[0-9]*$/.test(value)) {
			setter(value)
		}
	}

	const handleSellPriceChange = handleNumberInput(setEditSellPrice)

	const handleAddTransaction = () => {
		const newTransaction: Transaction = {
			id: `temp-${Math.random().toString(36).substring(2)}`,
			quantity: 0,
			price: 0,
			date: new Date(),
			userCoinId: coin.coinId,
		}

		setEditTransactions([...editTransactions, newTransaction])
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
							Sell price
						</Label>

						<Input
							id="sell-price"
							type="number"
							min={0}
							step={0.01}
							value={editSellPrice}
							autoFocus={false}
							onChange={handleSellPriceChange}
							className="w-[80%] rounded-xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
						/>
					</div>

					{/* Section for displaying transactions and sales */}
					<div className="mt-2">
						<div className="flex items-center justify-between mb-1">
							<h3 className="px-4 text-lg font-semibold max-[400px]:text-sm">Transaction History</h3>

							<div className="flex flex-col px-4 max-[600px]:text-sm">
								<p className="">Total invested: ${formatPrice(coin.totalCost, false)}</p>

								<p className="">Total value: ${formatPrice(totalValue, false)}</p>
							</div>
						</div>

						<TableContainer
							editTransactions={editTransactions}
							onChange={setEditTransactions}
							className="h-[50vh]"
						/>
					</div>
				</div>

				<DialogFooter className="flex-row justify-end gap-3 px-4">
					<Button variant={'outline'} onClick={handleAddTransaction} className="rounded-xl text-white">
						<Plus className="mr-2 h-4 w-4" />
						Transaction
					</Button>

					<Button onClick={() => onSave(editSellPrice)} className="rounded-xl text-white">
						Save changes
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
