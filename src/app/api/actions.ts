'use server'

import { compare } from 'bcryptjs'
import { revalidatePath } from 'next/cache'

import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

import {
	AIRDROPS_DATA_KEY,
	CATEGORIES_KEY,
	COIN_DATA_KEY,
	COINS_LIST_KEY,
	MARKET_CHART_KEY,
	TRENDING_KEY,
} from './constants'
import { auth, signIn } from '@/auth'
import { makeReq } from './make-request'
import { sendEmail } from '@/lib/send-email'
import { saltAndHashPassword } from '@/lib/salt'
import { VerificationUserTemplate } from '@/components/shared/email-temapltes'
import { AidropsData, CategoriesData, CoinListData, CoinData, MarketChartData, TrendingData } from './types'

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

		// Ищем монету по составному ключу (ключ+coinId)
		let coin = await prisma.coin.findUnique({
			where: {
				key_coinId: {
					key: COIN_DATA_KEY,
					coinId: coinId,
				},
			},
		})

		// Если монета не найдена, создаем ее
		if (!coin) {
			coin = await prisma.coin.create({
				data: {
					key: COIN_DATA_KEY,
					coinId: coinId,
					value: JSON.stringify(coinData),
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			})
		}

		// Проверяем, если монета уже есть в портфеле пользователя
		const userCoin = await prisma.userCoin.findUnique({
			where: {
				userId_coinId: {
					userId: user.id,
					coinId: coin.id,
				},
			},
		})

		if (userCoin) {
			throw new Error('The coin is already in the portfolio')
		}

		// Создаем запись UserCoin
		await prisma.userCoin.create({
			data: {
				userId: user.id,
				coinId: coin.id,
				quantity,
			},
		})

		revalidatePath('/')
	} catch (error) {
		console.error('Error [ADD_CRYPTO_TO_USER]:', error)

		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			console.error('Prisma error code:', error.code)
			console.error('Prisma error message:', error.message)
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
				coin: true, // Включаем данные о криптовалюте
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
		const cachedData = await prisma.trendingData.findUnique({
			where: { key: TRENDING_KEY },
		})

		if (cachedData) {
			// Если данные найдены, возвращаем их
			return cachedData.value as TrendingData
		}

		// Если данных нет, запрашиваем их через API
		const data = await makeReq('GET', '/gecko/trending')
		if (data) {
			// Сохраняем полученные данные в базе
			await prisma.trendingData.create({
				data: {
					key: TRENDING_KEY,
					value: data,
				},
			})

			return data
		} else {
			return { coins: [] }
		}
	} catch (error) {
		console.error('Error fetching trending data:', error)

		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			console.error('Prisma error code:', error.code)
			console.error('Prisma error message:', error.message)
		}

		throw error
	}
}

export const fetchCategories = async (): Promise<CategoriesData> => {
	try {
		// Проверяем наличие категорий в базе данных
		const categories = await prisma.category.findUnique({
			where: { key: CATEGORIES_KEY },
		})

		if (categories) {
			return JSON.parse(categories.value) as CategoriesData
		}

		// Если в базе данных ничего нет, делаем запрос к API
		const data = await makeReq('GET', '/gecko/categories')
		if (data) {
			// Сохраняем данные в базу данных
			await prisma.category.upsert({
				where: { key: CATEGORIES_KEY },
				update: { value: JSON.stringify(data) },
				create: { key: CATEGORIES_KEY, value: JSON.stringify(data) },
			})

			return data
		}

		return []
	} catch (error) {
		console.error('Error fetching categories:', error)

		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			console.error('Prisma error code:', error.code)
			console.error('Prisma error message:', error.message)
		}

		throw error
	}
}

export const fetchCoinsList = async (): Promise<CoinListData> => {
	try {
		// Проверяем наличие данных в базе данных
		const coinsList = await prisma.coin.findUnique({
			where: {
				key_coinId: {
					key: COINS_LIST_KEY,
					coinId: 'coins_list',
				},
			},
		})

		if (coinsList) {
			return JSON.parse(coinsList.value as string) as CoinListData
		}

		// Если данных нет, делаем запрос к API
		const data = await makeReq('GET', '/gecko/list')
		if (data && typeof data === 'object' && data !== null) {
			// Сохраняем данные в базе
			await prisma.coin.upsert({
				where: {
					key_coinId: {
						key: COINS_LIST_KEY,
						coinId: 'coins_list',
					},
				},
				update: { value: JSON.stringify(data) },
				create: {
					key: COINS_LIST_KEY,
					value: JSON.stringify(data),
					coinId: 'coins_list',
				},
			})

			return data
		} else {
			console.error('Invalid data received for coins list:', data)
			return []
		}
	} catch (error) {
		// Дополнительная проверка на ошибку
		if (error instanceof Error) {
			console.error('Error fetching coins list:', error.message)
		} else {
			console.error('Unknown error occurred during fetching coins list')
		}

		throw error
	}
}

export const fetchCoinData = async (coinId: string): Promise<CoinData> => {
	try {
		// Получаем данные о монетах из базы данных по ключу и coinId
		const coinsDataRecord = await prisma.coin.findUnique({
			where: {
				key_coinId: {
					key: COIN_DATA_KEY,
					coinId: coinId,
				},
			},
		})

		let coinsDatas: Record<string, CoinData> = {}

		// Проверяем, если данные о монетах уже существуют в базе данных
		if (coinsDataRecord) {
			try {
				coinsDatas = JSON.parse(coinsDataRecord.value as string)
			} catch (error) {
				console.error('Error parsing coins data:', error)
				coinsDatas = {} // Если ошибка парсинга, начинаем с пустого объекта
			}

			// Если данные о монетах существуют в базе данных, возвращаем их
			if (coinsDatas[coinId]) {
				return coinsDatas[coinId]
			}
		}

		// Если данных нет в базе данных, выполняем запрос
		const data = await makeReq('GET', `/gecko/coins/${coinId}`)
		if (!data || Object.keys(data).length === 0) {
			console.error(`Failed to fetch valid data for coin ${coinId}`)
			return {} as CoinData
		}

		// Обновляем или создаем запись в базе данных с новыми данными
		coinsDatas[coinId] = data

		// Сохраняем обновленные данные о монетах в базу данных
		await prisma.coin.upsert({
			where: {
				key_coinId: {
					key: COIN_DATA_KEY,
					coinId: coinId,
				},
			},
			update: { value: JSON.stringify(coinsDatas) },
			create: {
				key: COIN_DATA_KEY,
				value: JSON.stringify(coinsDatas),
				coinId: coinId, // Передаем coinId
			},
		})

		return data
	} catch (error) {
		console.error(`Error fetching data for coin ${coinId}:`, error)

		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			console.error('Prisma error code:', error.code)
			console.error('Prisma error message:', error.message)
		}

		throw error
	}
}

export const fetchCoinsListByCate = async (cate: string): Promise<CoinListData> => {
	try {
		// Создаем уникальный идентификатор для категории
		const coinId = `${cate}-category`

		// Проверяем наличие данных в базе данных
		const categoryData = await prisma.coin.findUnique({
			where: {
				key_coinId: {
					key: cate,
					coinId: coinId,
				},
			},
		})

		if (categoryData) {
			return JSON.parse(categoryData.value as string) as CoinListData
		}

		// Если данных нет, делаем запрос к API
		const data = await makeReq('GET', `/gecko/${cate}/coins`)
		if (data) {
			// Сохраняем данные в базе
			await prisma.coin.upsert({
				where: {
					key_coinId: {
						key: cate,
						coinId: coinId,
					},
				},
				update: { value: JSON.stringify(data) },
				create: { key: cate, value: JSON.stringify(data), coinId: coinId },
			})

			return data
		}

		return []
	} catch (error) {
		console.error(`Error fetching coins list for category ${cate}:`, error)

		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			console.error('Prisma error code:', error.code)
			console.error('Prisma error message:', error.message)
		}

		throw error
	}
}

export const fetchCoinsMarketChart = async (coinId: string): Promise<MarketChartData> => {
	try {
		// Получаем все данные о графиках из базы данных
		const marketChartData = await prisma.marketChart.findUnique({
			where: { key: MARKET_CHART_KEY },
		})

		// Проверяем, если данные о графиках уже существуют
		if (marketChartData) {
			const marketChartDatas = JSON.parse(marketChartData.value as string) as Record<string, MarketChartData>
			const coinMarketChart = marketChartDatas[coinId]
			if (coinMarketChart) {
				return coinMarketChart
			}
		}

		// Если данных нет, выполняем запрос
		const data = await makeReq('GET', `/gecko/chart/${coinId}`)
		if (data) {
			let marketChartDatas: Record<string, MarketChartData> = {}

			// Если данные о графиках уже существуют, добавляем новые данные
			if (marketChartData) {
				marketChartDatas = JSON.parse(marketChartData.value as string)
			}

			marketChartDatas[coinId] = data

			// Создаем уникальный идентификатор для записи
			const marketChartId = `${coinId}-chart`

			// Сохраняем данные о графиках в базу данных
			await prisma.marketChart.upsert({
				where: { key: MARKET_CHART_KEY },
				update: { value: JSON.stringify(marketChartDatas) },
				create: { key: MARKET_CHART_KEY, value: JSON.stringify(marketChartDatas), coinId: marketChartId },
			})

			return data
		}

		return {} as MarketChartData
	} catch (error) {
		console.error(`Error fetching market chart for coin ${coinId}:`, error)

		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			console.error('Prisma error code:', error.code)
			console.error('Prisma error message:', error.message)
		}

		throw error
	}
}

export const fetchAidrops = async (): Promise<AidropsData> => {
	try {
		// Получаем данные о airdrops из базы данных
		const aidropsDataRecord = await prisma.aidrop.findUnique({
			where: { key: AIRDROPS_DATA_KEY }, // Используем ключ для поиска записи
		})

		// Если данные о airdrops уже существуют в базе данных, возвращаем их
		if (aidropsDataRecord) {
			return JSON.parse(aidropsDataRecord.value as string) as AidropsData
		}

		// Если данных нет в базе данных, выполняем запрос
		const data = await makeReq('GET', '/cmc/aidrops')
		if (data) {
			// Сохраняем данные о airdrops в базу данных
			await prisma.aidrop.upsert({
				where: { key: AIRDROPS_DATA_KEY }, // Используем ключ для уникальности записи
				update: { value: JSON.stringify(data) }, // Обновляем данные
				create: { key: AIRDROPS_DATA_KEY, value: JSON.stringify(data) }, // Создаем новую запись
			})

			return data
		}

		return {} as AidropsData
	} catch (error) {
		console.error('Error fetching aidrops data:', error)

		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			console.error('Prisma error code:', error.code)
			console.error('Prisma error message:', error.message)
		}

		throw error
	}
}
