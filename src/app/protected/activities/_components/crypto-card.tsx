'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Pencil, Trash } from 'lucide-react'

import {
	Button,
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	Input,
	Label,
} from '@/components/ui'

interface Props {
	name: string
	symbol: string
	currentPrice: number
	quantity: number
	image: string
}

export const CryptoCard = ({ name, symbol, currentPrice, quantity, image }: Props) => {
	const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
	const [editQuantity, setEditQuantity] = useState<number>(quantity)
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false)

	const totalValue = currentPrice * quantity

	const handleSave = () => {
		// Здесь можно добавить логику для сохранения измененного количества
		console.log('New quantity:', editQuantity)
		setIsDialogOpen(false)
	}

	const handleDelete = () => {
		// Логика для удаления монеты
		console.log('Deleting:', name)
		setIsDeleteDialogOpen(false)
	}

	return (
		<Card className="flex flex-col gap-1 w-full min-h-20 min-w-80 max-w-[378px]">
			<CardHeader className="p-3 pb-0">
				<CardTitle className="flex items-center gap-2">
					<Image src={image} alt={name} width={24} height={24} className="rounded-full" />

					<span>{name}</span>

					<span className="text-sm text-muted-foreground">({symbol.toUpperCase()})</span>
				</CardTitle>

				<CardDescription>Current Price: ${currentPrice.toLocaleString()}</CardDescription>
			</CardHeader>

			<CardContent className="p-3 pt-0 pb-0">
				<p className="text-lg font-semibold">Quantity: {quantity}</p>

				<p className="text-lg font-semibold">Total Value: ${totalValue.toLocaleString()}</p>
			</CardContent>

			<CardFooter className="flex justify-end gap-2 p-3 pt-0">
				{/* Edit button */}
				<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
					<DialogTrigger asChild>
						<Button variant="ghost" size="icon">
							<Pencil className="h-4 w-4" />
						</Button>
					</DialogTrigger>

					<DialogContent>
						<DialogHeader>
							<DialogTitle>Edit Quantity</DialogTitle>

							<DialogDescription>Update the quantity of {name} in your portfolio</DialogDescription>
						</DialogHeader>

						<div className="grid gap-4 py-4">
							<div className="grid grid-cols-4 items-center gap-4">
								<Label htmlFor="quantity" className="text-right">
									Quantity
								</Label>

								<Input
									id="quantity"
									type="number"
									value={editQuantity}
									onChange={(e) => setEditQuantity(Number(e.target.value))}
									className="col-span-3 rounded-xl"
								/>
							</div>
						</div>

						<DialogFooter>
							<Button onClick={handleSave} className="rounded-xl text-white">
								Save changes
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				{/* Delete button */}
				<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
					<DialogTrigger asChild>
						<Button variant="ghost" size="icon">
							<Trash className="h-4 w-4" />
						</Button>
					</DialogTrigger>

					<DialogContent>
						<DialogHeader>
							<DialogTitle>Delete {name}</DialogTitle>
							<DialogDescription>
								Are you sure you want to delete this coin from your portfolio?
							</DialogDescription>
						</DialogHeader>

						<DialogFooter>
							<Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="rounded-xl">
								Cancel
							</Button>

							<Button onClick={handleDelete} variant="destructive" className="rounded-xl">
								Delete
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</CardFooter>
		</Card>
	)
}
