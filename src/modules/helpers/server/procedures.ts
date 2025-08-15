import z from 'zod'
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

	setExchangeRate: baseProcedure
		.input(
			z.object({
				vsCurrencies: z.record(z.string(), z.number()),
				selectedCurrency: z.string(),
			}),
		)
		.mutation(async ({ input: { vsCurrencies, selectedCurrency } }) => {
			if (!vsCurrencies) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'vsCurrencies is required',
				})
			}

			const exchangeRate = await prisma.exchangeRate.update({
				where: { id: 'exchange-rate' },
				data: { vsCurrencies, selectedCurrency },
			})

			return exchangeRateSchema.parse(exchangeRate)
		}),
})
