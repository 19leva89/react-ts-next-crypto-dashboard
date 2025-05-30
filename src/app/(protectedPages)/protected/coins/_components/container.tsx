'use client'

import { useEffect, useState } from 'react'
import useLocalStorageState from 'use-local-storage-state'
import { LayoutGridIcon, ListIcon, SearchIcon } from 'lucide-react'

import {
	Button,
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Skeleton,
	useSidebar,
} from '@/components/ui'
import { cn } from '@/lib'
import { AddCoin } from './add-coin'
import { CoinCard } from './coin-card'
import { UserCoinData } from '@/app/api/types'
import { formatPrice } from '@/constants/format-price'

interface Props {
	coinData: UserCoinData[]
	totalInvestedValue: number
	totalValue: number
	plannedProfit: number
}

export const CoinsContainer = ({ coinData, totalInvestedValue, totalValue, plannedProfit }: Props) => {
	const { open } = useSidebar()

	const [isMounted, setIsMounted] = useState<boolean>(false)
	const [searchQuery, setSearchQuery] = useState<string>('')
	const [viewMode, setViewMode] = useLocalStorageState<'list' | 'grid'>('viewMode', {
		defaultValue: 'grid',
	})
	const [sortOption, setSortOption] = useState<
		'total-asc' | 'total-desc' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc'
	>('total-desc')

	const sortedCoinData = [...coinData].sort((a, b) => {
		switch (sortOption) {
			case 'total-asc':
				return a.current_price * a.total_quantity - b.current_price * b.total_quantity

			case 'total-desc':
				return b.current_price * b.total_quantity - a.current_price * a.total_quantity

			case 'price-asc':
				return a.current_price - b.current_price

			case 'price-desc':
				return b.current_price - a.current_price

			case 'name-asc':
				return a.name.localeCompare(b.name)

			case 'name-desc':
				return b.name.localeCompare(a.name)

			default:
				return 0
		}
	})

	const filteredCoinData = sortedCoinData.filter(
		(coin) =>
			coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			coin.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
	)

	useEffect(() => {
		setIsMounted(true)
	}, [])

	if (!isMounted) {
		return (
			<div className="flex flex-col w-full">
				<div className="flex items-center justify-between">
					<Skeleton className="h-14 w-full" />
				</div>

				<div className="flex flex-col gap-2 items-start justify-start w-full p-6">
					<Skeleton className="h-24 w-full" />
					<Skeleton className="h-24 w-full" />
					<Skeleton className="h-24 w-full" />
				</div>
			</div>
		)
	}

	return (
		<div className="flex flex-col w-full">
			<div className="flex items-center justify-between gap-1 max-[900px]:flex-wrap">
				<div className="flex items-start gap-1 max-[1000px]:flex-col">
					<div className="p-2 px-6 max-[1000px]:p-0 max-[1000px]:px-6">
						<h2 className="text-xl font-bold max-[460px]:text-lg">
							Total invested: ${formatPrice(totalInvestedValue, true)}
						</h2>
					</div>

					<div className="p-2 px-6 max-[1000px]:p-0 max-[1000px]:px-6">
						<h2 className="text-xl font-bold max-[460px]:text-lg">
							Total coin: ${formatPrice(totalValue, true)}
						</h2>
					</div>

					<div className="p-2 px-6 max-[1000px]:p-0 max-[1000px]:px-6">
						<h2 className="text-xl font-bold max-[460px]:text-lg">
							Planned profit: ${formatPrice(plannedProfit, true)}
						</h2>
					</div>
				</div>

				<div className="flex items-center gap-2 max-[870px]:flex-row-reverse max-[550px]:flex-wrap max-[550px]:flex-col max-[550px]:items-start">
					<AddCoin />

					<div className="flex items-center max-[870px]:flex-row-reverse">
						<div className="flex items-center gap-2">
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setViewMode('grid')}
								className={cn('transition-colors ease-in-out duration-300', {
									'bg-accent': viewMode === 'grid',
								})}
							>
								<LayoutGridIcon className="size-4" />
							</Button>

							<Button
								variant="ghost"
								size="icon"
								onClick={() => setViewMode('list')}
								className={cn('transition-colors ease-in-out duration-300', {
									'bg-accent': viewMode === 'list',
								})}
							>
								<ListIcon className="size-4" />
							</Button>
						</div>

						{/* Sort coin */}
						<div className="mx-6">
							<Select
								value={sortOption}
								onValueChange={(value) =>
									setSortOption(
										value as
											| 'total-asc'
											| 'total-desc'
											| 'price-asc'
											| 'price-desc'
											| 'name-asc'
											| 'name-desc',
									)
								}
							>
								<SelectTrigger className="w-[180px]">
									<SelectValue placeholder="Sort" />
								</SelectTrigger>

								<SelectContent>
									<SelectItem value="total-asc">Total: Low - Hi</SelectItem>
									<SelectItem value="total-desc">Total: Hi - Low</SelectItem>
									<SelectItem value="price-asc">Price: Low - Hi</SelectItem>
									<SelectItem value="price-desc">Price: Hi - Low</SelectItem>
									<SelectItem value="name-asc">Name: A - Z</SelectItem>
									<SelectItem value="name-desc">Name: Z - A</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</div>
			</div>

			{/* Search */}
			<div className="relative w-full px-6 pt-6">
				<SearchIcon size={18} className="absolute left-9 top-2/3 transform -translate-y-1/2 text-gray-400" />

				<Input
					placeholder="Filter coins..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="pl-10 rounded-xl max-[600px]:pl-10"
				/>
			</div>

			<div
				className={cn(
					'w-full p-6',
					viewMode === 'grid'
						? cn(
								'grid auto-rows-[1fr] gap-4',
								open
									? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
									: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4',
							)
						: 'flex flex-col gap-2',
				)}
			>
				{coinData.length === 0 && (
					<h2 className="flex justify-center w-full">No coins added. Add your first coin!</h2>
				)}

				{coinData.length > 0 && filteredCoinData.length === 0 && (
					<h2 className="flex justify-center w-full">No coins found. Try another search!</h2>
				)}

				{filteredCoinData.length > 0 &&
					filteredCoinData.map((coin) => (
						<CoinCard key={`${coin.coinId}-${coin.transactions.length}`} coin={coin} viewMode={viewMode} />
					))}
			</div>
		</div>
	)
}
