import { z } from 'zod'

export const notificationSchema = z.object({
	id: z.string(),
	title: z.string(),
	message: z.string(),
	type: z.enum(['LOGIN', 'LOGOUT', 'PRICE_ALERT']),
	isRead: z.boolean().default(false),
	coinId: z.string().nullable().optional(),
	coin: z
		.object({
			id: z.string(),
			name: z.string(),
			symbol: z.string(),
			image: z.string().optional(),
		})
		.optional(),
	createdAt: z.string().or(z.date()),
	updatedAt: z.string().or(z.date()),
})

export type TNotification = z.infer<typeof notificationSchema>
