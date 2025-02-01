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
import { fetchCoinData, fetchCoinsMarketChart } from '@/app/api/actions'

interface Props {
	coinId: string
	showDetailModal: boolean
	closeModal: (value: boolean) => void
}

export const CoinDetailModal = ({ coinId, showDetailModal, closeModal }: Props) => {
	const [fetchingCoinsData, setFetchingCoinsData] = useState<boolean>(false)
	const [fetchingHistoryData, setFetchingHistoryData] = useState<boolean>(false)
	const [coinsData, setCoinsData] = useState<CoinData | Record<string, any>>({})
	const [coinMarketChartData, setCoinMarketChartData] = useState<MarketChartData>({ prices: [] })

	useEffect(() => {
		if (!showDetailModal) return

		setFetchingCoinsData(true)
		setFetchingHistoryData(true)

		const fetchData = async () => {
			try {
				const [coinInfo, marketChart] = await Promise.all([
					fetchCoinData(coinId),
					fetchCoinsMarketChart(coinId),
				])

				setCoinsData(coinInfo || {})
				setCoinMarketChartData(marketChart || { prices: [] })
			} catch (error) {
				console.error('Error fetching coin details:', error)
			} finally {
				setFetchingCoinsData(false)
				setFetchingHistoryData(false)
			}
		}

		fetchData()
	}, [coinId, showDetailModal])

	const chartConfig = {
		prices: {
			label: 'Price',
			color: 'hsl(var(--chart-2))',
		},
	} satisfies ChartConfig

	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

	const formattedData = coinMarketChartData.prices.map(([timestamp, price]) => ({
		Month: months[new Date(timestamp).getMonth()],
		Price: price,
	}))

	const minPrice = Math.min(...formattedData.map((h) => h.Price))
	const maxPrice = Math.max(...formattedData.map((h) => h.Price))

	return (
		<Sheet open={showDetailModal} onOpenChange={closeModal}>
			<SheetContent className="sm:max-w-xl overflow-y-auto" aria-describedby={undefined}>
				<SheetHeader>
					<SheetTitle>
						<div className="flex justify-between items-center mb-8">
							{fetchingCoinsData ? (
								<Skeleton className="h-6 w-3/4" />
							) : (
								<h4 className="font-semibold text-md">{coinsData.name}</h4>
							)}
						</div>
					</SheetTitle>

					<SheetDescription className="hidden" />
				</SheetHeader>

				<div className="flex justify-center">
					{fetchingHistoryData ? (
						<Skeleton className="h-72 w-full" />
					) : (
						<div className="w-[420px] mx-auto">
							<ChartContainer config={chartConfig}>
								<LineChart
									accessibilityLayer
									data={formattedData}
									margin={{
										left: 12,
										right: 12,
									}}
								>
									{/* Сетка */}
									<CartesianGrid vertical={true} strokeDasharray="4 4" />

									{/* Ось X */}
									<XAxis
										dataKey="Month"
										tickLine={false}
										axisLine={false}
										tick={true}
										tickMargin={10}
										tickFormatter={(value) => value.slice(0, 3)}
									/>

									{/* Ось Y */}
									<YAxis
										dataKey="Price"
										domain={[minPrice, maxPrice]}
										axisLine={false}
										tickLine={false}
										tick={true}
										tickMargin={10}
									/>

									{/* Тултип */}
									<ChartTooltip cursor={true} content={<ChartTooltipContent />} />

									{/* Линия */}
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

								<div>${formatPrice(coinsData.market_data?.current_price?.usd)}</div>
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
										${formatPrice(coinsData.market_data?.market_cap.usd, true)}
									</span>
								</div>

								<div className="flex flex-wrap justify-between gap-2">
									<span>Circulating supply</span>

									<span className="text-gray-600 dark:text-gray-300">
										${formatPrice(coinsData.market_data?.circulating_supply, true)}
									</span>
								</div>

								<div className="flex flex-wrap justify-between gap-2">
									<span className="capitalize">24 hour high</span>

									<span className="text-gray-600 dark:text-gray-300">
										${formatPrice(coinsData.market_data?.high_24h?.usd, true)}
									</span>
								</div>

								<div className="flex flex-wrap justify-between gap-2">
									<span className="capitalize">24 hour low</span>

									<span className="text-gray-600 dark:text-gray-300">
										${formatPrice(coinsData.market_data?.low_24h?.usd, true)}
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
