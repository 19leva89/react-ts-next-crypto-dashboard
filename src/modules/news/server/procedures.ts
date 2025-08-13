import z from 'zod'

import { getCryptoNews } from '@/lib/newsapi'
import { createTRPCRouter, baseProcedure } from '@/trpc/init'

export const newsRouter = createTRPCRouter({
	getCryptoNews: baseProcedure
		.input(
			z.object({
				page: z.number().min(1).default(1),
			}),
		)
		.query(async ({ input }) => {
			const { articles, totalResults } = await getCryptoNews(input.page)

			return { articles, totalResults: Math.min(totalResults, 96) }
		}),
})
