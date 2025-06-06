import { createTRPCRouter } from '@/trpc/init'
import { coinsRouter } from '@/modules/coins/server/procedures'
import { chartsRouter } from '@/modules/charts/server/procedures'
import { settingsRouter } from '@/modules/settings/server/procedures'

export const appRouter = createTRPCRouter({
	coins: coinsRouter,
	charts: chartsRouter,
	settings: settingsRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
