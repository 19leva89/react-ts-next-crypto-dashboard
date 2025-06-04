import { createTRPCRouter } from '@/trpc/init'
import { chartsRouter } from '@/modules/charts/server/procedures'

export const appRouter = createTRPCRouter({
	charts: chartsRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
