'use client'

import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { ChangeEvent, useEffect, useState } from 'react'
import { ArrowLeftIcon, LoaderIcon, PlusIcon } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'

import {
	Button,
	Card,
	CardContent,
	CardHeader,
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	Input,
	Label,
} from '@/components/ui'
import { cn } from '@/lib'
import { useTRPC } from '@/trpc/client'
import { useFormatValue } from '@/hooks/use-format-value'
import { getCoinsMarketChart } from '@/data/market-chart'
import { DAY_OPTIONS, MONTH_OPTIONS } from '@/constants/chart'
import { useFormatUSDPrice } from '@/hooks/use-format-usd-price'
import { useCurrencyConverter } from '@/hooks/use-currency-converter'
import { TableContainer } from '@/components/shared/data-tables/transaction-table'
import { TMarketChartData, TTransaction, TUserCoinData } from '@/modules/coins/schema'

interface Props {
	coin: TUserCoinData
}

export const CoinIdContainer = ({ coin }: Props) => {
	const trpc = useTRPC()
	const router = useRouter()
	const queryClient = useQueryClient()

	const formatValue = useFormatValue()
	const formatUSDPrice = useFormatUSDPrice()
	const { fromUSD, toUSD, selectedCurrency } = useCurrencyConverter()

	const [days, setDays] = useState<number>(1)
	const [isAdding, setIsAdding] = useState<boolean>(false)
	const [isSaving, setIsSaving] = useState<boolean>(false)
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [isNavigatingBack, setIsNavigatingBack] = useState<boolean>(false)
	const [coinMarketChartData, setCoinMarketChartData] = useState<TMarketChartData>()
	const [editTransactions, setEditTransactions] = useState<TTransaction[]>(coin.transactions)
	const [editSellPrice, setEditSellPrice] = useState<string>(() => {
		if (coin.desired_sell_price) {
			const convertedPrice = fromUSD(coin.desired_sell_price)

			return String(convertedPrice)
		}

		return ''
	})

	// Sync local state with updated data (important, don't remove)
	useEffect(() => {
		setEditTransactions(coin.transactions)

		if (coin.desired_sell_price) {
			const convertedPrice = fromUSD(coin.desired_sell_price)
			setEditSellPrice(String(convertedPrice))
		} else {
			setEditSellPrice('')
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [coin.transactions, coin.desired_sell_price, selectedCurrency])

	useEffect(() => {
		const fetchMarketChartData = async () => {
			try {
				setIsLoading(true)

				const data = await getCoinsMarketChart(coin.coinId, days)

				if (data?.prices) {
					setCoinMarketChartData(data)
				}
			} catch (error) {
				console.error('Error fetching market chart data:', error)
			} finally {
				setIsLoading(false)
			}
		}

		if (coin?.coinId) {
			void fetchMarketChartData()
		}
	}, [coin.coinId, days])

	const createTransactionMutation = useMutation(
		trpc.coins.addTransactionForUser.mutationOptions({
			onSuccess: (newTransaction) => {
				setEditTransactions((prev) => [...prev, newTransaction])

				toast.success('Transaction created successfully')
			},
			onError: (error) => {
				console.error('Create transaction error:', error)
				toast.error('Failed to create transaction')
			},
		}),
	)

	const updateCoinMutation = useMutation(
		trpc.coins.updateUserCoin.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries(trpc.coins.getUserCoin.queryOptions(coin.coinId))
				queryClient.invalidateQueries(trpc.coins.getUserCoins.queryOptions())

				toast.success('Coin updated successfully')
			},
			onError: (error) => {
				console.error('Update error:', error)
				toast.error('Failed to update coin')
			},
		}),
	)

	const totalValue = coin.current_price * coin.total_quantity

	const chartConfig = {
		prices: {
			label: 'Price',
			color: 'hsl(var(--chart-2))',
		},
	} satisfies ChartConfig

	// Sort transactions by date (oldest to newest)
	const sortedTransactions = [...coin.transactions].sort(
		(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
	)

	const formattedData =
		coinMarketChartData?.prices.map(([timestamp, price]) => {
			const date = new Date(timestamp)
			let label = ''

			switch (true) {
				case days <= 7:
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

			// Find the current totalQuantity at this point in time
			const currentQuantity = sortedTransactions
				.filter((transaction) => new Date(transaction.date).getTime() <= timestamp)
				.reduce((sum, transaction) => sum + transaction.quantity, 0)

			return {
				Label: label,
				Price: price,
				TotalValue: currentQuantity * price, // Take the current number of coins and multiply it by the price
			}
		}) || []

	const minValue = Math.min(...formattedData.map((h) => h.TotalValue))
	const maxValue = Math.max(...formattedData.map((h) => h.TotalValue))

	const handleNumberInput = (setter: (value: string) => void) => (e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.replace(/,/g, '.')

		if (/^[0-9]*\.?[0-9]*$/.test(value)) {
			setter(value)
		}
	}

	const handleSellPriceChange = handleNumberInput(setEditSellPrice)

	const handleAddTransaction = async () => {
		setIsAdding(true)

		try {
			await createTransactionMutation.mutateAsync({
				coinId: coin.coinId,
				quantity: 0,
				price: 0,
				date: new Date().toISOString(),
			})
		} finally {
			setIsAdding(false)
		}
	}

	const handleUpdate = async (sellPrice: string) => {
		setIsSaving(true)

		try {
			const updatedTransactions = editTransactions.map(({ id, ...rest }) => ({
				id,
				quantity: rest.quantity,
				price: rest.price,
				date: new Date(rest.date).toISOString(),
				wallet: rest.wallet,
			}))

			const sellPriceInUSD = sellPrice ? toUSD(Number(sellPrice)) : undefined

			await updateCoinMutation.mutateAsync({
				coinId: coin.coinId,
				desiredSellPrice: sellPriceInUSD,
				transactions: updatedTransactions,
			})
		} finally {
			setIsSaving(false)
		}
	}

	return (
		<div className='mx-0 flex flex-col gap-6 xl:mx-20 2xl:mx-40'>
			<div className='flex flex-row items-start justify-between gap-3 pr-4 text-sm sm:items-center md:text-base'>
				<Button
					variant='ghost'
					size='icon'
					disabled={isLoading || isSaving || isAdding}
					onClick={() => {
						setIsNavigatingBack(true)
						router.back()
					}}
					className='rounded-xl transition-colors duration-300 ease-in-out'
				>
					{isNavigatingBack ? <LoaderIcon className='size-5 animate-spin text-primary' /> : <ArrowLeftIcon />}
				</Button>

				<div className='flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-3'>
					<p>Quantity: {formatValue(coin.total_quantity)}</p>

					<p>Total invested: {formatUSDPrice(coin.total_cost, false)}</p>

					<p>Total value: {formatUSDPrice(totalValue, false)}</p>
				</div>
			</div>

			<div className='flex items-center justify-start gap-4 pl-4'>
				<Label htmlFor='sell-price' className='w-[30%]'>
					Sell price
				</Label>

				<Input
					id='sell-price'
					type='number'
					min={0}
					step={0.01}
					value={editSellPrice}
					autoFocus={false}
					onChange={handleSellPriceChange}
					className='w-[80%] [appearance:textfield] rounded-xl [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
				/>
			</div>

			{/* Chart */}
			<Card className='flex flex-col rounded-xl py-1'>
				<CardHeader className='flex-row items-center justify-between gap-2 space-y-0 p-3 sm:p-4'>
					<div className='flex flex-row items-center justify-center gap-2'>
						<Image
							src={coin.image || '/svg/coin-not-found.svg'}
							alt={coin.name || 'Coin image'}
							width={24}
							height={24}
							className='rounded-full'
							onError={(e) => {
								e.currentTarget.src = '/svg/coin-not-found.svg'
							}}
						/>

						<Link
							href={`https://coingecko.com/en/coins/${coin.coinId}`}
							target='_blank'
							rel='noopener noreferrer'
						>
							<span className='cursor-pointer truncate hover:text-[#397fee] dark:hover:text-[#75a6f4]'>
								{coin.name}
							</span>
						</Link>
					</div>

					<div className='flex flex-row items-center justify-center gap-2'>
						{DAY_OPTIONS.map(({ label, value }) => (
							<Button
								key={value}
								variant='outline'
								onClick={() => setDays(value)}
								className={cn('h-6 rounded-xl px-2 py-1 transition-colors duration-300 ease-in-out', {
									'bg-blue-500 hover:bg-blue-500': days === value,
								})}
							>
								{/* Full text for screens > 640px */}
								<span className='hidden sm:inline'>{label}</span>

								{/* Shortened text for screens < 640px */}
								<span className='inline sm:hidden'>
									{label === '1 day' ? '1d' : label === '1 week' ? '1w' : label === '1 month' ? '1m' : '1y'}
								</span>
							</Button>
						))}
					</div>
				</CardHeader>

				<CardContent className='px-1 py-3 sm:px-6 sm:pb-4'>
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
							<CartesianGrid vertical={true} strokeDasharray='4 4' />

							{/* Axis X */}
							<XAxis
								dataKey='Label'
								tickLine={false}
								axisLine={false}
								tick={true}
								tickMargin={10}
								tickFormatter={(value) => value}
							/>

							{/* Axis Y */}
							<YAxis
								dataKey='TotalValue'
								domain={[minValue * 0.98, maxValue * 1.02]}
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
								content={({ active, payload }) => {
									if (!active || !payload || payload.length === 0) return null

									const timeValue = payload[0].payload.Label
									const priceValue = payload[0].payload.Price
									const totalValue = payload[0].payload.TotalValue

									return (
										<div className='rounded-xl border bg-background p-2 shadow-xs sm:p-4'>
											<div className='flex flex-col gap-1'>
												<span className='text-xs'>{timeValue}</span>

												<span className='text-xs'>Price: {formatUSDPrice(priceValue)}</span>

												<span className='text-xs'>Total value: {formatUSDPrice(totalValue)}</span>
											</div>
										</div>
									)
								}}
							/>

							{/* Line on chart */}
							<Line
								dataKey='TotalValue'
								type='natural'
								stroke='var(--color-prices)'
								strokeWidth={2}
								dot={false}
							/>
						</LineChart>
					</ChartContainer>
				</CardContent>
			</Card>

			{/* Section for displaying transactions and sales */}
			<div className='mt-6'>
				<div className='mb-1 flex items-center justify-between'>
					<h3 className='px-4 text-sm font-semibold sm:text-lg'>Transaction History</h3>
				</div>

				<TableContainer
					key={Date.now()}
					editTransactions={editTransactions}
					onChange={setEditTransactions}
					className='h-auto'
				/>

				<div className='mt-4 flex flex-row items-center justify-end gap-3 px-4'>
					<Button
						variant='outline'
						size='default'
						onClick={handleAddTransaction}
						disabled={isAdding || isSaving}
						loading={isAdding}
						className='rounded-xl transition-colors duration-300 ease-in-out'
					>
						<PlusIcon className='size-4' />

						<span>Transaction</span>
					</Button>

					<Button
						variant='default'
						size='default'
						onClick={() => handleUpdate(editSellPrice)}
						disabled={isSaving || isAdding}
						loading={isSaving}
						className='rounded-xl text-white transition-colors duration-300 ease-in-out'
					>
						<span>Save changes</span>
					</Button>
				</div>
			</div>
		</div>
	)
}
