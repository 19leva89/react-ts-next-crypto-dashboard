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
		console.log('Error [CREATE_USER]', error)

		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			console.error('Prisma error code:', error.code)
			console.error('Prisma error message:', error.message)
		}

		throw error
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
		console.log('Error [UPDATE_USER]', error)

		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			console.error('Prisma error code:', error.code)
			console.error('Prisma error message:', error.message)
		}

		throw error
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
		console.error('Error [DELETE_USER]', error)

		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			console.error('Prisma error code:', error.code)
			console.error('Prisma error message:', error.message)
		}

		throw error
	}
}

export const addCryptoToUser = async (coinId: string, quantity: number) => {
	try {
		const session = await auth()

		if (!session?.user) {
			throw new Error('User not authenticated')
		}

		if (!coinId) {
			throw new Error('CoinId is required')
		}

		if (typeof quantity !== 'number' || isNaN(quantity) || quantity <= 0) {
			throw new Error('Quantity must be a valid number greater than 0')
		}

		// Проверяем, существует ли пользователь
		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
		})

		if (!user) {
			throw new Error('User not found')
		}

		// Получаем данные о монете из fetchCoinData
		const coinData = await fetchCoinData(coinId)

		// Если coinData пустое (ошибка получения данных), выбрасываем ошибку
		if (!coinData || Object.keys(coinData).length === 0) {
			throw new Error(`Failed to fetch data for coin ${coinId}`)
		}

		// Используем upsert для создания или обновления записи UserCoin
		await prisma.userCoin.upsert({
			where: {
				userId_coinId: {
					userId: user.id,
					coinId: coinId,
				},
			},
			update: {
				quantity: quantity,
			},
			create: {
				id: coinData.id,
				quantity: quantity,
				userId: user.id,
				coinId: coinId,
				coinsListIDMapId: coinData.id,
			},
		})

		revalidatePath('/')
	} catch (error) {
		// console.error('Error [ADD_CRYPTO_TO_USER]:', error)

		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			console.error('💾 Prisma error:', error.code, error.message)
		} else if (error instanceof Error) {
			console.error('🚨 Unexpected error:', error.message)
			console.error('Error stack:', error.stack)
			console.error('Error name:', error.name)
			console.error('Error cause:', error.cause)
		} else {
			console.error(`Error fetching data for coin ${coinId}:`, error)
		}

		throw error
	}
}

export const getUserCryptos = async () => {
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

		return await prisma.userCoin.findMany({
			where: {
				userId: session.user.id,
			},
			include: {
				// Подключаем данные монеты
				coin: {
					include: {
						// Подключаем данные из CoinsListIDMap (название, символ)
						coinsListIDMap: true,
					},
				},
			},
		})
	} catch (error) {
		console.error('Error [GET_USER_CRYPTO]', error)

		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			console.error('Prisma error code:', error.code)
			console.error('Prisma error message:', error.message)
		}

		throw error
	}
}

export const updateCryptoQuantity = async (coinId: string, quantity: number) => {
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

		await prisma.userCoin.update({
			where: {
				userId_coinId: { userId: session.user.id, coinId }, // Используем уникальный ключ
			},
			data: {
				quantity,
			},
		})

		revalidatePath('/')
	} catch (error) {
		console.error('Error [UPDATE_USER_CRYPTO]', error)

		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			console.error('Prisma error code:', error.code)
			console.error('Prisma error message:', error.message)
		}

		throw error
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
		console.error('Error [DELETE_USER_CRYPTO]', error)

		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			console.error('Prisma error code:', error.code)
			console.error('Prisma error message:', error.message)
		}

		throw error
	}
}

export const fetchTrendingData = async (): Promise<TrendingData> => {
	try {
		const cachedData = await prisma.trendingCoin.findMany({
			where: {
				updatedAt: {
					gte: new Date(Date.now() - 300 * 60 * 1000), // Данные обновлены не старше 300 минут
				},
			},
		})

		if (cachedData.length > 0) {
			console.log('✅ Используем кешированные данные из БД')

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
		console.log('🔄 Данных нет или они устарели, запрашиваем API...')
		const data = await makeReq('GET', '/gecko/trending')

		if (!data || !data.coins) {
			console.warn('⚠️ Пустой ответ от API')

			return { coins: [] }
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

		console.log('✅ Данные обновлены!')

		return { coins: trendingCoins }
	} catch (error) {
		console.error('❌ Error fetching trending data:', error)

		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			console.error('💾 Prisma error:', error.code, error.message)
		}

		throw error
	}
}

export const fetchCategories = async (): Promise<CategoriesData> => {
	try {
		// Проверяем наличие категорий в базе данных
		const cachedData = await prisma.category.findMany()

		if (cachedData.length > 0) {
			console.log('✅ Используем кешированные данные из БД')

			return cachedData.map((category) => ({
				category_id: category.category_id,
				name: category.name,
			}))
		}

		// Если данных нет или они устарели, запрашиваем их через API
		console.log('🔄 Данных нет или они устарели, запрашиваем API...')
		const data = await makeReq('GET', '/gecko/categories')

		if (!data || !Array.isArray(data) || data.length === 0) {
			console.warn('⚠️ Пустой ответ от API')

			return []
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

		console.log('✅ Данные обновлены!')

		return categoriesData
	} catch (error) {
		console.error('❌ Error fetching categories:', error)

		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			console.error('💾 Prisma error:', error.code, error.message)
		}

		throw error
	}
}

export const fetchCoinsList = async (): Promise<CoinsListData> => {
	try {
		// Проверяем наличие данных в базе данных
		const cachedData = await prisma.coin.findMany({
			include: {
				coinsListIDMap: true,
			},
		})

		if (cachedData.length > 0) {
			console.log('✅ Используем кешированные данные из БД')
			return cachedData.map((list) => ({
				id: list.coinsListIDMap.id,
				symbol: list.coinsListIDMap.symbol,
				name: list.coinsListIDMap.name,
				description: list.description,
				image: list.image,
				current_price: list.current_price,
				market_cap: list.market_cap,
				market_cap_rank: list.market_cap_rank,
				total_volume: list.total_volume,
				high_24h: list.high_24h,
				low_24h: list.low_24h,
				price_change_percentage_24h: list.price_change_percentage_24h,
				circulating_supply: list.circulating_supply,
				sparkline_in_7d: list.sparkline_in_7d,

				price_change_percentage_7d_in_currency: list.price_change_percentage_7d_in_currency,
			})) as CoinsListData
		}

		// Если данных нет, делаем запрос к API
		console.log('🔄 Данных нет в БД, запрашиваем API...')
		const data = await makeReq('GET', '/gecko/list')

		// Если данные получены и они не пустые
		if (Array.isArray(data)) {
			// Обрабатываем каждую монету из API
			for (const coinData of data) {
				const { id, symbol, name } = coinData

				// Убедимся, что запись в CoinsListIDMap существует
				await prisma.coinsListIDMap.upsert({
					where: { id },
					update: { symbol, name },
					create: { id, symbol, name },
				})

				// Обновляем или создаем запись в Coin
				await prisma.coin.upsert({
					where: { id },
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
					},
					create: {
						id,
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
						coinsListIDMapId: id,
					},
				})
			}
			console.log('✅ Данные о монетах успешно обновлены или созданы')

			return data
		} else {
			console.warn('⚠️ Данные от API пустые или имеют неверный формат')
			return []
		}
	} catch (error) {
		console.error('Error fetching coins list:', error)

		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			console.error('💾 Prisma error:', error.code, error.message)
		} else if (error instanceof Error) {
			console.error('🚨 Unexpected error:', error.message)
		}

		throw error
	}
}

export const fetchUserCoinsList = async (): Promise<any> => {
	try {
		const session = await auth()

		if (!session?.user) {
			throw new Error('User not found')
		}

		// Получаем список монет пользователя
		const userCoins = await prisma.userCoin.findMany({
			where: { userId: session.user.id },
			include: { coin: true },
		})

		if (!userCoins.length) {
			return []
		}

		const currentTime = new Date()
		const oneHourAgo = new Date(currentTime.getTime() - 60 * 60 * 1000)

		// Получаем только те монеты, которые устарели
		const coinsToUpdate = await prisma.userCoin.findMany({
			where: {
				userId: session.user.id,
				updatedAt: { lt: oneHourAgo }, // Берем только те, что старше 1 часа
			},
			include: { coin: true },
		})

		// Если нет устаревших данных, просто возвращаем всё из кэша
		if (!coinsToUpdate.length) {
			console.log('✅ Используем кешированные данные из БД')
			return (await prisma.userCoin.findMany({
				where: { userId: session.user.id },
				include: { coin: true },
			})) as unknown as CoinData[]
		}

		// Собираем ID монет для запроса
		const coinList = coinsToUpdate.map((uc) => encodeURIComponent(uc.coinId)).join('%2C')

		// Запрашиваем свежие данные
		console.log('🔄 Данные в БД устарели, запрашиваем API...')
		const response = await makeReq('GET', `/gecko/user/${coinList}`)
		console.log('✅ Данные response получены', response)

		for (const coin of response) {
			await prisma.userCoin.updateMany({
				where: { userId: session.user.id, coinId: coin.id },
				data: {
					updatedAt: currentTime,
				},
			})
		}

		console.log('✅ Данные о монетах успешно обновлены')
	} catch (error) {
		console.error(`Error fetching coin list:`, error)

		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			console.error('💾 Prisma error:', error.code, error.message)
		} else if (error instanceof Error) {
			console.error('🚨 Unexpected error:', error.message)
		}

		throw error
	}
}

export const fetchCoinsListIDMap = async (): Promise<CoinsListIDMapData> => {
	try {
		// Получаем количество записей в БД
		const dbCount = await prisma.coinsListIDMap.count()
		console.log(`📊 В БД записей: ${dbCount}`)

		// Запрашиваем данные из API
		console.log('🔄 Запрашиваем актуальный список монет из API...')
		const data = await makeReq('GET', '/gecko/coins')

		if (!data || !Array.isArray(data) || data.length === 0) {
			console.warn('⚠️ Пустой ответ от API')
			return []
		}

		console.log(`📊 В API доступно монет: ${data.length}`)

		// Если API-данных больше, чем в БД, обновляем
		if (data.length > dbCount) {
			const newCoins = data.map((coin: any) => ({
				id: coin.id,
				symbol: coin.symbol,
				name: coin.name,
			}))

			// Обновляем или создаем новые записи
			for (const coin of newCoins) {
				await prisma.coinsListIDMap.upsert({
					where: { id: coin.id },
					update: coin,
					create: coin,
				})
			}

			console.log(`✅ Добавлено новых монет: ${data.length - dbCount}`)
		} else {
			console.log('✅ Данные актуальны, обновление не требуется.')
		}

		// Запрашиваем актуальные данные с image из Coin
		const updatedCoins = await prisma.coinsListIDMap.findMany({
			include: { coin: true },
		})

		// Возвращаем данные с image
		return updatedCoins.map((list) => ({
			id: list.id,
			symbol: list.symbol,
			name: list.name,
			image: list.coin?.image || null,
		}))
	} catch (error) {
		console.error('Error fetching coins:', error)

		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			console.error('💾 Prisma error:', error.code, error.message)
		}

		throw error
	}
}

export const fetchCoinData = async (coinId: string): Promise<CoinData> => {
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
			console.log('✅ Используем кешированные данные из БД')
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
		console.log('🔄 Данных нет в БД, запрашиваем API...')
		const data = await makeReq('GET', `/gecko/coins/${coinId}`)

		// Validate the API response
		if (!data || typeof data !== 'object' || Array.isArray(data)) {
			console.warn('⚠️ Данные от API пустые или имеют неверный формат')
			return {
				id: coinId,
				symbol: '',
				name: '',
				description: { en: '' },
				image: { thumb: '' },
				market_cap_rank: 0,
				market_data: {
					current_price: { usd: 0 },
					market_cap: { usd: 0 },
					high_24h: { usd: 0 },
					low_24h: { usd: 0 },
					circulating_supply: 0,
				},
			} as CoinData
		}

		const { id, symbol, name, image, description, market_cap_rank, market_data } = data

		// Ensure CoinsListIDMap exists
		await prisma.coinsListIDMap.upsert({
			where: { id },
			update: { symbol, name },
			create: { id, symbol, name },
		})
		console.log('✅ Запись в CoinsListIDMap обновлена!')

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
		console.log('✅ Запись в Coin обновлена!')

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
		console.error(`Error fetching data for coin ${coinId}:`, error)

		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			console.error('💾 Prisma error:', error.code, error.message)
		} else if (error instanceof Error) {
			console.error('🚨 Unexpected error:', error.message)
		}

		throw error
	}
}

export const fetchCoinsListByCate = async (cate: string): Promise<CoinsListData> => {
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
			console.log('✅ Используем кешированные данные из БД')
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
		console.log('🔄 Данных нет в БД, запрашиваем API...')
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

			console.log('✅ Данные о монетах успешно обновлены или созданы')

			// Возвращаем данные в формате CoinsListData
			return data
		} else {
			console.warn('⚠️ Данные от API пустые или имеют неверный формат')
			return []
		}
	} catch (error) {
		console.error(`Error fetching coins list for category ${cate}:`, error)

		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			console.error('💾 Prisma error:', error.code, error.message)
		} else if (error instanceof Error) {
			console.error('🚨 Unexpected error:', error.message)
		}

		throw error
	}
}

export const fetchCoinsMarketChart = async (coinId: string): Promise<MarketChartData> => {
	try {
		// Получаем все данные о графиках из базы данных
		const cachedData = await prisma.marketChart.findUnique({
			where: { id: `${coinId}-chart` },
		})

		// Если данные уже есть в БД, просто возвращаем их
		if (cachedData) {
			console.log('✅ Используем кешированные данные из БД')

			return { prices: cachedData.prices } as MarketChartData
		}

		// Если данных нет, выполняем запрос к API
		console.log('🔄 Данных нет или они устарели, запрашиваем API...')
		const data = await makeReq('GET', `/gecko/chart/${coinId}`)

		// Если данных нет или они пустые, выводим предупреждение
		if (!data || !data.prices || data.prices.length === 0) {
			console.warn(`⚠️ No market chart data for coin ${coinId}`)
			return { prices: [] }
		}

		// Создаем уникальный идентификатор для записи
		const marketChartId = `${coinId}-chart`.replace(/[^a-zA-Z0-9-]/g, '-')

		// Сохраняем новые данные о графике в базу данных
		await prisma.marketChart.create({
			data: {
				id: marketChartId,
				prices: data.prices,
			},
		})

		console.log('✅ Данные о графике сохранены в БД')

		return { prices: data.prices } as MarketChartData
	} catch (error) {
		console.error(`Error fetching market chart for coin ${coinId}:`, error)

		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			console.error('💾 Prisma error:', error.code, error.message)
		}

		throw error
	}
}

export const fetchAidrops = async (): Promise<AidropsData> => {
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
			console.log('✅ Используем кешированные данные из БД')

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
		console.log('🔄 Данных нет или они устарели, запрашиваем API...')
		const data = await makeReq('GET', '/cmc/aidrops')

		if (!data || !Array.isArray(data.data) || data.data.length === 0) {
			console.warn('⚠️ Пустой ответ от API или данные не в нужном формате')

			return { data: [] }
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

		console.log('✅ Данные обновлены!')

		return aidropsData
	} catch (error) {
		console.error('Error fetching aidrops data:', error)

		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			console.error('💾 Prisma error:', error.code, error.message)
		}

		throw error
	}
}
