import { z } from 'zod'

export const transactionSchema = z.object({
	id: z.string(),
	amount: z.number(),
	price: z.number(),
	date: z.string(),
	quantity: z.number(),
	createdAt: z.string(),
	updatedAt: z.string(),
	userCoin: z.object({
		coin: z.object({
			id: z.string(),
			symbol: z.string(),
			name: z.string(),
			image: z.string().nullable(),
		}),
	}),
})

export type Transaction = z.infer<typeof transactionSchema>
