'use server'

import axios from 'axios'
import { pick } from 'lodash'
import { isValid } from 'date-fns'
import { revalidatePath } from 'next/cache'
import { MarketChart, Prisma } from '@prisma/client'

import { auth, signIn } from '@/auth'
import { prisma } from '@/lib/prisma'
import { makeReq } from './make-request'
import { sendEmail } from '@/lib/send-email'
import { saltAndHashPassword } from '@/lib/salt'
import { MarketChartData } from '@/modules/coins/schema'
import { UserChartDataPoint } from '@/modules/charts/schema'
import { trendingDataSchema } from '@/modules/dashboard/schema'
import { CategoriesData, TrendingData } from '@/modules/dashboard/schema'
import { AirdropsData, PrismaTransactionClient, CoinData, Airdrop } from './types'
import { NotificationTemplate, VerificationUserTemplate } from '@/components/shared/email-templates'
import { COINS_UPDATE_INTERVAL, DAYS_MAPPING, MARKET_CHART_UPDATE_INTERVAL, ValidDays } from './constants'

const handleError = (error: unknown, context: string) => {
	if (error instanceof Prisma.PrismaClientKnownRequestError) {
		console.error(`💾 Prisma error [${context}]:`, error.code, error.message)
	} else if (axios.isAxiosError(error)) {
		console.error(`🌐 API error [${context}]:`, error.response?.status, error.message)
	} else if (error instanceof Error) {
		console.error(`🚨 Unexpected error [${context}]:`, error.message)
	} else {
		console.error(`❌ Unknown error [${context}]`, error)
	}

	throw error
}

// General function for recalculating aggregated data
export const recalculateAveragePrice = async (
	userId: string,
	coinId: string,
	prisma: PrismaTransactionClient,
) => {
	const transactions = await prisma.userCoinTransaction.findMany({
		where: { userCoin: { userId, coinId } },
		orderBy: { date: 'asc' },
	})

	const totals = transactions.reduce(
		(acc, { quantity, price }) => {
			if (quantity > 0) {
				acc.totalQuantity += quantity
				acc.totalCost += quantity * price
			} else {
				const sellQty = Math.min(-quantity, acc.totalQuantity)
				if (sellQty > 0) {
					const averagePrice = acc.totalCost / acc.totalQuantity
					acc.totalCost -= sellQty * averagePrice
					acc.totalQuantity -= sellQty
				}
			}
			return acc
		},
		{ totalQuantity: 0, totalCost: 0 },
	)

	// Blocked going into minus
	if (totals.totalQuantity < 0) throw new Error('Not enough coins to sell')

	return prisma.userCoin.upsert({
		where: { userId_coinId: { userId, coinId } },
		update: {
			total_quantity: totals.totalQuantity,
			total_cost: totals.totalCost,
			average_price: totals.totalQuantity > 0 ? totals.totalCost / totals.totalQuantity : 0,
		},
		create: {
			id: coinId,
			user: { connect: { id: userId } },
			coin: { connect: { id: coinId } },
			coinsListIDMap: { connect: { id: coinId } },
			total_quantity: totals.totalQuantity,
			total_cost: totals.totalCost,
			average_price: totals.totalQuantity > 0 ? totals.totalCost / totals.totalQuantity : 0,
		},
	})
}

const getFieldForDays = (days: number): keyof MarketChart | null => {
	return (DAYS_MAPPING[days as ValidDays] as keyof MarketChart) || null
}

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

export const registerUser = async (body: Prisma.UserCreateInput) => {
	try {
		const user = await prisma.user.findUnique({
			where: {
				email: body.email,
			},
			include: { accounts: true },
		})

		if (user) {
			if (user.accounts.length > 0)
				throw new Error('This email is linked to a social login. Please use GitHub or Google')

			if (!user.emailVerified) throw new Error('Email not confirmed')

			throw new Error('User already exists')
		}

		const createdUser = await prisma.user.create({
			data: {
				name: body.name,
				email: body.email,
				password: await saltAndHashPassword(body.password as string),
			},
		})

		const code = Math.floor(100000 + Math.random() * 900000).toString()

		await prisma.verificationCode.create({
			data: {
				code,
				userId: createdUser.id,
			},
		})

		await sendEmail({
			to: createdUser.email,
			subject: 'Crypto / 📝 Registration confirmation',
			html: VerificationUserTemplate({ code }).toString(),
		})
	} catch (error) {
		handleError(error, 'CREATE_USER')
	}
}

export const loginUser = async (provider: string) => {
	await signIn(provider, { redirectTo: '/' })

	revalidatePath('/')
}

export const createLoginNotification = async (userId: string) => {
	try {
		await prisma.notification.create({
			data: {
				userId,
				type: 'LOGIN',
				title: 'Login',
				message: 'You have successfully logged in',
			},
		})
	} catch (error) {
		handleError(error, 'CREATE_LOGIN_NOTIFICATION')
	}
}

export const notifyUsersOnPriceTarget = async () => {
	const userCoins = await prisma.userCoin.findMany({
		where: {
			desired_sell_price: {
				not: null,
			},
			coin: {
				current_price: {
					not: null,
				},
			},
		},
		include: {
			coinsListIDMap: true,
			coin: true,
			user: true,
		},
	})

	// Grouping by user
	const userMap: Record<
		string,
		{
			email: string
			coins: { name: string; image: string; currentPrice: number; desiredPrice: number }[]
		}
	> = {}

	for (const userCoin of userCoins) {
		const { user, coin, desired_sell_price, coinsListIDMap } = userCoin

		if (!user.email || desired_sell_price == null || coin.current_price == null) continue
		if (coin.current_price < desired_sell_price) continue

		if (!userMap[user.id]) {
			userMap[user.id] = {
				email: user.email,
				coins: [],
			}
		}

		userMap[user.id].coins.push({
			name: coinsListIDMap?.name ?? coin.id,
			image: coin.image ?? '/svg/coin-not-found.svg',
			currentPrice: coin.current_price,
			desiredPrice: desired_sell_price,
		})
	}

	// Sending emails to users and creating notifications
	for (const userId in userMap) {
		const { email, coins } = userMap[userId]

		try {
			// Creating notifications
			for (const coin of coins) {
				await prisma.notification.create({
					data: {
						userId,
						type: 'PRICE_ALERT',
						title: '🎯 Target price reached!',
						message: `${coin.name} reached your target (${coin.currentPrice}$)`,
						coinId: coin.name,
					},
				})
			}

			// Sending emails
			await sendEmail({
				to: email,
				subject: `🚀 ${coins.length > 1 ? 'A few coins' : coins[0].name} reached your target`,
				html: NotificationTemplate({ coins }).toString(),
			})
		} catch (error) {
			handleError(error, 'NOTIFY_USER_ON_PRICE_TARGET')
		}
	}
}

// cron 24h
export const updateTrendingData = async (): Promise<TrendingData> => {
	try {
		console.log('🔄 Starting TrendingData update via API...')
		const response = await makeReq('GET', '/gecko/trending')

		if (!response || !response.coins || !response.coins.length) {
			console.warn('⚠️ Empty response from API, aborting update')
			return { coins: [] } as TrendingData
		}

		// Delete old data
		await prisma.trendingCoin.deleteMany()
		console.log('🗑️ Old trending data deleted.')

		// Transform and validate the data
		const trendingCoins = trendingDataSchema.parse({ coins: response.coins })

		// Batch update
		const transaction = await prisma.$transaction(
			trendingCoins.coins.map((coin) =>
				prisma.trendingCoin.create({
					data: {
						...coin.item,
						thumb: coin.item.thumb || '',
						market_cap_rank: coin.item.market_cap_rank || 0,
						price_btc: coin.item.price_btc || 0,
						data: JSON.stringify(coin.item.data),
					},
				}),
			),
		)

		console.log(`✅ Updated ${transaction.length} trendingCoins`)

		return trendingCoins
	} catch (error) {
		handleError(error, 'UPDATE_TRENDING_DATA')
		return { coins: [] }
	}
}

// cron 24h
export const updateCategories = async (): Promise<CategoriesData> => {
	try {
		console.log('🔄 Starting categories update via API...')
		const response = await makeReq('GET', '/gecko/categories')

		if (!response || !response.length) {
			console.warn('⚠️ Empty response from API, aborting update')
			return []
		}

		// Data transformation
		const categoriesData: CategoriesData = response.map((category: any) => ({
			category_id: category.category_id,
			name: category.name,
		}))

		// Batch update
		const transaction = await prisma.$transaction(
			categoriesData.map((category) =>
				prisma.category.upsert({
					where: { category_id: category.category_id },
					update: category,
					create: category,
				}),
			),
		)

		console.log(`✅ Updated ${transaction.length} categories`)
		return categoriesData
	} catch (error) {
		handleError(error, 'UPDATE_CATEGORIES')
		return []
	}
}

// cron 10min
export const updateCoinsList = async (): Promise<any> => {
	try {
		// Getting a list of outdated coins
		const coinsToUpdate = await prisma.coin.findMany({
			orderBy: { updatedAt: 'asc' },
			take: 50, // Limit in DB
			select: { id: true, updatedAt: true },
		})

		if (!coinsToUpdate.length) return []

		// Forming a string for an API request
		const coinIds = coinsToUpdate.map((coin) => encodeURIComponent(coin.id)).join('%2C')

		// Requesting fresh data from the API
		console.log('🔄 Outdated records, request CoinsList via API...')
		const response = await makeReq('GET', `/gecko/coins-upd/${coinIds}`)

		if (!response || !Array.isArray(response) || !response.length) {
			console.warn('⚠️ UPDATE_COINS: Empty response from API, using old CoinsList')

			return prisma.coin.findMany({ include: { coinsListIDMap: true } })
		}

		// Batch update
		const updateOperations = response.flatMap((coin) => [
			// Upsert for CoinsListIDMap
			prisma.coinsListIDMap.upsert({
				where: { id: coin.id },
				update: { symbol: coin.symbol, name: coin.name },
				create: { id: coin.id, symbol: coin.symbol, name: coin.name },
			}),

			// Update for Coin
			prisma.coin.update({
				where: { id: coin.id },
				data: {
					...pick(coin, [
						'current_price',
						'description',
						'image',
						'market_cap',
						'market_cap_rank',
						'total_volume',
						'high_24h',
						'low_24h',
						'price_change_percentage_24h',
						'circulating_supply',
						'sparkline_in_7d',
						'price_change_percentage_7d_in_currency',
					]),
					updatedAt: new Date(),
				},
			}),
		])

		await prisma.$transaction(updateOperations)

		console.log('✅ Records CoinsList updated!')

		// Returning an updated list of coins
		return prisma.coin.findMany({ include: { coinsListIDMap: true } })
	} catch (error) {
		handleError(error, 'UPDATE_COINS_LIST')
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

export const updateUserCoinsList = async (userId: string): Promise<any> => {
	try {
		const currentTime = new Date()
		const updateTime = new Date(currentTime.getTime() - COINS_UPDATE_INTERVAL)

		// Get a list of user coins
		const coinsToUpdate = await prisma.userCoin.findMany({
			where: {
				userId,
				updatedAt: { lt: updateTime },
			},
			orderBy: { updatedAt: 'asc' },
			take: 50, // Limit in DB
			select: {
				coinId: true,
				coin: { select: { id: true } },
			},
		})

		if (!coinsToUpdate.length) {
			console.log('✅ Using cached UserCoins')

			return prisma.userCoin.findMany({
				where: { userId },
				include: { coin: true },
			})
		}

		// Forming a string for an API request
		const coinIds = coinsToUpdate.map((coin) => encodeURIComponent(coin.coinId)).join('%2C')

		// Requesting fresh data from the API
		console.log('🔄 Outdated records, request UserCoins via API...')
		const response = await makeReq('GET', `/gecko/user/${coinIds}`)

		if (!response || !Array.isArray(response) || !response.length) {
			console.warn('⚠️ UPDATE_USER_COINS: Empty response from API, using old UserCoinsList')

			return prisma.userCoin.findMany({
				where: { userId },
				include: { coin: true },
			})
		}

		// Batch update
		const updateOperations = response.flatMap((coin) => [
			prisma.coin.upsert({
				where: { id: coin.id },
				update: {
					current_price: coin.current_price,
					image: coin.image,
					sparkline_in_7d: coin.sparkline_in_7d,
					updatedAt: currentTime,
				},
				create: {
					id: coin.id,
					coinsListIDMapId: coin.id,
					current_price: coin.current_price,
					sparkline_in_7d: coin.sparkline_in_7d,
					image: coin.image,
					updatedAt: currentTime,
				},
			}),
			prisma.userCoin.updateMany({
				where: {
					userId,
					coinId: coin.id,
				},
				data: { updatedAt: currentTime },
			}),
		])

		await prisma.$transaction(updateOperations)

		console.log('✅ Records UserCoinsList updated!')

		// Returning an updated list of coins
		return await prisma.userCoin.findMany({
			where: { userId },
			include: { coin: true },
		})
	} catch (error) {
		handleError(error, 'UPDATE_USER_COINS_LIST')
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

export const getCoinData = async (coinId: string): Promise<CoinData> => {
	try {
		const updateTime = new Date(Date.now() - COINS_UPDATE_INTERVAL)

		// Checking the availability of data in the DB
		const cachedData = await prisma.coin.findUnique({
			where: { id: coinId },
			include: { coinsListIDMap: true },
		})

		if (cachedData && cachedData.updatedAt > updateTime) {
			console.log('✅ Using cached CoinData from DB')

			return {
				id: cachedData.id,
				symbol: cachedData.coinsListIDMap.symbol,
				name: cachedData.coinsListIDMap.name,
				description: { en: cachedData.description || '' },
				image: { thumb: cachedData.image || '' },
				market_cap_rank: cachedData.market_cap_rank || 0,
				market_data: {
					current_price: { usd: cachedData.current_price || 0 },
					market_cap: { usd: cachedData.market_cap || 0 },
					high_24h: { usd: cachedData.high_24h || 0 },
					low_24h: { usd: cachedData.low_24h || 0 },
					circulating_supply: cachedData.circulating_supply || 0,
					sparkline_7d: { price: cachedData.sparkline_in_7d || [] },
				},
				last_updated: cachedData.updatedAt.toISOString(),
			} as CoinData
		}

		// If there is no data, make a request to the API
		console.log(`🔄 Outdated records, request CoinData ${coinId} via API...`)
		const response = await makeReq('GET', `/gecko/coins-get/${coinId}`)

		// Validate the API response
		if (!response || typeof response !== 'object' || Array.isArray(response)) {
			console.warn('⚠️ Empty response from API, using old CoinData')

			return {} as CoinData
		}

		const { id, symbol, name, image, description, market_cap_rank, market_data } = response

		const mapToDbFields = (data: any) => ({
			current_price: data.market_data?.current_price?.usd || 0,
			description: data.description?.en || '',
			image: data.image?.thumb || '',
			market_cap: data.market_data?.market_cap?.usd || 0,
			market_cap_rank: data.market_cap_rank || 0,
			high_24h: data.market_data?.high_24h?.usd || 0,
			low_24h: data.market_data?.low_24h?.usd || 0,
			circulating_supply: data.market_data?.circulating_supply || 0,
			price_change_percentage_24h: data.market_data?.price_change_percentage_24h || 0,
			price_change_percentage_7d_in_currency:
				data.market_data?.price_change_percentage_7d_in_currency?.usd || 0,
			total_volume: data.market_data?.total_volume?.usd || 0,
			updatedAt: new Date(),
		})

		// Merged transaction
		await prisma.$transaction([
			prisma.coinsListIDMap.upsert({
				where: { id },
				update: { symbol, name },
				create: { id, symbol, name },
			}),
			prisma.coin.upsert({
				where: { id },
				update: {
					...mapToDbFields(response),
					updatedAt: new Date(),
				},
				create: {
					id,
					coinsListIDMapId: id,
					...mapToDbFields(response),
				},
			}),
		])

		console.log('✅ Records CoinData updated!')

		return {
			id,
			symbol,
			name,
			description: { en: description?.en || '' },
			image: { thumb: image?.thumb || '' },
			market_cap_rank: market_cap_rank || 0,
			market_data: {
				current_price: { usd: market_data?.current_price?.usd || 0 },
				market_cap: { usd: market_data?.market_cap?.usd || 0 },
				high_24h: { usd: market_data?.high_24h?.usd || 0 },
				low_24h: { usd: market_data?.low_24h?.usd || 0 },
				circulating_supply: market_data?.circulating_supply || 0,
			},
		} as CoinData
	} catch (error) {
		handleError(error, 'GET_COIN_DATA')

		return {} as CoinData
	}
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const updateUserCoinData = async (coinId: string) => {}

export const getCoinsMarketChart = async (coinId: string, days: ValidDays): Promise<MarketChartData> => {
	try {
		const field = getFieldForDays(days)
		if (!field) throw new Error('Invalid days parameter')

		const updatedField = `updatedAt_${days}d` as keyof MarketChart

		// Get all the data about the charts from the DB
		const cachedData = await prisma.marketChart.findUnique({
			where: { id: coinId },
		})

		const currentTime = new Date()
		const updateTime = new Date(currentTime.getTime() - MARKET_CHART_UPDATE_INTERVAL)

		// If the data for the required period already exists, return it
		if (cachedData?.[field] && cachedData?.[updatedField] && cachedData[updatedField]! > updateTime) {
			return { prices: cachedData[field] } as MarketChartData
		}

		// Request data from the API
		console.log(`🔄 Fetching CoinsMarketChart from API for ${days} day(s)...`)
		const response = await makeReq('GET', `/gecko/chart/${coinId}`, { days })

		// If there is no data or it is empty, display a warning
		if (!response || !response.prices || !response.prices.length) {
			throw new Error('⚠️ Empty response from API')
		}

		// Create CoinsListIDMap
		await prisma.coinsListIDMap.upsert({
			where: { id: coinId },
			update: {},
			create: {
				id: coinId,
				symbol: coinId,
				name: coinId,
			},
		})

		// Create Coin
		await prisma.coin.upsert({
			where: { id: coinId },
			update: {},
			create: {
				id: coinId,
				coinsListIDMapId: coinId,
			},
		})

		// Create/Update MarketChart
		await prisma.marketChart.upsert({
			where: { id: coinId },
			update: {
				[field]: response.prices,
				[updatedField]: currentTime,
			},
			create: {
				id: coinId,
				[field]: response.prices,
				[updatedField]: currentTime,
				coin: {
					connect: { id: coinId },
				},
			},
		})

		console.log(`✅ Records CoinsMarketChart updated for ${days} day(s)!`)

		return { prices: response.prices } as MarketChartData
	} catch (error) {
		handleError(error, 'GET_COINS_MARKET_CHART')

		return {} as MarketChartData
	}
}

// cron 24h
export const updateCoinsMarketChart = async (days: ValidDays): Promise<MarketChartData> => {
	const RPM_LIMIT = 30 // 30 requests per minute
	const DELAY = (60 * 1000) / RPM_LIMIT + 100 // 2100ms between requests
	let requestCount = 0

	try {
		const field = getFieldForDays(days)
		if (!field) throw new Error('Invalid days parameter')

		const updatedField = `updatedAt_${days}d` as keyof MarketChart

		const coins = await prisma.coin.findMany({
			select: { id: true },
		})

		console.log(`🔄 Fetching market data for ${coins.length} coins (${days} day(s))...`)

		const results = {
			success: 0,
			errors: 0,
			skipped: 0,
		}

		// Process each coin sequentially
		for (const { id: coinId } of coins) {
			try {
				const startTime = Date.now()

				// Pause before each request
				if (requestCount > 0) {
					await new Promise((resolve) => setTimeout(resolve, DELAY))
				}

				// Request data for a specific coin
				const response = await makeReq('GET', `/gecko/chart/${coinId}`, { days })
				requestCount++

				if (!response || !response.prices || !response.prices.length) {
					results.skipped++

					console.warn(`⚠️ No data for ${coinId}`)

					continue
				}

				// Updating a record in DB
				await prisma.marketChart.upsert({
					where: { id: coinId },
					update: {
						[field]: response.prices,
						[updatedField]: new Date(),
					},
					create: {
						id: coinId,
						[field]: response.prices,
						[updatedField]: new Date(),
						coin: { connect: { id: coinId } },
					},
				})

				console.log(`✅ Updated ${coinId}`)
				results.success++

				// Compensate for the query execution time
				const executionTime = Date.now() - startTime
				if (executionTime < DELAY) {
					await new Promise((resolve) => setTimeout(resolve, DELAY - executionTime))
				}
			} catch (error) {
				results.errors++

				if (error instanceof Error) {
					if (error.message.includes('429') || error.message.includes('500')) {
						console.warn(`⚠️ Rate limit detected, waiting 60 seconds...`)
						await new Promise((resolve) => setTimeout(resolve, 60 * 1000))

						requestCount = 0 // Reset the counter after waiting
					}
					console.error(`❌ Error processing ${coinId}:`, error.message)
				}

				handleError(error, 'UPDATE_COIN_MARKET_CHART')
			}
		}

		console.log(
			`✅ Results: ${results.success} updated, ${results.skipped} skipped, ${results.errors} errors`,
		)

		return { success: true } as unknown as MarketChartData
	} catch (error) {
		handleError(error, 'UPDATE_COINS_MARKET_CHART')

		return {} as MarketChartData
	}
}

export const getAirdrops = async (): Promise<AirdropsData> => {
	try {
		// Getting airdrop data from the DB
		const cachedData = await prisma.airdrop.findMany({
			include: {
				coin: { select: { id: true } },
				coinsListIDMap: { select: { name: true, symbol: true } },
			},
		})

		// If the airdrops data already exists in the DB, return it
		if (cachedData.length) {
			console.log('✅ Using cached Airdrops from DB')

			return {
				data: cachedData.map(({ coin, coinsListIDMap, start_date, end_date, ...rest }) => ({
					...rest,
					coin: { id: coin.id, ...coinsListIDMap },
					startDate: new Date(start_date.toISOString()),
					endDate: new Date(end_date.toISOString()),
					projectName: rest.project_name,
					totalPrize: rest.total_prize,
					winnerCount: rest.winner_count,
				})),
			}
		}

		// If there is no data or it is outdated, request it via API
		console.log('🔄 Outdated records, request Airdrops via API...')
		const response = await makeReq('GET', '/cmc/airdrops')

		if (!response || !Array.isArray(response.data) || !response.data.length) {
			console.warn('⚠️ Empty response from API, using old Airdrops')

			return { data: [] } as AirdropsData
		}

		const transformAirdropData = (airdrop: Airdrop) => ({
			project_name: airdrop.projectName,
			description: airdrop.description,
			status: airdrop.status,
			coinId: airdrop.coin.id,
			coinsListIDMapId: airdrop.coin.id,
			start_date: new Date(airdrop.startDate),
			end_date: new Date(airdrop.endDate),
			total_prize: airdrop.totalPrize,
			winner_count: airdrop.winnerCount,
			link: airdrop.link,
		})

		// Batch processing via transaction
		const upsertOperations = response.data.map((airdrop: Airdrop) =>
			prisma.airdrop.upsert({
				where: { id: airdrop.id },
				update: transformAirdropData(airdrop),
				create: {
					id: airdrop.id,
					...transformAirdropData(airdrop),
				},
			}),
		)

		await prisma.$transaction(upsertOperations)

		// Returning current data from DB
		const updatedData = await prisma.airdrop.findMany({
			include: {
				coin: { select: { id: true } },
				coinsListIDMap: { select: { name: true, symbol: true } },
			},
		})

		console.log('✅ Records Airdrops updated!')

		return {
			data: updatedData.map(({ coin, coinsListIDMap, start_date, end_date, ...rest }) => ({
				...rest,
				coin: { id: coin.id, ...coinsListIDMap },
				startDate: new Date(start_date),
				endDate: new Date(end_date),
				projectName: rest.project_name,
				totalPrize: rest.total_prize,
				winnerCount: rest.winner_count,
			})),
		}
	} catch (error) {
		handleError(error, 'GET_AIRDROPS')

		return { data: [] } as AirdropsData
	}
}
