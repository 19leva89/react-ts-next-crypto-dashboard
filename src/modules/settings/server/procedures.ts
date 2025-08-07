import { z } from 'zod'
import { TRPCError } from '@trpc/server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { saltAndHashPassword } from '@/lib/salt'
import { createTRPCRouter, protectedProcedure } from '@/trpc/init'

export const settingsRouter = createTRPCRouter({
	getProfile: protectedProcedure.query(async () => {
		const session = await auth()

		return session?.user ?? null
	}),

	updateUserInfo: protectedProcedure
		.input(
			z.object({
				email: z.email().optional(),
				name: z.string().optional(),
				password: z.string().optional(),
			}),
		)
		.mutation(async ({ input }) => {
			const session = await auth()

			if (!session?.user) throw new TRPCError({ code: 'UNAUTHORIZED' })

			const existingUser = await prisma.user.findFirst({
				where: { id: session.user.id },
				include: { accounts: true },
			})

			if (!existingUser) throw new TRPCError({ code: 'NOT_FOUND' })

			const hasOAuthAccounts = existingUser.accounts.length > 0

			if (hasOAuthAccounts) {
				if (input.email && input.email !== existingUser.email)
					throw new TRPCError({ code: 'BAD_REQUEST', message: 'Email cannot be changed for OAuth users' })

				if (input.password)
					throw new TRPCError({ code: 'BAD_REQUEST', message: 'Password cannot be changed for OAuth users' })
			}

			if (input.email && input.email !== existingUser.email && !hasOAuthAccounts) {
				const emailExists = await prisma.user.findUnique({
					where: { email: input.email },
				})

				if (emailExists) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Email is already in use' })
			}

			const updatedData: {
				name?: string
				email?: string
				password?: string | null
			} = {
				name: input.name,
			}

			if (!hasOAuthAccounts) {
				updatedData.email = input.email ?? existingUser.email
				updatedData.password = input.password
					? await saltAndHashPassword(input.password)
					: existingUser.password
			}

			return prisma.user.update({
				where: { id: session.user.id },
				data: updatedData,
			})
		}),

	deleteUser: protectedProcedure.mutation(async () => {
		const session = await auth()

		if (!session?.user) throw new TRPCError({ code: 'UNAUTHORIZED' })

		return prisma.user.delete({
			where: { id: session.user.id },
			include: {
				accounts: true,
				sessions: true,
				verificationCode: true,
			},
		})
	}),
})
