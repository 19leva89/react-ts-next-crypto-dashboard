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
import { ChevronDown, Search } from 'lucide-react'
import { useDebounce } from 'use-debounce'
import { FixedSizeList as List } from 'react-window'
import { ChangeEvent, useEffect, useState } from 'react'

import {
	Button,
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	Input,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui'
import { CategoriesData, CoinListData } from '@/app/api/definitions'
import { fetchCategories, fetchCoinsList, fetchCoinsListByCate } from '@/app/api/actions'

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[]
	data: TData[]
}

export function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
	const [sorting, setSorting] = useState<SortingState>([])
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
	const [rowSelection, setRowSelection] = useState({})

	const [categories, setCategories] = useState<CategoriesData>([])
	const [coinsList, setCoinsList] = useState<CoinListData>([])
	const [currentDatas, setCurrentDatas] = useState<CoinListData>([])
	const [fetchingCoins, setFetchingCoins] = useState<boolean>(false)
	const [showDetailModal, setShowDetailModal] = useState<boolean>(false)
	const [currentCoinId, setCurrentCoinId] = useState<string>('')
	const [currentCategorie, setCurrentCategorie] = useState<string>('All')

	// const [debouncedSearch] = useDebounce(searchStr, 300)

	// Fetch categories and coin list on component mount
	useEffect(() => {
		fetchCategories().then((resp) => {
			if (resp) {
				setCategories(resp)
			}
		})

		setFetchingCoins(true)

		fetchCoinsList().then((resp) => {
			setFetchingCoins(false)
			if (resp) {
				setCoinsList(resp)
			}
		})
	}, [])

	// Filter coins based on debounced search string
	// useEffect(() => {
	// 	if (debouncedSearch.length > 0) {
	// 		const results = coinsList.filter(
	// 			(coin) =>
	// 				coin?.name?.toLowerCase().includes(debouncedSearch) ||
	// 				coin?.id?.toLowerCase().includes(debouncedSearch) ||
	// 				coin?.symbol?.toLowerCase().includes(debouncedSearch) ||
	// 				coin?.current_price?.toString().includes(debouncedSearch) ||
	// 				coin?.market_cap_rank?.toString().includes(debouncedSearch),
	// 		)
	// 		setSearchResults(results)
	// 	} else {
	// 		setSearchResults([])
	// 	}
	// }, [debouncedSearch, coinsList])

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

	// Handle category selection
	const onCategorieClick = (cate: string, name?: string) => {
		setFetchingCoins(true)
		setCoinsList([])
		if (cate) {
			name && setCurrentCategorie(name)
			fetchCoinsListByCate(cate).then((resp) => {
				setFetchingCoins(false)
				if (resp) {
					setCoinsList(resp)
				}
			})
		} else {
			setCurrentCategorie('All')
			// if exist, request won't be sent, cause cache in the ls (Local storage)
			fetchCoinsList().then((resp) => {
				setFetchingCoins(false)
				if (resp) {
					setCoinsList(resp)
				}
			})
		}
	}

	// Handle coin detail modal
	const toggleDetailModal = () => {
		setShowDetailModal(!showDetailModal)
	}

	return (
		<div className="w-full">
			<div className="flex items-center justify-between gap-2 py-4">
				{/* Search */}
				<div className="relative w-full max-w-sm sm:w-[350px]">
					<Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />

					<Input
						placeholder="Filter coins..."
						value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
						onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
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
									className="w-full h-10 py-2 px-4 justify-between rounded-xl group"
								>
									<span className="truncate">{currentCategorie || 'Categories'}</span>

									<ChevronDown
										size={16}
										className="transition-transform duration-300 group-hover:rotate-180"
									/>
								</Button>
							</DropdownMenuTrigger>

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

			<div className="rounded-md border">
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
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			<div className="flex items-center justify-end space-x-2 py-4">
				<div className="space-x-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
						className="rounded-xl"
					>
						Previous
					</Button>

					<Button
						variant="outline"
						size="sm"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
						className="rounded-xl"
					>
						Next
					</Button>
				</div>
			</div>
		</div>
	)
}
