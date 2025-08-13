import { z } from 'zod'

const sourceSchema = z.object({
	id: z.string().nullable(),
	name: z.string(),
})

export const articleSchema = z.object({
	source: sourceSchema,
	author: z.string().nullable(),
	title: z.string(),
	description: z.string().nullable(),
	url: z.url(),
	urlToImage: z.url().nullable(),
	publishedAt: z.iso.datetime(),
	content: z.string().nullable(),
})

export const newsResponseSchema = z.array(articleSchema)

export type TArticle = z.infer<typeof articleSchema>
export type TNewsResponse = z.infer<typeof newsResponseSchema>
