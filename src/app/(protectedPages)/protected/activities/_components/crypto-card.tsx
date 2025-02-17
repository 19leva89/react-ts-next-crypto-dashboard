'use client'

import Image from 'next/image'
import { useState } from 'react'
import { EllipsisVertical, Pencil, Trash, TrendingDown, TrendingUp } from 'lucide-react'

import {
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui'
import { cn } from '@/lib'
import { useToast } from '@/hooks'
import { EditCrypto } from './edit-crypto'
import { DeleteCrypto } from './delete-crypto'
import { formatPrice } from '@/constants/format-price'
import { deleteCryptoFromUser, updateUserCrypto } from '@/app/api/actions'

export interface Transaction {
	id: string
	quantity: number
	price: number
	date: Date
	userCoinId: string
}
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
	transactions: Transaction[]
}

interface Props {
	coin: CryptoData
	viewMode: 'list' | 'grid'
	onClick: (coinId: string) => void
}

export const CryptoCard = ({ coin, viewMode, onClick }: Props) => {
	const { toast } = useToast()
	const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false)
	const [editTransactions, setEditTransactions] = useState<Transaction[]>(coin.transactions)

	const totalValue = coin.currentPrice * coin.totalQuantity
	const changePercentagePrice = ((coin.currentPrice - coin.averagePrice) / coin.averagePrice) * 100

	const handleUpdate = async (sellPrice: string) => {
		try {
			// Преобразуем данные о покупках в нужный формат
			const updatedTransactions = editTransactions.map((transaction) => ({
				...transaction,
				quantity: transaction.quantity,
				price: transaction.price,
				date: new Date(transaction.date),
			}))

			// Вызываем функцию для обновления криптовалюты
			await updateUserCrypto(coin.coinId, Number(sellPrice), updatedTransactions)

			// Уведомляем пользователя об успехе
			toast({
				title: 'Success ✅',
				description: 'Coin updated successfully',
				variant: 'default',
			})

			// Закрываем диалог
			setIsDialogOpen(false)
		} catch (error) {
			// Уведомляем пользователя об ошибке
			console.error('Error updating coin:', error)

			toast({
				title: 'Error 🚨',
				description: error instanceof Error ? error.message : 'Failed to update coin. Please try again',
				variant: 'destructive',
			})
		}
	}

	const handleDelete = async () => {
		try {
			// Вызываем функцию для удаления криптовалюты
			await deleteCryptoFromUser(coin.coinId)

			// Уведомляем пользователя об успехе
			toast({
				title: 'Success ✅',
				description: 'Coin removed successfully',
				variant: 'default',
			})

			setIsDeleteDialogOpen(false)
		} catch (error) {
			// Уведомляем пользователя об ошибке
			console.error('Error removing coin:', error)

			toast({
				title: 'Error 🚨',
				description: error instanceof Error ? error.message : 'Failed to remove coin. Please try again',
				variant: 'destructive',
			})
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
			<EditCrypto
				key={`edit-${coin.coinId}`}
				coin={coin}
				isOpen={isDialogOpen}
				onClose={() => setIsDialogOpen(false)}
				onSave={handleUpdate}
				editTransactions={editTransactions}
				setEditTransactions={setEditTransactions}
			/>

			{/* Delete Dialog */}
			<DeleteCrypto
				key={`delete-${coin.coinId}`}
				coin={coin}
				isOpen={isDeleteDialogOpen}
				onClose={() => setIsDeleteDialogOpen(false)}
				onDelete={handleDelete}
			/>
		</Card>
	)
}
