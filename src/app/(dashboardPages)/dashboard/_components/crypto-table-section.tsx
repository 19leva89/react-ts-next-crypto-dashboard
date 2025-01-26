'use client'

import Image from 'next/image'
import dynamic from 'next/dynamic'
import { useDebounce } from 'use-debounce'
import { FixedSizeList as List } from 'react-window'
import { ChangeEvent, useEffect, useState } from 'react'
import { ChevronDown, EllipsisVertical, Search } from 'lucide-react'

import {
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	Input,
} from '@/components/ui'
import { cn } from '@/lib'
import { Pagination } from '@/components/shared'
import { CategoriesData, CoinListData } from '@/app/api/definitions'
import { CoinDetailModal } from '@/components/shared/modals/coin-detail-modal'
import { fetchCategories, fetchCoinsList, fetchCoinsListByCate } from '@/app/api/actions'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

export const CryptosTableSection = () => {
	const [searchStr, setSearchStr] = useState<string>('')
	const [searchResutls, setSearchResults] = useState<CoinListData>([])
	const [categories, setCategories] = useState<CategoriesData>([])
	const [coinsList, setCoinsList] = useState<CoinListData>([])
	const [currentDatas, setCurrentDatas] = useState<CoinListData>([])
	const [fetchingCoins, setFetchingCoins] = useState<boolean>(false)
	const [showDetailModal, setShowDetailModal] = useState<boolean>(false)
	const [currentCoinId, setCurrentCoinId] = useState<string>('')
	const [currentCategorie, setCurrentCategorie] = useState<string>('All')

	const [debouncedSearch] = useDebounce(searchStr, 300)

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
	useEffect(() => {
		if (debouncedSearch.length > 0) {
			const results = coinsList.filter(
				(coin) =>
					coin?.name?.toLowerCase().includes(debouncedSearch) ||
					coin?.id?.toLowerCase().includes(debouncedSearch) ||
					coin?.symbol?.toLowerCase().includes(debouncedSearch) ||
					coin?.current_price?.toString().includes(debouncedSearch) ||
					coin?.market_cap_rank?.toString().includes(debouncedSearch),
			)
			setSearchResults(results)
		} else {
			setSearchResults([])
		}
	}, [debouncedSearch, coinsList])

	// Handle search input change
	const handleSearchChange = (ev: ChangeEvent<HTMLInputElement>) => {
		setSearchStr(ev.target.value.toLowerCase())
	}

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

	const onCoinsClick = (coinId: string) => {
		setCurrentCoinId(coinId)

		toggleDetailModal()
	}

	return (
		<>
			<div className="mt-10 gap-2 flex justify-between items-center flex-wrap sm:flex-nowrap">
				<div className="rounded-xl relative w-full sm:w-[350px]">
					<Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" />

					{!searchStr && (
						<label
							htmlFor="crypto"
							className="absolute left-10 top-1/2 -translate-y-1/2 flex items-center gap-1 text-sm text-gray-600 dark:text-gray-500 cursor-text"
						>
							<span>Search crypto...</span>
						</label>
					)}

					<Input
						type="search"
						name="crypto"
						id="crypto"
						className="p-2 pl-10 rounded-xl"
						onChange={handleSearchChange}
					/>
				</div>

				<div className="w-full sm:w-64">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								id="categorie-btn"
								variant="outline"
								size="lg"
								className="w-full py-2 px-3 justify-between rounded-xl group"
							>
								<span className="truncate">{currentCategorie || 'Categories'}</span>

								<ChevronDown size={16} className="transition-transform duration-300 group-hover:rotate-180" />
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
									<DropdownMenuItem key={categories[index].category_id} className="rounded-xl" style={style}>
										<button
											className="p-2 w-full text-start rounded-xl"
											onClick={() => onCategorieClick(categories[index].category_id, categories[index].name)}
										>
											{categories[index].name}
										</button>
									</DropdownMenuItem>
								)}
							</List>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			<div className="mt-6 border-2 dark:border-gray-700 rounded-xl overflow-auto no-scrollbar">
				<div className="flex justify-between py-4 px-3 items-center">
					<h4 className="font-medium text-lg">Market</h4>

					<Button variant="outline" size="icon" className="p-3 rounded-xl">
						<EllipsisVertical size={16} className="size-4" />
					</Button>
				</div>

				{fetchingCoins ? (
					<div className="bg-slate-200 animate-pulse h-64"></div>
				) : (
					coinsList &&
					coinsList.length > 0 && (
						<div className="w-full overflow-auto no-scrollbar">
							<table className="table min-w-full w-[950px] ">
								<thead className="bg-gray-100 dark:bg-slate-800 text-sm border-b dark:border-gray-700">
									<tr className="*:text-start text-gray-600 dark:text-slate-100">
										<th scope="col" className="ps-4 py-3">
											#
										</th>

										<th scope="col" className="py-3">
											Coins
										</th>

										<th scope="col" className="py-3">
											Price
										</th>

										<th scope="col" className="py-3">
											24h
										</th>

										<th scope="col" className="py-3">
											24h Volume
										</th>

										<th scope="col" className="py-3">
											Market Cap
										</th>

										<th scope="col" className="py-3 pe-4 flex justify-center">
											<span>Last 7 Days</span>
										</th>
									</tr>
								</thead>

								<tbody>
									{currentDatas?.map((coins) => (
										<tr key={coins.id} className="border-b dark:border-gray-700 last-of-type:border-0">
											<td className="ps-4 py-3">{coins.market_cap_rank ? coins.market_cap_rank : '-'}</td>

											<td className="py-3">
												<button
													className="flex gap-2 items-center "
													onClick={() => {
														onCoinsClick(coins.id)
													}}
												>
													{coins.image && coins.name ? (
														<Image
															src={coins.image || '/svg/coin-not-found.svg'}
															alt={coins.name || 'Coin image'}
															width={32}
															height={32}
															className="size-8 rounded-full"
														/>
													) : (
														'-'
													)}
													{coins.name && <span>{coins.name}</span>}
												</button>
											</td>

											<td className="py-3">
												{coins.current_price
													? coins.current_price?.toLocaleString('en-US', {
															style: 'currency',
															currency: 'USD',
														})
													: '-'}
											</td>

											<td className="py-3">
												{coins.price_change_percentage_24h ? (
													<div
														className={cn(
															'rounded-full font-medium px-2 py-1 inline-block',
															coins.price_change_percentage_24h > 0
																? 'bg-green-100 text-green-600 dark:bg-green-dark-container dark:text-green-dark-item'
																: 'bg-red-100 text-red-600 dark:bg-red-dark-container dark:text-red-dark-item',
														)}
													>
														<span>
															{coins.price_change_percentage_24h > 0 && '+'}
															{coins.price_change_percentage_24h?.toFixed(1)}%
														</span>
													</div>
												) : (
													'-'
												)}
											</td>

											<td className="py-3">
												{coins.total_volume
													? coins?.total_volume?.toLocaleString('en-US', {
															style: 'currency',
															currency: 'USD',
														})
													: '-'}
											</td>

											<td className="py-3">
												{coins.market_cap
													? coins.market_cap?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
													: '-'}
											</td>

											<td className="py-3 pe-4">
												<div className=" flex justify-center">
													<Chart
														type="line"
														options={{
															chart: {
																sparkline: {
																	enabled: true,
																},
																animations: {
																	enabled: false,
																},
															},
															tooltip: {
																enabled: false,
															},
															stroke: {
																show: true,
																curve: 'smooth',
																lineCap: 'butt',
																width: 2,
															},
														}}
														width={100}
														height={50}
														series={[
															{
																data: coins?.sparkline_in_7d?.price,
																name: `${coins?.name}`,
																color: `${
																	coins?.price_change_percentage_7d_in_currency &&
																	coins?.price_change_percentage_7d_in_currency > 0
																		? '#22c55e'
																		: coins?.price_change_percentage_7d_in_currency &&
																			  coins?.price_change_percentage_7d_in_currency < 0
																			? '#dc2626'
																			: '#22c55e'
																}`,
															},
														]}
													/>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)
				)}
			</div>

			<Pagination rows={10} datas={searchStr ? searchResutls : coinsList} setCurrentDatas={setCurrentDatas} />

			<CoinDetailModal
				coinId={currentCoinId}
				showDetailModal={showDetailModal}
				closeModal={toggleDetailModal}
			/>
		</>
	)
}
