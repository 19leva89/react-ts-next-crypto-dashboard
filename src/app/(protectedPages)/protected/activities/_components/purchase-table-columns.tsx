import { ColumnDef } from '@tanstack/react-table'
import { ArrowDown, ArrowUp } from 'lucide-react'

import { Purchase } from './crypto-card'
import { Button, Input } from '@/components/ui'
import { InputFormatPrice } from '@/components/shared'

export const getColumns = (
	onPurchaseChange: (id: string, field: keyof Purchase, value: string) => void,
): ColumnDef<Purchase>[] => [
	// Quantity
	{
		accessorKey: 'quantity',
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					className="px-0"
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				>
					Quantity
					{column.getIsSorted() === 'asc' ? (
						<ArrowUp className="h-4 w-4" />
					) : (
						<ArrowDown className="h-4 w-4" />
					)}
				</Button>
			)
		},
		cell: ({ row }) => (
			<InputFormatPrice
				value={row.original.quantity}
				onChange={(newValue) => onPurchaseChange(row.original.id, 'quantity', newValue.toString())}
			/>
		),
	},

	// Price
	{
		accessorKey: 'price',
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					className="px-0"
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				>
					Price
					{column.getIsSorted() === 'asc' ? (
						<ArrowUp className="h-4 w-4" />
					) : (
						<ArrowDown className="h-4 w-4" />
					)}
				</Button>
			)
		},
		cell: ({ row }) => (
			<InputFormatPrice
				value={row.original.price}
				onChange={(newValue) => onPurchaseChange(row.original.id, 'price', newValue.toString())}
			/>
		),
	},

	// Date
	{
		accessorKey: 'date',
		header: ({ column }) => {
			return (
				<Button
					variant="ghost"
					className="px-0"
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				>
					Date
					{column.getIsSorted() === 'asc' ? (
						<ArrowUp className="h-4 w-4" />
					) : (
						<ArrowDown className="h-4 w-4" />
					)}
				</Button>
			)
		},
		cell: ({ row }) => {
			const dateValue = row.original.date.toISOString().split('T')[0]

			return (
				<Input
					type="date"
					value={dateValue}
					onChange={(e) => onPurchaseChange(row.original.id, 'date', e.target.value)}
					className="rounded-xl"
				/>
			)
		},
	},
]
