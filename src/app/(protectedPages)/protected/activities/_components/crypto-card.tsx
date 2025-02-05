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
import { formatPrice } from '@/constants/format-price'
import { delleteCryptoFromUser, updateCryptoQuantity } from '@/app/api/actions'

interface Props {
	coinId: string
	name: string
	symbol: string
	currentPrice: number
	quantity: number
	image: string
}

const CryptoCard = ({ coinId, name, symbol, currentPrice, quantity, image }: Props) => {
	const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
	const [editQuantity, setEditQuantity] = useState<string>(String(quantity))
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false)

	const totalValue = currentPrice * quantity

	const handleQuantityChange = (e: ChangeEvent<HTMLInputElement>) => {
		let value = e.target.value

		// Разрешаем только цифры, точку и запятую
		if (!/^[0-9]*[.,]?[0-9]*$/.test(value)) return

		// Заменяем запятую на точку (если вводится 4,001 -> 4.001)
		value = value.replace(',', '.')

		setEditQuantity(value)
	}

	const handleUpdate = async () => {
		try {
			// Вызываем функцию для обновления криптовалюты
			await updateCryptoQuantity(coinId, Number(editQuantity))

			// Уведомляем пользователя об успехе
			toast.success('Crypto updated successfully')

			// Закрываем диалог
			setIsDialogOpen(false)
		} catch (error) {
			// Уведомляем пользователя об ошибке
			console.error('Error updating crypto:', error)

			if (error instanceof Error) {
				toast.error(error.message)
			} else {
				toast.error('Failed to update crypto. Please try again')
			}
		}
	}

	const handleDelete = async () => {
		try {
			// Вызываем функцию для удаления криптовалюты
			await delleteCryptoFromUser(coinId)

			// Уведомляем пользователя об успехе
			toast.success('Crypto removed successfully')

			setIsDeleteDialogOpen(false)
		} catch (error) {
			// Уведомляем пользователя об ошибке
			console.error('Error removing crypto:', error)

			if (error instanceof Error) {
				toast.error(error.message)
			} else {
				toast.error('Failed to remove crypto. Please try again')
			}
		}
	}

	return (
		<Card className="flex flex-col gap-1 w-full min-h-20 min-w-80 max-w-[378px]">
			<CardHeader className="flex flex-row items-center justify-between p-3 pb-0">
				<div className="flex flex-col gap-1">
					<CardTitle className="flex items-center gap-2">
						<Image src={image} alt={name} width={24} height={24} loading="lazy" className="rounded-full" />

						<span>{name}</span>

						<span className="text-sm text-muted-foreground">({symbol.toUpperCase()})</span>
					</CardTitle>
					<CardDescription>Current Price: ${formatPrice(currentPrice)}</CardDescription>
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
							className="p-0 rounded-xl cursor-pointer hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						>
							<Button variant="ghost" size="icon" className="flex items-center justify-start gap-3 mx-2">
								<Pencil className="h-4 w-4" />
								<span>Edit</span>
							</Button>
						</DropdownMenuItem>

						<DropdownMenuItem
							onSelect={() => setIsDeleteDialogOpen(true)}
							className="p-0 rounded-xl cursor-pointer hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
				<p className="text-lg font-semibold">Quantity: {formatPrice(quantity)}</p>
				<p className="text-lg font-semibold">Total Value: ${formatPrice(totalValue)}</p>
			</CardContent>

			{/* Edit Dialog */}
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
		</Card>
	)
}

export default CryptoCard
