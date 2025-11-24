'use server'

import { prisma } from '@/lib/prisma'
import { ValidDays } from '@/constants/chart'
import { makeReq } from '@/app/api/make-request'
import { handleError } from '@/lib/handle-error'
import { MarketChart } from '@/generated/prisma/client'
import { getFieldForDays } from '@/data/field-for-days'
import { TMarketChartData } from '@/modules/coins/schema'
import { INTERVAL_MARKET_CHART_UPDATE } from '@/constants/intervals'

export const getCoinsMarketChart = async (coinId: string, days: ValidDays): Promise<TMarketChartData> => {
	try {
		const field = getFieldForDays(days)
		if (!field) throw new Error('Invalid days parameter')

		const updatedField = `updatedAt_${days}d` as keyof MarketChart

		// Get all the data about the charts from the DB
		const cachedData = await prisma.marketChart.findUnique({
			where: { id: coinId },
		})

		const currentTime = new Date()
		const updateTime = new Date(currentTime.getTime() - INTERVAL_MARKET_CHART_UPDATE)

		// If the data for the required period already exists, return it
		if (cachedData?.[field] && cachedData?.[updatedField] && cachedData[updatedField]! > updateTime) {
			return { prices: cachedData[field] } as TMarketChartData
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

		return { prices: response.prices } as TMarketChartData
	} catch (error) {
		handleError(error, 'GET_COINS_MARKET_CHART')

		return {} as TMarketChartData
	}
}
