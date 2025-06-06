import { createTRPCRouter } from '@/trpc/init'
import { coinsRouter } from '@/modules/coins/server/procedures'
import { chartsRouter } from '@/modules/charts/server/procedures'
import { settingsRouter } from '@/modules/settings/server/procedures'
import { dashboardRouter } from '@/modules/dashboard/server/procedures'

export const appRouter = createTRPCRouter({
	coins: coinsRouter,
	charts: chartsRouter,
	settings: settingsRouter,
	dashboard: dashboardRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
