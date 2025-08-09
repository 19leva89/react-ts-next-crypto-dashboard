import { isValid } from 'date-fns'
import { MarketChart } from '@prisma/client'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { ValidDays } from '@/constants/chart'
import { makeReq } from '@/app/api/make-request'
import { handleError } from '@/lib/handle-error'
import { getFieldForDays } from '@/data/field-for-days'
import { UserChartDataPoint } from '@/modules/charts/schema'

const getLatestBefore = <T extends { timestamp: Date }>(entries: T[], target: Date): T | null => {
	let left = 0
	let right = entries.length - 1
	let resultIdx = -1
	const targetTime = target.getTime()

	while (left <= right) {
		const mid = Math.floor((left + right) / 2)
		const midTime = entries[mid].timestamp.getTime()

		if (midTime <= targetTime) {
			resultIdx = mid
			left = mid + 1
		} else {
			right = mid - 1
		}
	}

	return resultIdx >= 0 ? entries[resultIdx] : null
}

export const getUserById = async (id: string) => {
	try {
		const user = await prisma.user.findUnique({
			where: { id },
			include: { accounts: true },
		})

		return user
	} catch {
		return null
	}
}

export const getUserByEmail = async (email: string) => {
	try {
		const user = await prisma.user.findUnique({
			where: { email },
			include: { accounts: true },
		})

		return user
	} catch {
		return null
	}
}

export const getUserCoinsList = async () => {
	try {
		const session = await auth()

		// Checking if the user is authorized
		if (!session?.user) throw new Error('User not authenticated')

		// Return old data immediately
		const userCoins = await prisma.userCoin.findMany({
			where: { userId: session.user.id },
			select: {
				total_quantity: true,
				total_cost: true,
				average_price: true,
				desired_sell_price: true,
				coinsListIDMap: {
					select: {
						name: true,
						symbol: true,
					},
				},
				coin: {
					select: {
						id: true,
						current_price: true,
						image: true,
						sparkline_in_7d: true,
						price_change_percentage_7d_in_currency: true,
					},
				},
				transactions: {
					select: {
						id: true,
						quantity: true,
						price: true,
						date: true,
						userCoinId: true,
					},
				},
			},
		})

		// Launch an update in the background via API
		const response = await makeReq('GET', `/update/user-coins?userId=${session.user.id}`)

		if (!response || !Array.isArray(response) || response.length === 0) {
			console.log('✅ GET_USER_COINS: Using cached UserCoins from DB')

			return userCoins
		}

		return userCoins
	} catch (error) {
		handleError(error, 'GET_USER_COINS')

		return []
	}
}

export const getUserCoinsListMarketChart = async (days: ValidDays): Promise<UserChartDataPoint[]> => {
	try {
		// Checking if the user is authorized
		const session = await auth()
		if (!session?.user) throw new Error('User not authenticated')

		const field = getFieldForDays(days)
		if (!field) throw new Error('Invalid days parameter')

		const priceField = `prices_${days}d` as keyof MarketChart

		// Get all user coins with transactions and MarketChart data
		const userCoins = await prisma.userCoin.findMany({
			where: { userId: session.user.id },
			select: {
				transactions: { orderBy: { date: 'asc' } },
				coin: {
					select: {
						marketCharts: true,
					},
				},
			},
		})

		// 2. Coins processing
		const coinsData = userCoins.map(({ transactions, coin }) => {
			// 2.1. Collecting timeline
			let quantity = 0

			const timeline = transactions.map((tx) => {
				return {
					timestamp: tx.date,
					quantity: (quantity += tx.quantity),
				}
			})

			// 2.2. Price processing
			const marketChart = coin.marketCharts?.find((chart) => chart[priceField])

			const prices = (marketChart?.[priceField] as [number, number][]) ?? []

			const pricePoints = prices
				.map(([timestampMs, price]) => ({ timestamp: new Date(timestampMs), price }))
				.filter(({ timestamp }) => isValid(timestamp))

			return { timeline, pricePoints }
		})

		// 3. Collecting timestamps
		const timestamps = Array.from(
			new Set(coinsData.flatMap((c) => c.pricePoints.map((p) => p.timestamp.getTime()))),
		)
			.sort((a, b) => a - b)
			.map((t) => new Date(t))

		// 4. Calculating cost for each timestamp
		return timestamps
			.map((timestamp) => ({
				timestamp,
				value: coinsData.reduce((total, { timeline, pricePoints }) => {
					const quantity = getLatestBefore(timeline, timestamp)?.quantity ?? 0
					const price = getLatestBefore(pricePoints, timestamp)?.price ?? 0
					return total + quantity * price
				}, 0),
			}))
			.filter(({ value }) => value > 0)
	} catch (error) {
		handleError(error, 'GET_USER_COINS_MARKET_CHART')

		return {} as UserChartDataPoint[]
	}
}
