'use server'

import { hashSync } from 'bcrypt'

import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

import {
	AidropsData,
	CategoriesData,
	CoinListData,
	CoinsData,
	MarketChartData,
	TrendingData,
} from './definitions'
import {
	AIRDROPS_DATA_KEY,
	CATEGORIES_KEY,
	COINS_DATA_KEY,
	COINS_LIST_KEY,
	MARKET_CHART_KEY,
	TRENDING_KEY,
} from './constants'
import { makeReq } from './make-request'
import { sendEmail } from '@/lib/send-email'
import { getUserSession } from '@/lib/get-user-session'
import { VerificationUserTemplate } from '@/components/shared/email-temapltes'

export const updateUserInfo = async (body: Prisma.UserUpdateInput) => {
	try {
		const currentUser = await getUserSession()

		if (!currentUser) {
			throw new Error('User not found')
		}

		const existingUser = await prisma.user.findFirst({
			where: {
				id: currentUser.id,
			},
		})

		if (!existingUser) {
			throw new Error('User not found')
		}

		// Validation for email uniqueness
		if (body.email && body.email !== existingUser.email) {
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
			email: body.email ? body.email : existingUser.email, // Conditional assignment
			password: body.password ? hashSync(body.password as string, 10) : existingUser.password,
		}

		const updatedUser = await prisma.user.update({
			where: {
				id: currentUser.id,
			},
			data: updatedData,
		})

		return updatedUser
	} catch (err) {
		console.log('Error [UPDATE_USER]', err)
		throw err
	}
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
				password: hashSync(body.password, 10),
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
	} catch (err) {
		console.log('Error [CREATE_USER]', err)
		throw err
	}
}

export const fetchTrendingData = async (): Promise<TrendingData | null> => {
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
			return null
		}
	} catch (error) {
		console.error('Error fetching trending data:', error)
		return null
	}
}

export const fetchCategories = async (): Promise<CategoriesData | null> => {
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

		return null
	} catch (error) {
		console.error('Error fetching categories:', error)
		return null
	}
}

export const fetchCoinsList = async (): Promise<CoinListData | null> => {
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
			return null
		}
	} catch (error) {
		// Дополнительная проверка на ошибку
		if (error instanceof Error) {
			console.error('Error fetching coins list:', error.message)
		} else {
			console.error('Unknown error occurred during fetching coins list')
		}
		return null
	}
}

export const fetchCoinsData = async (coinId: string): Promise<CoinsData | null> => {
	try {
		// Получаем данные о монетах из базы данных по ключу и coinId
		const coinsDataRecord = await prisma.coin.findUnique({
			where: {
				key_coinId: {
					key: COINS_DATA_KEY,
					coinId: coinId,
				},
			},
		})

		let coinsDatas: Record<string, CoinsData> = {}

		// Проверяем, если данные о монетах уже существуют в базе данных
		if (coinsDataRecord) {
			try {
				coinsDatas = JSON.parse(coinsDataRecord.value as string)
			} catch (error) {
				console.error('Error parsing coins data:', error)
				coinsDatas = {} // Если ошибка парсинга, начинаем с пустого объекта
			}

			const coinData = coinsDatas[coinId]
			if (coinData) {
				return coinData
			}
		}

		// Если данных нет в базе данных, выполняем запрос
		const data = await makeReq('GET', `/gecko/coins/${coinId}`)
		if (!data) {
			console.error(`No data received for coin ${coinId}`)
			return null
		}

		// Обновляем или создаем запись в базе данных с новыми данными
		coinsDatas[coinId] = data

		// Убедитесь, что coinsDatas не пустой и не null
		if (Object.keys(coinsDatas).length === 0) {
			console.error('No valid coin data available to save')
			return null
		}

		// Сохраняем обновленные данные о монетах в базу данных
		await prisma.coin.upsert({
			where: {
				key_coinId: {
					key: COINS_DATA_KEY,
					coinId: coinId,
				},
			},
			update: { value: JSON.stringify(coinsDatas) },
			create: {
				key: COINS_DATA_KEY,
				value: JSON.stringify(coinsDatas),
				coinId: coinId, // Передаем coinId
			},
		})

		return data
	} catch (error) {
		console.error(`Error fetching data for coin ${coinId}:`, error)
		return null
	}
}

export const fetchCoinsListByCate = async (cate: string): Promise<CoinListData | null> => {
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

		return null
	} catch (error) {
		console.error(`Error fetching coins list for category ${cate}:`, error)
		return null
	}
}

export const fetchCoinsMarketChart = async (coinId: string): Promise<MarketChartData | null> => {
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

		return null
	} catch (error) {
		console.error(`Error fetching market chart for coin ${coinId}:`, error)
		return null
	}
}

export const fetchAidrops = async (): Promise<AidropsData | null> => {
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

		return null
	} catch (error) {
		console.error('Error fetching aidrops data:', error)
		return null
	}
}
