import { createTRPCRouter } from '@/trpc/init'
import { userRouter } from '@/modules/user/server/procedures'
import { newsRouter } from '@/modules/news/server/procedures'
import { coinsRouter } from '@/modules/coins/server/procedures'
import { chartsRouter } from '@/modules/charts/server/procedures'
import { settingsRouter } from '@/modules/settings/server/procedures'
import { dashboardRouter } from '@/modules/dashboard/server/procedures'
import { transactionsRouter } from '@/modules/transactions/server/procedures'
import { notificationsRouter } from '@/modules/notifications/server/procedures'

export const appRouter = createTRPCRouter({
	user: userRouter,
	news: newsRouter,
	coins: coinsRouter,
	charts: chartsRouter,
	settings: settingsRouter,
	dashboard: dashboardRouter,
	transactions: transactionsRouter,
	notifications: notificationsRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
