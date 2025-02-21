'use client'

import { Plus } from 'lucide-react'
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
import { useToast } from '@/hooks'
import { ValidDays } from '@/app/api/constants'
import { formatPrice } from '@/constants/format-price'
import { getCoinsMarketChart, updateUserCoin } from '@/app/api/actions'
import { MarketChartData, Transaction, UserCoinData } from '@/app/api/types'
import { TableContainer } from '@/components/shared/data-tables/transaction-table'

interface Props {
	coin: UserCoinData
}

const DAY_OPTIONS: { label: string; value: ValidDays }[] = [
	{ label: '1 day', value: 1 },
	{ label: '1 week', value: 7 },
	{ label: '1 month', value: 30 },
	{ label: '1 year', value: 365 },
]

export const CoinIdContainer = ({ coin }: Props) => {
	const { toast } = useToast()

	const [days, setDays] = useState<number>(1)
	const [getCoinData, setGetCoinData] = useState<boolean>(false)
	const [coinMarketChartData, setCoinMarketChartData] = useState<MarketChartData>()
	const [editSellPrice, setEditSellPrice] = useState<string>(String(coin.sellPrice || ''))
	const [editTransactions, setEditTransactions] = useState<Transaction[]>(coin.transactions)

	useEffect(() => {
		setGetCoinData(true)
		setCoinMarketChartData(undefined)

		const fetchData = async () => {
			try {
				const marketChart = await getCoinsMarketChart(coin.coinId, days)

				setCoinMarketChartData(marketChart)
			} catch (error) {
				console.error('Error fetching coin details:', error)
			} finally {
				setGetCoinData(false)
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

	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

	// Сортируем транзакции по дате (от старых к новым)
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
					const month = months[date.getMonth()]
					label = `${hours}:${minutes}, ${day} ${month}`
					break

				case days <= 30:
					// Show day and month for "1 week" and "1 month" (e.g., 15 Mar)
					const monthDay = date.getDate()
					const monthName = months[date.getMonth()]
					label = `${monthDay} ${monthName}`
					break

				case days <= 365:
					// Show month and year for "1 year" (e.g., Mar 2025)
					const monthYear = months[date.getMonth()]
					const year = date.getFullYear()
					label = `${monthYear} ${year}`
					break

				default:
					// For other cases, use the year only (e.g., 2025)
					label = date.getFullYear().toString()
					break
			}

			// Находим актуальное totalQuantity на этот момент времени
			const currentQuantity = sortedTransactions
				.filter((transaction) => new Date(transaction.date).getTime() <= timestamp)
				.reduce((sum, transaction) => sum + transaction.quantity, 0)

			return {
				Label: label,
				Price: price,
				TotalValue: currentQuantity * price, // Берем актуальное количество монет и умножаем на цену
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

	const handleAddTransaction = () => {
		const newTransaction: Transaction = {
			id: `temp-${Math.random().toString(36).substring(2)}`,
			quantity: 0,
			price: 0,
			date: new Date(),
			userCoinId: coin.coinId,
		}

		setEditTransactions([...editTransactions, newTransaction])
	}

	const handleUpdate = async (sellPrice: string) => {
		try {
			// Преобразуем данные о покупках в нужный формат
			const updatedTransactions = editTransactions.map((transaction) => ({
				...transaction,
				quantity: transaction.quantity,
				price: transaction.price,
				date: new Date(transaction.date),
			}))

			// Вызываем функцию для обновления криптовалюты
			await updateUserCoin(coin.coinId, Number(sellPrice), updatedTransactions)

			// Уведомляем пользователя об успехе
			toast({
				title: '✅ Success',
				description: 'Coin updated successfully',
				variant: 'default',
			})
		} catch (error) {
			// Уведомляем пользователя об ошибке
			console.error('Error updating coin:', error)

			toast({
				title: '🚨 Error',
				description: error instanceof Error ? error.message : 'Failed to update coin. Please try again',
				variant: 'destructive',
			})
		}
	}

	return (
		<div className="flex flex-col items-center gap-4 py-4 w-full">
			<div className="flex flex-row items-center justify-start gap-3 px-4 w-2/3 max-[1200px]:w-auto max-[700px]:w-full max-[700px]:flex-col max-[700px]:items-start max-[700px]:gap-1 max-[600px]:text-sm">
				<p>Quantity: {formatPrice(coin.totalQuantity, false)}</p>

				<p>Total invested: ${formatPrice(coin.totalCost, false)}</p>

				<p>Total value: ${formatPrice(totalValue, false)}</p>
			</div>

			<div className="flex items-center justify-start gap-4 px-4 w-2/3 max-[700px]:w-full">
				<Label htmlFor="sell-price" className="w-[30%]">
					Sell price
				</Label>

				<Input
					id="sell-price"
					type="number"
					min={0}
					step={0.01}
					value={editSellPrice}
					onChange={handleSellPriceChange}
					className="w-[80%] rounded-xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
				/>
			</div>

			{/* Chart */}
			<div className="w-2/3 max-[1200px]:w-auto max-[700px]:w-full">
				<div className="flex items-center justify-center gap-2 m-4 mb-2">
					{DAY_OPTIONS.map(({ label, value }) => (
						<Button
							key={value}
							variant={'outline'}
							onClick={() => setDays(value)}
							className={`px-2 py-1 h-6 rounded-xl ${days === value ? 'bg-blue-500 hover:bg-blue-500' : ''}`}
						>
							{/* Full text for screens wider than 640px */}
							<span className="hidden sm:inline">{label}</span>

							{/* Shortened text for screens strather than 640px */}
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
			<div className="w-2/3 mt-2 max-[1200px]:w-auto max-[700px]:w-full">
				<div className="flex items-center justify-between mb-1">
					<h3 className="px-4 text-lg font-semibold max-[400px]:text-sm">Transaction History</h3>
				</div>

				<TableContainer
					editTransactions={editTransactions}
					setEditTransactions={setEditTransactions}
					className="h-auto"
				/>

				<div className="flex flex-row items-center justify-end gap-3 px-4 mt-4">
					<Button variant={'outline'} onClick={handleAddTransaction} className="rounded-xl text-white">
						<Plus className="mr-2 h-4 w-4" />
						Transaction
					</Button>

					<Button onClick={() => handleUpdate(editSellPrice)} className="rounded-xl text-white">
						Save changes
					</Button>
				</div>
			</div>
		</div>
	)
}
