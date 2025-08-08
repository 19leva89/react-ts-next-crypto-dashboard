'use server'

import { pick } from 'lodash'
import { revalidatePath } from 'next/cache'
import { MarketChart, Prisma } from '@prisma/client'

import { signIn } from '@/auth'
import { formatPrice } from '@/lib'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/send-email'
import { getUserByEmail } from '@/data/user'
import { makeReq } from '@/app/api/make-request'
import { handleError } from '@/lib/handle-error'
import { saltAndHashPassword } from '@/lib/salt'
import { getFieldForDays } from '@/data/field-for-days'
import { MarketChartData } from '@/modules/coins/schema'
import { generateVerificationToken } from '@/lib/tokens'
import { PrismaTransactionClient } from '@/app/api/types'
import { trendingDataSchema } from '@/modules/dashboard/schema'
import { COINS_UPDATE_INTERVAL, ValidDays } from '@/app/api/constants'
import { CategoriesData, TrendingData } from '@/modules/dashboard/schema'
import { NotificationTemplate, VerificationUserTemplate } from '@/components/shared/email-templates'

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

export const registerUser = async (body: Prisma.UserCreateInput) => {
	try {
		const user = await getUserByEmail(body.email)

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

		const verificationToken = await generateVerificationToken(createdUser.email)

		await sendEmail({
			to: createdUser.email,
			subject: '📝 Registration confirmation',
			html: VerificationUserTemplate({ token: verificationToken.token }),
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
			coins: {
				id: string
				name: string
				image: string
				currentPrice: number
				desiredPrice: number
			}[]
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
			id: coin.id,
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
						message: `${coin.name} reached your target $${formatPrice(coin.currentPrice)}`,
						coinId: coin.id,
					},
				})
			}

			// Sending emails
			await sendEmail({
				to: email,
				subject: `🚀 ${coins.length > 1 ? 'A few coins' : coins[0].name} reached your target`,
				html: NotificationTemplate({ coins }),
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const updateUserCoinData = async (coinId: string) => {}

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
