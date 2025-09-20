import { format } from 'date-fns'
import { ColumnDef } from '@tanstack/react-table'
import { ArrowDownIcon, ArrowUpIcon, CalendarIcon } from 'lucide-react'

import {
	Button,
	Calendar,
	Popover,
	PopoverContent,
	PopoverTrigger,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui'

import { getWalletDisplayName } from '@/data/wallet'
import { TTransaction, WALLETS } from '@/modules/coins/schema'
import { InputFormatPrice, InputFormatQuantity } from '@/components/shared'
import { WalletIcon } from '@/modules/transactions/ui/components/wallet-icon'
import { DeleteTransaction } from '@/modules/coins/ui/components/delete-transaction'

export const getColumns = (
	onTransactionChange: (id: string, field: keyof TTransaction, value: string) => void,
	onTransactionDelete: (id: string) => void,
): ColumnDef<TTransaction>[] => [
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
			<InputFormatQuantity
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
							className='w-full justify-start rounded-xl p-2 px-2 text-left text-xs font-normal has-[>svg]:px-2 sm:text-sm lg:p-4 lg:text-base'
						>
							<CalendarIcon className='mr-0 size-4 sm:mr-1 lg:mr-2' />

							{dateValue ? format(dateValue, 'dd-MM-yyyy') : <span>Pick a date</span>}
						</Button>
					</PopoverTrigger>

					<PopoverContent className='w-auto rounded-xl p-0' autoFocus={true}>
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

	// Wallet
	{
		accessorKey: 'wallet',
		header: ({ column }) => {
			return (
				<Button
					variant='ghost'
					className='px-0 has-[>svg]:px-0'
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				>
					Wallet
					{column.getIsSorted() === 'asc' ? (
						<ArrowUpIcon className='size-4' />
					) : (
						<ArrowDownIcon className='size-4' />
					)}
				</Button>
			)
		},
		cell: ({ row }) => (
			<Select
				value={row.original.wallet}
				onValueChange={(value) => {
					onTransactionChange(row.original.id, 'wallet', value)
				}}
			>
				<SelectTrigger
					id={`wallet-${row.original.id}`}
					aria-label={`Current wallet: ${getWalletDisplayName(row.original.wallet as keyof typeof WALLETS)}`}
					className='w-full rounded-xl text-xs sm:text-sm lg:text-base'
				>
					<SelectValue placeholder='Select wallet' />
				</SelectTrigger>

				<SelectContent className='rounded-xl'>
					{Object.keys(WALLETS).map((walletKey) => (
						<SelectItem key={walletKey} value={walletKey} className='rounded-xl'>
							<WalletIcon wallet={walletKey as keyof typeof WALLETS} />

							{getWalletDisplayName(walletKey as keyof typeof WALLETS)}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		),
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
