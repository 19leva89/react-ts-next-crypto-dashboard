import { prisma } from '@/lib/prisma'
import { createTRPCRouter, protectedProcedure } from '@/trpc/init'

export const transactionsRouter = createTRPCRouter({
	getAll: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.auth.user.id

		const transactions = await prisma.userCoinTransaction.findMany({
			where: { userCoin: { userId } },
			include: {
				userCoin: {
					include: {
						coinsListIDMap: {
							select: {
								id: true,
								symbol: true,
								name: true,
							},
						},
						coin: {
							select: {
								image: true,
							},
						},
					},
				},
			},
			orderBy: { date: 'desc' },
		})

		return transactions.map((t) => ({
			...t,
			userCoin: {
				coin: {
					id: t.userCoin.coinsListIDMap.id,
					name: t.userCoin.coinsListIDMap.name,
					symbol: t.userCoin.coinsListIDMap.symbol,
					image: t.userCoin.coin.image,
				},
			},
		}))
	}),
})
