import z from 'zod'

import { prisma } from '@/lib/prisma'
import { createTRPCRouter, protectedProcedure } from '@/trpc/init'

export const notificationsRouter = createTRPCRouter({
	addNotification: protectedProcedure
		.input(
			z.object({
				type: z.enum(['LOGIN', 'LOGOUT', 'PRICE_ALERT']),
				coinId: z.string().optional(),
			}),
		)
		.mutation(async ({ input: { type, coinId }, ctx }) => {
			const data: any = {
				userId: ctx.auth.user.id,
				type,
				title: type === 'PRICE_ALERT' ? 'Price Alert' : type,
				message: type === 'PRICE_ALERT' ? 'Price alert triggered' : `${type} successful`,
			}

			if (coinId) {
				data.coinId = coinId
			}

			await prisma.notification.create({
				data,
			})
		}),

	addLoginNotification: protectedProcedure.mutation(async ({ ctx }) => {
		await prisma.notification.create({
			data: {
				userId: ctx.auth.user.id,
				type: 'LOGIN',
				title: 'Login',
				message: 'You have successfully logged in',
			},
		})
	}),

	addLogoutNotification: protectedProcedure.mutation(async ({ ctx }) => {
		await prisma.notification.create({
			data: {
				userId: ctx.auth.user.id,
				type: 'LOGOUT',
				title: 'Logout',
				message: 'You have been logged out',
			},
		})
	}),

	getNotifications: protectedProcedure.query(async ({ ctx }) => {
		return prisma.notification.findMany({
			where: {
				userId: ctx.auth.user.id,
			},
		})
	}),

	markAsRead: protectedProcedure.input(z.string()).mutation(async ({ input: notificationId, ctx }) => {
		await prisma.notification.update({
			where: {
				id: notificationId,
				userId: ctx.auth.user.id,
			},
			data: {
				isRead: true,
			},
		})
	}),

	markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
		await prisma.notification.updateMany({
			where: {
				userId: ctx.auth.user.id,
			},
			data: {
				isRead: true,
			},
		})
	}),
})
