import {
	useReactTable,
	getCoreRowModel,
	flexRender,
	ColumnDef,
	SortingState,
	getSortedRowModel,
} from '@tanstack/react-table'
import { useState } from 'react'

import {
	ScrollArea,
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui'
import { formatPrice } from '@/constants/format-price'

interface Props<TData extends { quantity: number; price: number }> {
	data: TData[]
	columns: ColumnDef<TData>[]
}

export function DataTable<TData extends { quantity: number; price: number }>({
	columns,
	data,
}: Props<TData>) {
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

	// Вычисляем общие значения
	const totals = data.reduce(
		(acc, purchase) => {
			acc.totalQuantity += purchase.quantity
			acc.totalValue += purchase.quantity * purchase.price
			return acc
		},
		{ totalQuantity: 0, totalValue: 0 },
	)

	const averagePrice = totals.totalQuantity > 0 ? totals.totalValue / totals.totalQuantity : 0

	return (
		<ScrollArea className="h-[50vh] bg-background">
			<Table className="border-x">
				<TableHeader className="sticky top-0 bg-secondary">
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<TableHead key={header.id} className="pl-7">
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
									<TableCell key={cell.id}>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={columns.length} className="h-24 text-center">
								No purchases found
							</TableCell>
						</TableRow>
					)}
				</TableBody>

				<TableFooter className="sticky bottom-0 bg-secondary">
					<TableRow>
						<TableCell className="pl-7">{formatPrice(totals.totalQuantity)}</TableCell>

						<TableCell className="pl-7">{formatPrice(averagePrice)}</TableCell>

						<TableCell />
					</TableRow>
				</TableFooter>
			</Table>
		</ScrollArea>
	)
}
