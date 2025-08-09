import axios from 'axios'
import { chunk, pick } from 'lodash'
import { Prisma } from '@prisma/client'

// Do not change the path, made for seed.ts

import { prisma } from './../lib/prisma'
import { makeReq } from './../app/api/make-request'
import { CoinsListData } from './../modules/dashboard/schema'

const BATCH_SIZE = 50

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

export const updateCoinsListIDMapFromAPI = async (): Promise<void> => {
	try {
		console.log('🔄 Requesting current CoinsListIDMap via API...')
		const response = await makeReq('GET', '/gecko/coins-get')

		if (!response || !Array.isArray(response) || response.length === 0) {
			console.warn('⚠️ Empty response from API, using old CoinsListIDMapFromAPI')

			return
		}

		console.log(`📊 CoinsListIDMap is available in API: ${response.length}`)

		// Breaking data into chunks
		const coinIdChunks = chunk(response, BATCH_SIZE)

		// Update coins in batches
		for (const batch of coinIdChunks) {
			await prisma.$transaction([
				// Update coinsListIDMap
				...batch.map((coin) =>
					prisma.coinsListIDMap.upsert({
						where: { id: coin.id },
						update: coin,
						create: coin,
					}),
				),
			])
		}

		console.log('✅ Records CoinsListIDMap updated!')
	} catch (error) {
		handleError(error, 'GET_COINS_LIST_ID_MAP')

		return
	}
}

export const getCoinsList = async (): Promise<CoinsListData> => {
	try {
		console.log('🔄 Requesting current CoinsList via API...')
		const response = await makeReq('GET', '/gecko/list')

		if (!response || !Array.isArray(response) || response.length === 0) {
			console.warn('⚠️ Empty response from API, using old CoinsList')

			return [] as CoinsListData
		}

		console.log(`📊 CoinsList is available in API: ${response.length}`)

		const transformCoinData = (coin: any) => ({
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
			price_change_percentage_1h_in_currency: coin.price_change_percentage_1h_in_currency,
			price_change_percentage_24h_in_currency: coin.price_change_percentage_24h_in_currency,
			price_change_percentage_7d_in_currency: coin.price_change_percentage_7d_in_currency,
			price_change_percentage_30d_in_currency: coin.price_change_percentage_30d_in_currency,
			price_change_percentage_1y_in_currency: coin.price_change_percentage_1y_in_currency,
		})

		// Breaking data into chunks
		const batches = chunk(response, BATCH_SIZE)

		// Update coins in batches
		for (const batch of batches) {
			await prisma.$transaction(
				batch.flatMap((coin) => [
					// Update coinsListIDMap
					prisma.coinsListIDMap.upsert({
						where: { id: coin.id },
						update: { symbol: coin.symbol, name: coin.name },
						create: { id: coin.id, ...pick(coin, ['symbol', 'name']) },
					}),

					// Update coin
					prisma.coin.upsert({
						where: { id: coin.id },
						update: transformCoinData(coin),
						create: {
							id: coin.id,
							coinsListIDMapId: coin.id,
							...transformCoinData(coin),
						},
					}),
				]),
			)
		}

		console.log('✅ Records CoinsListIDMap updated!')

		return response.map((coin) => ({
			...pick(coin, ['id', 'symbol', 'name']),
			...transformCoinData(coin),
		}))
	} catch (error) {
		handleError(error, 'GET_COINS_LIST')

		return []
	}
}
