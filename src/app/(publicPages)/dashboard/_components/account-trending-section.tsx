'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ArrowUp, ChevronDown, TrendingDown, TrendingUp } from 'lucide-react'

import { cn } from '@/lib'
import { Button } from '@/components/ui'
import { TrendingData } from '@/app/api/types'

interface Props {
	trendingData: TrendingData
}

export const AccountTrendingSection = ({ trendingData }: Props) => {
	const [dataIndex, setDataIndex] = useState<{ start: number; end: number }>({ start: 0, end: 4 })

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
		<div className="flex gap-5 flex-wrap w-full lg:flex-nowrap">
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
					<Button
						variant="outline"
						size="lg"
						className="w-full min-[300px]:w-r1/2 mx-auto px-8 py-2 rounded-xl text-blue-500 bg-blue-50 hover:bg-green-600/80 dark:bg-slate-900 dark:hover:bg-green-700"
					>
						<div className="flex items-center gap-1">
							<ArrowUp size={24} />

							<span className="font-medium">Deposit</span>
						</div>
					</Button>

					<Button
						variant="outline"
						size="lg"
						className="w-full min-[300px]:w-r1/2 mx-auto px-8 py-2 rounded-xl text-blue-500 bg-blue-50 hover:bg-red-600/70 dark:bg-slate-900 dark:hover:bg-red-600/70"
					>
						<div className="flex items-center gap-1">
							<ArrowUp size={24} className="rotate-180" />

							<span className="font-medium">Withdraw</span>
						</div>
					</Button>
				</div>
			</div>

			<div className="flex flex-col gap-3 grow overflow-auto">
				<div className="flex justify-between items-center">
					<h3 className="font-medium text-lg">Trending</h3>

					<Button
						variant="ghost"
						size="sm"
						className="gap-1 group"
						onClick={() => {
							onShowMoreBtnClick(dataIndex.end >= trendingData?.coins?.length)
						}}
					>
						{dataIndex.end >= trendingData?.coins?.length ? (
							<span>Reset</span>
						) : (
							<>
								<span>View more</span>

								<ChevronDown
									size={16}
									className="-rotate-90 transition-transform duration-300 group-hover:rotate-0"
								/>
							</>
						)}
					</Button>
				</div>

				<div className="flex flex-wrap items-start justify-start gap-2 text-sm overflow-auto no-scrollbar">
					{trendingData?.coins?.slice(dataIndex.start, dataIndex.end)?.map((data, index) => (
						<div
							className="shrink-0 border dark:border-gray-700 p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800 duration-500 w-full min-[500px]:w-[48%]"
							key={index}
						>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-1">
									<Image
										src={data.item?.thumb || '/svg/coin-not-found.svg'}
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
									className={cn(
										'flex items-center gap-2 rounded-full font-medium px-2 py-1',
										data.item.data.price_change_percentage_24h.usd > 0
											? 'bg-green-100 text-green-600 dark:bg-green-dark-container dark:text-green-dark-item'
											: 'bg-red-100 text-red-600 dark:bg-red-dark-container dark:text-red-dark-item',
									)}
								>
									<span>
										{data.item.data.price_change_percentage_24h.usd > 0 && '+'}
										{data.item.data.price_change_percentage_24h.usd.toFixed(1)}%
									</span>

									{data.item.data.price_change_percentage_24h.usd > 0 ? (
										<TrendingUp size={16} className="text-green-500" />
									) : (
										<TrendingDown size={16} className="text-red-500" />
									)}
								</div>
							</div>

							<div className="mt-3 flex flex-col ">
								<span className="text-gray-500 dark:text-slate-200 font-semibold overflow-hidden">
									{/* dummy */}
									{parseFloat(data.item.data.total_volume_btc).toFixed(2)} {data.item.symbol}
								</span>

								<span className="text-gray-600 dark:text-slate-400 text-xs">{data.item.data.market_cap}</span>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}
