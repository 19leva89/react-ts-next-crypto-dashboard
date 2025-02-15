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
import { DataTable } from './purchase-table-data'
import { CryptoData, Purchase } from './crypto-card'
import { getColumns } from './purchase-table-columns'

interface Props {
	coin: CryptoData
	isOpen: boolean
	onClose: () => void
	onSave: (sellPrice: string) => void
	editPurchases: Purchase[]
	setEditPurchases: (purchases: Purchase[]) => void
}

export const EditDialog = ({ coin, isOpen, onClose, onSave, editPurchases, setEditPurchases }: Props) => {
	const [editSellPrice, setEditSellPrice] = useState<string>(String(coin.sellPrice || ''))

	const handleNumberInput = (setter: (value: string) => void) => (e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.replace(/,/g, '.')

		if (/^[0-9]*\.?[0-9]*$/.test(value)) {
			setter(value)
		}
	}

	const handleSellPriceChange = handleNumberInput(setEditSellPrice)

	const onPurchaseChange = (id: string, field: keyof CryptoData['purchases'][0], value: string) => {
		setEditPurchases(
			produce(editPurchases, (draft: Draft<Purchase[]>) => {
				const purchase = draft.find((p) => p.id === id)

				if (purchase) {
					if (field === 'date') {
						;(purchase[field] as Date) = new Date(value)
					} else {
						;(purchase[field] as number) = parseFloat(value) || 0
					}
				}
			}),
		)
	}

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="px-8 rounded-xl max-w-xl">
				<DialogHeader>
					<DialogTitle>Edit quantity, price or date</DialogTitle>

					<DialogDescription>Update values of {coin.name} in your portfolio</DialogDescription>
				</DialogHeader>

				<div className="grid gap-4 py-4">
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="sell-price" className="text-right">
							Sell Price
						</Label>

						<Input
							id="sell-price"
							type="number"
							min={0}
							step={0.01}
							value={editSellPrice}
							onChange={handleSellPriceChange}
							className="col-span-3 rounded-xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
						/>
					</div>

					{/* Section for displaying purchases and sales */}
					<div className="mt-6">
						<h3 className="text-lg font-semibold mb-4">Purchase History</h3>

						<DataTable columns={getColumns(onPurchaseChange)} data={editPurchases} />
					</div>
				</div>

				<DialogFooter>
					<Button onClick={() => onSave(editSellPrice)} className="rounded-xl text-white">
						Save changes
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
