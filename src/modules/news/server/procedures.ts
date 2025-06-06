import { cryptoNews } from '@/modules/news/server/data'
import { createTRPCRouter, baseProcedure } from '@/trpc/init'

export const newsRouter = createTRPCRouter({
	getCryptoNews: baseProcedure.query(() => cryptoNews),
})
