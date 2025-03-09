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

	const totalValue = coin.current_price * coin.total_quantity
	const changePercentagePrice = ((coin.current_price - coin.average_price) / coin.average_price) * 100

	return (
		<Card
			className={cn(
				'flex flex-col gap-1 py-1',
				viewMode === 'grid'
					? 'grow shrink-0 sm:basis-[calc(50%-1rem)] md:basis-[calc(40%-1rem)] lg:basis-[calc(33%-1rem)] xl:basis-[calc(25%-1rem)] 2xl:basis-[calc(20%-1rem)] min-w-[19rem] max-w-[21rem] min-h-[10rem]'
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
							<span>Buy: ${formatPrice(coin.average_price)}</span>

							<span>Curr: ${formatPrice(coin.current_price)}</span>

							{coin.desired_sell_price ? <span>Sell: ${formatPrice(coin.desired_sell_price)}</span> : null}
						</div>

						<div
							className={cn(
								'flex items-center gap-2 rounded-full font-medium px-2 py-1 h-8',
								viewMode === 'grid' ? '' : 'max-[460px]:hidden',
								coin.current_price > coin.average_price
									? 'bg-green-100 text-green-600 dark:bg-green-900/30'
									: 'bg-red-100 text-red-600 dark:bg-red-900/30',
							)}
						>
							<span>
								{changePercentagePrice > 0 && '+'}
								{changePercentagePrice.toFixed(1)}%
							</span>

							{changePercentagePrice > 0 ? (
								<TrendingUp size={16} className="text-green-600" />
							) : (
								<TrendingDown size={16} className="text-red-600" />
							)}
						</div>
					</CardDescription>
				</div>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon" className="mt-0! group shrink-0">
							<EllipsisVertical
								size={16}
								className="transition-transform duration-300 group-hover:rotate-180"
							/>
						</Button>
					</DropdownMenuTrigger>

					<DropdownMenuContent side="right" align="start" sideOffset={0} className="rounded-xl">
						<DropdownMenuItem
							onSelect={() => setIsDialogOpen(true)}
							className="p-0 rounded-xl cursor-pointer hover:bg-accent hover:text-accent-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						>
							<Button variant="ghost" size="icon" className="flex items-center justify-start gap-3 mx-2">
								<Pencil size={16} />
								<span>Edit</span>
							</Button>
						</DropdownMenuItem>

						<DropdownMenuItem
							onSelect={() => setIsDeleteDialogOpen(true)}
							className="p-0 rounded-xl cursor-pointer hover:bg-accent hover:text-accent-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						>
							<Button variant="ghost" size="icon" className="flex items-center justify-start gap-3 mx-2">
								<Trash size={16} />
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
				<p className="text-lg font-semibold">Quantity: {formatPrice(coin.total_quantity)}</p>

				<p className="text-lg font-semibold">Total value: ${formatPrice(totalValue, false)}</p>
			</CardContent>

			{/* Edit Dialog */}
			<EditCoin coin={coin} isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />

			{/* Delete Dialog */}
			<DeleteCoin coin={coin} isOpen={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)} />
		</Card>
	)
}
