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
			className='relative h-full cursor-pointer overflow-y-auto
				[&::-webkit-scrollbar]:h-1.5
				[&::-webkit-scrollbar]:w-1.5
				[&::-webkit-scrollbar-thumb]:rounded-full
				[&::-webkit-scrollbar-thumb]:bg-gray-400
				dark:[&::-webkit-scrollbar-thumb]:bg-slate-600
				[&::-webkit-scrollbar-thumb:hover]:bg-gray-500
				dark:[&::-webkit-scrollbar-thumb:hover]:bg-slate-500
				[&::-webkit-scrollbar-track]:bg-gray-100
				dark:[&::-webkit-scrollbar-track]:bg-slate-800'
		>
			<Table className='border-x'>
				<TableHeader className='sticky top-0 z-20 bg-gray-100 text-left text-sm dark:border-gray-700 dark:bg-slate-800'>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header, i) => (
								<TableHead
									key={header.id}
									className={cn(
										'max-[1200px]:px-3 max-[1200px]:py-2 max-[600px]:px-2 max-[600px]:py-1 max-[400px]:px-1 max-[400px]:py-1',
										i === 0 && 'sticky left-[0.05rem] bg-gray-100 dark:bg-slate-800',
										i === 1 &&
											'sticky left-[6.5rem] min-w-20 bg-gray-100 max-[600px]:left-[6.0rem] max-[400px]:left-[5.5rem] dark:bg-slate-800',
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

				<TableBody>
					{table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map((row) => (
							<TableRow key={row.id} className='group cursor-pointer duration-0'>
								{row.getVisibleCells().map((cell, i) => (
									<TableCell
										key={cell.id}
										className={cn(
											'group-hover:bg-gray-50 max-[1200px]:px-3 max-[1200px]:py-2 max-[600px]:px-2 max-[600px]:py-1 max-[400px]:px-1 max-[400px]:py-1 dark:group-hover:bg-gray-700',
											i === 0 && 'sticky left-[0.05rem] bg-background dark:bg-background',
											i === 1 &&
												'sticky left-[6.5rem] min-w-20 bg-background max-[600px]:left-[6.0rem] max-[400px]:left-[5.5rem] dark:bg-background',
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
								No transactions found
							</TableCell>
						</TableRow>
					)}
				</TableBody>

				<TableFooter className='sticky bottom-0 z-20 bg-secondary'>
					<TableRow className='max-[900px]:text-sm max-[600px]:text-xs'>
						<TableCell
							className={cn(
								'pl-7 max-[900px]:pr-2 max-[900px]:pl-5 max-[600px]:pr-0 max-[600px]:pl-2',
								'sticky left-[0.05rem] bg-gray-100 dark:bg-slate-800',
							)}
						>
							{formatValue(totals.totalQuantity)}
						</TableCell>

						<TableCell
							className={cn(
								'pl-7 max-[900px]:pr-2 max-[900px]:pl-5 max-[600px]:pr-0 max-[600px]:pl-2',
								'sticky left-[6.5rem] min-w-20 bg-gray-100 max-[600px]:left-[6.0rem] max-[400px]:left-[5.5rem] dark:bg-slate-800',
							)}
						>
							{formatUSDPrice(averagePrice)}
						</TableCell>

						<TableCell className='pl-7 max-[900px]:pr-2 max-[900px]:pl-5 max-[600px]:pr-0 max-[600px]:pl-2' />

						<TableCell className='pl-7 max-[900px]:pr-2 max-[900px]:pl-5 max-[600px]:pr-0 max-[600px]:pl-2' />

						<TableCell className='pl-7 max-[900px]:pr-2 max-[900px]:pl-5 max-[600px]:pr-0 max-[600px]:pl-2' />
					</TableRow>
				</TableFooter>
			</Table>
		</div>
	)
}
