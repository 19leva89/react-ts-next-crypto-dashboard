'use client'

import Link from 'next/link'
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
import { EditCoin } from './edit-coin'
import { DeleteCoin } from './delete-coin'
import { UserCoinData } from '@/app/api/types'
import { formatPrice } from '@/constants/format-price'

interface Props {
	coin: UserCoinData
	viewMode: 'list' | 'grid'
}

export const CoinCard = ({ coin, viewMode }: Props) => {
	const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false)

	const totalValue = coin.currentPrice * coin.totalQuantity
	const changePercentagePrice = ((coin.currentPrice - coin.averagePrice) / coin.averagePrice) * 100

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

						<Link
							href={`/protected/coins/${coin.coinId}`}
							className="cursor-pointer truncate max-w-[8rem] hover:text-[#397fee] dark:hover:text-[#75a6f4]"
						>
							{coin.name}
						</Link>

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

				<p className="text-lg font-semibold">Total value: ${formatPrice(totalValue, false)}</p>
			</CardContent>

			{/* Edit Dialog */}
			<EditCoin
				key={`edit-${coin.coinId}`}
				coin={coin}
				isOpen={isDialogOpen}
				onClose={() => setIsDialogOpen(false)}
			/>

			{/* Delete Dialog */}
			<DeleteCoin
				key={`delete-${coin.coinId}`}
				coin={coin}
				isOpen={isDeleteDialogOpen}
				onClose={() => setIsDeleteDialogOpen(false)}
			/>
		</Card>
	)
}
