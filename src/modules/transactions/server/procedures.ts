import { TRPCError } from '@trpc/server'

import { prisma } from '@/lib/prisma'
import { createTRPCRouter, protectedProcedure } from '@/trpc/init'

export const transactionsRouter = createTRPCRouter({
	getAll: protectedProcedure.query(async ({ ctx }) => {
		if (!ctx.auth?.user?.id) {
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: 'User must be authenticated',
			})
		}

		const userId = ctx.auth.user.id

		const transactions = await prisma.userCoinTransaction.findMany({
			where: { userCoin: { userId } },
			include: {
				userCoin: {
					include: {
						coinsListIDMap: true,
					},
				},
			},
			orderBy: { date: 'desc' },
		})

		return transactions.map((t) => ({
			...t,
			userCoin: {
				coin: t.userCoin.coinsListIDMap,
			},
		}))
	}),
})
