import { baseProcedure, createTRPCRouter } from '@/trpc/init'
import { getCoinsList, getCategories, getTrendingData } from '@/app/api/actions'

export const dashboardRouter = createTRPCRouter({
	getCoinsList: baseProcedure.query(async () => {
		const coins = await getCoinsList()

		return coins
	}),

	getCategories: baseProcedure.query(async () => {
		const categories = await getCategories()

		return categories
	}),

	getTrending: baseProcedure.query(async () => {
		const trending = await getTrendingData()

		return trending
	}),
})
