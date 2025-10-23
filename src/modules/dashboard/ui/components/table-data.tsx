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
import { List } from 'react-window'
import { CSSProperties, useCallback, useId, useState } from 'react'

import {
	Button,
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
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
	Tooltip,
	TooltipContent,
	TooltipTrigger,
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

interface RowComponentProps {
	index: number
	style: CSSProperties
	data: { category_id: string; name: string }[]
}

/**
 * Comprehensive data table component with advanced features and responsive design
 * Handles sorting, filtering, pagination, column visibility, category filtering, and virtualized row rendering
 * Includes search functionality, sticky columns, custom scrollbars, and accessibility features
 * @param props - DataTable component props
 * @param props.columns - Column definitions for the table structure and rendering
 * @param props.data - Array of data objects to display in the table
 * @param props.categories - Available categories for filtering with virtualized dropdown
 * @param props.currentCategory - Currently selected category filter name
 * @param props.onRowClick - Callback function triggered when a table row is clicked
 * @param props.onCategoryClick - Callback function triggered when a category filter is selected
 * @returns JSX element with complete data table including controls, table content, and pagination
 */
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

	const selectId = useId()
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

	const searchQuery = (table.getColumn('name')?.getFilterValue() as string) ?? ''

	const handleFilterChange = (value: string) => {
		table.getColumn('name')?.setFilterValue(value)
	}

	const RowComponent = useCallback(
		({ index, style, data }: RowComponentProps) => {
			const category = data[index]

			return (
				<DropdownMenuItem key={category.category_id} className='!w-[98.5%] rounded-xl' style={style}>
					<button
						onClick={() => onCategoryClick(category.category_id, category.name)}
						className='w-full rounded-xl p-2 text-start'
					>
						{category.name}
					</button>
				</DropdownMenuItem>
			)
		},

		[onCategoryClick],
	)

	return (
		<>
			<div className='flex flex-wrap items-center justify-end gap-2 py-4 md:flex-nowrap md:justify-between md:gap-8'>
				{/* Search */}
				<div className='w-full md:w-2/3'>
					<InputGroup className='h-10 overflow-hidden rounded-xl transition-colors duration-300 ease-in-out hover:bg-accent dark:bg-transparent'>
						<InputGroupAddon align='inline-start'>
							<SearchIcon className='size-4.5' />
						</InputGroupAddon>

						<InputGroupInput
							placeholder='Filter coins...'
							value={searchQuery}
							onChange={(e) => handleFilterChange(e.target.value)}
						/>

						<InputGroupAddon align='inline-end'>
							<Tooltip>
								<TooltipTrigger asChild>
									<InputGroupButton
										variant='ghost'
										size='icon-sm'
										onClick={() => table.getColumn('name')?.setFilterValue('')}
										className={cn(
											'hover:bg-transparent dark:hover:text-gray-200',
											searchQuery ? 'opacity-100' : 'pointer-events-none opacity-0',
										)}
									>
										<XIcon />
									</InputGroupButton>
								</TooltipTrigger>

								<TooltipContent className='rounded-xl text-white'>
									<p>Clear</p>
								</TooltipContent>
							</Tooltip>
						</InputGroupAddon>
					</InputGroup>
				</div>

				<div className='flex w-full items-center justify-between gap-2 md:w-max'>
					{/* Filter by category */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								id='category-btn'
								variant='outline'
								size='lg'
								disabled={!categories.length}
								className='group h-10 w-2/4 justify-between rounded-xl px-4 py-2 transition-colors duration-300 ease-in-out md:w-fit'
							>
								<span className='truncate'>{currentCategory || 'Categories'}</span>

								<div className='relative size-5 transition-transform duration-300 group-hover:rotate-180'>
									<ChevronDownIcon className='absolute inset-0 m-auto' />
								</div>
							</Button>
						</DropdownMenuTrigger>

						{categories.length ? (
							<DropdownMenuContent
								align='start'
								className='mt-1 max-h-64 w-full overflow-y-hidden rounded-xl py-1 shadow-xl'
							>
								<DropdownMenuItem className='rounded-xl'>
									<button
										onClick={() => {
											onCategoryClick('')
										}}
										className='w-full rounded-xl px-2 py-1 text-start'
									>
										All categories
									</button>
								</DropdownMenuItem>

								<List
									rowComponent={({ index, style }) => (
										<RowComponent index={index} style={style} data={categories} />
									)}
									rowCount={categories.length}
									rowHeight={40}
									rowProps={{
										'aria-posinset': 1,
										'aria-setsize': categories.length,
										role: 'listitem',
									}}
									overscanCount={15}
									className='h-50 w-62 cursor-pointer
										[&::-webkit-scrollbar]:h-1.5
										[&::-webkit-scrollbar]:w-1.5
										[&::-webkit-scrollbar-thumb]:rounded-full
										[&::-webkit-scrollbar-thumb]:bg-gray-400
										dark:[&::-webkit-scrollbar-thumb]:bg-slate-600
										[&::-webkit-scrollbar-thumb:hover]:bg-gray-500
										dark:[&::-webkit-scrollbar-thumb:hover]:bg-slate-500
										[&::-webkit-scrollbar-track]:m-1.5
										[&::-webkit-scrollbar-track]:rounded-full
										[&::-webkit-scrollbar-track]:bg-gray-100
										dark:[&::-webkit-scrollbar-track]:bg-slate-800'
								/>
							</DropdownMenuContent>
						) : (
							<p className='px-4 py-2 text-sm text-gray-500'>No categories available</p>
						)}
					</DropdownMenu>

					{/* Visibility columns */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant='outline'
								className='group w-min rounded-xl px-4 py-2 transition-colors duration-300 ease-in-out'
							>
								<span>Columns</span>

								<div className='relative size-5 transition-transform duration-300 group-hover:rotate-180'>
									<ChevronDownIcon className='absolute inset-0 m-auto' />
								</div>
							</Button>
						</DropdownMenuTrigger>

						<DropdownMenuContent align='end' className='rounded-xl'>
							{table
								.getAllColumns()
								.filter((column) => column.getCanHide())
								.map((column) => {
									let readableName = column.id.replace(/_/g, ' ') // Replace '_' with ' '

									readableName = readableName.charAt(0).toUpperCase() + readableName.slice(1)

									return (
										<DropdownMenuCheckboxItem
											key={column.id}
											className='rounded-xl'
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

			<div
				className='relative cursor-pointer overflow-auto rounded-xl border
					[&::-webkit-scrollbar]:h-1.5
					[&::-webkit-scrollbar]:w-1.5
					[&::-webkit-scrollbar-thumb]:rounded-full
					[&::-webkit-scrollbar-thumb]:bg-gray-400
					dark:[&::-webkit-scrollbar-thumb]:bg-slate-600
					[&::-webkit-scrollbar-thumb:hover]:bg-gray-500
					dark:[&::-webkit-scrollbar-thumb:hover]:bg-slate-500
					[&::-webkit-scrollbar-track]:m-1.5
					[&::-webkit-scrollbar-track]:rounded-full
					[&::-webkit-scrollbar-track]:bg-transparent'
			>
				<Table>
					<TableHeader className='border-b bg-gray-100 text-left text-sm dark:border-gray-700 dark:bg-slate-800'>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header, i) => {
									return (
										<TableHead
											key={header.id}
											className={cn(
												'px-1 py-0 xs:px-2 xs:py-1 sm:px-3 sm:py-2 xl:px-4 xl:py-3',
												i === 0 && 'sticky left-[0rem] bg-gray-100 dark:bg-slate-800',
												i === 1 &&
													'sticky left-[4rem] min-w-36 bg-gray-100 xs:left-[4.5rem] sm:left-[5rem] dark:bg-slate-800',
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
												'px-1 py-0 group-hover:bg-gray-50 xs:px-2 xs:py-1 sm:px-3 sm:py-2 xl:px-4 xl:py-3 dark:group-hover:bg-gray-800',
												i === 0 && 'sticky left-[0rem] bg-background dark:bg-background',
												i === 1 &&
													'sticky left-[4rem] min-w-36 bg-background xs:left-[4.5rem] sm:left-[5rem] dark:bg-background',
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
					<div className='hidden items-center gap-2 sm:flex'>
						<p className='text-sm font-medium'>Rows per page</p>

						<Select
							value={`${table.getState().pagination.pageSize}`}
							onValueChange={(value) => {
								table.setPageSize(Number(value))
							}}
						>
							<SelectTrigger
								id={selectId}
								className='h-8 w-fit rounded-xl transition-colors duration-300 ease-in-out hover:bg-accent'
							>
								<SelectValue placeholder={table.getState().pagination.pageSize} />
							</SelectTrigger>

							<SelectContent side='top' className='rounded-xl'>
								{[10, 20, 30, 40, 50].map((pageSize) => (
									<SelectItem key={pageSize} value={`${pageSize}`} className='rounded-xl'>
										{pageSize}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className='flex w-fit items-center justify-center text-sm font-medium'>
						Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
					</div>

					<div className='flex items-center gap-2'>
						<Button
							variant='outline'
							onClick={() => table.setPageIndex(0)}
							className={cn(
								'hidden size-8 rounded-xl p-0 transition-colors duration-300 ease-in-out lg:flex',
								!table.getCanPreviousPage() && 'pointer-events-auto cursor-not-allowed opacity-50',
							)}
						>
							<span className='sr-only'>Go to first page</span>

							<ChevronsLeftIcon />
						</Button>

						<Button
							variant='outline'
							onClick={() => table.previousPage()}
							className={cn(
								'size-8 rounded-xl p-0 transition-colors duration-300 ease-in-out',
								!table.getCanPreviousPage() && 'pointer-events-auto cursor-not-allowed opacity-50',
							)}
						>
							<span className='sr-only'>Go to previous page</span>

							<ChevronLeftIcon />
						</Button>

						<Button
							variant='outline'
							onClick={() => table.nextPage()}
							className={cn(
								'size-8 rounded-xl p-0 transition-colors duration-300 ease-in-out',
								!table.getCanNextPage() && 'pointer-events-auto cursor-not-allowed opacity-50',
							)}
						>
							<span className='sr-only'>Go to next page</span>

							<ChevronRightIcon />
						</Button>

						<Button
							variant='outline'
							onClick={() => table.setPageIndex(table.getPageCount() - 1)}
							className={cn(
								'hidden size-8 rounded-xl p-0 transition-colors duration-300 ease-in-out lg:flex',
								!table.getCanNextPage() && 'pointer-events-auto cursor-not-allowed opacity-50',
							)}
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
