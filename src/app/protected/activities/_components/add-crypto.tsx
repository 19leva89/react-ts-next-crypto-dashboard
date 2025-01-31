'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'

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

export const AddCrypto = () => {
	const [quantity, setQuantity] = useState('')
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [selectedCrypto, setSelectedCrypto] = useState('')

	const handleAddCrypto = () => {
		// Логика для добавления новой криптовалюты
		console.log('Selected Crypto:', selectedCrypto)
		console.log('Quantity:', quantity)
		setIsDialogOpen(false)
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
										<SelectItem value="btc">Bitcoin (BTC)</SelectItem>
										<SelectItem value="eth">Ethereum (ETH)</SelectItem>
										<SelectItem value="bnb">Binance Coin (BNB)</SelectItem>
										<SelectItem value="ada">Cardano (ADA)</SelectItem>
										<SelectItem value="sol">Solana (SOL)</SelectItem>
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
