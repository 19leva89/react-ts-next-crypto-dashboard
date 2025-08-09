import { compare } from 'bcrypt-ts'
import { JWT } from 'next-auth/jwt'
import { UserRole } from '@prisma/client'
import { Adapter } from 'next-auth/adapters'
import GitHub from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Credentials from 'next-auth/providers/credentials'
import NextAuth, { Account, Session, User } from 'next-auth'

import { prisma } from '@/lib/prisma'
import { getAccountByUserId } from '@/data/account'
import { createLoginNotification } from '@/actions/login'
import { getUserByEmail, getUserById } from '@/data/user'
import { LoginSchema } from '@/components/shared/modals/auth-modal/forms/schemas'
import { getTwoFactorConfirmationByUserId } from '@/data/two-factor-confirmation'

const providers = [
	Google({
		clientId: process.env.GOOGLE_CLIENT_ID!,
		clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
	}),
	GitHub({
		clientId: process.env.GITHUB_ID!,
		clientSecret: process.env.GITHUB_SECRET!,
	}),
	Credentials({
		credentials: {
			email: { label: 'Email', type: 'email' },
			password: { label: 'Password', type: 'password' },
		},
		async authorize(credentials) {
			try {
				const validatedFields = LoginSchema.safeParse(credentials)

				if (!validatedFields.success) {
					throw new Error('Invalid fields')
				}

				const { email, password } = validatedFields.data
				const user = await getUserByEmail(email)

				// Enforce all checks here
				if (!user || !user.password) {
					throw new Error('Invalid credentials')
				}

				if (user.accounts?.length > 0) {
					throw new Error('Account uses social login')
				}

				if (!user.emailVerified) {
					throw new Error('Email not verified')
				}

				const passwordsMatch = await compare(password, user.password)
				if (!passwordsMatch) {
					throw new Error('Invalid credentials')
				}

				return user
			} catch (error) {
				console.error('Authorization error:', error)
				return null
			}
		},
	}),
]

export const authOptions: any = {
	adapter: PrismaAdapter(prisma) as Adapter,

	secret: process.env.NEXTAUTH_SECRET,

	providers,

	session: {
		strategy: 'jwt' as const,
		maxAge: 30 * 60, // 30 minutes
		updateAge: 10 * 60, // 10 minutes
	},

	callbacks: {
		async signIn({ user, account }: { user: User; account: Account | null }) {
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
}

export const {
	handlers: { GET, POST },
	auth,
	signIn,
	signOut,
} = NextAuth(authOptions)
