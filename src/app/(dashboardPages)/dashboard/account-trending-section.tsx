'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

import { TrendingData } from '@/app/api/definitions'
import { fetchTrendingData } from '@/app/api/actions'
import { ArrowUpIcon, ChevronDownIcon, TradeDownIcon, TradeUpIcon } from '@/components/icons'

export const AccountTrendingSection = () => {
	const [dataIndex, setDataIndex] = useState({ start: 0, end: 4 })
	const [fetchingTrendData, setFetchingTrendData] = useState<boolean>(false)
	const [trendingData, setTrendingData] = useState<TrendingData>({ coins: [] })

	useEffect(() => {
		setFetchingTrendData(true)

		fetchTrendingData().then((resp) => {
			setFetchingTrendData(false)
			if (resp) {
				setTrendingData(resp)
			}
		})
	}, [])

	const onShowMoreBtnClick = (reset = false) => {
		setDataIndex({ end: 0, start: 0 })

		setTimeout(() => {
			if (reset) {
				setDataIndex({ end: 4, start: 0 })
			} else {
				setDataIndex({ start: dataIndex.end, end: dataIndex.end + 4 })
			}
		}, 100)
	}

	return (
		<div className="flex gap-5 flex-wrap lg:flex-nowrap">
			<div className="w-full md:max-w-[500px] md:mx-auto lg:w-auto border dark:border-gray-700 rounded-xl p-3 flex flex-col justify-between">
				<div>
					<h2 className="mb-3 text-xl font-medium dark:text-slate-200">
						<b>Balance</b>
					</h2>

					<div className="flex flex-wrap gap-x-14 items-center mb-3">
						<span className="font-semibold text-lg">$63,755,200</span>

						<div className="flex items-center text-sm gap-3">
							<span className="bg-green-100 dark:bg-green-dark-container text-green-600 dark:text-green-dark-item py-1 px-2 rounded-full font-medium ">
								+2.3%
							</span>

							<span className="text-gray-600 dark:text-slate-300">vs last month</span>
						</div>
					</div>
				</div>

				<div className="flex gap-2 flex-wrap min-[300px]:flex-nowrap">
					<button className="w-full min-[300px]:w-r1/2 mx-auto flex items-center justify-center px-8 py-2 rounded-xl bg-blue-50 dark:bg-slate-900 dark:border dark:border-gray-700 text-blue-500">
						<div className="flex items-center gap-1">
							<ArrowUpIcon className="size-6" />

							<span className="font-medium">Deposit</span>
						</div>
					</button>

					<button className="w-full min-[300px]:w-r1/2 mx-auto flex items-center justify-center px-8 py-2 rounded-xl bg-blue-50 dark:bg-slate-900 dark:border dark:border-gray-700 text-blue-500">
						<div className="flex items-center gap-1">
							<ArrowUpIcon className="size-6 rotate-180" />

							<span className="font-medium">Withdraw</span>
						</div>
					</button>
				</div>
			</div>

			<div className="flex flex-col gap-3 grow overflow-auto">
				<div className="flex justify-between items-center">
					<h3 className="font-medium text-lg">Trending</h3>

					<button
						className="text-gray-600 dark:text-slate-200 text-sm flex items-center gap-1"
						onClick={() => {
							onShowMoreBtnClick(dataIndex.end >= trendingData?.coins?.length)
						}}
					>
						{dataIndex.end >= trendingData?.coins?.length ? (
							<span>Reset</span>
						) : (
							<>
								<span>View more</span>

								<ChevronDownIcon className="-rotate-90" />
							</>
						)}
					</button>
				</div>

				{fetchingTrendData ? (
					<div className="bg-slate-200 animate-pulse rounded-xl h-32 "></div>
				) : (
					<div className="flex flex-wrap lg:flex-nowrap gap-2 text-sm overflow-auto no-scrollbar">
						{trendingData?.coins?.slice(dataIndex.start, dataIndex.end)?.map((data, index) => (
							<div
								className="shrink-0 border dark:border-gray-700 p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800 duration-500 
                    w-full min-[500px]:w-[48%] mx-auto lg:w-64 lg:mx-auto"
								key={index}
							>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-1">
										<Image
											src={data.item.thumb || '/svg/coin-not-found.svg'}
											alt={data.item.name || 'Coin image'}
											width={32}
											height={32}
											className="size-8 rounded-full"
										/>

										<div className="flex flex-col">
											<span className="text-gray-600 dark:text-white font-semibold">
												{data.item.name.length > 7 ? data.item.name.slice(0, 7) + '...' : data.item.name}
											</span>

											<span className="text-gray-400 dark:text-slate-400 font-semibold text-xs">
												{data.item.symbol}
											</span>
										</div>
									</div>

									<div
										className={`flex items-center gap-2 rounded-full font-medium px-2 py-1
                                ${
																	data.item.data.price_change_percentage_24h.usd > 0
																		? ' bg-green-100 text-green-600 dark:bg-green-dark-container dark:text-green-dark-item'
																		: ' bg-red-100 text-red-600 dark:bg-red-dark-container dark:text-red-dark-item'
																}`}
									>
										<span>
											{data.item.data.price_change_percentage_24h.usd > 0 && '+'}
											{data.item.data.price_change_percentage_24h.usd.toFixed(1)}%
										</span>

										{data.item.data.price_change_percentage_24h.usd > 0 ? (
											<TradeUpIcon className="size-4 text-green-500" />
										) : (
											<TradeDownIcon className="size-4 text-red-500" />
										)}
									</div>
								</div>

								<div className="mt-3 flex flex-col ">
									<span className="text-gray-500 dark:text-slate-200 font-semibold overflow-hidden">
										{/* dummy */}
										{parseFloat(data.item.data.total_volume_btc).toFixed(2)} {data.item.symbol}
									</span>

									<span className="text-gray-600 dark:text-slate-400 text-xs">
										{data.item.data.market_cap}
									</span>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	)
}
