'use client'

import Image from 'next/image'
import { ColumnDef } from '@tanstack/react-table'
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react'
import { Line, LineChart, YAxis } from 'recharts'

import { cn } from '@/lib'
import { CoinListData } from '@/app/api/types'
import { formatPrice } from '@/constants/format-price'
import { Button, ChartConfig, ChartContainer } from '@/components/ui'

export const columns: ColumnDef<CoinListData>[] = [
	// #
	{
		accessorKey: 'market_cap_rank',
		header: ({ column }) => {
			return (
				<Button
					variant='ghost'
					className='px-0'
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				>
					#
					{column.getIsSorted() === 'asc' ? (
						<ArrowUpIcon className='size-4' />
					) : (
						<ArrowDownIcon className='size-4' />
					)}
				</Button>
			)
		},
		cell: ({ row }) => (
			<div className='px-3 py-2 text-base max-[1200px]:text-sm'>{row.getValue('market_cap_rank')}</div>
		),
		enableHiding: false,
	},

	// Name
	{
		accessorKey: 'name',
		header: ({ column }) => {
			return (
				<Button
					variant='ghost'
					className='px-0'
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				>
					Name
					{column.getIsSorted() === 'asc' ? (
						<ArrowUpIcon className='size-4' />
					) : (
						<ArrowDownIcon className='size-4' />
					)}
				</Button>
			)
		},
		cell: ({ row }) => {
			const coin = row.original

			return (
				<div className='flex items-center gap-2 px-3 py-2 text-base max-[1200px]:text-sm'>
					{coin.image && coin.name ? (
						<Image
							src={coin.image || '/svg/coin-not-found.svg'}
							alt={coin.name || 'Coin image'}
							width={32}
							height={32}
							className='size-8 rounded-full max-[1200px]:size-6'
							onError={(e) => {
								e.currentTarget.src = '/svg/coin-not-found.svg'
							}}
						/>
					) : (
						'-'
					)}
					<span className='max-w-[6rem] truncate'>{coin.name}</span>
				</div>
			)
		},
		enableHiding: false,
	},

	// Price
	{
		accessorKey: 'current_price',
		header: ({ column }) => {
			return (
				<Button
					variant='ghost'
					className='px-0'
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				>
					Price
					{column.getIsSorted() === 'asc' ? (
						<ArrowUpIcon className='size-4' />
					) : (
						<ArrowDownIcon className='size-4' />
					)}
				</Button>
			)
		},
		cell: ({ row }) => {
			const amount = parseFloat(row.getValue('current_price')) || 0

			const formatted = formatPrice(amount, true)

			return <div className='px-3 py-2 text-base max-[1200px]:text-sm'>${formatted}</div>
		},
	},

	// 24h
	{
		accessorKey: 'price_change_percentage_24h',
		header: ({ column }) => {
			return (
				<Button
					variant='ghost'
					className='px-0'
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				>
					24h
					{column.getIsSorted() === 'asc' ? (
						<ArrowUpIcon className='size-4' />
					) : (
						<ArrowDownIcon className='size-4' />
					)}
				</Button>
			)
		},
		cell: ({ row }) => {
			const coin = row.original

			return (
				<div className='px-3 py-2 text-base max-[1200px]:text-sm'>
					{coin.price_change_percentage_24h ? (
						<div
							className={cn(
								'inline-block rounded-full px-2 py-1 font-medium',
								coin.price_change_percentage_24h > 0
									? 'bg-green-100 text-green-600 dark:bg-green-900/30'
									: 'bg-red-100 text-red-600 dark:bg-red-900/30',
							)}
						>
							<span>
								{coin.price_change_percentage_24h > 0 && '+'}
								{coin.price_change_percentage_24h?.toFixed(1)}%
							</span>
						</div>
					) : (
						<span>-</span>
					)}
				</div>
			)
		},
	},

	// 24h Volume
	{
		accessorKey: 'total_volume',
		header: ({ column }) => {
			return (
				<Button
					variant='ghost'
					className='px-0'
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				>
					24h Volume
					{column.getIsSorted() === 'asc' ? (
						<ArrowUpIcon className='size-4' />
					) : (
						<ArrowDownIcon className='size-4' />
					)}
				</Button>
			)
		},
		cell: ({ row }) => {
			const amount = parseFloat(row.getValue('total_volume')) || 0

			const formatted = formatPrice(amount, true)

			return <div className='px-3 py-2 text-base max-[1200px]:text-sm'>${formatted}</div>
		},
	},

	// Market Cap
	{
		accessorKey: 'market_cap',
		header: ({ column }) => {
			return (
				<Button
					variant='ghost'
					className='px-0'
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				>
					Market Cap
					{column.getIsSorted() === 'asc' ? (
						<ArrowUpIcon className='size-4' />
					) : (
						<ArrowDownIcon className='size-4' />
					)}
				</Button>
			)
		},
		cell: ({ row }) => {
			const amount = parseFloat(row.getValue('market_cap')) || 0

			const formatted = formatPrice(amount, true)

			return <div className='px-3 py-2 text-base max-[1200px]:text-sm'>${formatted}</div>
		},
	},

	// Last 7 Days
	{
		accessorKey: 'price_change_percentage_7d_in_currency',
		header: () => <div>Last 7 Days</div>,
		cell: ({ row }) => {
			const coin = row.original
			const priceChange = coin.price_change_percentage_7d_in_currency as number

			if (
				!coin.sparkline_in_7d?.price ||
				!Array.isArray(coin.sparkline_in_7d.price) || // <-- Add array check
				coin.sparkline_in_7d.price.length === 0 // <-- Add empty array check
			) {
				return null
			}

			const chartConfig = {
				prices: {
					label: 'Price',
					color: 'hsl(var(--chart-2))',
				},
			} satisfies ChartConfig

			const formattedData = coin.sparkline_in_7d.price
				.map((price, index) => ({
					Hour: index,
					Price: Number(price),
				}))
				.filter((item) => !isNaN(item.Price)) // <-- Filter invalid numbers

			// Handle empty data after filtering
			if (formattedData.length === 0) return null

			const prices = formattedData.map((h) => h.Price)
			const minPrice = Math.min(...prices)
			const maxPrice = Math.max(...prices)

			const lineColor = priceChange > 0 ? '#22c55ed6' : priceChange < 0 ? '#dc2626d6' : '#22c55ed6'

			return (
				<div className='mx-0 w-[100px]'>
					<ChartContainer config={chartConfig}>
						<LineChart accessibilityLayer data={formattedData}>
							<YAxis domain={[minPrice, maxPrice]} hide />

							<Line dataKey='Price' type='natural' stroke={lineColor} strokeWidth={2} dot={false} />
						</LineChart>
					</ChartContainer>
				</div>
			)
		},
	},
]
