'use server'

import axios from 'axios'
import { compare } from 'bcryptjs'
import { isValid } from 'date-fns'
import { omit, pick } from 'lodash'
import { revalidatePath } from 'next/cache'

import { prisma } from '@/lib/prisma'
import { MarketChart, Prisma } from '@prisma/client'

import {
	AirdropsData,
	CategoriesData,
	UserCoinData,
	MarketChartData,
	TrendingData,
	CoinsListIDMapData,
	CoinsListData,
	PrismaTransactionClient,
	TrendingCoin,
	CoinData,
	Transaction,
	MarketChartDataPoint,
	Airdrop,
} from './types'
import { auth, signIn } from '@/auth'
import { makeReq } from './make-request'
import { sendEmail } from '@/lib/send-email'
import { saltAndHashPassword } from '@/lib/salt'
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
const recalculateAveragePrice = async (userId: string, coinId: string, prisma: PrismaTransactionClient) => {
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
		const user = await prisma.user.findFirst({
			where: {
				email: body.email,
			},
		})

		if (user) {
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

		await sendEmail(
			createdUser.email,
			'Crypto / 📝 Registration confirmation',
			VerificationUserTemplate({
				code,
			}),
		)
	} catch (error) {
		handleError(error, 'CREATE_USER')
	}
}

export const loginUser = async (provider: string) => {
	await signIn(provider, { redirectTo: '/' })

	revalidatePath('/')
}

export const loginUserWithCreds = async (body: Prisma.UserCreateInput) => {
	const user = await prisma.user.findUnique({
		where: { email: body.email },
		include: { accounts: true },
	})

	if (!user) throw new Error('Invalid password or email')
	if (user.accounts.length > 0)
		throw new Error('This email is linked to a social login. Please use GitHub or Google')

	const isPasswordValid = await compare(body.password as string, user.password ?? '')

	if (!isPasswordValid) throw new Error('Invalid password or email')
	if (!user.emailVerified) throw new Error('Email is not verified')

	const data = {
		email: body.email,
		password: body.password,
		redirect: false,
	}

	const result = await signIn('credentials', data)

	if (result?.error) throw new Error(result.error)

	revalidatePath('/')
}

export const updateUserInfo = async (body: Prisma.UserUpdateInput) => {
	try {
		const session = await auth()

		if (!session?.user) throw new Error('User not found')

		const existingUser = await prisma.user.findFirst({
			where: { id: session?.user.id },
			include: { accounts: true },
		})

		if (!existingUser) throw new Error('User not found')

		// Checking if the user has OAuth accounts
		const hasOAuthAccounts = existingUser.accounts.length > 0

		// If the user logged in via OAuth, prohibit changing the email and password
		if (hasOAuthAccounts) {
			if (body.email && body.email !== existingUser.email)
				throw new Error('Email cannot be changed for OAuth users')

			if (body.password) throw new Error('Password cannot be changed for OAuth users')
		}

		// Validation for email uniqueness
		if (body.email && body.email !== existingUser.email && !hasOAuthAccounts) {
			const emailExists = await prisma.user.findUnique({
				where: {
					email: body.email as string,
				},
			})

			if (emailExists) throw new Error('Email is already in use')
		}

		const updatedData: Prisma.UserUpdateInput = {
			name: body.name,
		}

		// If the user is not OAuth, allow email and password updates
		if (!hasOAuthAccounts) {
			updatedData.email = body.email ? body.email : existingUser.email
			updatedData.password = body.password
				? await saltAndHashPassword(body.password as string)
				: existingUser.password
		}

		const updatedUser = await prisma.user.update({
			where: {
				id: session?.user.id,
			},
			data: updatedData,
		})

		return updatedUser
	} catch (error) {
		handleError(error, 'UPDATE_USER')
	}
}

export const deleteUser = async (userId?: string) => {
	try {
		const session = await auth()

		// Checking if the user is authorized
		if (!session?.user) throw new Error('User not authenticated')

		// If userId is not passed, delete the current user
		const targetUserId = userId || session.user.id

		// Check that the user only deletes himself (or the administrator can delete others)
		if (session.user.role !== 'ADMIN' && targetUserId !== session.user.id) {
			throw new Error('You do not have permission to delete this user')
		}

		// Delete the user and all associated data (cascade delete)
		const deletedUser = await prisma.user.delete({
			where: {
				id: targetUserId,
			},
			include: {
				accounts: true,
				sessions: true,
				verificationCode: true,
			},
		})

		return deletedUser
	} catch (error) {
		handleError(error, 'DELETE_USER')
	}
}

export const addCoinToUser = async (coinId: string, quantity: number, price: number) => {
	try {
		const session = await auth()
		const userId = session?.user?.id

		// Validation
		if (!userId) throw new Error('User not authenticated')
		if (!coinId) throw new Error('CoinId is required')

		if (typeof quantity !== 'number' || isNaN(quantity) || quantity === 0) {
			throw new Error('Invalid quantity. Use positive for buy, negative for sell')
		}

		if (typeof price !== 'number' || isNaN(price) || price < 0) {
			throw new Error('Invalid price. Price must be greater than 0')
		}

		// Check if user exists
		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
		})

		if (!user) throw new Error('User not found')

		// Getting coin data from fetchCoinData
		const coinData = await getCoinData(coinId)

		// If coinData is empty (error getting data), throw an error
		if (!coinData) throw new Error(`Failed to fetch data for coin ${coinId}`)

		await prisma.$transaction(async (transactionPrisma) => {
			// 1. Receive or create UserCoin
			const userCoin = await prisma.userCoin.upsert({
				where: {
					userId_coinId: {
						userId: session.user.id,
						coinId,
					},
				},
				update: {},
				create: {
					id: coinId,
					user: { connect: { id: session.user.id } },
					coin: { connect: { id: coinId } },
					coinsListIDMap: { connect: { id: coinId } },
				},
				include: { transactions: true },
			})

			// 2. Checking balance for sales
			if (quantity < 0 && Math.abs(quantity) > (userCoin.total_quantity || 0)) {
				throw new Error('Not enough coins to sell')
			}

			// 3. Create a transaction record
			await prisma.userCoinTransaction.create({
				data: {
					quantity,
					price,
					date: new Date(),
					userCoinId: userCoin.id,
				},
			})

			// 4. Recalculating aggregated data
			await recalculateAveragePrice(session.user.id, coinId, transactionPrisma)
		})

		revalidatePath('/coins')
	} catch (error) {
		handleError(error, 'ADD_COIN_TO_USER')
	}
}

export const updateUserCoin = async (
	coinId: string,
	desiredSellPrice?: number,
	transactions?: { id: string; quantity: number; price: number; date: Date }[],
) => {
	try {
		const session = await auth()
		const userId = session?.user?.id

		if (!userId) throw new Error('User not authenticated')
		if (!coinId) throw new Error('Coin ID is required')

		await prisma.$transaction(async (transactionPrisma) => {
			// Validation for transactions
			if (transactions?.some((t) => t.quantity < 0)) {
				const totalOwned = transactions.filter((t) => t.quantity > 0).reduce((sum, t) => sum + t.quantity, 0)

				const totalSelling = Math.abs(
					transactions.filter((t) => t.quantity < 0).reduce((sum, t) => sum + t.quantity, 0),
				)

				if (totalSelling > totalOwned) {
					throw new Error('Not enough coins to sell')
				}
			}

			// Update transactions
			if (transactions?.length) {
				await Promise.all(
					transactions.map((t) =>
						transactionPrisma.userCoinTransaction.update({
							where: { id: t.id },
							data: { ...t },
						}),
					),
				)
			}

			// Update sale price
			if (typeof desiredSellPrice !== 'undefined') {
				await transactionPrisma.userCoin.update({
					where: { userId_coinId: { userId, coinId } },
					data: { desired_sell_price: desiredSellPrice },
				})
			}

			// Recalculation of the average price
			if (transactions?.length) {
				await recalculateAveragePrice(userId, coinId, transactionPrisma)
			}
		})

		revalidatePath('/coins')
		revalidatePath(`/coins/${coinId}`)
	} catch (error) {
		handleError(error, 'UPDATE_USER_COIN')
	}
}

export const deleteCoinFromUser = async (coinId: string) => {
	try {
		const session = await auth()

		// Checking if the user is authorized
		if (!session?.user) throw new Error('User not authenticated')

		// Checking access rights
		if (session.user.id !== session.user.id && session.user.role !== 'ADMIN') {
			throw new Error('You do not have permission to perform this action')
		}

		if (!coinId) throw new Error('CoinId is required')

		await prisma.userCoin.delete({
			where: {
				userId_coinId: { userId: session.user.id, coinId },
			},
		})

		revalidatePath('/coins')
		revalidatePath(`/coins/${coinId}`)
	} catch (error) {
		handleError(error, 'DELETE_USER_COIN')
	}
}

export const createTransactionForUser = async (
	coinId: string,
	transactionData: Omit<Transaction, 'id' | 'userCoinId'>,
) => {
	try {
		const session = await auth()
		const userId = session?.user?.id

		if (!userId) throw new Error('User not authenticated')
		if (!coinId) throw new Error('Coin ID is required')

		const result = await prisma.$transaction(async (prisma) => {
			// Creating a new transaction
			const newTransaction = await prisma.userCoinTransaction.create({
				data: {
					...transactionData,
					userCoin: {
						connect: { userId_coinId: { userId, coinId } },
					},
				},
			})

			// Recalculation of the average price
			await recalculateAveragePrice(userId, coinId, prisma)

			return newTransaction
		})

		return result
	} catch (error) {
		handleError(error, 'CREATE_TRANSACTION')
	}
}

export const deleteTransactionFromUser = async (coinTransactionId: string) => {
	try {
		const session = await auth()

		// Checking if the user is authorized
		if (!session?.user) throw new Error('User not authenticated')
		if (!coinTransactionId) throw new Error('CoinTransactionId is required')

		// 1. Get the coinId inside the transaction and return its result
		const deletedTransaction = await prisma.$transaction(async (prisma) => {
			// 1. Find and validate transaction
			const transaction = await prisma.userCoinTransaction.findUniqueOrThrow({
				where: { id: coinTransactionId },
				include: { userCoin: true },
			})

			// 2. Delete transaction
			await prisma.userCoinTransaction.delete({
				where: { id: coinTransactionId },
			})

			// 3. Atomic update of UserCoin
			const updatedUserCoin = await prisma.userCoin.update({
				where: { id: transaction.userCoinId },
				data: {
					total_quantity: { decrement: transaction.quantity },
					total_cost: { decrement: transaction.quantity * transaction.price },
				},
			})

			// 4. Calculate new average price
			const newAveragePrice =
				updatedUserCoin.total_quantity > 0 ? updatedUserCoin.total_cost / updatedUserCoin.total_quantity : 0

			// 5. Update average price
			return await prisma.userCoin.update({
				where: { id: transaction.userCoinId },
				data: { average_price: newAveragePrice },
				include: { transactions: true },
			})
		})

		revalidatePath('/coins')
		revalidatePath(`/coins/${deletedTransaction.coinId}`)

		return deletedTransaction
	} catch (error) {
		handleError(error, 'DELETE_USER_PURCHASE')
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

	// Sending emails to users
	for (const userId in userMap) {
		const { email, coins } = userMap[userId]

		try {
			await sendEmail(
				email,
				`🚀 ${coins.length > 1 ? 'A few coins' : coins[0].name} reached your target`,
				NotificationTemplate({ coins }),
			)
		} catch (error) {
			handleError(error, 'NOTIFY_USER_ON_PRICE_TARGET')
		}
	}
}

export const getTrendingData = async (): Promise<TrendingData> => {
	try {
		const data = await prisma.trendingCoin.findMany({
			select: {
				id: true,
				name: true,
				symbol: true,
				market_cap_rank: true,
				thumb: true,
				slug: true,
				price_btc: true,
				data: true,
			},
		})

		console.log(data.length ? '✅ Using cached TrendingData from DB' : '⚠️ No TrendingData in DB')

		if (data.length === 0) {
			await updateTrendingData()
		}

		return {
			coins: data.map((coin) => ({
				item: {
					...coin,
					market_cap_rank: coin.market_cap_rank ?? 0,
					data: typeof coin.data === 'string' ? JSON.parse(coin.data) : coin.data,
				},
			})),
		}
	} catch (error) {
		handleError(error, 'GET_TRENDING_DATA')

		return { coins: [] }
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

		// Transform the data into the required format
		const trendingCoins = response.coins.map((coin: TrendingCoin) => ({
			item: {
				id: coin.item.id,
				name: coin.item.name,
				symbol: coin.item.symbol,
				market_cap_rank: coin.item.market_cap_rank,
				thumb: coin.item.thumb,
				slug: coin.item.slug,
				price_btc: coin.item.price_btc,
				data: coin.item.data,
			},
		}))

		// Batch update
		const transaction = await prisma.$transaction(
			trendingCoins.map((coin: TrendingCoin) =>
				prisma.trendingCoin.create({
					data: coin.item,
				}),
			),
		)

		console.log(`✅ Updated ${transaction.length} trendingCoins`)
		return { coins: trendingCoins }
	} catch (error) {
		handleError(error, 'UPDATE_TRENDING_DATA')
		return { coins: [] }
	}
}

export const getCategories = async (): Promise<CategoriesData> => {
	try {
		const data = await prisma.category.findMany({
			select: {
				category_id: true,
				name: true,
			},
		})

		console.log(data.length ? '✅ Using cached Categories from DB' : '⚠️ No Categories in DB')

		return data
	} catch (error) {
		handleError(error, 'GET_CATEGORIES')

		return []
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

export const getCoinsList = async (): Promise<CoinsListData> => {
	// Return old data immediately
	const cachedCoins = await prisma.coin.findMany({
		include: {
			coinsListIDMap: true,
		},
	})

	const transformCoinData = (coins: any[]): CoinsListData => {
		return coins.map((coin) => ({
			...coin,
			symbol: coin.coinsListIDMap.symbol,
			name: coin.coinsListIDMap.name,
		}))
	}

	return transformCoinData(cachedCoins)
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

export const getUserCoinsListMarketChart = async (days: ValidDays): Promise<MarketChartDataPoint[]> => {
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

		return {} as MarketChartDataPoint[]
	}
}

export const getCoinsListIDMap = async (): Promise<CoinsListIDMapData> => {
	try {
		// Getting data from the DB
		const coins = await prisma.coinsListIDMap.findMany({
			include: { coin: true },
		})

		console.log('✅ Using cached CoinsListIDMap from DB')

		// Returning the list
		return coins.map((list) => ({
			id: list.id,
			symbol: list.symbol,
			name: list.name,
			image: list.coin?.image,
		})) as CoinsListIDMapData
	} catch (error) {
		handleError(error, 'GET_COINS_ID_LIST')

		return []
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

export const getUserCoinData = async (coinId: string): Promise<UserCoinData> => {
	try {
		const session = await auth()

		// Checking if the user is authorized
		if (!session?.user) throw new Error('User not authenticated')

		// Return old data immediately
		const userCoin = await prisma.userCoin.findUnique({
			where: { userId_coinId: { userId: session.user.id, coinId } },
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

		if (userCoin === null) {
			throw new Error('User coin data not found')
		}

		// Transform the userCoin object to match the UserCoinData type
		const transformedUserCoin: UserCoinData = {
			coinId: userCoin.coin.id,
			name: userCoin.coinsListIDMap.name,
			symbol: userCoin.coinsListIDMap.symbol,
			current_price: userCoin.coin.current_price ?? 0,
			total_quantity: userCoin.total_quantity,
			total_cost: userCoin.total_cost,
			average_price: userCoin.average_price,
			desired_sell_price: userCoin.desired_sell_price ?? 0,
			image: userCoin.coin.image ?? '/svg/coin-not-found.svg',
			sparkline_in_7d: {
				price:
					typeof userCoin.coin.sparkline_in_7d === 'string'
						? (JSON.parse(userCoin.coin.sparkline_in_7d)?.price ?? [])
						: typeof userCoin.coin.sparkline_in_7d === 'object' &&
							  userCoin.coin.sparkline_in_7d !== null &&
							  'price' in userCoin.coin.sparkline_in_7d &&
							  Array.isArray(userCoin.coin.sparkline_in_7d.price)
							? userCoin.coin.sparkline_in_7d.price
							: [],
			},
			price_change_percentage_7d_in_currency: userCoin.coin.price_change_percentage_7d_in_currency as number,
			transactions: userCoin.transactions.map((transaction) => ({
				id: transaction.id,
				quantity: transaction.quantity,
				price: transaction.price,
				date: transaction.date,
				userCoinId: transaction.userCoinId,
			})),
		}

		// Launch an update in the background via API
		const response = await makeReq('GET', `/update/user-coin/${coinId}`)

		if (!response || !Array.isArray(response) || response.length === 0) {
			console.log('✅ GET_USER_COINS: Using cached UserCoins from DB')

			return transformedUserCoin
		}

		return transformedUserCoin
	} catch (error) {
		handleError(error, 'GET_USER_COIN_DATA')

		return {} as UserCoinData
	}
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const updateUserCoinData = async (coinId: string) => {}

export const getCoinsListByCate = async (cate: string): Promise<CoinsListData> => {
	try {
		// Checking the availability of data in the DB
		const cachedData = await prisma.coin.findMany({
			where: { categoryId: cate },
			include: {
				coinsListIDMap: {
					select: { symbol: true, name: true },
				},
			},
		})

		// If there is data, return it
		if (cachedData.length > 0) {
			console.log('✅ Using cached CoinsListByCate from DB')

			return cachedData.map(({ coinsListIDMap, ...coin }) => ({
				...coin,
				...coinsListIDMap,
				sparkline_in_7d: { price: coin.sparkline_in_7d },
			})) as CoinsListData
		}

		// If there is no data, make a request to the API
		console.log('🔄 Outdated records, request CoinsListByCate via API...')
		const response = await makeReq('GET', `/gecko/${cate}/coins`)

		if (!Array.isArray(response) || !response.length) {
			console.warn('⚠️ Empty response from API, using old CoinsListByCate')

			return []
		}

		const transformCoinData = (data: any, category: string) => ({
			...pick(data, [
				'description',
				'image',
				'current_price',
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
			categoryId: category,
		})

		// Batch processing via transaction
		const upsertOperations = response.flatMap((coinData) => [
			prisma.coinsListIDMap.upsert({
				where: { id: coinData.id },
				update: { symbol: coinData.symbol, name: coinData.name },
				create: { id: coinData.id, ...pick(coinData, ['symbol', 'name']) },
			}),
			prisma.coin.upsert({
				where: { id: coinData.id },
				update: { ...transformCoinData(coinData, cate) },
				create: {
					id: coinData.id,
					coinsListIDMapId: coinData.id,
					...transformCoinData(coinData, cate),
				},
			}),
		])

		await prisma.$transaction(upsertOperations)

		console.log('✅ Records CoinsListByCate updated!')

		// Return data in CoinsListData format
		return response.map((coin) => ({
			...pick(coin, ['id', 'symbol', 'name', 'description', 'image']),
			...omit(coin, ['id', 'symbol', 'name', 'description', 'image']),
		})) as CoinsListData
	} catch (error) {
		handleError(error, 'GET_COINS_LIST_BY_CATE')

		return [] as CoinsListData
	}
}

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

		// Update or create a record in the DB
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
