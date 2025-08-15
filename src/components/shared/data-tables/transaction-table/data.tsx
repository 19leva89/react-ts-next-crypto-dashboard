import {
	useReactTable,
	getCoreRowModel,
	flexRender,
	ColumnDef,
	SortingState,
	getSortedRowModel,
} from '@tanstack/react-table'
import { useState } from 'react'

import { useFormatPrice } from '@/hooks/use-format-price'
import { useCurrencyConverter } from '@/hooks/use-currency-converter'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui'

interface Props<TData extends { quantity: number; price: number; date: string }> {
	data: TData[]
	columns: ColumnDef<TData>[]
}

export function DataTable<TData extends { quantity: number; price: number; date: string }>({
	columns,
	data,
}: Props<TData>) {
	const formatPrice = useFormatPrice()
	const { fromUSD } = useCurrencyConverter()

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
		<Table className='w-full border-x'>
			<TableHeader className='sticky top-0 bg-secondary'>
				{table.getHeaderGroups().map((headerGroup) => (
					<TableRow key={headerGroup.id}>
						{headerGroup.headers.map((header) => (
							<TableHead key={header.id} className='pl-7 max-[900px]:pr-2 max-[900px]:pl-5 max-[600px]:pl-3'>
								{flexRender(header.column.columnDef.header, header.getContext())}
							</TableHead>
						))}
					</TableRow>
				))}
			</TableHeader>

			<TableBody>
				{table.getRowModel().rows?.length ? (
					table.getRowModel().rows.map((row) => (
						<TableRow key={row.id}>
							{row.getVisibleCells().map((cell) => (
								<TableCell key={cell.id} className='max-[900px]:p-2 max-[600px]:px-1 max-[450px]:pr-0'>
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

			<TableFooter className='sticky bottom-0 bg-secondary'>
				<TableRow className='max-[900px]:text-sm max-[600px]:text-xs'>
					<TableCell className='pl-7 max-[900px]:pr-2 max-[900px]:pl-5 max-[600px]:pr-0 max-[600px]:pl-2'>
						{formatPrice(totals.totalQuantity, false)}
					</TableCell>

					<TableCell className='pl-7 max-[900px]:pr-2 max-[900px]:pl-5 max-[600px]:pr-0 max-[600px]:pl-2'>
						{formatPrice(fromUSD(averagePrice))}
					</TableCell>

					<TableCell className='pl-7 max-[900px]:pr-2 max-[900px]:pl-5 max-[600px]:pr-0 max-[600px]:pl-2' />

					<TableCell className='pl-7 max-[900px]:pr-2 max-[900px]:pl-5 max-[600px]:pr-0 max-[600px]:pl-2' />
				</TableRow>
			</TableFooter>
		</Table>
	)
}
