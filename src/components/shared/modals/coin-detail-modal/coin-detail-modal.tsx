import Link from 'next/link'
import Image from 'next/image'
import { Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'

import {
	Button,
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	Skeleton,
} from '@/components/ui'
import { formatPrice } from '@/constants/format-price'
import { CoinData, MarketChartData } from '@/app/api/types'
import { DAY_OPTIONS, MONTH_OPTIONS } from '@/constants/chart'
import { getCoinData, getCoinsMarketChart } from '@/app/api/actions'

interface Props {
	coinId: string
	showDetailModal: boolean
	closeModal: (value: boolean) => void
}

export const CoinDetailModal = ({ coinId, showDetailModal, closeModal }: Props) => {
	const [days, setDays] = useState<number>(1)
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [coinMarketChartData, setCoinMarketChartData] = useState<MarketChartData>()
	const [coinData, setCoinData] = useState<CoinData>()

	useEffect(() => {
		if (!showDetailModal) return

		setIsLoading(true)
		setCoinMarketChartData(undefined)

		const fetchData = async () => {
			try {
				const marketChart = await getCoinsMarketChart(coinId, days)
				const coinData = await getCoinData(coinId)

				setCoinMarketChartData(marketChart)
				setCoinData(coinData)
			} catch (error) {
				console.error('Error fetching coin details:', error)
			} finally {
				setIsLoading(false)
			}
		}

		fetchData()
	}, [coinId, days, showDetailModal])

	const chartConfig = {
		prices: {
			label: 'Price',
			color: 'hsl(var(--chart-2))',
		},
	} satisfies ChartConfig

	// Format data for the chart based on the selected time range
	const formattedData =
		coinMarketChartData?.prices.map(([timestamp, price]) => {
			const date = new Date(timestamp)
			let label = ''

			switch (true) {
				case days === 1:
					// Show time, day and month for "1 day" (e.g., 15:45, 15 Mar)
					const hours = date.getHours().toString().padStart(2, '0')
					const minutes = date.getMinutes().toString().padStart(2, '0')
					const day = date.getDate()
					const month = MONTH_OPTIONS[date.getMonth()]
					label = `${hours}:${minutes}, ${day} ${month}`
					break

				case days <= 30:
					// Show day and month for "1 week" and "1 month" (e.g., 15 Mar)
					const monthDay = date.getDate()
					const monthName = MONTH_OPTIONS[date.getMonth()]
					label = `${monthDay} ${monthName}`
					break

				case days <= 365:
					// Show month and year for "1 year" (e.g., Mar 2025)
					const monthYear = MONTH_OPTIONS[date.getMonth()]
					const year = date.getFullYear()
					label = `${monthYear} ${year}`
					break

				default:
					// For other cases, use the year only (e.g., 2025)
					label = date.getFullYear().toString()
					break
			}

			return { Label: label, Price: price }
		}) || []

	const minPrice = Math.min(...formattedData.map((h) => h.Price))
	const maxPrice = Math.max(...formattedData.map((h) => h.Price))

	return (
		<Sheet open={showDetailModal} onOpenChange={closeModal}>
			<SheetContent className="sm:max-w-xl overflow-y-auto" aria-describedby={undefined}>
				<SheetHeader>
					<SheetTitle>
						<div className="flex justify-between items-center">
							{isLoading ? (
								<Skeleton className="h-7 w-3/4 max-[500px]:h-5" />
							) : (
								<Link
									href={`https://coingecko.com/en/coins/${coinData?.id}`}
									target="_blank"
									rel="noopener noreferrer"
								>
									<h4 className="cursor-pointer font-semibold text-md hover:text-[#397fee] dark:hover:text-[#75a6f4] max-[500px]:text-sm">
										{coinData?.name}
									</h4>
								</Link>
							)}
						</div>

						<div className="flex items-center justify-center gap-2 m-4 mb-2">
							{DAY_OPTIONS.map(({ label, value }) => (
								<Button
									key={value}
									variant="outline"
									onClick={() => setDays(value)}
									className={`px-2 py-1 h-6 rounded-xl ${days === value ? 'bg-blue-500 hover:bg-blue-500' : ''}`}
								>
									{/* Full text for screens > 640px */}
									<span className="hidden sm:inline">{label}</span>

									{/* Shortened text for screens < 640px */}
									<span className="inline sm:hidden">
										{label === '1 day' ? '1d' : label === '1 week' ? '1w' : label === '1 month' ? '1m' : '1y'}
									</span>
								</Button>
							))}
						</div>
					</SheetTitle>

					<SheetDescription className="hidden" />
				</SheetHeader>

				<div className="flex justify-center">
					{isLoading ? (
						<Skeleton className="h-72 w-full" />
					) : (
						<div className="w-full">
							<ChartContainer config={chartConfig} style={{ overflow: 'hidden' }}>
								<LineChart
									accessibilityLayer
									data={formattedData}
									margin={{
										left: 12,
										right: 12,
									}}
								>
									{/* Grid */}
									<CartesianGrid vertical={true} strokeDasharray="4 4" />

									{/* Axis X */}
									<XAxis
										dataKey="Label"
										tickLine={false}
										axisLine={false}
										tick={true}
										tickMargin={10}
										tickFormatter={(value) => value}
									/>

									{/* Axis Y */}
									<YAxis
										dataKey="Price"
										domain={[minPrice * 0.98, maxPrice * 1.02]}
										axisLine={false}
										tickLine={false}
										tick={true}
										tickMargin={4}
										tickFormatter={(value) => {
											if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
											if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
											if (value >= 1) return value.toFixed(2)

											return value.toFixed(5)
										}}
									/>

									{/* Popup tooltip */}
									<ChartTooltip
										cursor={true}
										content={
											<ChartTooltipContent
												formatter={(value, name) => {
													const numericValue = typeof value === 'number' ? value : parseFloat(value as string)

													if (name === 'Price') return ['Price: $', formatPrice(numericValue)]

													return [name, numericValue]
												}}
											/>
										}
									/>

									{/* Line on chart */}
									<Line
										dataKey="Price"
										type="natural"
										stroke="var(--color-prices)"
										strokeWidth={2}
										dot={false}
									/>
								</LineChart>
							</ChartContainer>
						</div>
					)}
				</div>

				<div className="mt-10">
					{isLoading ? (
						<Skeleton className="h-72 w-full" />
					) : (
						<>
							<div className="flex justify-between items-center font-medium max-[500px]:text-sm">
								<Link
									href={`https://coingecko.com/en/coins/${coinData?.id}`}
									target="_blank"
									rel="noopener noreferrer"
								>
									<div className="items-center flex gap-2 cursor-pointer hover:text-[#397fee] dark:hover:text-[#75a6f4]">
										<Image
											src={coinData?.image.thumb || '/svg/coin-not-found.svg'}
											alt={coinData?.name || 'Coin image'}
											width={32}
											height={32}
											className="size-8 rounded-full max-[500px]:size-6"
										/>

										<span className="font-medium">
											<span>{coinData?.name} </span>

											<span className="uppercase">({coinData?.symbol}/usd)</span>
										</span>
									</div>
								</Link>

								<div>${formatPrice(coinData?.market_data.current_price.usd as number)}</div>
							</div>

							<div className="mt-8 flex flex-col gap-2 text-md max-[500px]:text-sm">
								<div className="flex flex-wrap justify-between gap-2 capitalize">
									<span>Crypto market rank</span>

									<span className="bg-slate-100 dark:bg-gray-600 px-2 rounded-full text-sm flex items-center">
										Rank #{coinData?.market_cap_rank}
									</span>
								</div>

								<div className="flex flex-wrap justify-between gap-2">
									<span>Market cap</span>

									<span className="text-gray-600 dark:text-gray-300">
										${formatPrice(coinData?.market_data.market_cap.usd as number, true)}
									</span>
								</div>

								<div className="flex flex-wrap justify-between gap-2">
									<span>Circulating supply</span>

									<span className="text-gray-600 dark:text-gray-300">
										${formatPrice(coinData?.market_data.circulating_supply as number, true)}
									</span>
								</div>

								<div className="flex flex-wrap justify-between gap-2">
									<span className="capitalize">24 hour high</span>

									<span className="text-gray-600 dark:text-gray-300">
										${formatPrice(coinData?.market_data.high_24h.usd as number, true)}
									</span>
								</div>

								<div className="flex flex-wrap justify-between gap-2">
									<span className="capitalize">24 hour low</span>

									<span className="text-gray-600 dark:text-gray-300">
										${formatPrice(coinData?.market_data.low_24h.usd as number, true)}
									</span>
								</div>
							</div>

							<div className="mt-8">
								<span className="font-medium max-[500px]:text-sm">Description</span>

								<p
									className="mt-3 text-gray-600 dark:text-gray-300 prose prose-sm prose-a:text-blue-700 prose-a:hover:underline dark:prose-a:text-blue-700 dark:prose-a:hover:underline duration-200"
									dangerouslySetInnerHTML={{ __html: coinData?.description.en as string }}
								/>
							</div>
						</>
					)}
				</div>

				<SheetFooter>
					<SheetClose asChild>
						<Button
							type="submit"
							variant="outline"
							size="lg"
							className="w-full mt-8 p-2 rounded-xl text-blue-500 bg-blue-50 hover:bg-green-600/80 dark:bg-slate-900 dark:hover:bg-green-700"
						>
							<div className="flex items-center gap-2">
								<Star size={20} />

								<span>Add to favorites</span>
							</div>
						</Button>
					</SheetClose>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	)
}
