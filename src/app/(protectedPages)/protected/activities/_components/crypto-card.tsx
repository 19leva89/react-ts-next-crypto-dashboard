'use client'

import Image from 'next/image'
import toast from 'react-hot-toast'
import { ChangeEvent, useState } from 'react'
import { EllipsisVertical, Pencil, Trash, TrendingDown, TrendingUp } from 'lucide-react'

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
import { delleteCryptoFromUser, updateUserCrypto } from '@/app/api/actions'

export interface CryptoData {
	coinId: string
	name: string
	symbol: string
	currentPrice: number
	totalQuantity: number
	totalCost: number
	averagePrice: number
	sellPrice?: number
	image: string
}

interface Props {
	coin: CryptoData
	viewMode: 'list' | 'grid'
	onClick: (coinId: string) => void
}

export const CryptoCard = ({ coin, viewMode, onClick }: Props) => {
	const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
	const [editTotalQuantity, setEditTotalQuantity] = useState<string>(String(coin.totalQuantity))
	const [editAveragePrice, setEditAveragePrice] = useState<string>(String(coin.averagePrice))
	const [editSellPrice, setEditSellPrice] = useState<string>(String(coin.sellPrice || ''))
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false)

	const totalValue = coin.currentPrice * coin.totalQuantity
	const changePercentagePrice = ((coin.currentPrice - coin.averagePrice) / coin.averagePrice) * 100

	const handleNumberInput = (setter: (value: string) => void) => (e: ChangeEvent<HTMLInputElement>) => {
		let value = e.target.value

		// Разрешаем только цифры, точку и запятую
		if (!/^[0-9]*[.,]?[0-9]*$/.test(value)) return

		// Заменяем запятую на точку (если вводится 4,001 -> 4.001)
		value = value.replace(/,/g, '.')

		// Проверяем количество точек
		if ((value.match(/\./g) || []).length > 1) return

		setter(value)
	}

	const handleTotalQuantityChange = handleNumberInput(setEditTotalQuantity)
	const handleAveragePriceChange = handleNumberInput(setEditAveragePrice)
	const handleSellPriceChange = handleNumberInput(setEditSellPrice)

	const handleUpdate = async () => {
		try {
			// Вызываем функцию для обновления криптовалюты
			await updateUserCrypto(
				coin.coinId,
				Number(editTotalQuantity),
				Number(editAveragePrice),
				Number(editSellPrice),
			)

			// Уведомляем пользователя об успехе
			toast.success('Coin updated successfully')

			// Закрываем диалог
			setIsDialogOpen(false)
		} catch (error) {
			// Уведомляем пользователя об ошибке
			console.error('Error updating coin:', error)

			if (error instanceof Error) {
				toast.error(error.message)
			} else {
				toast.error('Failed to update coin. Please try again')
			}
		}
	}

	const handleDelete = async () => {
		try {
			// Вызываем функцию для удаления криптовалюты
			await delleteCryptoFromUser(coin.coinId)

			// Уведомляем пользователя об успехе
			toast.success('Coin removed successfully')

			setIsDeleteDialogOpen(false)
		} catch (error) {
			// Уведомляем пользователя об ошибке
			console.error('Error removing coin:', error)

			if (error instanceof Error) {
				toast.error(error.message)
			} else {
				toast.error('Failed to remove coin. Please try again')
			}
		}
	}

	return (
		<Card
			className={cn(
				'flex flex-col gap-1',
				viewMode === 'grid'
					? 'flex-grow flex-shrink-0 sm:basis-[calc(50%-1rem)] md:basis-[calc(40%-1rem)] lg:basis-[calc(33%-1rem)] xl:basis-[calc(25%-1rem)] 2xl:basis-[calc(20%-1rem)] min-w-[18rem] max-w-[21rem] min-h-[10rem]'
					: 'w-full gap-0',
			)}
		>
			<CardHeader className="flex flex-row items-start justify-between px-3 py-1 pb-0">
				<div
					className={cn(
						'flex gap-1',
						viewMode === 'grid' ? 'flex-col' : 'flex-row items-center gap-4 max-[550px]:flex-wrap',
					)}
				>
					<CardTitle className="flex items-center gap-2">
						<Image
							src={coin.image || '/svg/coin-not-found.svg'}
							alt={coin.name || 'Coin image'}
							width={24}
							height={24}
							className="rounded-full"
						/>

						<span
							onClick={() => onClick(coin.coinId)}
							className="cursor-pointer truncate max-w-[8rem] hover:text-[#397fee] dark:hover:text-[#75a6f4]"
						>
							{coin.name}
						</span>

						<span className="text-sm text-muted-foreground max-[600px]:hidden">
							({coin.symbol.toUpperCase()})
						</span>
					</CardTitle>

					<CardDescription className="flex gap-2 items-center">
						<div
							className={cn('flex', viewMode === 'grid' ? 'flex-col' : 'flex-row gap-4 max-[1000px]:hidden')}
						>
							<span>Buy: ${formatPrice(coin.averagePrice)}</span>

							<span>Curr: ${formatPrice(coin.currentPrice)}</span>

							{coin.sellPrice ? <span>Sell: ${formatPrice(coin.sellPrice)}</span> : null}
						</div>

						<div
							className={cn(
								'flex items-center gap-2 rounded-full font-medium px-2 py-1 h-8 ',
								viewMode === 'grid' ? '' : 'max-[460px]:hidden',
								coin.currentPrice > coin.averagePrice
									? 'bg-green-100 text-green-600 dark:bg-green-dark-container dark:text-green-dark-item'
									: 'bg-red-100 text-red-600 dark:bg-red-dark-container dark:text-red-dark-item',
							)}
						>
							<span>
								{changePercentagePrice > 0 && '+'}
								{changePercentagePrice.toFixed(1)}%
							</span>

							{changePercentagePrice > 0 ? (
								<TrendingUp size={16} className="text-green-500" />
							) : (
								<TrendingDown size={16} className="text-red-500" />
							)}
						</div>
					</CardDescription>
				</div>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon" className="!mt-0 group shrink-0">
							<EllipsisVertical className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180" />
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
					'flex gap-0 px-3 py-1 pt-0',
					viewMode === 'grid' ? 'flex-col items-start' : 'flex-row items-center justify-between gap-8',
				)}
			>
				<p className="text-lg font-semibold">Quantity: {formatPrice(coin.totalQuantity)}</p>

				<p className="text-lg font-semibold">Total Value: ${formatPrice(totalValue, false)}</p>
			</CardContent>

			{/* Edit Dialog */}
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className="px-8 rounded-xl">
					<DialogHeader>
						<DialogTitle>Edit Quantity</DialogTitle>

						<DialogDescription>Update the quantity of {coin.name} in your portfolio</DialogDescription>
					</DialogHeader>

					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="quantity" className="text-right">
								Total Quantity
							</Label>

							<Input
								id="quantity"
								type="number"
								min={0}
								step={0.01}
								value={editTotalQuantity}
								onChange={handleTotalQuantityChange}
								className="col-span-3 rounded-xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
							/>
						</div>

						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="average-price" className="text-right">
								Average Price
							</Label>

							<Input
								id="average-price"
								type="number"
								min={0}
								step={0.01}
								value={editAveragePrice}
								onChange={handleAveragePriceChange}
								className="col-span-3 rounded-xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
							/>
						</div>

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
				<DialogContent className="px-8 rounded-xl">
					<DialogHeader>
						<DialogTitle>Delete {coin.name}</DialogTitle>

						<DialogDescription>
							Are you sure you want to delete this coin from your portfolio?
						</DialogDescription>
					</DialogHeader>

					<DialogFooter className="gap-4">
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
