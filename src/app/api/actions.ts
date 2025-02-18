'use server'

import { compare } from 'bcryptjs'
import { revalidatePath } from 'next/cache'

import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

import {
	AidropsData,
	CategoriesData,
	CoinData,
	MarketChartData,
	TrendingData,
	CoinsListIDMapData,
	CoinsListData,
	PrismaTransactionClient,
} from './types'
import { auth, signIn } from '@/auth'
import { makeReq } from './make-request'
import { sendEmail } from '@/lib/send-email'
import { saltAndHashPassword } from '@/lib/salt'
import { VerificationUserTemplate } from '@/components/shared/email-temapltes'

const COINS_UPDATE_INTERVAL = 10 // minutes

const handleError = (error: unknown, context: string) => {
	if (error instanceof Prisma.PrismaClientKnownRequestError) {
		console.error(`💾 Prisma error [${context}]:`, error.code, error.message)
	} else if (error instanceof Error) {
		console.error(`🚨 Unexpected error [${context}]:`, error.message)
	} else {
		console.error(`❌ Error [${context}]`, error)
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

export const addCryptoToUser = async (coinId: string, quantity: number, price: number) => {
	try {
		const session = await auth()
		const userId = session?.user?.id

		// Валидация
		if (!userId) throw new Error('User not authenticated')
		if (!coinId) throw new Error('CoinId is required')

		if (typeof quantity !== 'number' || isNaN(quantity) || quantity === 0) {
			throw new Error('Invalid quantity. Use positive for buy, negative for sell')
		}

		if (typeof price !== 'number' || isNaN(price) || price < 0) {
			throw new Error('Invalid price. Price must be greater than 0')
		}

		// Проверяем, существует ли пользователь
		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
		})

		if (!user) throw new Error('User not found')

		// Получаем данные о монете из fetchCoinData
		const coinData = await getCoinData(coinId)

		// Если coinData пустое (ошибка получения данных), выбрасываем ошибку
		if (!coinData) throw new Error(`Failed to fetch data for coin ${coinId}`)

		await prisma.$transaction(async (transactionPrisma) => {
			// 1. Получаем или создаем UserCoin
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

			// 2. Проверка баланса для продаж
			if (quantity < 0 && Math.abs(quantity) > (userCoin.total_quantity || 0)) {
				throw new Error(`Not enough coins to sell. Available: ${userCoin.total_quantity}`)
			}

			// 3. Создаем запись о транзакции
			await prisma.userCoinTransaction.create({
				data: {
					quantity,
					price,
					date: new Date(),
					userCoinId: userCoin.id,
				},
			})

			// 4. Пересчитываем агрегированные данные
			await recalculateAveragePrice(session.user.id, coinId, transactionPrisma)
		})

		revalidatePath('/')
	} catch (error) {
		handleError(error, 'ADD_CRYPTO_TO_USER')
	}
}

export const updateUserCrypto = async (
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
			const userCoin = await prisma.userCoin.findUnique({
				where: { userId_coinId: { userId, coinId } },
				include: { transactions: true },
			})

			if (!userCoin) throw new Error('Coin not found in portfolio')

			// Check: Is the user trying to sell more than he has?
			const totalOwned = userCoin.transactions.reduce((sum, t) => sum + t.quantity, 0)
			const totalSelling =
				transactions?.filter((t) => t.quantity < 0).reduce((sum, t) => sum + t.quantity, 0) || 0

			if (totalOwned + totalSelling < 0) throw new Error('Not enough coins to sell')

			// Updating transactions
			if (transactions?.length) {
				const existingTransactions = userCoin.transactions
				const newTransactions = []
				const updatedTransactions = []

				// Separating new and existing transactions
				for (const t of transactions) {
					if (t.id.startsWith('temp-')) {
						newTransactions.push({
							quantity: t.quantity,
							price: t.price,
							date: t.date,
							userCoinId: userCoin.id,
						})
					} else {
						if (!existingTransactions.some((et) => et.id === t.id)) {
							throw new Error(`Invalid transaction ID: ${t.id}`)
						}
						updatedTransactions.push(t)
					}
				}

				// Creating new transactions
				if (newTransactions.length > 0) {
					await transactionPrisma.userCoinTransaction.createMany({
						data: newTransactions,
					})
				}

				// Updating existing transactions
				await Promise.all(
					updatedTransactions.map((t) =>
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

		revalidatePath('/')
	} catch (error) {
		handleError(error, 'UPDATE_USER_CRYPTO')
	}
}

export const deleteCryptoFromUser = async (coinId: string) => {
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

		revalidatePath('/')
	} catch (error) {
		handleError(error, 'DELETE_USER_CRYPTO')
	}
}

export const deleteTransactionFromUser = async (coinTransactionId: string) => {
	try {
		const session = await auth()

		// Checking if the user is authorized
		if (!session?.user) throw new Error('User not authenticated')

		// Checking access rights
		if (session.user.id !== session.user.id && session.user.role !== 'ADMIN') {
			throw new Error('You do not have permission to perform this action')
		}

		if (!coinTransactionId) throw new Error('CoinTransactionId is required')

		// Starting a transaction
		await prisma.$transaction(async (prisma) => {
			// 1. Getting the transaction to be deleted
			const transaction = await prisma.userCoinTransaction.findUnique({
				where: { id: coinTransactionId },
				select: { quantity: true, price: true, userCoinId: true },
			})

			if (!transaction) throw new Error('Transaction not found')

			// 2. Delete transaction
			await prisma.userCoinTransaction.delete({
				where: { id: coinTransactionId },
			})

			// 3. Get current UserCoin values
			const userCoin = await prisma.userCoin.findUnique({
				where: { id: transaction.userCoinId },
				select: { total_quantity: true, total_cost: true },
			})

			if (!userCoin) throw new Error('UserCoin not found')

			// 4. Recalculate the values
			const newQuantity = userCoin.total_quantity - transaction.quantity
			const newCost = userCoin.total_cost - transaction.quantity * transaction.price
			const newAveragePrice = newQuantity > 0 ? newCost / newQuantity : 0

			// 5. Updating UserCoin
			await prisma.userCoin.update({
				where: { id: transaction.userCoinId },
				data: {
					total_quantity: newQuantity,
					total_cost: newCost,
					average_price: newAveragePrice,
				},
			})
		})

		revalidatePath('/')
	} catch (error) {
		handleError(error, 'DELETE_USER_PURCHASE')
	}
}

export const getTrendingData = async (): Promise<TrendingData> => {
	try {
		const data = await prisma.trendingCoin.findMany({
			select: {
				id: true,
				coin_id: true,
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

		return {
			coins: data.map((coin) => ({
				item: {
					id: coin.id,
					coin_id: coin.coin_id,
					name: coin.name,
					symbol: coin.symbol,
					market_cap_rank: coin.market_cap_rank ?? 0,
					thumb: coin.thumb,
					slug: coin.slug,
					price_btc: coin.price_btc,
					data: coin.data as any,
				},
			})),
		}
	} catch (error) {
		handleError(error, 'GET_TRENDING_DATA')

		return { coins: [] }
	}
}

// cron
export const updateTrendingData = async (): Promise<TrendingData> => {
	try {
		console.log('🔄 Starting TrendingData update via API...')
		const data = await makeReq('GET', '/gecko/trending')

		if (!data?.length) {
			console.warn('⚠️ Empty response from API, aborting update')
			return { coins: [] } as TrendingData
		}

		// Transform the data into the required format
		const trendingCoins = data.coins.map((coin: any) => ({
			coin_id: coin.item.coin_id,
			name: coin.item.name,
			symbol: coin.item.symbol,
			market_cap_rank: coin.item.market_cap_rank ?? 0,
			thumb: coin.item.thumb,
			slug: coin.item.slug,
			price_btc: parseFloat(coin.item.price_btc),
			data: coin.item.data,
		}))

		// Пакетное обновление
		const transaction = await prisma.$transaction(
			trendingCoins.map((coin: any) =>
				prisma.trendingCoin.upsert({
					where: { coin_id_slug: { coin_id: coin.coin_id, slug: coin.slug } },
					update: coin,
					create: coin,
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

// cron
export const updateCategories = async (): Promise<CategoriesData> => {
	try {
		console.log('🔄 Starting categories update via API...')
		const data = await makeReq('GET', '/gecko/categories')

		if (!data?.length) {
			console.warn('⚠️ Empty response from API, aborting update')
			return []
		}

		// Преобразование данных
		const categoriesData: CategoriesData = data.map((category: any) => ({
			category_id: category.category_id,
			name: category.name,
		}))

		// Пакетное обновление
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

// cron
export const updateCoinsList = async (): Promise<any> => {
	try {
		// Get a list of coins
		const cachedCoins = await prisma.coin.findMany({
			include: {
				coinsListIDMap: true,
			},
		})

		if (!cachedCoins.length) {
			return []
		}

		// Forming a string for an API request
		const coinList = cachedCoins
			.sort(() => Math.random() - 0.5) // Shuffle the array randomly
			.slice(0, 10) // Take the first 10 elements
			.map((coin) => encodeURIComponent(coin.id))
			.join('%2C')

		// Requesting fresh data from the API
		console.log('🔄 Outdated records, request CoinsList via API...')
		const response = await makeReq('GET', `/gecko/coins-upd/${coinList}`)

		if (!response || !Array.isArray(response) || response.length === 0) {
			console.warn('⚠️ UPDATE_COINS: Empty response from API, using old CoinsList')
			return cachedCoins
		}

		await prisma.$transaction([
			// Updating coinsListIDMap
			...response.map((coin) =>
				prisma.coinsListIDMap.upsert({
					where: { id: coin.id },
					update: {
						symbol: coin.symbol,
						name: coin.name,
					},
					create: {
						id: coin.id,
						symbol: coin.symbol,
						name: coin.name,
					},
				}),
			),

			// Updating Coin
			...response.map((coin) =>
				prisma.coin.updateMany({
					where: { id: coin.id },
					data: {
						description: coin.description,
						image: coin.image,
						current_price: coin.current_price,
						market_cap: coin.market_cap,
						market_cap_rank: coin.market_cap_rank,
						total_volume: coin.total_volume,
						high_24h: coin.high_24h,
						low_24h: coin.low_24h,
						price_change_percentage_24h: coin.price_change_percentage_24h,
						circulating_supply: coin.circulating_supply,
						sparkline_in_7d: coin.sparkline_in_7d,
						price_change_percentage_7d_in_currency: coin.price_change_percentage_7d_in_currency,
						updatedAt: new Date(),
					},
				}),
			),
		])

		console.log('✅ Records CoinsList updated!')

		// Returning an updated list of coins
		return await prisma.coin.findMany({
			include: { coinsListIDMap: true },
		})
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
		// Get a list of user coins
		const userCoins = await prisma.userCoin.findMany({
			where: { userId },
			include: { coin: true },
		})

		if (!userCoins.length) return { status: 'success', message: 'No coins found' }

		const currentTime = new Date()
		const updateTime = new Date(currentTime.getTime() - COINS_UPDATE_INTERVAL * 60 * 1000)

		// Filtering outdated coins
		const coinsToUpdate = userCoins.filter((uc) => uc.updatedAt < updateTime)

		if (!coinsToUpdate.length) {
			console.log('✅ Using cached UserCoins from DB')
			return userCoins
		}

		// Forming a string for an API request
		const coinList = coinsToUpdate
			.sort(() => Math.random() - 0.5) // Shuffle the array randomly
			.slice(0, 15) // Take the first 15 elements
			.map((uc) => uc.coinId)
			.join('%2C')

		// Requesting fresh data from the API
		console.log('🔄 Outdated records, request UserCoins via API...')
		const response = await makeReq('GET', `/gecko/user/${encodeURIComponent(coinList)}`)

		if (!response || !Array.isArray(response) || response.length === 0) {
			console.warn('⚠️ UPDATE_USER_COINS: Empty response from API, using old UserCoinsList')
			return userCoins
		}

		await prisma.$transaction([
			// Updating coin
			...response.map((coin) =>
				prisma.coin.upsert({
					where: { id: coin.id },
					update: {
						current_price: coin.current_price,
						image: coin.image,
						updatedAt: currentTime,
					},
					create: {
						id: coin.id,
						coinsListIDMapId: coin.id,
						current_price: coin.current_price,
						image: coin.image,
						updatedAt: currentTime,
					},
				}),
			),

			// Updating userCoin
			...response.map((coin) =>
				prisma.userCoin.updateMany({
					where: { userId, coinId: coin.id },
					data: { updatedAt: currentTime },
				}),
			),
		])

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
		const session = await auth()

		if (!session?.user) throw new Error('User not found')

		const existingUser = await prisma.user.findFirst({
			where: { id: session?.user.id },
			include: { accounts: true },
		})

		if (!existingUser) throw new Error('User not found')

		// Checking the availability of data in the DB
		const cachedData = await prisma.userCoin.findUnique({
			where: {
				userId_coinId: { userId: existingUser.id, coinId },
			},
			include: {
				coinsListIDMap: true,
				coin: true,
			},
		})

		if (cachedData) {
			console.log('✅ Using cached CoinData from DB')
			return {
				id: cachedData.coinId,
				symbol: cachedData.coinsListIDMap.symbol,
				name: cachedData.coinsListIDMap.name,
				description: { en: cachedData.coin.description || '' },
				image: { thumb: cachedData.coin.image || '' },
				market_cap_rank: cachedData.coin.market_cap_rank || 0,
				market_data: {
					current_price: {
						usd: cachedData.coin.current_price || 0,
					},
					market_cap: {
						usd: cachedData.coin.market_cap || 0,
					},
					high_24h: {
						usd: cachedData.coin.high_24h || 0,
					},
					low_24h: {
						usd: cachedData.coin.low_24h || 0,
					},
					circulating_supply: cachedData.coin.circulating_supply || 0,
				},
				last_updated: cachedData.updatedAt.toISOString(),
			} as CoinData
		}

		// If there is no data, make a request to the API
		console.log('🔄 Outdated records, request CoinData via API...')
		const data = await makeReq('GET', `/gecko/coins-get/${coinId}`)

		// Validate the API response
		if (!data || typeof data !== 'object' || Array.isArray(data)) {
			console.warn('⚠️ Empty response from API, using old CoinData')
			return {} as CoinData
		}

		const { id, symbol, name, image, description, market_cap_rank, market_data } = data

		// Ensure CoinsListIDMap exists
		await prisma.coinsListIDMap.upsert({
			where: { id },
			update: { symbol, name },
			create: { id, symbol, name },
		})

		// Update or create the Coin record
		await prisma.coin.upsert({
			where: { id },
			update: {
				current_price: market_data?.current_price?.usd || 0,
				description: description?.en || '',
				image: image?.thumb || '',
				market_cap: market_data?.market_cap?.usd || 0,
				market_cap_rank: market_cap_rank || 0,
				total_volume: market_data?.total_volume?.usd || 0,
				high_24h: market_data?.high_24h?.usd || 0,
				low_24h: market_data?.low_24h?.usd || 0,
				price_change_percentage_24h: market_data?.price_change_percentage_24h || 0,
				circulating_supply: market_data?.circulating_supply || 0,
				price_change_percentage_7d_in_currency: market_data?.price_change_percentage_7d_in_currency?.usd || 0,
			},
			create: {
				id,
				current_price: market_data?.current_price?.usd || 0,
				description: description?.en || '',
				image: image?.thumb || '',
				market_cap: market_data?.market_cap?.usd || 0,
				market_cap_rank: market_cap_rank || 0,
				total_volume: market_data?.total_volume?.usd || 0,
				high_24h: market_data?.high_24h?.usd || 0,
				low_24h: market_data?.low_24h?.usd || 0,
				price_change_percentage_24h: market_data?.price_change_percentage_24h || 0,
				circulating_supply: market_data?.circulating_supply || 0,
				price_change_percentage_7d_in_currency: market_data?.price_change_percentage_7d_in_currency?.usd || 0,
				coinsListIDMapId: id,
			},
		})
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

export const getCoinsListByCate = async (cate: string): Promise<CoinsListData> => {
	try {
		// Checking the availability of data in the DB
		const cachedData = await prisma.coin.findMany({
			where: {
				categoryId: cate,
			},
			include: {
				coinsListIDMap: true,
			},
		})

		// If there is data, return it
		if (cachedData.length > 0) {
			console.log('✅ Using cached CoinsListByCate from DB')
			return cachedData.map((coin) => ({
				id: coin.id,
				symbol: coin.coinsListIDMap.symbol,
				name: coin.coinsListIDMap.name,
				description: coin.description,
				image: coin.image,
				current_price: coin.current_price,
				market_cap: coin.market_cap,
				market_cap_rank: coin.market_cap_rank,
				total_volume: coin.total_volume,
				high_24h: coin.high_24h,
				low_24h: coin.low_24h,
				price_change_percentage_24h: coin.price_change_percentage_24h,
				circulating_supply: coin.circulating_supply,
				sparkline_in_7d: coin.sparkline_in_7d,
				price_change_percentage_7d_in_currency: coin.price_change_percentage_7d_in_currency,
			})) as CoinsListData
		}
		// If there is no data, make a request to the API
		console.log('🔄 Outdated records, request CoinsListByCate via API...')
		const data = await makeReq('GET', `/gecko/${cate}/coins`)

		// If the data is received and it is not empty
		if (Array.isArray(data)) {
			// Process each coin from the API
			for (const coinData of data) {
				// Make sure that the entry in CoinsListIDMap exists
				await prisma.coinsListIDMap.upsert({
					where: { id: coinData.id },
					update: { symbol: coinData.symbol, name: coinData.name },
					create: { id: coinData.id, symbol: coinData.symbol, name: coinData.name },
				})

				// Update or create an entry in Coin
				await prisma.coin.upsert({
					where: { id: coinData.id },
					update: {
						description: coinData.description,
						image: coinData.image,
						current_price: coinData.current_price,
						market_cap: coinData.market_cap,
						market_cap_rank: coinData.market_cap_rank,
						total_volume: coinData.total_volume,
						high_24h: coinData.high_24h,
						low_24h: coinData.low_24h,
						price_change_percentage_24h: coinData.price_change_percentage_24h,
						circulating_supply: coinData.circulating_supply,
						sparkline_in_7d: coinData.sparkline_in_7d,
						price_change_percentage_7d_in_currency: coinData.price_change_percentage_7d_in_currency,
						categoryId: cate,
					},
					create: {
						id: coinData.id,
						description: coinData.description,
						image: coinData.image,
						current_price: coinData.current_price,
						market_cap: coinData.market_cap,
						market_cap_rank: coinData.market_cap_rank,
						total_volume: coinData.total_volume,
						high_24h: coinData.high_24h,
						low_24h: coinData.low_24h,
						price_change_percentage_24h: coinData.price_change_percentage_24h,
						circulating_supply: coinData.circulating_supply,
						sparkline_in_7d: coinData.sparkline_in_7d,
						price_change_percentage_7d_in_currency: coinData.price_change_percentage_7d_in_currency,
						coinsListIDMapId: coinData.id,
						categoryId: cate,
					},
				})
			}

			console.log('✅ Records CoinsListByCate updated!')

			// Return data in CoinsListData format
			return data
		} else {
			console.warn('⚠️ Empty response from API, using old CoinsListByCate')
			return [] as CoinsListData
		}
	} catch (error) {
		handleError(error, 'GET_COINS_LIST_BY_CATE')

		return [] as CoinsListData
	}
}

export const getCoinsMarketChart = async (coinId: string): Promise<MarketChartData> => {
	try {
		// Get all the data about the charts from the DB
		let cachedData = await prisma.marketChart.findUnique({
			where: { id: coinId },
			include: {
				coin: {
					include: {
						coinsListIDMap: true,
					},
				},
			},
		})

		// Request data from the API
		console.log('🔄 Fetching CoinsMarketChart from API...')
		const data = await makeReq('GET', `/gecko/chart/${coinId}`)

		// If there is no data or it is empty, display a warning
		if (!data || !data.prices || data.prices.length === 0) {
			console.warn('⚠️ Empty response from API, using old CoinsMarketChart')
			return { prices: cachedData?.prices ?? [] } as MarketChartData
		}

		// Update or create a record in the DB
		cachedData = await prisma.marketChart.upsert({
			where: { id: coinId },
			update: { prices: data.prices },
			create: {
				id: coinId,
				prices: data.prices,
				coin: {
					connect: { id: coinId },
				},
			},
			include: {
				coin: {
					include: {
						coinsListIDMap: true,
					},
				},
			},
		})

		console.log('✅ Records CoinsMarketChart updated!')

		return {
			prices: data.prices,
			coin: cachedData.coin,
		} as MarketChartData
	} catch (error) {
		handleError(error, 'GET_COINS_MARKET_CHART')

		return {} as MarketChartData
	}
}

export const getAidrops = async (): Promise<AidropsData> => {
	try {
		// Getting airdrop data from the DB
		const cachedData = await prisma.airdrop.findMany({
			include: {
				coin: true,
				coinsListIDMap: true,
			},
		})

		// If the airdrops data already exists in the DB, return it
		if (cachedData.length > 0) {
			console.log('✅ Using cached Aidrops from DB')

			return {
				data: cachedData.map((airdrop) => ({
					id: airdrop.id,
					project_name: airdrop.project_name,
					description: airdrop.description,
					status: airdrop.status,
					coin: {
						id: airdrop.coin.id,
						name: airdrop.coinsListIDMap.name,
						symbol: airdrop.coinsListIDMap.symbol,
					},
					start_date: airdrop.start_date.toISOString(),
					end_date: airdrop.end_date.toISOString(),
					total_prize: airdrop.total_prize,
					winner_count: airdrop.winner_count,
					link: airdrop.link,
				})),
			}
		}

		// If there is no data or it is outdated, request it via API
		console.log('🔄 Outdated records, request Aidrops via API...')
		const data = await makeReq('GET', '/cmc/aidrops')

		if (!data || !Array.isArray(data.data) || data.data.length === 0) {
			console.warn('⚠️ Empty response from API, using old Aidrops')

			return { data: [] } as AidropsData
		}

		// Transform the data into the required format
		const aidropsData: AidropsData = {
			data: data.data.map((aidrop: any) => ({
				id: aidrop.id,
				project_name: aidrop.project_name,
				description: aidrop.description,
				status: aidrop.status,
				coin: {
					id: aidrop.coin.id,
					name: aidrop.coin.name,
					symbol: aidrop.coin.symbol,
				},
				start_date: aidrop.start_date,
				end_date: aidrop.end_date,
				total_prize: aidrop.total_prize,
				winner_count: aidrop.winner_count,
				link: aidrop.link,
			})),
		}

		// Update or create records in the DB
		for (const aidrop of aidropsData.data) {
			await prisma.airdrop.upsert({
				where: { id: aidrop.id },
				update: {
					project_name: aidrop.project_name,
					description: aidrop.description,
					status: aidrop.status,
					coinId: aidrop.coin.id,
					coinsListIDMapId: aidrop.coin.id,
					start_date: new Date(aidrop.start_date),
					end_date: new Date(aidrop.end_date),
					total_prize: aidrop.total_prize,
					winner_count: aidrop.winner_count,
					link: aidrop.link,
				},
				create: {
					id: aidrop.id,
					project_name: aidrop.project_name,
					description: aidrop.description,
					status: aidrop.status,
					coinId: aidrop.coin.id,
					coinsListIDMapId: aidrop.coin.id,
					start_date: new Date(aidrop.start_date),
					end_date: new Date(aidrop.end_date),
					total_prize: aidrop.total_prize,
					winner_count: aidrop.winner_count,
					link: aidrop.link,
				},
			})
		}

		console.log('✅ Records Aidrops updated!')

		return aidropsData
	} catch (error) {
		handleError(error, 'GET_AIDROPS')

		return { data: [] } as AidropsData
	}
}
