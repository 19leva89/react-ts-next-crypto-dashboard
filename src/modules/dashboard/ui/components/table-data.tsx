'use client'

import {
	ChevronDownIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	ChevronsLeftIcon,
	ChevronsRightIcon,
	SearchIcon,
	XIcon,
} from 'lucide-react'
import {
	ColumnDef,
	ColumnFiltersState,
	RowSelectionState,
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
import { cn } from '@/lib'

interface Props<TData, TValue> {
	data: TData[]
	columns: ColumnDef<TData, TValue>[]
	categories: { category_id: string; name: string }[]
	currentCategory: string
	onRowClick: (rowData: TData) => void
	onCategoryClick: (category: string, name?: string) => void
}

export function DataTable<TData, TValue>({
	columns,
	data,
	categories,
	currentCategory,
	onRowClick,
	onCategoryClick,
}: Props<TData, TValue>) {
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
	const [sorting, setSorting] = useState<SortingState>([{ id: 'total_volume', desc: true }])

	const table = useReactTable({
		data,
		columns,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
		},
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
	})

	const filterValue = (table.getColumn('name')?.getFilterValue() as string) ?? ''

	const handleFilterChange = (value: string) => {
		table.getColumn('name')?.setFilterValue(value)
	}

	return (
		<>
			<div className='flex items-center justify-between gap-8 py-4 max-[820px]:flex-wrap-reverse max-[820px]:justify-end max-[820px]:gap-2'>
				{/* Search */}
				<div className='relative w-full'>
					<SearchIcon
						size={18}
						className='absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400'
					/>

					<Input
						placeholder='Filter coins...'
						value={filterValue}
						onChange={(e) => handleFilterChange(e.target.value)}
						className='rounded-xl px-10'
					/>

					<Button
						variant='ghost'
						size='icon'
						onClick={() => table.getColumn('name')?.setFilterValue('')}
						className={cn(
							'absolute top-1/2 right-1 -translate-y-1/2 hover:bg-transparent hover:text-gray-400',
							filterValue ? 'opacity-100' : 'pointer-events-none opacity-0',
						)}
					>
						<XIcon size={16} />
					</Button>
				</div>

				<div className='flex items-center gap-2'>
					{/* Filter by category */}
					<div className='w-full sm:w-64'>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									id='category-btn'
									variant='outline'
									size='lg'
									disabled={!categories.length}
									className='group h-10 w-full justify-between rounded-xl px-4 py-2 transition-colors duration-300 ease-in-out'
								>
									<span className='truncate'>{currentCategory || 'Categories'}</span>

									<div className='relative size-5 transition-transform duration-300 group-hover:rotate-180'>
										<ChevronDownIcon size={16} className='absolute inset-0 m-auto' />
									</div>
								</Button>
							</DropdownMenuTrigger>

							{categories.length ? (
								<DropdownMenuContent
									align='start'
									className='mt-1 max-h-64 w-full overflow-y-hidden rounded-xl bg-white py-1 shadow-xl dark:bg-gray-900'
								>
									<DropdownMenuItem className='rounded-xl'>
										<button
											className='w-full cursor-pointer rounded-xl px-2 py-1 text-start'
											onClick={() => {
												onCategoryClick('')
											}}
										>
											All categories
										</button>
									</DropdownMenuItem>

									<List
										height={200}
										width={246}
										itemSize={40} // Height of one element
										itemCount={categories.length} // Quantity of elements
									>
										{({ index, style }) => (
											<DropdownMenuItem
												key={categories[index].category_id}
												className='rounded-xl'
												style={style}
											>
												<button
													className='w-full cursor-pointer rounded-xl p-2 text-start'
													onClick={() =>
														onCategoryClick(categories[index].category_id, categories[index].name)
													}
												>
													{categories[index].name}
												</button>
											</DropdownMenuItem>
										)}
									</List>
								</DropdownMenuContent>
							) : (
								<p className='px-4 py-2 text-sm text-gray-500'>No categories available</p>
							)}
						</DropdownMenu>
					</div>

					{/* Visibility columns */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant='outline'
								className='group ml-auto rounded-xl transition-colors duration-300 ease-in-out'
							>
								<span>Columns</span>

								<div className='relative size-5 transition-transform duration-300 group-hover:rotate-180'>
									<ChevronDownIcon size={16} className='absolute inset-0 m-auto' />
								</div>
							</Button>
						</DropdownMenuTrigger>

						<DropdownMenuContent align='end'>
							{table
								.getAllColumns()
								.filter((column) => column.getCanHide())
								.map((column) => {
									const readableName = column.id.replace(/_/g, ' ') // Replace '_' with ' '

									return (
										<DropdownMenuCheckboxItem
											key={column.id}
											className='capitalize'
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

			<div className='relative overflow-auto rounded-xl border'>
				<Table>
					<TableHeader className='border-b bg-gray-100 text-left text-sm dark:border-gray-700 dark:bg-slate-800'>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header, i) => {
									return (
										<TableHead
											key={header.id}
											className={cn(
												'max-[1200px]:px-3 max-[1200px]:py-2 max-[600px]:px-2 max-[600px]:py-1 max-[400px]:px-1 max-[400px]:py-0',
												i === 0 && 'sticky left-[0rem] bg-gray-100 dark:bg-slate-800',
												i === 1 &&
													'sticky left-[5rem] min-w-36 bg-gray-100 max-[600px]:left-[4.5rem] max-[400px]:left-[4rem] dark:bg-slate-800',
											)}
										>
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
									onClick={() => onRowClick(row.original)}
									className='group cursor-pointer duration-0'
								>
									{row.getVisibleCells().map((cell, i) => (
										<TableCell
											key={cell.id}
											className={cn(
												'group-hover:bg-gray-50 max-[1200px]:px-3 max-[1200px]:py-2 max-[600px]:px-2 max-[600px]:py-1 max-[400px]:px-1 max-[400px]:py-0 dark:group-hover:bg-gray-800',
												i === 0 && 'sticky left-[0rem] bg-background dark:bg-background',
												i === 1 &&
													'sticky left-[5rem] min-w-36 bg-background max-[600px]:left-[4.5rem] max-[400px]:left-[4rem] dark:bg-background',
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
									No coins found. Try another search!
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			<div className='flex items-center justify-end px-2 pt-4'>
				<div className='flex items-center gap-2'>
					<div className='flex items-center gap-2 max-[420px]:hidden'>
						<p className='text-sm font-medium'>Rows per page</p>

						<Select
							value={`${table.getState().pagination.pageSize}`}
							onValueChange={(value) => {
								table.setPageSize(Number(value))
							}}
						>
							<SelectTrigger className='h-8 w-[70px]'>
								<SelectValue placeholder={table.getState().pagination.pageSize} />
							</SelectTrigger>

							<SelectContent side='top'>
								{[10, 20, 30, 40, 50].map((pageSize) => (
									<SelectItem key={pageSize} value={`${pageSize}`}>
										{pageSize}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className='flex w-25 items-center justify-center text-sm font-medium'>
						Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
					</div>

					<div className='flex items-center gap-2'>
						<Button
							variant='outline'
							className='hidden size-8 p-0 transition-colors duration-300 ease-in-out lg:flex'
							onClick={() => table.setPageIndex(0)}
							disabled={!table.getCanPreviousPage()}
						>
							<span className='sr-only'>Go to first page</span>

							<ChevronsLeftIcon />
						</Button>

						<Button
							variant='outline'
							className='size-8 p-0 transition-colors duration-300 ease-in-out'
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}
						>
							<span className='sr-only'>Go to previous page</span>

							<ChevronLeftIcon />
						</Button>

						<Button
							variant='outline'
							className='size-8 p-0 transition-colors duration-300 ease-in-out'
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}
						>
							<span className='sr-only'>Go to next page</span>

							<ChevronRightIcon />
						</Button>

						<Button
							variant='outline'
							className='hidden size-8 p-0 transition-colors duration-300 ease-in-out lg:flex'
							onClick={() => table.setPageIndex(table.getPageCount() - 1)}
							disabled={!table.getCanNextPage()}
						>
							<span className='sr-only'>Go to last page</span>

							<ChevronsRightIcon />
						</Button>
					</div>
				</div>
			</div>
		</>
	)
}
