import { JWT } from 'next-auth/jwt'
import { UserRole } from '@prisma/client'
import { Adapter } from 'next-auth/adapters'
import NextAuth, { Session, User } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'

import { prisma } from '@/lib/prisma'
import authConfig from '@/auth.config'
import { getUserById } from '@/data/user'
import { getAccountByUserId } from '@/data/account'
import { createLoginNotification } from '@/actions/login'
import { getTwoFactorConfirmationByUserId } from '@/data/two-factor-confirmation'

export const { auth, handlers, signIn, signOut } = NextAuth({
	adapter: PrismaAdapter(prisma) as Adapter,

	session: {
		strategy: 'jwt',
		maxAge: 30 * 60, // 30 minutes
		updateAge: 10 * 60, // 10 minutes
	},

	callbacks: {
		async signIn(params) {
			const { user, account } = params

			// Allow OAuth without email verification
			if (account?.provider !== 'credentials') return true

			if (!user.id) {
				return false // Reject sign-in if user ID is undefined
			}

			const existingUser = await getUserById(user.id)

			// Prevent sign in without email verification
			if (!existingUser?.emailVerified) return false

			if (existingUser.isTwoFactorEnabled) {
				const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id)

				if (!twoFactorConfirmation) return false

				// Delete two-factor confirmation for next sign in
				await prisma.twoFactorConfirmation.delete({
					where: { id: twoFactorConfirmation.id },
				})
			}

			return true
		},

		async session({ session, token }: { session: Session; token: JWT }) {
			if (token.sub && session.user) {
				session.user.id = token.sub
			}

			if (token.role && session.user) {
				session.user.role = token.role as UserRole
			}

			if (session.user) {
				session.user.name = token.name
				session.user.email = token.email
				session.user.isOAuth = token.isOAuth as boolean
				session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean
			}

			return session
		},

		async jwt({ token }: { token: JWT }) {
			if (!token.sub) return token

			const existingUser = await getUserById(token.sub)

			if (!existingUser) return token

			const existingAccount = await getAccountByUserId(existingUser.id)

			token.isOAuth = !!existingAccount
			token.name = existingUser.name
			token.email = existingUser.email
			token.role = existingUser.role
			token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled

			return token
		},
	},

	events: {
		async signIn({ user }: { user: User }) {
			if (user.id) {
				await createLoginNotification(user.id)
			}
		},
	},

	...authConfig,
})
