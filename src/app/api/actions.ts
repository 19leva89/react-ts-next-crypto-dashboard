'use server'

import { compare } from 'bcryptjs'
import { revalidatePath } from 'next/cache'

import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

import { auth, signIn } from '@/auth'
import { makeReq } from './make-request'
import { sendEmail } from '@/lib/send-email'
import { saltAndHashPassword } from '@/lib/salt'
import { VerificationUserTemplate } from '@/components/shared/email-temapltes'
import {
	AidropsData,
	CategoriesData,
	CoinData,
	MarketChartData,
	TrendingData,
	CoinsListIDMapData,
	CoinsListData,
} from './types'

const USER_COINS_UPDATE_INTERVAL = 5 // minutes
const COINS_UPDATE_INTERVAL = 60 // minutes

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

export const registerUser = async (body: Prisma.UserCreateInput) => {
	try {
		const user = await prisma.user.findFirst({
			where: {
				email: body.email,
			},
		})

		if (user) {
			if (!user.emailVerified) {
				throw new Error('Email not confirmed')
			}

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

	if (!user) {
		throw new Error('Invalid password or email')
	}

	if (user.accounts.length > 0) {
		throw new Error('This email is linked to a social login. Please use GitHub or Google')
	}

	const isPasswordValid = await compare(body.password as string, user.password ?? '')

	if (!isPasswordValid) {
		throw new Error('Invalid password or email')
	}

	if (!user.emailVerified) {
		throw new Error('Email is not verified')
	}

	const data = {
		email: body.email,
		password: body.password,
		redirect: false,
	}

	const result = await signIn('credentials', data)

	if (result?.error) {
		throw new Error(result.error)
	}

	revalidatePath('/')
}

export const updateUserInfo = async (body: Prisma.UserUpdateInput) => {
	try {
		const session = await auth()

		if (!session?.user) {
			throw new Error('User not found')
		}

		const existingUser = await prisma.user.findFirst({
			where: { id: session?.user.id },
			include: { accounts: true },
		})

		if (!existingUser) {
			throw new Error('User not found')
		}

		// Проверяем, есть ли у пользователя OAuth-аккаунты
		const hasOAuthAccounts = existingUser.accounts.length > 0

		// Если пользователь вошел через OAuth, запрещаем изменение email и пароля
		if (hasOAuthAccounts) {
			if (body.email && body.email !== existingUser.email) {
				throw new Error('Email cannot be changed for OAuth users')
			}

			if (body.password) {
				throw new Error('Password cannot be changed for OAuth users')
			}
		}

		// Validation for email uniqueness
		if (body.email && body.email !== existingUser.email && !hasOAuthAccounts) {
			const emailExists = await prisma.user.findUnique({
				where: {
					email: body.email as string,
				},
			})
			if (emailExists) {
				throw new Error('Email is already in use')
			}
		}

		const updatedData: Prisma.UserUpdateInput = {
			name: body.name,
		}

		// Если пользователь не OAuth, разрешаем обновление email и пароля
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

		// Проверяем, авторизован ли пользователь
		if (!session?.user) {
			throw new Error('User not authenticated')
		}

		// Если userId не передан, удаляем текущего пользователя
		const targetUserId = userId || session.user.id

		// Проверяем, что пользователь удаляет только себя (или администратор может удалять других)
		if (session.user.role !== 'ADMIN' && targetUserId !== session.user.id) {
			throw new Error('You do not have permission to delete this user')
		}

		// Удаляем пользователя и все связанные данные (каскадное удаление)
		const deletedUser = await prisma.user.delete({
			where: {
				id: targetUserId,
			},
			include: {
				accounts: true, // Удаляем связанные аккаунты
				sessions: true, // Удаляем связанные сессии
				verificationCode: true, // Удаляем код подтверждения
			},
		})

		return deletedUser
	} catch (error) {
		handleError(error, 'DELETE_USER')
	}
}

export const addCryptoToUser = async (
	coinId: string,
	quantity: number,
	price: number,
	desiredSellPrice?: number,
) => {
	try {
		const session = await auth()

		if (!session?.user) {
			throw new Error('User not authenticated')
		}

		if (!coinId) {
			throw new Error('CoinId is required')
		}

		if (typeof quantity !== 'number' || isNaN(quantity) || quantity === 0) {
			throw new Error('Invalid quantity. Use positive for buy, negative for sell')
		}

		// Проверяем, существует ли пользователь
		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
		})

		if (!user) {
			throw new Error('User not found')
		}

		await prisma.$transaction(async (prisma) => {
			// 1. Получаем или создаем UserCoin
			const userCoin = await prisma.userCoin.upsert({
				where: {
					userId_coinId: {
						userId: session.user.id,
						coinId: coinId,
					},
				},
				update: {},
				create: {
					id: coinId,
					desired_sell_price: desiredSellPrice,
					user: { connect: { id: session.user.id } },
					coin: { connect: { id: coinId } },
					coinsListIDMap: { connect: { id: coinId } },
				},
				include: { purchases: true },
			})

			if (!userCoin && quantity < 0) {
				throw new Error('Cannot sell non-existing coins')
			}

			// 2. Проверка баланса для продаж
			if (quantity < 0) {
				const available = userCoin.total_quantity || 0
				if (Math.abs(quantity) > available) {
					throw new Error(`Not enough coins to sell. Available: ${available}`)
				}
			}

			// 2. Создаем запись о транзакции
			await prisma.userCoinPurchase.create({
				data: {
					quantity,
					price,
					date: new Date(),
					userCoinId: userCoin.id,
				},
			})

			// 3. Пересчитываем агрегированные данные
			const totalQuantity = userCoin.total_quantity + quantity

			let totalCost = userCoin.total_cost
			if (quantity > 0) {
				// Покупка: добавляем стоимость
				totalCost += quantity * price
			} else {
				// Продажа: уменьшаем стоимость пропорционально средней цене
				totalCost -= Math.abs(quantity) * userCoin.average_price
			}

			const averagePrice = totalQuantity > 0 ? totalCost / totalQuantity : 0

			// 4. Обновляем UserCoin
			await prisma.userCoin.update({
				where: { id: userCoin.id },
				data: {
					total_quantity: totalQuantity,
					total_cost: totalCost,
					average_price: averagePrice,
					desired_sell_price: desiredSellPrice ?? userCoin.desired_sell_price,
				},
				include: { purchases: true },
			})
		})

		revalidatePath('/')
	} catch (error) {
		handleError(error, 'ADD_CRYPTO_TO_USER')
	}
}

export const updateUserCrypto = async (
	coinId: string,
	quantity: number,
	buyPrice: number,
	sellPrice?: number,
) => {
	try {
		const session = await auth()

		// Проверяем, авторизован ли пользователь
		if (!session?.user) {
			throw new Error('User not authenticated')
		}

		// Проверяем права доступа
		if (session.user.id !== session.user.id && session.user.role !== 'ADMIN') {
			throw new Error('You do not have permission to perform this action')
		}

		// Валидация входных данных
		if (quantity <= 0) {
			throw new Error('Quantity must be greater than 0')
		}

		if (buyPrice <= 0) {
			throw new Error('Buy price must be greater than 0')
		}

		if (sellPrice && sellPrice <= 0) {
			throw new Error('Sell price must be greater than 0')
		}

		await prisma.userCoin.update({
			where: {
				userId_coinId: { userId: session.user.id, coinId }, // Используем уникальный ключ
			},
			data: {
				total_quantity: quantity,
				average_price: buyPrice,
				sell_price: sellPrice,
			},
		})

		revalidatePath('/')
	} catch (error) {
		handleError(error, 'UPDATE_USER_CRYPTO')
	}
}

export const delleteCryptoFromUser = async (coinId: string) => {
	try {
		const session = await auth()

		// Проверяем, авторизован ли пользователь
		if (!session?.user) {
			throw new Error('User not authenticated')
		}

		// Проверяем права доступа
		if (session.user.id !== session.user.id && session.user.role !== 'ADMIN') {
			throw new Error('You do not have permission to perform this action')
		}

		await prisma.userCoin.delete({
			where: {
				userId_coinId: { userId: session.user.id, coinId }, // Используем уникальный ключ
			},
		})

		revalidatePath('/')
	} catch (error) {
		handleError(error, 'DELETE_USER_CRYPTO')
	}
}

export const getTrendingData = async (): Promise<TrendingData> => {
	try {
		const cachedData = await prisma.trendingCoin.findMany({
			where: {
				updatedAt: {
					gte: new Date(Date.now() - 300 * 60 * 1000), // Данные обновлены не старше 300 минут
				},
			},
		})

		if (cachedData.length > 0) {
			console.log('✅ Using cached TrendingData from DB')

			return {
				coins: cachedData.map((coin) => ({
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
		}

		// Если данных нет или они устарели, запрашиваем их через API
		console.log('🔄 Outdated records, request TrendingData via API...')
		const data = await makeReq('GET', '/gecko/trending')

		if (!data || !data.coins) {
			console.warn('⚠️ Empty response from API, using old TrendingData')

			return { coins: [] } as TrendingData
		}

		// Преобразуем данные в нужный формат
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

		// Обновляем или создаем записи в БД
		for (const coin of trendingCoins) {
			await prisma.trendingCoin.upsert({
				where: { coin_id_slug: { coin_id: coin.coin_id, slug: coin.slug } },
				update: coin,
				create: coin,
			})
		}

		console.log('✅ Records TrendingData updated!')

		return { coins: trendingCoins }
	} catch (error) {
		handleError(error, 'GET_TRENDING_DATA')

		return { coins: [] }
	}
}

export const getCategories = async (): Promise<CategoriesData> => {
	try {
		// Проверяем наличие категорий в базе данных
		const cachedData = await prisma.category.findMany()

		if (cachedData.length > 0) {
			console.log('✅ Using cached Categories from DB')

			return cachedData.map((category) => ({
				category_id: category.category_id,
				name: category.name,
			}))
		}

		// Если данных нет или они устарели, запрашиваем их через API
		console.log('🔄 Outdated records, request Categories via API...')
		const data = await makeReq('GET', '/gecko/categories')

		if (!data || !Array.isArray(data) || data.length === 0) {
			console.warn('⚠️ Empty response from API, using old Categories')

			return [] as CategoriesData
		}

		// Преобразуем данные в нужный формат
		const categoriesData: CategoriesData = data.map((category: any) => ({
			category_id: category.category_id,
			name: category.name,
		}))

		// Обновляем или создаем записи в БД
		for (const category of categoriesData) {
			await prisma.category.upsert({
				where: { category_id: category.category_id },
				update: category,
				create: category,
			})
		}

		console.log('✅ Records Categories updated!')

		return categoriesData
	} catch (error) {
		handleError(error, 'GET_CATEGORIES')

		return []
	}
}

export const getCoinsList = async (): Promise<CoinsListData> => {
	// Отдаем старые данные сразу
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

	// Запускаем обновление в фоне через API
	const response = await makeReq('GET', '/update/coins-list')

	if (!response || !Array.isArray(response) || response.length === 0) {
		console.log('✅ GET_USER_COINS: Using cached UserCoins from DB')

		return transformCoinData(cachedCoins)
	}

	return transformCoinData(cachedCoins)
}

export const updateCoinsList = async (): Promise<any> => {
	try {
		// Получаем список монет
		const cachedCoins = await prisma.coin.findMany({
			include: {
				coinsListIDMap: true,
			},
		})

		if (!cachedCoins.length) {
			return []
		}

		const currentTime = new Date()
		const updateTime = new Date(currentTime.getTime() - COINS_UPDATE_INTERVAL * 60 * 1000)

		// Фильтруем устаревшие монеты
		const coinsToUpdate = cachedCoins.filter((coin) => coin.updatedAt < updateTime)

		if (!coinsToUpdate.length) {
			console.log('✅ Using cached Coins from DB')
			return cachedCoins
		}

		// Формируем строку для API-запроса
		const coinList = coinsToUpdate
			.sort(() => Math.random() - 0.5) // Перемешиваем массив случайным образом
			.slice(0, 10) // Берем первые 10 элементов
			.map((coin) => encodeURIComponent(coin.id))
			.join('%2C')

		// Запрашиваем свежие данные с API
		console.log('🔄 Outdated records, request CoinsList via API...')
		const response = await makeReq('GET', `/gecko/coins-upd/${coinList}`)

		if (!response || !Array.isArray(response) || response.length === 0) {
			console.warn('⚠️ UPDATE_COINS: Empty response from API, using old CoinsList')
			return cachedCoins
		}

		await prisma.$transaction([
			// Обновляем coinsListIDMap
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

			// Обновляем Coin
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
						updatedAt: currentTime,
					},
				}),
			),
		])

		console.log('✅ Records CoinsList updated!')

		// Возвращаем обновленный список монет
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

		// Проверяем, авторизован ли пользователь
		if (!session?.user) {
			throw new Error('User not authenticated')
		}

		// Отдаем старые данные сразу
		const userCoins = await prisma.userCoin.findMany({
			where: { userId: session.user.id },
			include: { coinsListIDMap: true, coin: true },
		})

		// Запускаем обновление в фоне через API
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
		// Получаем список монет пользователя
		const userCoins = await prisma.userCoin.findMany({
			where: { userId },
			include: { coin: true },
		})

		if (!userCoins.length) {
			return []
		}

		const currentTime = new Date()
		const updateTime = new Date(currentTime.getTime() - USER_COINS_UPDATE_INTERVAL * 60 * 1000)

		// Фильтруем устаревшие монеты
		const coinsToUpdate = userCoins.filter((uc) => uc.updatedAt < updateTime)

		if (!coinsToUpdate.length) {
			console.log('✅ Using cached UserCoins from DB')
			return userCoins
		}

		// Формируем строку для API-запроса
		const coinList = coinsToUpdate
			.sort(() => Math.random() - 0.5) // Перемешиваем массив случайным образом
			.slice(0, 10) // Берем первые 10 элементов
			.map((uc) => encodeURIComponent(uc.coinId))
			.join('%2C')

		// Запрашиваем свежие данные с API
		console.log('🔄 Outdated records, request UserCoins via API...')
		const response = await makeReq('GET', `/gecko/user/${coinList}`)

		if (!response || !Array.isArray(response) || response.length === 0) {
			console.warn('⚠️ UPDATE_USER_COINS: Empty response from API, using old UserCoinsList')
			return userCoins
		}

		await prisma.$transaction([
			// Обновляем coin
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

			// Обновляем userCoin
			...response.map((coin) =>
				prisma.userCoin.updateMany({
					where: { userId, coinId: coin.id },
					data: { updatedAt: currentTime },
				}),
			),
		])

		console.log('✅ Records UserCoinsList updated!')

		// Возвращаем обновленный список монет
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
		// Getting data from the database
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

		if (!session?.user) {
			throw new Error('User not found')
		}

		const existingUser = await prisma.user.findFirst({
			where: { id: session?.user.id },
			include: { accounts: true },
		})

		if (!existingUser) {
			throw new Error('User not found')
		}
		// Проверяем наличие данных в базе данных
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

		// Если данных нет, делаем запрос к API
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
		// Проверяем наличие данных в базе данных
		const cachedData = await prisma.coin.findMany({
			where: {
				categoryId: cate,
			},
			include: {
				coinsListIDMap: true,
			},
		})

		// Если данные есть, возвращаем их
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
		// Если данных нет, делаем запрос к API
		console.log('🔄 Outdated records, request CoinsListByCate via API...')
		const data = await makeReq('GET', `/gecko/${cate}/coins`)

		// Если данные получены и они не пустые
		if (Array.isArray(data)) {
			// Обрабатываем каждую монету из API
			for (const coinData of data) {
				// Убедимся, что запись в CoinsListIDMap существует
				await prisma.coinsListIDMap.upsert({
					where: { id: coinData.id },
					update: { symbol: coinData.symbol, name: coinData.name },
					create: { id: coinData.id, symbol: coinData.symbol, name: coinData.name },
				})

				// Обновляем или создаем запись в Coin
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
						categoryId: cate, // Связываем с категорией
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
						coinsListIDMapId: coinData.id, // Связываем с CoinsListIDMap
						categoryId: cate, // Связываем с категорией
					},
				})
			}

			console.log('✅ Records CoinsListByCate updated!')

			// Возвращаем данные в формате CoinsListData
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
		// Получаем все данные о графиках из базы данных
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

		// Запрашиваем данные с API
		console.log('🔄 Fetching CoinsMarketChart from API...')
		const data = await makeReq('GET', `/gecko/chart/${coinId}`)

		// Если данных нет или они пустые, выводим предупреждение
		if (!data || !data.prices || data.prices.length === 0) {
			console.warn('⚠️ Empty response from API, using old CoinsMarketChart')
			return { prices: cachedData?.prices ?? [] } as MarketChartData
		}

		// Обновляем или создаем запись в БД
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
		// Получаем данные о airdrops из базы данных
		const cachedData = await prisma.airdrop.findMany({
			include: {
				coin: true,
				coinsListIDMap: true,
			},
		})

		// Если данные о airdrops уже существуют в базе данных, возвращаем их
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

		// Если данных нет или они устарели, запрашиваем их через API
		console.log('🔄 Outdated records, request Aidrops via API...')
		const data = await makeReq('GET', '/cmc/aidrops')

		if (!data || !Array.isArray(data.data) || data.data.length === 0) {
			console.warn('⚠️ Empty response from API, using old Aidrops')

			return { data: [] } as AidropsData
		}

		// Преобразуем данные в нужный формат
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

		// Обновляем или создаем записи в БД
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
