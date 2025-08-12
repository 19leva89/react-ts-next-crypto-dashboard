'use client'

import { useState } from 'react'
import useLocalStorageState from 'use-local-storage-state'
import { LayoutGridIcon, ListIcon, SearchIcon, XIcon } from 'lucide-react'

import {
	Button,
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	useSidebar,
} from '@/components/ui'
import { cn, formatPrice } from '@/lib'
import { TUserCoinData } from '@/modules/coins/schema'
import { AddCoin } from '@/modules/coins/ui/components/add-coin'
import { CoinCard } from '@/modules/coins/ui/components/coin-card'

interface Props {
	coinData: TUserCoinData[]
	totalInvestedValue: number
	totalValue: number
	plannedProfit: number
}

export const CoinsContainer = ({ coinData, totalInvestedValue, totalValue, plannedProfit }: Props) => {
	const { open } = useSidebar()

	const [searchQuery, setSearchQuery] = useState<string>('')
	const [viewMode, setViewMode] = useLocalStorageState<'list' | 'grid'>('viewMode', {
		defaultValue: 'grid',
	})
	const [sortOption, setSortOption] = useState<
		| 'total-asc'
		| 'total-desc'
		| 'profit-asc'
		| 'profit-desc'
		| 'name-asc'
		| 'name-desc'
		| 'price-asc'
		| 'price-desc'
	>('total-desc')

	const sortedCoinData = [...coinData].sort((a, b) => {
		switch (sortOption) {
			case 'total-asc':
				return a.current_price * a.total_quantity - b.current_price * b.total_quantity

			case 'total-desc':
				return b.current_price * b.total_quantity - a.current_price * a.total_quantity

			case 'profit-asc':
				const profitAscA =
					a.average_price === 0 ? 0 : ((a.current_price - a.average_price) / a.average_price) * 100
				const profitAscB =
					b.average_price === 0 ? 0 : ((b.current_price - b.average_price) / b.average_price) * 100
				return profitAscA - profitAscB

			case 'profit-desc':
				const profitDescA =
					a.average_price === 0 ? 0 : ((a.current_price - a.average_price) / a.average_price) * 100
				const profitDescB =
					b.average_price === 0 ? 0 : ((b.current_price - b.average_price) / b.average_price) * 100
				return profitDescB - profitDescA

			case 'name-asc':
				return a.name.localeCompare(b.name)

			case 'name-desc':
				return b.name.localeCompare(a.name)

			case 'price-asc':
				return a.current_price - b.current_price

			case 'price-desc':
				return b.current_price - a.current_price

			default:
				return 0
		}
	})

	const filteredCoinData = sortedCoinData.filter(
		(coin) =>
			coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			coin.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
	)

	return (
		<div className='flex w-full flex-col gap-6'>
			<div className='flex items-center justify-between gap-1 max-[900px]:flex-wrap'>
				<div className='flex items-start gap-1 max-[1000px]:flex-col'>
					<div className='p-2 px-6 max-[1000px]:p-0 max-[1000px]:px-6'>
						<h2 className='text-xl font-bold max-[460px]:text-lg'>
							Total invested: ${formatPrice(totalInvestedValue, true)}
						</h2>
					</div>

					<div className='p-2 px-6 max-[1000px]:p-0 max-[1000px]:px-6'>
						<h2 className='text-xl font-bold max-[460px]:text-lg'>
							Total coin: ${formatPrice(totalValue, true)}
						</h2>
					</div>

					<div className='p-2 px-6 max-[1000px]:p-0 max-[1000px]:px-6'>
						<h2 className='text-xl font-bold max-[460px]:text-lg'>
							Planned profit: ${formatPrice(plannedProfit, true)}
						</h2>
					</div>
				</div>

				<div className='flex items-center gap-2 max-[870px]:flex-row-reverse max-[550px]:flex-col max-[550px]:flex-wrap max-[550px]:items-start'>
					<AddCoin />

					<div className='flex items-center max-[870px]:flex-row-reverse'>
						<div className='flex items-center gap-2'>
							<Button
								variant='ghost'
								size='icon'
								onClick={() => setViewMode('grid')}
								className={cn('transition-colors duration-300 ease-in-out', {
									'bg-accent': viewMode === 'grid',
								})}
							>
								<LayoutGridIcon className='size-4' />
							</Button>

							<Button
								variant='ghost'
								size='icon'
								onClick={() => setViewMode('list')}
								className={cn('transition-colors duration-300 ease-in-out', {
									'bg-accent': viewMode === 'list',
								})}
							>
								<ListIcon className='size-4' />
							</Button>
						</div>

						{/* Sort coin */}
						<div className='mx-6'>
							<Select
								value={sortOption}
								onValueChange={(value) =>
									setSortOption(
										value as
											| 'total-asc'
											| 'total-desc'
											| 'profit-asc'
											| 'profit-desc'
											| 'name-asc'
											| 'name-desc'
											| 'price-asc'
											| 'price-desc',
									)
								}
							>
								<SelectTrigger className='w-45'>
									<SelectValue placeholder='Sort' />
								</SelectTrigger>

								<SelectContent>
									<SelectItem value='total-asc'>Total: Low - Hi</SelectItem>
									<SelectItem value='total-desc'>Total: Hi - Low</SelectItem>
									<SelectItem value='profit-asc'>Profit: Low - Hi</SelectItem>
									<SelectItem value='profit-desc'>Profit: Hi - Low</SelectItem>
									<SelectItem value='name-asc'>Name: A - Z</SelectItem>
									<SelectItem value='name-desc'>Name: Z - A</SelectItem>
									<SelectItem value='price-asc'>Price: Low - Hi</SelectItem>
									<SelectItem value='price-desc'>Price: Hi - Low</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</div>
			</div>

			{/* Search */}
			<div className='relative w-full px-6'>
				<SearchIcon size={18} className='absolute top-1/2 left-9 -translate-y-1/2 transform text-gray-400' />

				<Input
					placeholder='Filter coins...'
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className='rounded-xl px-10'
				/>

				<Button
					variant='ghost'
					size='icon'
					onClick={() => setSearchQuery('')}
					className={cn(
						'absolute top-1/2 right-6 -translate-y-1/2 hover:bg-transparent hover:text-gray-400',
						searchQuery ? 'opacity-100' : 'pointer-events-none opacity-0',
					)}
				>
					<XIcon size={16} />
				</Button>
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
					<h2 className='flex w-full justify-center'>No coins added. Add your first coin!</h2>
				)}

				{coinData.length > 0 && filteredCoinData.length === 0 && (
					<h2 className='flex w-full justify-center'>No coins found. Try another search!</h2>
				)}

				{filteredCoinData.length > 0 &&
					filteredCoinData.map((coin) => (
						<CoinCard key={`${coin.coinId}-${coin.transactions.length}`} coin={coin} viewMode={viewMode} />
					))}
			</div>
		</div>
	)
}
