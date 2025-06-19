import { z } from 'zod'

export const transactionSchema = z.object({
	id: z.string(),
	quantity: z.number(),
	price: z.number(),
	date: z.string(),
	userCoinId: z.string(),
})

export const userCoinDataSchema = z.object({
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
	transactions: z.array(transactionSchema),
})

export const marketChartDataSchema = z.object({
	prices: z.array(z.tuple([z.number(), z.number()])),
})

export const addCoinToUserSchema = z.object({
	coinId: z.string(),
	quantity: z.number(),
	price: z.number(),
	image: z.string(),
})

export type Transaction = z.infer<typeof transactionSchema>
export type UserCoinData = z.infer<typeof userCoinDataSchema>
export type MarketChartData = z.infer<typeof marketChartDataSchema>
export type AddCoinToUserInput = z.infer<typeof addCoinToUserSchema>
