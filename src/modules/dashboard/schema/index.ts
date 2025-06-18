import { z } from 'zod'

export const categorySchema = z.object({
	category_id: z.string(),
	name: z.string(),
})

export const categoriesDataSchema = z.array(categorySchema)

export const coinListSchema = z.object({
	id: z.string(),
	symbol: z.string().optional(),
	name: z.string().optional(),
	description: z.string(),
	image: z.string(),
	current_price: z.number(),
	market_cap: z.number(),
	market_cap_rank: z.number(),
	total_volume: z.number(),
	high_24h: z.number(),
	low_24h: z.number(),
	price_change_percentage_24h: z.number(),
	circulating_supply: z.number(),
	sparkline_in_7d: z.object({
		price: z.array(z.number()),
	}),
	price_change_percentage_7d_in_currency: z.number(),
})

export const coinsListDataSchema = z.array(coinListSchema)

export const trendingItemSchema = z.object({
	id: z.string(),
	name: z.string(),
	symbol: z.string(),
	market_cap_rank: z.number(),
	thumb: z.string(),
	slug: z.string(),
	price_btc: z.number(),
	data: z.object({
		price: z.number(),
		price_btc: z.string(),
		price_change_percentage_24h: z.object({
			btc: z.number(),
			usd: z.number(),
		}),
		market_cap: z.string(),
		market_cap_btc: z.number(),
		total_volume: z.string(),
		total_volume_btc: z.number(),
		sparkline: z.string(),
	}),
})

export const trendingCoinSchema = z.object({
	item: trendingItemSchema,
})

export const trendingDataSchema = z.object({
	coins: z.array(trendingCoinSchema),
})

export type CategoriesData = z.infer<typeof categoriesDataSchema>
export type CoinsListData = z.infer<typeof coinsListDataSchema>
export type TrendingData = z.infer<typeof trendingDataSchema>
