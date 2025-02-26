'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus } from 'lucide-react'
import { ChangeEvent, useEffect, useState } from 'react'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'

import {
	Button,
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	Input,
	Label,
} from '@/components/ui'
import { useCoinActions } from '@/hooks'
import { formatPrice } from '@/constants/format-price'
import { DAY_OPTIONS, MONTH_OPTIONS } from '@/constants/chart'
import { MarketChartData, Transaction, UserCoinData } from '@/app/api/types'
import { TableContainer } from '@/components/shared/data-tables/transaction-table'
import { createTransactionForUser, getCoinsMarketChart, updateUserCoin } from '@/app/api/actions'

interface Props {
	coin: UserCoinData
}

export const CoinIdContainer = ({ coin }: Props) => {
	const router = useRouter()

	const { handleAction } = useCoinActions()

	const [days, setDays] = useState<number>(1)
	const [isAdding, setIsAdding] = useState<boolean>(false)
	const [isSaving, setIsSaving] = useState<boolean>(false)
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [coinMarketChartData, setCoinMarketChartData] = useState<MarketChartData>()
	const [editSellPrice, setEditSellPrice] = useState<string>(String(coin.sellPrice || ''))
	const [editTransactions, setEditTransactions] = useState<Transaction[]>(coin.transactions)

	useEffect(() => {
		setIsLoading(true)
		setCoinMarketChartData(undefined)

		const fetchData = async () => {
			try {
				const marketChart = await getCoinsMarketChart(coin.coinId, days)

				setCoinMarketChartData(marketChart)
			} catch (error) {
				console.error('Error fetching coin details:', error)
			} finally {
				setIsLoading(false)
			}
		}

		fetchData()
	}, [coin.coinId, days])

	const totalValue = coin.currentPrice * coin.totalQuantity

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
			await handleAction(
				async () => {
					const newTransaction = await createTransactionForUser(coin.coinId, {
						quantity: 0,
						price: 0,
						date: new Date(),
					})

					if (newTransaction) {
						setEditTransactions((prev) => [...prev, newTransaction])
					}
				},
				'Transaction created successfully',
				'Failed to create transaction',
			)
		} finally {
			setIsAdding(false)
		}
	}

	const handleUpdate = async (sellPrice: string) => {
		setIsSaving(true)

		try {
			await handleAction(
				async () => {
					const updatedTransactions = editTransactions.map((transaction) => ({
						...transaction,
						quantity: transaction.quantity,
						price: transaction.price,
						date: new Date(transaction.date),
					}))

					await updateUserCoin(coin.coinId, Number(sellPrice), updatedTransactions)
				},
				'Coin updated successfully',
				'Failed to update coin',
			)
		} finally {
			setIsSaving(false)
		}
	}

	return (
		<div className="flex flex-col gap-4 mx-72 max-[1700px]:mx-40 max-[1500px]:mx-20 max-[1300px]:mx-10 max-[1200px]:mx-0">
			<div className="flex flex-row items-center justify-between gap-3 pr-4 max-[600px]:items-start max-[700px]:text-sm">
				<Button variant="ghost" size="icon" onClick={() => router.back()}>
					<ArrowLeft />
				</Button>

				<div className="flex flex-row items-center gap-3 max-[600px]:flex-col max-[600px]:items-start max-[600px]:gap-1">
					<p>Quantity: {formatPrice(coin.totalQuantity, false)}</p>

					<p>Total invested: ${formatPrice(coin.totalCost, false)}</p>

					<p>Total value: ${formatPrice(totalValue, false)}</p>
				</div>
			</div>

			<div className="flex items-center justify-start gap-4 px-4">
				<Label htmlFor="sell-price" className="w-[30%]">
					Sell price
				</Label>

				<Input
					id="sell-price"
					type="number"
					min={0}
					step={0.01}
					value={editSellPrice}
					autoFocus={false}
					onChange={handleSellPriceChange}
					className="w-[80%] rounded-xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
				/>
			</div>

			{/* Chart */}
			<div>
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

				<ChartContainer config={chartConfig}>
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
							dataKey="TotalValue"
							domain={[minValue, maxValue]}
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

										const formattedValue =
											!isNaN(numericValue) && numericValue >= 1
												? numericValue.toFixed(2)
												: numericValue.toFixed(5)

										if (name === 'TotalValue') return ['Total value: ', formattedValue]
										return [name, formattedValue]
									}}
								/>
							}
						/>

						{/* Line on chart */}
						<Line
							dataKey="TotalValue"
							type="natural"
							stroke="var(--color-prices)"
							strokeWidth={2}
							dot={false}
						/>
					</LineChart>
				</ChartContainer>
			</div>

			{/* Section for displaying transactions and sales */}
			<div>
				<div className="flex items-center justify-between mb-1">
					<h3 className="px-4 text-lg font-semibold max-[400px]:text-sm">Transaction History</h3>
				</div>

				<TableContainer
					key={Date.now()}
					editTransactions={editTransactions}
					onChange={setEditTransactions}
					className="h-auto"
				/>

				<div className="flex flex-row items-center justify-end gap-3 px-4 mt-4">
					<Button
						variant="outline"
						size="default"
						onClick={handleAddTransaction}
						disabled={isAdding || isSaving}
						loading={isAdding}
						className="rounded-xl"
					>
						<Plus className="h-4 w-4" />
						<span>Transaction</span>
					</Button>

					<Button
						variant="default"
						size="default"
						onClick={() => handleUpdate(editSellPrice)}
						disabled={isSaving || isAdding}
						loading={isSaving}
						className="rounded-xl text-white"
					>
						<span>Save changes</span>
					</Button>
				</div>
			</div>
		</div>
	)
}
