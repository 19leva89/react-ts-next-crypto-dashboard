'use client'

import Image from 'next/image'
import { format } from 'date-fns'
import { ColumnDef } from '@tanstack/react-table'
import { ArrowDownIcon, ArrowDownToLine, ArrowUpFromLine, ArrowUpIcon } from 'lucide-react'

import { Button } from '@/components/ui'
import { TWallet } from '@/modules/coins/schema'
import { TTransaction } from '@/modules/transactions/schema'
import { TableCell } from '@/modules/transactions/ui/components/table-cell'
import { WalletIcon } from '@/modules/transactions/ui/components/wallet-icon'

export const columns: ColumnDef<TTransaction>[] = [
	// Coin name
	{
		accessorKey: 'userCoin.coin.name',
		header: ({ column }) => {
			return (
				<Button
					variant='ghost'
					className='px-0'
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				>
					Coin
					{column.getIsSorted() === 'asc' ? (
						<ArrowUpIcon className='size-4' />
					) : (
						<ArrowDownIcon className='size-4' />
					)}
				</Button>
			)
		},
		cell: ({ row }) => {
			const coin = row.original.userCoin.coin

			return (
				<div className='flex min-w-46 items-center gap-2'>
					<Image
						src={coin.image || '/svg/coin-not-found.svg'}
						alt={coin.name}
						width={24}
						height={24}
						onError={(e) => {
							e.currentTarget.src = '/svg/coin-not-found.svg'
						}}
						className='size-6 rounded-full max-[500px]:size-5'
					/>

					<span className='truncate'>
						{coin.name} ({coin.symbol.toUpperCase()})
					</span>
				</div>
			)
		},
		enableHiding: false,
	},

	// Type
	{
		accessorKey: 'type',
		header: ({ column }) => {
			return (
				<Button
					variant='ghost'
					className='px-0'
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				>
					Type
					{column.getIsSorted() === 'asc' ? (
						<ArrowUpIcon className='size-4' />
					) : (
						<ArrowDownIcon className='size-4' />
					)}
				</Button>
			)
		},
		cell: ({ row }) => {
			const amount = parseFloat(row.getValue('quantity')) || 0

			return (
				<div className='inline-flex items-center gap-2'>
					<div className={amount > 0 ? 'text-green-500' : 'text-red-500'}>
						{amount > 0 ? <ArrowDownToLine size={16} /> : <ArrowUpFromLine size={16} />}
					</div>

					<span className='-mb-1'>{amount > 0 ? 'Buy' : 'Sell'}</span>
				</div>
			)
		},
		sortingFn: (rowA, rowB) => {
			const amountA = rowA.original.quantity
			const amountB = rowB.original.quantity
			return amountA - amountB
		},
	},

	// Quantity
	{
		accessorKey: 'quantity',
		header: ({ column }) => {
			return (
				<Button
					variant='ghost'
					className='px-0'
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
		cell: ({ row }) => {
			const amount = parseFloat(row.getValue('quantity')) || 0

			return <div className='px-3 py-2 text-base max-[1200px]:text-sm'>{amount}</div>
		},
	},

	// Price
	{
		accessorKey: 'price',
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
			const amount = parseFloat(row.getValue('price')) || 0

			return <TableCell value={amount} />
		},
	},

	// Total
	{
		accessorKey: 'total',
		header: ({ column }) => {
			return (
				<Button
					variant='ghost'
					className='px-0'
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				>
					Total
					{column.getIsSorted() === 'asc' ? (
						<ArrowUpIcon className='size-4' />
					) : (
						<ArrowDownIcon className='size-4' />
					)}
				</Button>
			)
		},
		cell: ({ row }) => {
			const price = parseFloat(row.getValue('price')) || 0
			const quantity = parseFloat(row.getValue('quantity')) || 0
			const total = quantity * price

			return <TableCell value={total} />
		},
		sortingFn: (rowA, rowB) => {
			const priceA = parseFloat(rowA.getValue('price')) || 0
			const quantityA = parseFloat(rowA.getValue('quantity')) || 0
			const totalA = quantityA * priceA

			const priceB = parseFloat(rowB.getValue('price')) || 0
			const quantityB = parseFloat(rowB.getValue('quantity')) || 0
			const totalB = quantityB * priceB

			return totalA - totalB
		},
	},

	// Date
	{
		accessorKey: 'date',
		header: ({ column }) => {
			return (
				<Button
					variant='ghost'
					className='px-0'
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
			const date = row.getValue('date') as Date

			return (
				<div className='px-3 py-2 text-base max-[1200px]:text-sm'>
					{format(new Date(date), 'dd.MM.yyyy, HH:mm')}
				</div>
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
					className='px-0'
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
		cell: ({ row }) => {
			const wallet = row.getValue('wallet') as TWallet
			const label = wallet.replace(/_/g, ' ').toLowerCase()

			return (
				<div
					tabIndex={0}
					role='textbox'
					aria-label={`wallet: ${label}`}
					className='flex min-w-46 items-center gap-2 px-3 py-2 text-base max-[1200px]:text-sm'
				>
					<WalletIcon wallet={wallet} />

					<span className='truncate capitalize'>{label}</span>
				</div>
			)
		},
	},
]
