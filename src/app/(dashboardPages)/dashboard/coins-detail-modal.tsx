'use client'

import Image from 'next/image'
import dynamic from 'next/dynamic'
import { Star, X } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

import { cn } from '@/lib'
import { useBodyModalEffect } from '@/hooks'
import { Overlay } from '@/components/shared'
import { Button, Skeleton } from '@/components/ui'
import { CoinsData, MarketChartData } from '@/app/api/definitions'
import { fetchCoinsData, fetchCoinsMarketChart } from '@/app/api/actions'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface CoinDetailModalProps {
	showDetailModal: boolean
	closeModal: () => void
	coinId: string
}

export const CoinDetailModal = ({ showDetailModal, closeModal, coinId }: CoinDetailModalProps) => {
	const { theme } = useTheme()

	const [fetchingCoinsData, setFetchingCoinsData] = useState<boolean>(false)
	const [fetchingHistoryData, setFetchingHistoryData] = useState<boolean>(false)
	const [coinsData, setCoinsData] = useState<CoinsData | Record<string, any>>({})
	const [coinMarketChartData, setCoinMarketChartData] = useState<MarketChartData>({ prices: [] })

	useBodyModalEffect([showDetailModal], showDetailModal)

	useEffect(() => {
		if (showDetailModal) {
			setFetchingHistoryData(true)
			setFetchingCoinsData(true)
			fetchCoinsMarketChart(coinId).then((resp) => {
				setFetchingHistoryData(false)
				if (resp) {
					setCoinMarketChartData(resp)
				}
			})

			fetchCoinsData(coinId).then((resp) => {
				setFetchingCoinsData(false)
				if (resp) {
					setCoinsData(resp)
				}
			})
		}
	}, [showDetailModal, coinId])

	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

	return (
		<>
			<Overlay onOverlayClick={closeModal} showOverlay={showDetailModal} />

			<div
				className={cn(
					'p-5 z-[10] shadow-xl fixed top-0 h-full rounded-tl-xl rounded-bl-xl bg-white dark:bg-dark w-full min-[550px]:w-[500px] duration-300 linear overflow-auto',
					showDetailModal ? 'right-0' : '-right-full',
				)}
			>
				<div className="flex justify-between items-center mb-8">
					{fetchingCoinsData ? (
						<Skeleton className="h-6 w-full" />
					) : (
						<h4 className="font-semibold text-md">{coinsData.name}</h4>
					)}

					<Button variant="ghost" size="icon" className="rounded-2xl" onClick={closeModal}>
						<X size={20} />
					</Button>
				</div>

				<div className="flex justify-center">
					{fetchingHistoryData ? (
						<Skeleton className="h-72 w-full" />
					) : (
						<div className="w-[420px] mx-auto">
							<Chart
								type="line"
								options={{
									stroke: {
										curve: 'straight',
										width: 3,
									},
									grid: {
										xaxis: {
											lines: {
												show: true,
											},
										},
										yaxis: {
											lines: {
												show: true,
											},
										},
									},
									tooltip: {
										theme: theme,
									},
									chart: {
										toolbar: {
											show: false,
											tools: {
												zoom: false,
												selection: false,
												reset: false,
												zoomin: false,
												zoomout: false,
												pan: false,
											},
										},
										animations: {
											enabled: true,
										},
									},
									xaxis: {
										type: 'numeric',
										labels: {
											style: {
												colors: theme === 'dark' ? '#f1f5f9' : '#4b5563',
											},
											formatter(value, timestamp, opts) {
												const timestampValue = parseInt(value)
												const date = new Date(timestampValue)
												return months[date.getMonth()]
											},
										},
									},
									yaxis: {
										labels: {
											style: {
												colors: theme === 'dark' ? '#f1f5f9' : '#4b5563',
											},
										},
									},
								}}
								series={[
									{
										data: coinMarketChartData.prices,
										name: coinsData.name,
										color: '#22c55e',
									},
								]}
								height={300}
							/>

							<div className="flex items-center gap-1 ms-16">
								<div className="bg-green-500 w-8 h-2"></div>

								<p>Price</p>
							</div>
						</div>
					)}
				</div>

				<div className="mt-10">
					{fetchingCoinsData ? (
						<Skeleton className="h-72 w-full" />
					) : (
						<>
							<div className="flex justify-between items-center font-medium">
								<div className="items-center flex gap-2">
									<Image
										src={coinsData.image?.thumb || '/svg/coin-not-found.svg'}
										alt={coinsData.name || 'Coin image'}
										width={32}
										height={32}
										className="size-8 rounded-full"
									/>

									<span className="font-medium">
										<span>{coinsData.name} </span>

										<span className="uppercase">({coinsData.symbol}/usd)</span>
									</span>
								</div>

								<div>${coinsData.market_data?.current_price?.usd.toFixed(2)}</div>
							</div>

							<div className="mt-8 flex flex-col gap-2 text-md">
								<div className="flex flex-wrap justify-between gap-2 capitalize">
									<span>Crypto market rank</span>

									<span className="bg-slate-100 dark:bg-gray-600 px-2 rounded-full text-sm flex items-center">
										Rank #{coinsData.market_cap_rank}
									</span>
								</div>

								<div className="flex flex-wrap justify-between gap-2">
									<span>Market cap</span>

									<span className="text-gray-600 dark:text-gray-300">
										{coinsData.market_data?.market_cap?.usd.toLocaleString('en-US', {
											style: 'currency',
											currency: 'USD',
										})}
									</span>
								</div>

								<div className="flex flex-wrap justify-between gap-2">
									<span>Circulating supply</span>

									<span className="text-gray-600 dark:text-gray-300">
										{coinsData.market_data?.circulating_supply.toFixed(1)}
									</span>
								</div>

								<div className="flex flex-wrap justify-between gap-2">
									<span className="capitalize">24 hour high</span>

									<span className="text-gray-600 dark:text-gray-300">
										{coinsData.market_data?.high_24h?.usd.toLocaleString('en-US', {
											style: 'currency',
											currency: 'USD',
										})}
									</span>
								</div>

								<div className="flex flex-wrap justify-between gap-2">
									<span className="capitalize">24 hour low</span>

									<span className="text-gray-600 dark:text-gray-300">
										{coinsData.market_data?.low_24h?.usd.toLocaleString('en-US', {
											style: 'currency',
											currency: 'USD',
										})}
									</span>
								</div>
							</div>

							<div className="mt-8 crypto-descr">
								<span className="font-medium">Description</span>

								<p
									className="text-gray-600 dark:text-gray-300 prose prose-sm prose-a:text-blue-700 prose-a:hover:underline dark:prose-a:text-blue-700 dark:prose-a:hover:underline duration-200 mt-3"
									dangerouslySetInnerHTML={{ __html: coinsData.description?.en || '' }}
								/>
							</div>

							<button className="font-medium mt-8 rounded-xl w-full flex bg-blue-50 dark:bg-slate-900 text-blue-500 dark:text-blue-600 items-center justify-center p-2 dark:border dark:border-gray-700">
								<div className="flex items-center gap-2">
									<Star size={20} />

									<span>Add to favorites</span>
								</div>
							</button>
						</>
					)}
				</div>
			</div>
		</>
	)
}
