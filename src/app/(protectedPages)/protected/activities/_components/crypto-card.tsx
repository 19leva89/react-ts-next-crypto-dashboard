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
import { cn } from '@/lib'
import { formatPrice } from '@/constants/format-price'
import { delleteCryptoFromUser, updateCryptoQuantity } from '@/app/api/actions'

export interface CryptoData {
	coinId: string
	name: string
	symbol: string
	currentPrice: number
	quantity: number
	image: string
}

export const CryptoCard = ({ coin, viewMode }: { coin: CryptoData; viewMode: 'grid' | 'list' }) => {
	const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
	const [editQuantity, setEditQuantity] = useState<string>(String(coin.quantity))
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false)

	const totalValue = coin.currentPrice * coin.quantity

	const handleQuantityChange = (e: ChangeEvent<HTMLInputElement>) => {
		let value = e.target.value

		// Разрешаем только цифры, точку и запятую
		if (!/^[0-9]*[.,]?[0-9]*$/.test(value)) return

		// Заменяем запятую на точку (если вводится 4,001 -> 4.001)
		value = value.replace(',', '.')

		if ((value.match(/\./g) || []).length > 1) return

		setEditQuantity(value)
	}

	const handleUpdate = async () => {
		try {
			// Вызываем функцию для обновления криптовалюты
			await updateCryptoQuantity(coin.coinId, Number(editQuantity))

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
			await delleteCryptoFromUser(coin.coinId)

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
		<Card
			className={cn(
				'flex w-full',
				viewMode === 'grid' ? 'flex-col gap-1 min-w-[19.5rem] max-w-[21rem]' : 'flex-col',
			)}
		>
			<CardHeader className="flex items-center flex-row justify-between px-3 py-1 pb-0">
				<div className={cn('flex', viewMode === 'grid' ? 'flex-col gap-1' : 'flex-row items-center gap-2')}>
					<CardTitle className="flex items-center gap-2">
						<Image src={coin.image} alt={coin.name} width={24} height={24} className="rounded-full" />

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

			<CardContent
				className={cn(
					'flex gap-1 px-3 py-1 pt-0',
					viewMode === 'grid' ? 'flex-col items-start' : 'flex-row items-center gap-10',
				)}
			>
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
