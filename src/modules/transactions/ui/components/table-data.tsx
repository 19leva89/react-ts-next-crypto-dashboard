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
import { useId, useState } from 'react'

import {
	Button,
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
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
	onRowClick: (rowData: TData) => void
}

/**
 * Transaction data table component with sorting, filtering, and pagination features
 * Handles transaction display with coin name search, column visibility controls, and sticky first column
 * Includes responsive design, hover effects, and accessibility features for transaction management
 * @param props - DataTable component props
 * @param props.columns - Column definitions for the transaction table structure and rendering
 * @param props.data - Array of transaction data objects to display in the table
 * @param props.onRowClick - Callback function triggered when a transaction row is clicked
 * @returns JSX element with complete transaction table including search, controls, table content, and pagination
 */
export function DataTable<TData, TValue>({ columns, data, onRowClick }: Props<TData, TValue>) {
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
	const [sorting, setSorting] = useState<SortingState>([{ id: 'date', desc: true }])

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

	const filterValue = (table.getColumn('userCoin_coin_name')?.getFilterValue() as string) ?? ''

	const handleFilterChange = (value: string) => {
		table.getColumn('userCoin_coin_name')?.setFilterValue(value)
	}

	return (
		<>
			<div className='flex items-center justify-between gap-2 py-4 md:gap-8'>
				{/* Search */}
				<div className='w-full'>
					<InputGroup className='h-10 overflow-hidden rounded-xl transition-colors duration-300 ease-in-out hover:bg-accent dark:bg-transparent'>
						<InputGroupAddon align='inline-start'>
							<SearchIcon className='size-4.5' />
						</InputGroupAddon>

						<InputGroupInput
							placeholder='Filter transactions...'
							value={filterValue}
							onChange={(e) => handleFilterChange(e.target.value)}
						/>

						<InputGroupAddon align='inline-end'>
							<Tooltip>
								<TooltipTrigger asChild>
									<InputGroupButton
										variant='ghost'
										size='icon-sm'
										onClick={() => table.getColumn('userCoin_coin_name')?.setFilterValue('')}
										className={cn(
											'hover:bg-transparent dark:hover:text-gray-200',
											filterValue ? 'opacity-100' : 'pointer-events-none opacity-0',
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

				<div className='flex items-center gap-2'>
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

						<DropdownMenuContent align='end' className='rounded-xl'>
							{table
								.getAllColumns()
								.filter((column) => column.getCanHide())
								.map((column) => {
									const readableName = column.id.replace(/_/g, ' ') // Replace '_' with ' '

									return (
										<DropdownMenuCheckboxItem
											key={column.id}
											className='rounded-xl capitalize'
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
									No transactions found. Try another search!
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
