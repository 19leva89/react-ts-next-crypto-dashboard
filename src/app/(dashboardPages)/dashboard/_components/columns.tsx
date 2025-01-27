'use client'

import Image from 'next/image'
import { ArrowUpDown } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'

import { Button } from '@/components/ui'

export type CryptoTableSection = {
	id: string
	symbol: string
	name: string
	image: string
	current_price: number
	market_cap: number
	market_cap_rank: number
	total_volume: number
	price_change_percentage_24h: number
	sparkline_in_7d: {
		price: number[]
	}
	price_change_percentage_7d_in_currency: number | null
}

const onCoinsClick = (coinId: string) => {
	// setCurrentCoinId(coinId)
	// toggleDetailModal()
}

export const columns: ColumnDef<CryptoTableSection>[] = [
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
	{
		accessorKey: 'name',
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					className="px-0"
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				>
					Coin
					<ArrowUpDown />
				</Button>
			)
		},
		cell: ({ row }) => {
			const coin = row.original // Данные текущей строки
			return (
				<button
					className="flex gap-2 items-center"
					onClick={() => {
						onCoinsClick(coin.id) // Используем id из данных
					}}
				>
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
	},
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
		cell: ({ row }) => <div className="text-base">{row.getValue('price_change_percentage_24h')}</div>,
	},
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
	{
		accessorKey: 'price_change_percentage_7d_in_currency',
		header: () => <div>Last 7 Days</div>,
		cell: ({ row }) => (
			<div className="text-base">{row.getValue('price_change_percentage_7d_in_currency')}</div>
		),
	},
]
