'use client'

import Image from 'next/image'
import dynamic from 'next/dynamic'
import { ArrowUpDown } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'

import { cn } from '@/lib'
import { Button } from '@/components/ui'
import { CoinData } from '@/app/api/definitions'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

export const columns: ColumnDef<CoinData>[] = [
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
			const sparkline = coin?.sparkline_in_7d?.price || []
			const lastUpdated = new Date(coin.last_updated)
			const dataLength = sparkline.length

			return (
				<Chart
					type="line"
					options={{
						chart: {
							sparkline: {
								enabled: true,
							},
							animations: {
								enabled: false,
							},
						},
						tooltip: {
							enabled: true,
							followCursor: true,
							x: {
								formatter: (hour) => {
									const date = new Date(lastUpdated.getTime() - (dataLength - hour) * 60 * 60 * 1000)
									return date.toLocaleDateString('en-US', {
										month: 'short',
										day: 'numeric',
									})
								},
							},
							y: {
								formatter: (value) => value.toFixed(2),
								title: {
									formatter: (seriesName) => seriesName,
								},
							},
						},
						stroke: {
							show: true,
							curve: 'smooth',
							lineCap: 'butt',
							width: 2,
						},
					}}
					width={100}
					height={50}
					series={[
						{
							data: sparkline.length > 0 ? sparkline : [0],
							name: `${coin?.name || 'No Name'}`,
							color: `${
								coin?.price_change_percentage_7d_in_currency &&
								coin?.price_change_percentage_7d_in_currency > 0
									? '#22c55e'
									: coin?.price_change_percentage_7d_in_currency &&
										  coin?.price_change_percentage_7d_in_currency < 0
										? '#dc2626'
										: '#22c55e'
							}`,
						},
					]}
				/>
			)
		},
	},
]
