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

	secret: process.env.AUTH_SECRET,

	trustHost: process.env.AUTH_TRUST_PROXY !== 'false',

	session: {
		strategy: 'jwt',
		maxAge: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24, // 1 day
	},

	callbacks: {
		async signIn(params) {
			const { user, account } = params

			if (!user.id) {
				return false // Reject sign-in if user ID is undefined
			}

			const existingUser = await getUserById(user.id)

			// If the user is found and already has a linked account
			if (existingUser?.accounts?.length) {
				const provider = existingUser.accounts[0].provider
				if (provider !== account?.provider) {
					throw new Error(
						`This account can only be accessed with ${provider.charAt(0).toUpperCase() + provider.slice(1)} login`,
					)
				}
			}

			if (account?.provider === 'credentials') {
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
				session.user.rememberMe = token.rememberMe as boolean
			}

			if (token.exp) {
				session.expires = new Date(token.exp * 1000).toISOString()
			}

			return session
		},

		async jwt({ token, user, trigger, session }) {
			const now = Math.floor(Date.now() / 1000)
			const ONE_DAY = 60 * 60 * 24
			const SEVEN_DAYS = ONE_DAY * 7

			if (user) {
				const rememberMe = typeof user.rememberMe === 'boolean' ? user.rememberMe : true

				token.rememberMe = rememberMe
				token.exp = now + (rememberMe ? SEVEN_DAYS : ONE_DAY)
			}

			if (trigger === 'update' && typeof session?.rememberMe === 'boolean') {
				token.rememberMe = session.rememberMe
				token.exp = now + (session.rememberMe ? SEVEN_DAYS : ONE_DAY)
			}

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
