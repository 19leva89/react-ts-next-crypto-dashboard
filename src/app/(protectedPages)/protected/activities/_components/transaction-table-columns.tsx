import { format } from 'date-fns'
import { ColumnDef } from '@tanstack/react-table'
import { ArrowDown, ArrowUp, CalendarIcon } from 'lucide-react'

import { Transaction } from './crypto-card'
import { InputFormatPrice } from '@/components/shared'
import { DeleteTransaction } from './delete-transaction'
import { Button, Calendar, Popover, PopoverContent, PopoverTrigger } from '@/components/ui'

export const getColumns = (
	onTransactionChange: (id: string, field: keyof Transaction, value: string) => void,
	onTransactionDelete: (id: string) => void,
): ColumnDef<Transaction>[] => [
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
				onChange={(newValue) => onTransactionChange(row.original.id, 'quantity', newValue.toString())}
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
				onChange={(newValue) => onTransactionChange(row.original.id, 'price', newValue.toString())}
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
			const dateValue = new Date(row.original.date)

			return (
				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							className="w-full justify-start text-left font-normal rounded-xl max-[900px]:p-2 max-[600px]:px-1 max-[900px]:text-sm max-[600px]:text-xs"
						>
							<CalendarIcon className="mr-2 h-4 w-4 max-[900px]:mr-1 max-[600px]:mr-0" />

							{dateValue ? format(dateValue, 'dd-MM-yyyy') : <span>Pick a date</span>}
						</Button>
					</PopoverTrigger>

					<PopoverContent className="w-auto p-0">
						<Calendar
							mode="single"
							selected={dateValue}
							onSelect={(selectedDate) => {
								if (selectedDate) {
									onTransactionChange(row.original.id, 'date', selectedDate.toISOString())
								}
							}}
							initialFocus
						/>
					</PopoverContent>
				</Popover>
			)
		},
	},

	// Delete
	{
		accessorKey: 'delete',
		header: () => <span />,
		cell: ({ row }) => (
			<DeleteTransaction
				key={`delete-transaction-${row.original.id}`}
				transactionId={row.original.id}
				onDelete={onTransactionDelete}
			/>
		),
	},
]
