'use client'

import useLocalStorageState from 'use-local-storage-state'
import { LayoutGridIcon, ListIcon, SearchIcon, XIcon } from 'lucide-react'

import {
	Button,
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
	Tooltip,
	TooltipContent,
	TooltipTrigger,
	useSidebar,
} from '@/components/ui'
import { cn } from '@/lib'
import { TUserCoinData } from '@/modules/coins/schema'
import { AddCoin } from '@/modules/coins/ui/components/add-coin'
import { useFormatUSDPrice } from '@/hooks/use-format-usd-price'
import { CoinCard } from '@/modules/coins/ui/components/coin-card'
import { SortSelect } from '@/modules/coins/ui/components/sort-select'

interface Props {
	coinData: TUserCoinData[]
	totalInvestedValue: number
	totalValue: number
	plannedProfit: number
}

export const CoinsContainer = ({ coinData, totalInvestedValue, totalValue, plannedProfit }: Props) => {
	const { open } = useSidebar()

	const formatUSDPrice = useFormatUSDPrice()

	const [searchQuery, setSearchQuery] = useLocalStorageState<string>('searchQueryCoins', {
		defaultValue: '',
	})
	const [viewMode, setViewMode] = useLocalStorageState<'list' | 'grid'>('viewMode', {
		defaultValue: 'grid',
	})
	const [sortOption, setSortOption] = useLocalStorageState<
		| 'total-asc'
		| 'total-desc'
		| 'profit-asc'
		| 'profit-desc'
		| 'name-asc'
		| 'name-desc'
		| 'price-asc'
		| 'price-desc'
	>('sortOption', {
		defaultValue: 'total-desc',
	})

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
		<div className='flex w-full flex-col gap-4'>
			{/* Invested, total, planned profit */}
			<div className='flex w-full flex-col items-start gap-1 lg:flex-row'>
				<div className='p-0 px-6 lg:p-2 lg:px-6'>
					<h2 className='text-lg font-bold sm:text-xl'>
						Total invested: {formatUSDPrice(totalInvestedValue, true)}
					</h2>
				</div>

				<div className='p-0 px-6 lg:p-2 lg:px-6'>
					<h2 className='text-lg font-bold sm:text-xl'>Total coin: {formatUSDPrice(totalValue, true)}</h2>
				</div>

				<div className='p-0 px-6 lg:p-2 lg:px-6'>
					<h2 className='text-lg font-bold sm:text-xl'>
						Planned profit: {formatUSDPrice(plannedProfit, true)}
					</h2>
				</div>
			</div>

			<div className='flex flex-nowrap items-center justify-between gap-2'>
				<AddCoin className='ml-6' />

				<div className='flex w-full items-center justify-between sm:justify-end sm:gap-2'>
					<div className='flex items-center gap-2'>
						<Button
							variant='ghost'
							size='icon-lg'
							onClick={() => setViewMode('grid')}
							className={cn(
								'rounded-xl transition-colors duration-300 ease-in-out',
								viewMode === 'grid' && 'bg-accent',
							)}
						>
							<LayoutGridIcon />
						</Button>

						<Button
							variant='ghost'
							size='icon-lg'
							onClick={() => setViewMode('list')}
							className={cn(
								'rounded-xl transition-colors duration-300 ease-in-out',
								viewMode === 'list' && 'bg-accent',
							)}
						>
							<ListIcon />
						</Button>
					</div>

					{/* Sort coin */}
					<div className='mr-6'>
						<SortSelect value={sortOption} onChange={setSortOption} className='w-full' />
					</div>
				</div>
			</div>

			{/* Search */}
			<div className='w-full px-6'>
				<InputGroup className='h-10 overflow-hidden rounded-xl transition-colors duration-300 ease-in-out hover:bg-accent dark:bg-transparent'>
					<InputGroupAddon align='inline-start'>
						<SearchIcon className='size-4.5' />
					</InputGroupAddon>

					<InputGroupInput
						placeholder='Filter coins...'
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>

					<InputGroupAddon align='inline-end'>
						<Tooltip>
							<TooltipTrigger asChild>
								<InputGroupButton
									variant='ghost'
									size='icon-sm'
									onClick={() => setSearchQuery('')}
									className={cn(
										'hover:bg-transparent dark:hover:text-gray-200',
										searchQuery ? 'opacity-100' : 'pointer-events-none opacity-0',
									)}
								>
									<XIcon />
								</InputGroupButton>
							</TooltipTrigger>

							<TooltipContent className='rounded-xl text-white'>
								<p>Clear</p>
							</TooltipContent>
						</Tooltip>
					</InputGroupAddon>
				</InputGroup>
			</div>

			<div
				className={cn(
					'w-full p-6',
					viewMode === 'list' && 'flex flex-col gap-2',
					viewMode === 'grid' && 'grid auto-rows-[1fr] gap-4',
					viewMode === 'grid' && open && 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4',
					viewMode === 'grid' && !open && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4',
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
