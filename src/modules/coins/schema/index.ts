import { z } from 'zod'

export const TransactionSchema = z.object({
	id: z.string(),
	quantity: z.number(),
	price: z.number(),
	date: z.string(),
	userCoinId: z.string(),
})

export const UserCoinDataSchema = z.object({
	coinId: z.string(),
	name: z.string(),
	symbol: z.string(),
	current_price: z.number(),
	total_quantity: z.number(),
	total_cost: z.number(),
	average_price: z.number(),
	desired_sell_price: z.number().optional(),
	image: z.string(),
	sparkline_in_7d: z.object({
		price: z.array(z.number()),
	}),
	price_change_percentage_7d_in_currency: z.number().optional(),
	transactions: z.array(TransactionSchema),
})

export const MarketChartDataSchema = z.object({
	prices: z.array(z.tuple([z.number(), z.number()])),
})

export type Transaction = z.infer<typeof TransactionSchema>
export type UserCoinData = z.infer<typeof UserCoinDataSchema>
export type MarketChartData = z.infer<typeof MarketChartDataSchema>
