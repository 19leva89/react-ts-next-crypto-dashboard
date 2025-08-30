import { z } from 'zod'

// Schema for browser metadata
const browserDetailsSchema = z.object({
	name: z.string(),
	os: z.string(),
	device: z.string(),
})

// Schema for cryptocurrency data
const coinDataSchema = z.object({
	coinId: z.string(),
	price: z.number().optional(),
	change: z.number().optional(),
	priceThreshold: z.number().optional(),
})

// Schema for notification metadata
const notificationMetadataSchema = z
	.object({
		device: z.string().optional(),
		loginTime: z.string().optional(),
		securityAlert: z.boolean().optional(),
		browserDetails: browserDetailsSchema.optional(),
		coinData: coinDataSchema.optional(),
		location: z
			.object({
				country: z.string().optional(),
				city: z.string().optional(),
				region: z.string().optional(),
			})
			.optional(),
		sessionId: z.string().optional(),
	})
	.optional()

export const notificationSchema = z.object({
	id: z.string(),
	userId: z.string(),
	title: z.string(),
	message: z.string(),
	type: z.enum(['LOGIN', 'LOGOUT', 'PRICE_ALERT', 'SECURITY', 'SYSTEM', 'COIN_NEWS']),
	isRead: z.boolean().default(false),
	ipAddress: z.string().nullable().optional(),
	location: z.string().nullable().optional(),
	browser: z.string().nullable().optional(),
	os: z.string().nullable().optional(),
	userAgent: z.string().nullable().optional(),
	metadata: notificationMetadataSchema,
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

// Scheme for creating a notification
export const createNotificationSchema = z.object({
	userId: z.string(),
	title: z.string(),
	message: z.string(),
	type: z.enum(['LOGIN', 'LOGOUT', 'PRICE_ALERT', 'SECURITY', 'SYSTEM', 'COIN_NEWS']),
	isRead: z.boolean().default(false),
	ipAddress: z.string().optional(),
	location: z.string().optional(),
	browser: z.string().optional(),
	os: z.string().optional(),
	userAgent: z.string().optional(),
	metadata: notificationMetadataSchema,
	coinId: z.string().optional(),
})

export type TNotification = z.infer<typeof notificationSchema>
export type TCreateNotification = z.infer<typeof createNotificationSchema>
export type TNotificationMetadata = z.infer<typeof notificationMetadataSchema>
export type TBrowserDetails = z.infer<typeof browserDetailsSchema>
export type TCoinData = z.infer<typeof coinDataSchema>
