'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'

import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	Input,
	Label,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui'
import { CoinListData } from '@/app/api/types'
import { addCryptoToUser } from '@/app/api/actions'

interface Props {
	initialCoins: CoinListData
}

export const AddCrypto = ({ initialCoins }: Props) => {
	const [quantity, setQuantity] = useState('')
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [selectedCrypto, setSelectedCrypto] = useState('')

	const handleAddCrypto = async () => {
		try {
			// Проверяем, что выбрана криптовалюта и введено количество
			if (!selectedCrypto || !quantity) {
				toast.error('Please select a cryptocurrency and enter a quantity')
				return
			}

			console.log('Adding crypto:', selectedCrypto, quantity)

			// Вызываем функцию для добавления криптовалюты
			await addCryptoToUser(selectedCrypto, parseFloat(quantity))

			// Уведомляем пользователя об успехе
			toast.success('Crypto added successfully')

			// Закрываем диалог
			setIsDialogOpen(false)

			// Очищаем поля
			setSelectedCrypto('')
			setQuantity('')
		} catch (error) {
			// Уведомляем пользователя об ошибке
			toast.error('Failed to add crypto. Please try again.')
			console.error('Error adding crypto:', error)
		}
	}

	return (
		<div className="flex flex-col gap-4 p-2 px-6">
			<div className="flex justify-end">
				<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
					<DialogTrigger asChild>
						<Button variant="default" size="sm" className="rounded-xl text-white">
							<Plus className="mr-2 h-4 w-4" />
							Add Crypto
						</Button>
					</DialogTrigger>

					<DialogContent>
						<DialogHeader>
							<DialogTitle>Add New Crypto</DialogTitle>

							<DialogDescription>Select a cryptocurrency and enter the quantity</DialogDescription>
						</DialogHeader>

						<div className="grid gap-4 py-4">
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="crypto" className="text-right">
									Crypto
								</Label>

								<Select onValueChange={setSelectedCrypto}>
									<SelectTrigger className="col-span-3">
										<SelectValue placeholder="Select a cryptocurrency" />
									</SelectTrigger>

									<SelectContent>
										{initialCoins.map((coin) => (
											<SelectItem key={coin.id} value={coin.id}>
												{coin.name} ({coin.symbol.toUpperCase()})
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="quantity" className="text-right">
									Quantity
								</Label>

								<Input
									id="quantity"
									type="number"
									value={quantity}
									onChange={(e) => setQuantity(e.target.value)}
									className="col-span-3"
								/>
							</div>
						</div>

						<DialogFooter>
							<Button onClick={handleAddCrypto} className="rounded-xl text-white">
								Add
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	)
}
