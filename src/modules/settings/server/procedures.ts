import { z } from 'zod'
import { TRPCError } from '@trpc/server'

import { prisma } from '@/lib/prisma'
import { saltAndHashPassword } from '@/lib/salt'
import { createTRPCRouter, protectedProcedure } from '@/trpc/init'

export const settingsRouter = createTRPCRouter({
	getProfile: protectedProcedure.query(async ({ ctx }) => {
		const user = await prisma.user.findUnique({
			where: { id: ctx.auth.user.id },
			select: {
				id: true,
				name: true,
				email: true,
				image: true,
				isTwoFactorEnabled: true,
				accounts: {
					select: {
						provider: true,
					},
				},
			},
		})

		return {
			...user,
			isOAuth: (user?.accounts?.length ?? 0) > 0,
		}
	}),

	updateUserInfo: protectedProcedure
		.input(
			z.object({
				email: z.email().optional(),
				name: z.string().optional(),
				password: z.string().optional(),
				isTwoFactorEnabled: z.boolean().optional(),
			}),
		)
		.mutation(async ({ input, ctx }) => {
			const existingUser = await prisma.user.findFirst({
				where: { id: ctx.auth.user.id },
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
				isTwoFactorEnabled?: boolean
			} = {
				name: input.name,
			}

			if (input.email && !hasOAuthAccounts) {
				updatedData.email = input.email
			}

			if (input.password && !hasOAuthAccounts) {
				updatedData.password = await saltAndHashPassword(input.password)
			}

			if (typeof input.isTwoFactorEnabled !== 'undefined') {
				updatedData.isTwoFactorEnabled = input.isTwoFactorEnabled
			}

			const updatedUser = await prisma.user.update({
				where: { id: ctx.auth.user.id },
				data: updatedData,
			})

			return {
				...updatedUser,
				isOAuth: hasOAuthAccounts,
			}
		}),

	deleteUser: protectedProcedure.mutation(async ({ ctx }) => {
		return prisma.user.delete({
			where: { id: ctx.auth.user.id },
			include: {
				accounts: true,
				sessions: true,
				authenticator: true,
			},
		})
	}),
})
