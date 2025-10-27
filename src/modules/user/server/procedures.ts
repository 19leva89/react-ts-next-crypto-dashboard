import z from 'zod'

import { prisma } from '@/lib/prisma'
import { createTRPCRouter, protectedProcedure } from '@/trpc/init'

export const userRouter = createTRPCRouter({
	getDoNotDisturb: protectedProcedure.query(async ({ ctx }) => {
		const user = await prisma.user.findUnique({
			where: { id: ctx.auth.user.id },
			select: { doNotDisturb: true },
		})

		return user?.doNotDisturb ?? false
	}),

	setDoNotDisturb: protectedProcedure
		.input(z.object({ enabled: z.boolean() }))
		.mutation(async ({ ctx, input }) => {
			const user = await prisma.user.update({
				where: { id: ctx.auth.user.id },
				data: { doNotDisturb: input.enabled },
			})

			return { doNotDisturb: user.doNotDisturb }
		}),
})
