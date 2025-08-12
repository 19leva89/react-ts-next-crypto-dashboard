import { z } from 'zod'

export const transactionSchema = z.object({
	id: z.string(),
	quantity: z.number(),
	price: z.number(),
	date: z.string(),
	userCoin: z.object({
		coin: z.object({
			id: z.string(),
			symbol: z.string(),
			name: z.string(),
			image: z.string().nullable(),
		}),
	}),
	createdAt: z.string(),
	updatedAt: z.string(),
})

export type TTransaction = z.infer<typeof transactionSchema>
