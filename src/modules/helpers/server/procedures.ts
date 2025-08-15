import { TRPCError } from '@trpc/server'

import { prisma } from '@/lib/prisma'
import { baseProcedure, createTRPCRouter } from '@/trpc/init'
import { TExchangeRate, exchangeRateSchema } from '@/modules/helpers/schema'

export const helpersRouter = createTRPCRouter({
	getExchangeRate: baseProcedure.query(async (): Promise<TExchangeRate> => {
		const exchangeRate = await prisma.exchangeRate.findFirst()

		if (!exchangeRate) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: 'Exchange rate not found',
			})
		}

		return exchangeRateSchema.parse(exchangeRate)
	}),
})
