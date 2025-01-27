'use client'

import { ArrowUpDown } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'

import { Button } from '@/components/ui'

export type CryptoTableSection = {
	id: number
	coin: string
	price: number
	lastDay: number
	lastDayVolume: number
	marketCap: number
	lastSevenDays: string
}

export const columns: ColumnDef<CryptoTableSection>[] = [
	{
		id: 'number',
		header: ({ column }) => {
			return (
				<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
					#
					<ArrowUpDown />
				</Button>
			)
		},
		cell: ({ row }) => <div className="lowercase">{row.index + 1}</div>,
		enableHiding: false,
	},
	{
		accessorKey: 'coin',
		header: 'Coin',
		cell: ({ row }) => <div className="lowercase">{row.getValue('coin')}</div>,
	},
	{
		accessorKey: 'price',
		header: () => <div className="text-right">Price</div>,
		cell: ({ row }) => {
			const amount = parseFloat(row.getValue('price'))

			// Format the amount as a dollar amount
			const formatted = new Intl.NumberFormat('en-US', {
				style: 'currency',
				currency: 'USD',
			}).format(amount)

			return <div className="text-right font-medium">{formatted}</div>
		},
	},
	{
		accessorKey: 'lastDay',
		header: () => <div className="text-right">24h</div>,
		cell: ({ row }) => <div className="lowercase">{row.getValue('lastDay')}</div>,
	},
	{
		accessorKey: 'lastDayVolume',
		header: () => <div className="text-right">24h Volume</div>,
		cell: ({ row }) => {
			const amount = parseFloat(row.getValue('lastDayVolume'))

			// Format the amount as a dollar amount
			const formatted = new Intl.NumberFormat('en-US', {
				style: 'currency',
				currency: 'USD',
			}).format(amount)

			return <div className="text-right font-medium">{formatted}</div>
		},
	},
	{
		accessorKey: 'marketCap',
		header: () => <div className="text-right">Market Cap</div>,
		cell: ({ row }) => {
			const amount = parseFloat(row.getValue('marketCap'))

			// Format the amount as a dollar amount
			const formatted = new Intl.NumberFormat('en-US', {
				style: 'currency',
				currency: 'USD',
			}).format(amount)

			return <div className="text-right font-medium">{formatted}</div>
		},
	},
	{
		accessorKey: 'lastSevenDays',
		header: () => <div className="text-right">Last 7 Days</div>,
		cell: ({ row }) => <div className="lowercase">{row.getValue('lastSevenDays')}</div>,
	},
]
