import { z } from 'zod'
import { pick } from 'lodash'

import {
	coinsListDataSchema,
	categoriesDataSchema,
	trendingDataSchema,
	type TCoinsListData,
	type TCategoriesData,
	type TTrendingData,
} from '@/modules/dashboard/schema'
import { prisma } from '@/lib/prisma'
import { makeReq } from '@/app/api/make-request'
import { baseProcedure, createTRPCRouter } from '@/trpc/init'

export const dashboardRouter = createTRPCRouter({
	getCoinsList: baseProcedure.output(coinsListDataSchema).query(async (): Promise<TCoinsListData> => {
		const cachedCoins = await prisma.coin.findMany({
			include: {
				coinsListIDMap: true,
			},
		})

		const coinsWithDefaults = cachedCoins.map((coin) => ({
			...coin,
			symbol: coin.coinsListIDMap.symbol,
			name: coin.coinsListIDMap.name,
		}))

		return coinsListDataSchema.parse(coinsWithDefaults)
	}),

	getCoinsListByCate: baseProcedure
		.input(z.string())
		.output(coinsListDataSchema)
		.query(async ({ input: cate }): Promise<TCoinsListData> => {
			const cachedData = await prisma.coin.findMany({
				where: { categoryId: cate },
				include: {
					coinsListIDMap: {
						select: { symbol: true, name: true },
					},
				},
			})

			if (cachedData.length > 0) {
				const coinsWithDefaults = cachedData.map(({ coinsListIDMap, ...coin }) => ({
					...coin,
					...coinsListIDMap,
				}))

				return coinsListDataSchema.parse(coinsWithDefaults)
			}

			const response = await makeReq('GET', `/gecko/${cate}/coins`)

			if (!Array.isArray(response) || !response.length) {
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

			await prisma.$transaction(
				response.flatMap((coinData) => [
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
				]),
			)

			return coinsListDataSchema.parse(response)
		}),

	getCategories: baseProcedure.output(categoriesDataSchema).query(async (): Promise<TCategoriesData> => {
		const data = await prisma.category.findMany({
			select: {
				category_id: true,
				name: true,
			},
		})

		console.log(data.length ? '✅ Using cached Categories from DB' : '⚠️ No Categories in DB')

		return data
	}),

	getTrending: baseProcedure.output(trendingDataSchema).query(async (): Promise<TTrendingData> => {
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
			const response = await makeReq('GET', '/gecko/trending')

			if (!response || !response.coins || !response.coins.length) {
				console.warn('⚠️ Empty response from API, aborting update')
				return { coins: [] }
			}

			await prisma.trendingCoin.deleteMany()

			const trendingCoins = response.coins.map((coin: any) => ({
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

			await prisma.$transaction(
				trendingCoins.map((coin: any) =>
					prisma.trendingCoin.create({
						data: coin.item,
					}),
				),
			)

			return trendingDataSchema.parse({ coins: trendingCoins })
		}

		const trendingData = {
			coins: data.map((coin) => ({
				item: {
					...coin,
					data:
						typeof coin.data === 'string'
							? (() => {
									try {
										return JSON.parse(coin.data)
									} catch {
										return {}
									}
								})()
							: coin.data,
				},
			})),
		}

		return trendingDataSchema.parse(trendingData)
	}),
})
