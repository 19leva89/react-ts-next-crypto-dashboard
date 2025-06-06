import { auth } from '@/auth'
import { createTRPCRouter, protectedProcedure } from '@/trpc/init'

export const settingsRouter = createTRPCRouter({
	getProfile: protectedProcedure.query(async () => {
		const session = await auth()

		return session?.user ?? null
	}),
})
