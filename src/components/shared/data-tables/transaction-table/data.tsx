import {
	useReactTable,
	getCoreRowModel,
	flexRender,
	ColumnDef,
	SortingState,
	getSortedRowModel,
} from '@tanstack/react-table'
import { useState } from 'react'

import { cn } from '@/lib'
import { useFormatValue } from '@/hooks/use-format-value'
import { useFormatUSDPrice } from '@/hooks/use-format-usd-price'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui'

interface Props<TData extends { quantity: number; price: number; date: string }> {
	data: TData[]
	columns: ColumnDef<TData>[]
}

/**
 * Generic data table component for displaying transaction data with sorting, sticky columns, and calculated totals
 * Uses moving average (weighted‑average cost) to derive average price and total quantity
 * @param props - Component props
 * @param props.columns - Column definitions for the table
 * @param props.data - Array of transaction data to display
 * @returns JSX element with scrollable table, sticky headers/footers, and calculated totals
 */
export function DataTable<TData extends { quantity: number; price: number; date: string }>({
	columns,
	data,
}: Props<TData>) {
	const formatValue = useFormatValue()
	const formatUSDPrice = useFormatUSDPrice()

	const [sorting, setSorting] = useState<SortingState>([{ id: 'date', desc: false }])

	const table = useReactTable({
		data,
		columns,
		state: {
			sorting,
		},
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	})

	// Calculating total values
	const sortedData = data.slice().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

	const totals = sortedData.reduce(
		(acc, transaction) => {
			const quantity = transaction.quantity
			const price = transaction.price

			if (quantity > 0) {
				// Purchase: add quantity and cost
				acc.totalQuantity += quantity
				acc.totalCost += quantity * price
			} else if (quantity < 0) {
				// Sale: write off at the current average price
				const absoluteQty = -quantity
				if (acc.totalQuantity <= 0 || absoluteQty === 0) return acc

				// If the sale is more than the available quantity, we sell everything
				const sellQty = Math.min(absoluteQty, acc.totalQuantity)
				const averagePriceBefore = acc.totalCost / acc.totalQuantity
				acc.totalCost -= sellQty * averagePriceBefore
				acc.totalQuantity -= sellQty
			}

			return acc
		},
		{ totalQuantity: 0, totalCost: 0 },
	)

	const averagePrice = totals.totalQuantity > 0 ? totals.totalCost / totals.totalQuantity : 0

	return (
		<div
			className={cn(
				`relative h-auto cursor-pointer overflow-y-auto rounded-xl border bg-gray-100 dark:bg-slate-800
				[&::-webkit-scrollbar]:h-1.5
				[&::-webkit-scrollbar]:w-1.5
				[&::-webkit-scrollbar-thumb]:rounded-full
				[&::-webkit-scrollbar-thumb]:bg-gray-400
				dark:[&::-webkit-scrollbar-thumb]:bg-slate-600
				[&::-webkit-scrollbar-thumb:hover]:bg-gray-500
				dark:[&::-webkit-scrollbar-thumb:hover]:bg-slate-500
				[&::-webkit-scrollbar-track]:m-1.5
				[&::-webkit-scrollbar-track]:bg-transparent`,
				table.getRowModel().rows.length > 5 && 'h-full',
			)}
		>
			<Table>
				<TableHeader className='sticky top-0 z-20 bg-gray-100 text-left text-sm dark:border-gray-700 dark:bg-slate-800'>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header, i) => (
								<TableHead
									key={header.id}
									className={cn(
										'px-1 py-1 text-center xs:px-2 sm:px-3 sm:py-2 xl:px-4 xl:py-3',
										i === 0 && 'sticky left-[0.05rem] bg-gray-100 dark:bg-slate-800',
										i === 1 && 'sticky left-31 min-w-20 bg-gray-100 xs:left-33 sm:left-35 dark:bg-slate-800',
									)}
								>
									{header.isPlaceholder
										? null
										: flexRender(header.column.columnDef.header, header.getContext())}
								</TableHead>
							))}
						</TableRow>
					))}
				</TableHeader>

				<TableBody className='bg-background dark:bg-background'>
					{table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map((row) => (
							<TableRow key={row.id} className='group cursor-pointer duration-0'>
								{row.getVisibleCells().map((cell, i) => (
									<TableCell
										key={cell.id}
										className={cn(
											'px-1 py-1 group-hover:bg-gray-50 xs:px-2 sm:px-3 sm:py-2 xl:px-4 xl:py-3 dark:group-hover:bg-gray-700',
											i === 0 && 'sticky left-[0.05rem] bg-background dark:bg-background',
											i === 1 &&
												'sticky left-31 min-w-20 bg-background xs:left-33 sm:left-35 dark:bg-background',
										)}
									>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={columns.length} className='h-24 text-center'>
								No transactions found. Add your first transaction!
							</TableCell>
						</TableRow>
					)}
				</TableBody>

				<TableFooter className='sticky bottom-0 z-20 bg-secondary'>
					<TableRow className='text-xs sm:text-sm lg:text-base'>
						<TableCell className='sticky left-2 bg-gray-100 pr-0 pl-2 sm:pr-2 sm:pl-5 lg:pl-7 dark:bg-slate-800'>
							{formatValue(totals.totalQuantity)}
						</TableCell>

						<TableCell className='sticky left-33 min-w-20 bg-gray-100 pr-0 pl-2 xs:left-35 sm:left-37 sm:pr-2 sm:pl-5 lg:pl-7 dark:bg-slate-800'>
							{formatUSDPrice(averagePrice)}
						</TableCell>

						<TableCell className='pr-0 pl-2 sm:pr-2 sm:pl-5 lg:pl-7' />

						<TableCell className='pr-0 pl-2 sm:pr-2 sm:pl-5 lg:pl-7' />

						<TableCell className='pr-0 pl-2 sm:pr-2 sm:pl-5 lg:pl-7' />
					</TableRow>
				</TableFooter>
			</Table>
		</div>
	)
}
