'use client'

import dynamic from 'next/dynamic'
import CoinDetailModal from './coinsDetailModal'
import { useEffect, useRef, useState } from 'react'

import { DataSplitter } from '@/components'
import { CategoriesData, CoinListData } from '@/app/api/definitions'
import { ChevronDownIcon, EllispsisIcon, SearchIcon } from '@/assets/iconComponents'
import { fetchCategories, fetchCoinsList, fetchCoinsListByCate } from '@/app/api/actions'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

export default function CryptosTableSection() {
	const [searchStr, setSearchStr] = useState<string>('')
	const [searchResutls, setSearchResults] = useState<CoinListData>([])
	const [categories, setCategories] = useState<CategoriesData>([])
	const [coinsList, setCoinsList] = useState<CoinListData>([])
	const [currentDatas, setCurrentDatas] = useState<CoinListData>([])
	const [fetchingCoins, setFetchingCoins] = useState<boolean>(false)
	const categorieContainerRef = useRef<HTMLUListElement>(null)
	const [showDetailModal, setShowDetailModal] = useState<boolean>(false)
	const [currentCoinId, setCurrentCoinId] = useState<string>('')
	const [currentCategorie, setCurrentCategorie] = useState<string>('All')

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

	useEffect(() => {
		function checkOpen(ev: any) {
			if (ev.target?.id !== 'categorie-btn' && !categorieContainerRef.current?.classList.contains('hidden')) {
				toggleCategorieContainer()
			}
		}
		document.addEventListener('click', checkOpen)

		return () => {
			document.removeEventListener('click', checkOpen)
		}
	}, [])

	function toggleCategorieContainer() {
		if (categorieContainerRef.current?.classList.contains('hidden')) {
			categorieContainerRef.current?.classList.remove('hidden')
		} else {
			categorieContainerRef.current?.classList.add('hidden')
		}
	}

	function searchCoins(ev: any) {
		const value: string = ev.target.value.toLocaleLowerCase()
		setSearchStr(value)

		if (value.length > 0) {
			const results = coinsList.filter(
				(coins) =>
					coins?.name?.toLocaleLowerCase().includes(value) ||
					coins?.id?.toLocaleLowerCase().includes(value) ||
					coins?.symbol?.toLocaleLowerCase().includes(value) ||
					coins?.current_price?.toString().toLocaleLowerCase().includes(value) ||
					coins?.market_cap_rank?.toString().toLocaleLowerCase().includes(value),
			)
			setSearchResults(results)
		} else {
			setSearchResults([])
		}
	}

	function onCategorieClick(cate: string, name?: string) {
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

	function toggleDetailModal() {
		if (showDetailModal) {
			setShowDetailModal(false)
		} else {
			setShowDetailModal(true)
		}
	}

	function onCoinsClick(coinId: string) {
		setCurrentCoinId(coinId)
		toggleDetailModal()
	}

	return (
		<>
			<div className="mt-10 gap-2 flex justify-between items-center flex-wrap sm:flex-nowrap">
				<div className="rounded-xl relative w-full sm:w-[350px]">
					{!searchStr && (
						<div className="flex gap-1 font-medium items-center text-sm text-gray-600 dark:text-gray-500 absolute top-1/2 left-5 -translate-y-1/2">
							<SearchIcon className="size-4" />

							<span>Search crypto...</span>
						</div>
					)}

					<input
						type="search"
						name="crypto"
						id="crypto"
						className="bg-transparent border dark:border-gray-700 p-2 rounded-xl w-full "
						onChange={searchCoins}
					/>
				</div>

				<div className="w-full sm:w-64 relative">
					<button
						className="rounded-xl w-full py-2 px-3 flex items-center justify-between border dark:border-gray-700 focus:border-2 text-sm font-medium text-gray-600 dark:text-white"
						onClick={toggleCategorieContainer}
						id="categorie-btn"
					>
						<span>{currentCategorie || 'Categories'}</span>

						<ChevronDownIcon className="size-4" />
					</button>

					<ul
						className="z-20 hidden shadow-xl mt-1 max-h-64 overflow-auto py-1 absolute top-full w-full bg-white dark:bg-slate-800 dark:text-slate-100 divide-y dark:divide-gray-700 rounded-xl"
						ref={categorieContainerRef}
					>
						<li>
							<button
								className={`p-3 hover:bg-slate-200 dark:hover:bg-slate-600 w-full text-start duration-500
                        ${currentCategorie === 'All' ? 'bg-slate-200 dark:bg-slate-600' : ''}`}
								onClick={() => {
									onCategorieClick('')
								}}
							>
								All
							</button>
						</li>
						{categories?.map((categorie) => (
							<li key={categorie.category_id}>
								<button
									className={`p-3 hover:bg-slate-200 dark:hover:bg-slate-600 w-full text-start duration-500
                            ${currentCategorie === categorie.name ? 'bg-slate-200 dark:bg-slate-600' : ''}`}
									onClick={() => {
										onCategorieClick(categorie.category_id, categorie.name)
									}}
								>
									{categorie.name}
								</button>
							</li>
						))}
					</ul>
				</div>
			</div>

			<div className="mt-6 border-2 dark:border-gray-700 rounded-xl overflow-auto no-scrollbar">
				<div className="flex justify-between py-4 px-3 items-center">
					<h4 className="font-medium text-lg">Market</h4>

					<button className="py-3 px-3 rounded-xl border dark:border-gray-700">
						<EllispsisIcon className="size-4" />
					</button>
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
														<div>
															<img src={coins.image} alt={coins.name} className="size-8 rounded-full " />
														</div>
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
														className={`rounded-full font-medium px-2 py-1 inline-block
                                    ${
																			coins.price_change_percentage_24h > 0
																				? 'bg-green-100 text-green-600 dark:bg-green-dark-container dark:text-green-dark-item'
																				: ' bg-red-100 text-red-600 dark:bg-red-dark-container dark:text-red-dark-item'
																		}`}
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

			<DataSplitter
				rows={10}
				datas={searchStr ? searchResutls : coinsList}
				setCurrentDatas={setCurrentDatas}
			/>

			<CoinDetailModal
				showDetailModal={showDetailModal}
				closeModal={toggleDetailModal}
				coinId={currentCoinId}
			/>
		</>
	)
}
