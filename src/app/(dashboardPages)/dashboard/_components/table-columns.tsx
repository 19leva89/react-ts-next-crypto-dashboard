'use client'

import Image from 'next/image'
import { ArrowUpDown } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { Line, LineChart, YAxis } from 'recharts'

import { cn } from '@/lib'
import { SingleCoinData } from '@/app/api/types'
import { Button, ChartConfig, ChartContainer } from '@/components/ui'

export const columns: ColumnDef<SingleCoinData>[] = [
	// #
	{
		accessorKey: 'market_cap_rank',
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					className="px-0"
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				>
					#
					<ArrowUpDown />
				</Button>
			)
		},
		cell: ({ row }) => <div className="text-base">{row.getValue('market_cap_rank')}</div>,
		enableHiding: false,
	},

	// Name
	{
		accessorKey: 'name',
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					className="px-0"
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				>
					Name
					<ArrowUpDown />
				</Button>
			)
		},
		cell: ({ row }) => {
			const coin = row.original

			return (
				<button className="flex gap-2 items-center text-base">
					{coin.image && coin.name ? (
						<Image
							src={coin.image || '/svg/coin-not-found.svg'}
							alt={coin.name || 'Coin image'}
							width={32}
							height={32}
							className="size-8 rounded-full"
						/>
					) : (
						'-'
					)}
					{coin.name}
				</button>
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
					variant="ghost"
					className="px-0"
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				>
					Price
					<ArrowUpDown />
				</Button>
			)
		},
		cell: ({ row }) => {
			const amount = parseFloat(row.getValue('current_price'))

			// Format the amount as a dollar amount
			const formatted = new Intl.NumberFormat('en-US', {
				style: 'currency',
				currency: 'USD',
			}).format(amount)

			return <div className="text-base">{formatted}</div>
		},
	},

	// 24h
	{
		accessorKey: 'price_change_percentage_24h',
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					className="px-0"
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				>
					24h
					<ArrowUpDown />
				</Button>
			)
		},
		cell: ({ row }) => {
			const coin = row.original

			return (
				<div className="text-base">
					{coin.price_change_percentage_24h ? (
						<div
							className={cn(
								'rounded-full font-medium px-2 py-1 inline-block',
								coin.price_change_percentage_24h > 0
									? 'bg-green-100 text-green-600 dark:bg-green-dark-container dark:text-green-dark-item'
									: 'bg-red-100 text-red-600 dark:bg-red-dark-container dark:text-red-dark-item',
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
					variant="ghost"
					className="px-0"
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				>
					24h Volume
					<ArrowUpDown />
				</Button>
			)
		},
		cell: ({ row }) => {
			const amount = parseFloat(row.getValue('total_volume'))

			// Format the amount as a dollar amount
			const formatted = new Intl.NumberFormat('en-US', {
				style: 'currency',
				currency: 'USD',
			}).format(amount)

			return <div className="text-base">{formatted}</div>
		},
	},

	// Market Cap
	{
		accessorKey: 'market_cap',
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					className="px-0"
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				>
					Market Cap
					<ArrowUpDown />
				</Button>
			)
		},
		cell: ({ row }) => {
			const amount = parseFloat(row.getValue('market_cap'))

			// Format the amount as a dollar amount
			const formatted = new Intl.NumberFormat('en-US', {
				style: 'currency',
				currency: 'USD',
			}).format(amount)

			return <div className="text-base">{formatted}</div>
		},
	},

	// Last 7 Days
	{
		accessorKey: 'price_change_percentage_7d_in_currency',
		header: () => <div>Last 7 Days</div>,
		cell: ({ row }) => {
			const coin = row.original
			const priceChange = coin?.price_change_percentage_7d_in_currency ?? 0

			const chartConfig = {
				prices: {
					label: 'Price',
					color: 'hsl(var(--chart-2))',
				},
			} satisfies ChartConfig

			const formattedData = coin.sparkline_in_7d.price.map((price, index) => ({
				Hour: index,
				Price: Number(price.toFixed(2)),
			}))

			const minPrice = Math.min(...formattedData.map((h) => h.Price))
			const maxPrice = Math.max(...formattedData.map((h) => h.Price))

			const lineColor = priceChange > 0 ? '#22c55ed6' : priceChange < 0 ? '#dc2626d6' : '#22c55ed6'

			return (
				<div className="w-[100px] mx-0">
					<ChartContainer config={chartConfig}>
						<LineChart accessibilityLayer data={formattedData}>
							<YAxis domain={[minPrice, maxPrice]} hide />

							<Line dataKey="Price" type="natural" stroke={lineColor} strokeWidth={2} dot={false} />
						</LineChart>
					</ChartContainer>
				</div>
			)
		},
	},
]
