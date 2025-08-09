'use server'

import { prisma } from '@/lib/prisma'
import { CoinData } from '@/app/api/types'
import { makeReq } from '@/app/api/make-request'
import { handleError } from '@/lib/handle-error'
import { COINS_UPDATE_INTERVAL } from '@/constants/intervals'

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
