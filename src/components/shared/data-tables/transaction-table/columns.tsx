import { format } from 'date-fns'
import { ColumnDef } from '@tanstack/react-table'
import { ArrowDownIcon, ArrowUpIcon, CalendarIcon } from 'lucide-react'

import { Transaction } from '@/modules/coins/schema'
import { InputFormatPrice } from '@/components/shared'
import { DeleteTransaction } from '@/modules/coins/ui/components/delete-transaction'
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
					variant='ghost'
					className='px-0 has-[>svg]:px-0'
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				>
					Quantity
					{column.getIsSorted() === 'asc' ? (
						<ArrowUpIcon className='size-4' />
					) : (
						<ArrowDownIcon className='size-4' />
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
					variant='ghost'
					className='px-0 has-[>svg]:px-0'
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
					variant='ghost'
					className='px-0 has-[>svg]:px-0'
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				>
					Date
					{column.getIsSorted() === 'asc' ? (
						<ArrowUpIcon className='size-4' />
					) : (
						<ArrowDownIcon className='size-4' />
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
							variant='outline'
							className='w-full justify-start rounded-xl text-left font-normal max-[900px]:p-2 max-[900px]:text-sm max-[600px]:px-2 max-[600px]:text-xs max-[600px]:has-[>svg]:px-2'
						>
							<CalendarIcon className='mr-2 size-4 max-[900px]:mr-1 max-[600px]:mr-0' />

							{dateValue ? format(dateValue, 'dd-MM-yyyy') : <span>Pick a date</span>}
						</Button>
					</PopoverTrigger>

					<PopoverContent className='w-auto p-0' autoFocus={true}>
						<Calendar
							mode='single'
							selected={dateValue}
							onSelect={(selectedDate) => {
								if (selectedDate) {
									onTransactionChange(row.original.id, 'date', selectedDate.toISOString())
								}
							}}
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
