'use client'

import {
	ColumnDef,
	ColumnFiltersState,
	SortingState,
	VisibilityState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from '@tanstack/react-table'
import { useState } from 'react'
import { FixedSizeList as List } from 'react-window'
import { ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from 'lucide-react'

import {
	Button,
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui'
import { CoinData } from '@/app/api/definitions'

interface DataTableProps<TData, TValue> {
	data: TData[]
	columns: ColumnDef<TData, TValue>[]
	categories: { category_id: string; name: string }[]
	currentCategorie: string
	onCoinsClick: (coinId: string) => void
	onCategorieClick: (categorie: string, name?: string) => void
}

export function DataTable<TData, TValue>({
	columns,
	data,
	categories,
	currentCategorie,
	onCoinsClick,
	onCategorieClick,
}: DataTableProps<TData, TValue>) {
	const [sorting, setSorting] = useState<SortingState>([])
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
	const [rowSelection, setRowSelection] = useState({})

	const table = useReactTable({
		data,
		columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
		},
	})

	const handleFilterChange = (value: string) => {
		table.getColumn('name')?.setFilterValue(value)
	}

	return (
		<div className="flex flex-col w-full">
			<div className="flex items-center justify-between gap-2 py-4">
				{/* Search */}
				<div className="relative w-full max-w-sm sm:w-[350px]">
					<Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />

					<Input
						placeholder="Filter coins..."
						value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
						onChange={(e) => handleFilterChange(e.target.value)}
						className="pl-10 rounded-xl"
					/>
				</div>

				<div className="flex items-center gap-2">
					{/* Filter by category */}
					<div className="w-full sm:w-64">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									id="categorie-btn"
									variant="outline"
									size="lg"
									disabled={!categories.length}
									className="w-full h-10 py-2 px-4 justify-between rounded-xl group"
								>
									<span className="truncate">{currentCategorie || 'Categories'}</span>

									<ChevronDown
										size={16}
										className="transition-transform duration-300 group-hover:rotate-180"
									/>
								</Button>
							</DropdownMenuTrigger>

							{categories.length ? (
								<DropdownMenuContent
									align="start"
									className="w-full max-h-64 mt-1 py-1 overflow-y-hidden rounded-xl shadow-xl bg-white dark:bg-dark"
								>
									<DropdownMenuItem className="rounded-xl">
										<button
											className="p-2 w-full text-start rounded-xl"
											onClick={() => {
												onCategorieClick('')
											}}
										>
											All categories
										</button>
									</DropdownMenuItem>

									<List
										height={200}
										width={246}
										itemSize={40} // Height of one element
										itemCount={categories?.length} // Quantity of elements
									>
										{({ index, style }) => (
											<DropdownMenuItem
												key={categories[index].category_id}
												className="rounded-xl"
												style={style}
											>
												<button
													className="p-2 w-full text-start rounded-xl"
													onClick={() =>
														onCategorieClick(categories[index].category_id, categories[index].name)
													}
												>
													{categories[index].name}
												</button>
											</DropdownMenuItem>
										)}
									</List>
								</DropdownMenuContent>
							) : (
								<p className="text-sm text-gray-500 px-4 py-2">No categories available</p>
							)}
						</DropdownMenu>
					</div>

					{/* Visibility columns */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" className="ml-auto rounded-xl">
								Columns <ChevronDown />
							</Button>
						</DropdownMenuTrigger>

						<DropdownMenuContent align="end">
							{table
								.getAllColumns()
								.filter((column) => column.getCanHide())
								.map((column) => {
									const readableName = column.id.replace(/_/g, ' ') // Replace '_' with ' '

									return (
										<DropdownMenuCheckboxItem
											key={column.id}
											className="capitalize"
											checked={column.getIsVisible()}
											onCheckedChange={(value) => column.toggleVisibility(!!value)}
										>
											{readableName}
										</DropdownMenuCheckboxItem>
									)
								})}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			<div className="border">
				<Table>
					<TableHeader className="text-left bg-gray-100 dark:bg-slate-800 text-sm border-b dark:border-gray-700">
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead key={header.id}>
											{header.isPlaceholder
												? null
												: flexRender(header.column.columnDef.header, header.getContext())}
										</TableHead>
									)
								})}
							</TableRow>
						))}
					</TableHeader>

					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									onClick={() => onCoinsClick((row.original as CoinData).id)}
									className="cursor-pointer"
								>
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
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			<div className="flex items-center justify-end px-2 pt-4">
				<div className="flex items-center space-x-6 lg:space-x-8">
					<div className="flex items-center space-x-2">
						<p className="text-sm font-medium">Rows per page</p>

						<Select
							value={`${table.getState().pagination.pageSize}`}
							onValueChange={(value) => {
								table.setPageSize(Number(value))
							}}
						>
							<SelectTrigger className="h-8 w-[70px]">
								<SelectValue placeholder={table.getState().pagination.pageSize} />
							</SelectTrigger>

							<SelectContent side="top">
								{[10, 20, 30, 40, 50].map((pageSize) => (
									<SelectItem key={pageSize} value={`${pageSize}`}>
										{pageSize}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="flex w-[100px] items-center justify-center text-sm font-medium">
						Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
					</div>

					<div className="flex items-center space-x-2">
						<Button
							variant="outline"
							className="hidden h-8 w-8 p-0 lg:flex"
							onClick={() => table.setPageIndex(0)}
							disabled={!table.getCanPreviousPage()}
						>
							<span className="sr-only">Go to first page</span>

							<ChevronsLeft />
						</Button>

						<Button
							variant="outline"
							className="h-8 w-8 p-0"
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}
						>
							<span className="sr-only">Go to previous page</span>

							<ChevronLeft />
						</Button>

						<Button
							variant="outline"
							className="h-8 w-8 p-0"
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}
						>
							<span className="sr-only">Go to next page</span>

							<ChevronRight />
						</Button>

						<Button
							variant="outline"
							className="hidden h-8 w-8 p-0 lg:flex"
							onClick={() => table.setPageIndex(table.getPageCount() - 1)}
							disabled={!table.getCanNextPage()}
						>
							<span className="sr-only">Go to last page</span>

							<ChevronsRight />
						</Button>
					</div>
				</div>
			</div>
		</div>
	)
}
