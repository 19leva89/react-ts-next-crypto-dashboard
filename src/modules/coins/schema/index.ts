import { z } from 'zod'

export const WALLETS = {
	BINANCE: 'Binance',
	GATE: 'Gate',
	LEDGER: 'Ledger',
	MEXC: 'MEXC',
	PROBIT_GLOBAL: 'ProBit Global',
	OTHER: 'Other',
} as const

export const walletSchema = z.enum(Object.keys(WALLETS) as [keyof typeof WALLETS, ...string[]])

export const transactionSchema = z.object({
	id: z.string(),
	quantity: z.number(),
	price: z.number(),
	date: z.string(),
	wallet: walletSchema,
	userCoinId: z.string(),
})

export const userCoinDataSchema = z.object({
	coinId: z.string(),
	name: z.string(),
	symbol: z.string(),
	image: z.string(),
	current_price: z.number(),
	total_quantity: z.number(),
	total_cost: z.number(),
	average_price: z.number(),
	desired_sell_price: z.number().optional(),
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
	wallet: walletSchema.optional().default('OTHER'),
	image: z.string().optional(),
})

export type TTransaction = z.infer<typeof transactionSchema>
export type TUserCoinData = z.infer<typeof userCoinDataSchema>
export type TMarketChartData = z.infer<typeof marketChartDataSchema>
export type TAddCoinToUserInput = z.infer<typeof addCoinToUserSchema>
export type TWallet = z.infer<typeof walletSchema>
