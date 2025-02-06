'use client'

import Image from 'next/image'
import toast from 'react-hot-toast'
import { ChangeEvent, useState } from 'react'
import { EllipsisVertical, Pencil, Trash } from 'lucide-react'

import {
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	Input,
	Label,
} from '@/components/ui'
import { CryptoData } from './activities-container'
import { formatPrice } from '@/constants/format-price'
import { delleteCryptoFromUser, updateCryptoQuantity } from '@/app/api/actions'

export const CryptoCardItem = ({ coin }: { coin: CryptoData }) => {
	const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
	const [editQuantity, setEditQuantity] = useState<string>(coin.quantity.toString())
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false)

	const totalValue = coin.currentPrice * coin.quantity

	const handleQuantityChange = (e: ChangeEvent<HTMLInputElement>) => {
		let value = e.target.value
		if (!/^\d*([.,]?\d*)?$/.test(value)) return
		value = value.replace(',', '.')
		if ((value.match(/\./g) || []).length > 1) return
		setEditQuantity(value)
	}

	const handleUpdate = async () => {
		try {
			await updateCryptoQuantity(coin.coinId, Number(editQuantity))
			toast.success('Crypto updated successfully')
			setIsDialogOpen(false)
		} catch (error) {
			console.error('Error updating crypto:', error)
			toast.error(error instanceof Error ? error.message : 'Failed to update crypto. Please try again')
		}
	}

	const handleDelete = async () => {
		try {
			await delleteCryptoFromUser(coin.coinId)
			toast.success('Crypto removed successfully')
			setIsDeleteDialogOpen(false)
		} catch (error) {
			console.error('Error removing crypto:', error)
			toast.error(error instanceof Error ? error.message : 'Failed to remove crypto. Please try again')
		}
	}

	return (
		<Card className="flex flex-col gap-1 w-full min-h-20 min-w-80 max-w-[378px]">
			<CardHeader className="flex flex-row items-center justify-between p-3 pb-0">
				<div className="flex flex-col gap-1">
					<CardTitle className="flex items-center gap-2">
						<Image
							src={coin.image}
							alt={coin.name}
							width={24}
							height={24}
							loading="lazy"
							className="rounded-full"
						/>
						<span>{coin.name}</span>
						<span className="text-sm text-muted-foreground">({coin.symbol.toUpperCase()})</span>
					</CardTitle>
					<CardDescription>Current Price: ${formatPrice(coin.currentPrice)}</CardDescription>
				</div>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon" className="!mt-0 group">
							<EllipsisVertical className="transition-transform duration-300 group-hover:rotate-180" />
						</Button>
					</DropdownMenuTrigger>

					<DropdownMenuContent side="right" align="start" sideOffset={0} className="rounded-xl">
						<DropdownMenuItem
							onSelect={() => setIsDialogOpen(true)}
							className="p-0 rounded-xl cursor-pointer"
						>
							<Button variant="ghost" size="icon" className="flex items-center justify-start gap-3 mx-2">
								<Pencil className="h-4 w-4" />
								<span>Edit</span>
							</Button>
						</DropdownMenuItem>
						<DropdownMenuItem
							onSelect={() => setIsDeleteDialogOpen(true)}
							className="p-0 rounded-xl cursor-pointer"
						>
							<Button variant="ghost" size="icon" className="flex items-center justify-start gap-3 mx-2">
								<Trash className="h-4 w-4" />
								<span>Delete</span>
							</Button>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</CardHeader>

			<CardContent className="p-3 pt-0">
				<p className="text-lg font-semibold">Quantity: {formatPrice(coin.quantity)}</p>
				<p className="text-lg font-semibold">Total Value: ${formatPrice(totalValue)}</p>
			</CardContent>

			{/* Edit Dialog */}
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit Quantity</DialogTitle>
						<DialogDescription>Update the quantity of {coin.name} in your portfolio</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="quantity" className="text-right">
								Quantity
							</Label>
							<Input
								id="quantity"
								type="text"
								value={editQuantity}
								onChange={handleQuantityChange}
								className="col-span-3 rounded-xl"
							/>
						</div>
					</div>
					<DialogFooter>
						<Button onClick={handleUpdate} className="rounded-xl text-white">
							Save changes
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Dialog */}
			<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete {coin.name}</DialogTitle>
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
		</Card>
	)
}
