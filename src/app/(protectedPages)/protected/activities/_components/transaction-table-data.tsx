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

interface Props<TData extends { quantity: number; price: number; date: Date }> {
	data: TData[]
	columns: ColumnDef<TData>[]
}

export function DataTable<TData extends { quantity: number; price: number; date: Date }>({
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
	const sortedData = data.slice().sort((a, b) => a.date.getTime() - b.date.getTime())

	const totals = sortedData.reduce(
		(acc, transaction) => {
			const quantity = transaction.quantity
			const price = transaction.price

			if (quantity > 0) {
				// Покупка: добавляем количество и стоимость
				acc.totalQuantity += quantity
				acc.totalCost += quantity * price
			} else if (quantity < 0) {
				// Продажа: списываем по текущей средней цене
				const absoluteQty = -quantity
				if (acc.totalQuantity <= 0 || absoluteQty === 0) return acc

				// Если продажа больше доступного количества, продаём всё
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
		<ScrollArea className="h-[50vh] bg-background">
			<Table className="border-x w-full">
				<TableHeader className="sticky top-0 bg-secondary">
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<TableHead key={header.id} className="pl-7 max-[900px]:pl-5 max-[900px]:pr-2">
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
									<TableCell key={cell.id} className="max-[900px]:p-2 max-[600px]:px-1 max-[450px]:pr-0">
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={columns.length} className="h-24 text-center">
								No transactions found
							</TableCell>
						</TableRow>
					)}
				</TableBody>

				<TableFooter className="sticky bottom-0 bg-secondary">
					<TableRow className="max-[900px]:text-sm max-[600px]:text-xs">
						<TableCell className="pl-7 max-[900px]:pl-5 max-[900px]:pr-2 max-[600px]:pl-2 max-[600px]:pr-0">
							{formatPrice(totals.totalQuantity)}
						</TableCell>

						<TableCell className="pl-7 max-[900px]:pl-5 max-[900px]:pr-2 max-[600px]:pl-2 max-[600px]:pr-0">
							{formatPrice(averagePrice)}
						</TableCell>

						<TableCell className="pl-7 max-[900px]:pl-5 max-[900px]:pr-2 max-[600px]:pl-2 max-[600px]:pr-0" />

						<TableCell className="pl-7 max-[900px]:pl-5 max-[900px]:pr-2 max-[600px]:pl-2 max-[600px]:pr-0" />
					</TableRow>
				</TableFooter>
			</Table>
		</ScrollArea>
	)
}
