'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ChevronDownIcon, TrendingDownIcon, TrendingUpIcon } from 'lucide-react'

import { cn } from '@/lib'
import { TrendingData } from '@/app/api/types'
import { formatPrice } from '@/constants/format-price'
import { Button, ScrollArea, ScrollBar, Skeleton } from '@/components/ui'
import { CoinDetailModal } from '@/components/shared/modals/coin-detail-modal'

interface Props {
	trendingData: TrendingData
}

export const AccountTrendingSection = ({ trendingData }: Props) => {
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
	const [selectedCoinId, setSelectedCoinId] = useState<string>('')
	const [dataIndex, setDataIndex] = useState<{ start: number; end: number }>({ start: 0, end: 5 })

	const onShowMoreBtnClick = (reset = false) => {
		setIsLoading(true)
		setDataIndex({ end: 0, start: 0 })

		setTimeout(() => {
			if (reset) {
				setDataIndex({ end: 5, start: 0 })
			} else {
				setDataIndex({ start: dataIndex.end, end: dataIndex.end + 5 })
			}

			setIsLoading(false)
		}, 1000)
	}

	// Handle coin detail modal
	const toggleDetailModal = () => {
		setIsModalOpen(!isModalOpen)
	}

	const handleCoinClick = (coinId: string) => {
		if (coinId) {
			setSelectedCoinId(coinId)
			toggleDetailModal()
		}
	}

	return (
		<div className="flex flex-col gap-5 mb-10">
			<div className="flex justify-between items-center">
				<h3 className="font-medium text-lg">Trending</h3>

				<Button
					variant="ghost"
					size="sm"
					className="gap-1 transition-colors ease-in-out duration-300 group"
					onClick={() => {
						onShowMoreBtnClick(dataIndex.end >= trendingData.coins.length)
					}}
				>
					{dataIndex.end >= trendingData.coins.length ? (
						<span>Reset</span>
					) : (
						<>
							<span>View more</span>

							<div className="relative size-5 -rotate-90 transition-transform duration-300 group-hover:rotate-0">
								<ChevronDownIcon size={16} className="absolute inset-0 m-auto" />
							</div>
						</>
					)}
				</Button>
			</div>

			<ScrollArea className="flex-nowrap pb-3">
				{isLoading ? (
					<div className="flex flex-nowrap gap-2 text-sm">
						{[...Array(5)].map((_, index) => (
							<div
								key={index}
								className="border dark:border-gray-700 p-3 rounded-xl w-full min-w-[15rem] max-w-[18rem]"
							>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-1">
										<Skeleton className="h-8 w-8 rounded-full" />

										<div className="flex flex-col gap-1">
											<Skeleton className="h-[18px] w-16" />
											<Skeleton className="h-[14px] w-12" />
										</div>
									</div>

									<Skeleton className="h-7 w-20 rounded-full" />
								</div>

								<div className="mt-3 flex flex-col gap-1">
									<Skeleton className="h-[14px] w-16" />
									<Skeleton className="h-[14px] w-24" />
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="flex flex-nowrap gap-2 text-sm">
						{trendingData.coins.slice(dataIndex.start, dataIndex.end).map((data, index) => (
							<div
								key={index}
								onClick={() => handleCoinClick(data.item.id)}
								className="border dark:border-gray-700 p-3 rounded-xl cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-800 duration-500 w-full min-w-[15rem] max-w-[18rem]"
							>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-1">
										<Image
											src={data.item.thumb || '/svg/coin-not-found.svg'}
											alt={data.item.name || 'Coin image'}
											width={32}
											height={32}
											className="size-8 rounded-full"
											onError={(e) => {
												e.currentTarget.src = '/svg/coin-not-found.svg'
											}}
										/>

										<div className="flex flex-col">
											<span className="w-20 text-gray-600 dark:text-white font-semibold truncate">
												{data.item.name}
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
												? 'bg-green-100 text-green-600 dark:bg-green-900/30'
												: 'bg-red-100 text-red-600 dark:bg-red-900/30',
										)}
									>
										<span>
											{data.item.data.price_change_percentage_24h.usd > 0 && '+'}
											{data.item.data.price_change_percentage_24h.usd.toFixed(1)}%
										</span>

										{data.item.data.price_change_percentage_24h.usd > 0 ? (
											<TrendingUpIcon size={16} className="text-green-600" />
										) : (
											<TrendingDownIcon size={16} className="text-red-600" />
										)}
									</div>
								</div>

								<div className="mt-3 flex flex-col ">
									<span className="text-gray-600 dark:text-slate-400 text-xs">
										₿{formatPrice(Number(data.item.data.market_cap_btc), true)}
									</span>

									<span className="text-gray-600 dark:text-slate-400 text-xs">
										${formatPrice(Number(data.item.data.market_cap.replace(/[$,]/g, '')), true)}
									</span>
								</div>
							</div>
						))}
					</div>
				)}

				<ScrollBar orientation="horizontal" />
			</ScrollArea>

			<CoinDetailModal coinId={selectedCoinId} showDetailModal={isModalOpen} closeModal={toggleDetailModal} />
		</div>
	)
}
