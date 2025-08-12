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
	description: z.string().nullable().optional().default(''),
	image: z.string().nullable().optional().default(''),
	current_price: z.number().nullable().optional().default(0),
	market_cap: z.number().nullable().optional().default(0),
	market_cap_rank: z.number().nullable().optional().default(0),
	total_volume: z.number().nullable().optional().default(0),
	high_24h: z.number().nullable().optional().default(0),
	low_24h: z.number().nullable().optional().default(0),
	price_change_percentage_24h: z.number().nullable().optional().default(0),
	circulating_supply: z.number().nullable().optional().default(0),
	sparkline_in_7d: z
		.union([z.string(), z.object({ price: z.array(z.number()) })])
		.nullable()
		.optional()
		.transform((val) => {
			if (typeof val === 'string') {
				try {
					return JSON.parse(val)
				} catch {
					return { price: [] }
				}
			}
			return val ?? { price: [] }
		}),
	price_change_percentage_7d_in_currency: z.number().nullable().optional().default(0),
})

export const coinsListDataSchema = z.array(coinListSchema)

const trendingItemDataSchema = z
	.object({
		price: z.number().nullable().optional().default(0),
		price_btc: z.string().nullable().optional().default(''),
		price_change_percentage_24h: z
			.object({
				btc: z.number().nullable().optional().default(0),
				usd: z.number().nullable().optional().default(0),
			})
			.nullable()
			.optional()
			.transform((val) => val ?? { btc: 0, usd: 0 }),
		market_cap: z.string().nullable().optional().default(''),
		market_cap_btc: z.union([z.string(), z.number()]).transform((val) => Number(val) || 0),
		total_volume: z.string().nullable().optional().default(''),
		total_volume_btc: z.union([z.string(), z.number()]).transform((val) => Number(val) || 0),
		sparkline: z.string().nullable().optional().default(''),
	})
	.nullable()
	.optional()
	.transform(
		(val) =>
			val ?? {
				price: 0,
				price_btc: '',
				price_change_percentage_24h: { btc: 0, usd: 0 },
				market_cap: '',
				market_cap_btc: 0,
				total_volume: '',
				total_volume_btc: 0,
				sparkline: '',
			},
	)

export const trendingItemSchema = z.object({
	id: z.string(),
	name: z.string(),
	symbol: z.string(),
	market_cap_rank: z.number().nullable().optional().default(0),
	thumb: z.string().nullable().optional().default(''),
	slug: z.string(),
	price_btc: z.number().nullable().optional().default(0),
	data: trendingItemDataSchema,
})

export const trendingCoinSchema = z.object({
	item: trendingItemSchema,
})

export const trendingDataSchema = z.object({
	coins: z.array(trendingCoinSchema),
})

export type TCategoriesData = z.infer<typeof categoriesDataSchema>
export type TCoinsListData = z.infer<typeof coinsListDataSchema>
export type TTrendingData = z.infer<typeof trendingDataSchema>
