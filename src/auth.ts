import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import GitHub from 'next-auth/providers/github'
import Credentials from 'next-auth/providers/credentials'

import { compare } from 'bcryptjs'
import { Adapter } from 'next-auth/adapters'
import { PrismaAdapter } from '@auth/prisma-adapter'

import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

export const { auth, handlers, signIn, signOut } = NextAuth({
	adapter: PrismaAdapter(prisma) as Adapter,
	providers: [
		Google({
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		}),

		GitHub({
			clientId: process.env.GITHUB_ID,
			clientSecret: process.env.GITHUB_SECRET,
			profile(profile) {
				return {
					id: profile.id.toString(),
					name: profile.name || profile.login,
					email: profile.email,
					image: profile.avatar_url,
					role: 'USER' as UserRole,
				}
			},
		}),

		Credentials({
			name: 'Credentials',
			credentials: {
				email: { label: 'Email', type: 'email', placeholder: 'email@example.com' },
				password: { label: 'Password', type: 'password' },
			},

			authorize: async (credentials) => {
				try {
					if (!credentials?.email || !credentials?.password) {
						console.error('Email and password are required')
						return null
					}

					const user = await prisma.user.findUnique({
						where: { email: credentials.email as string },
						include: { accounts: true },
					})

					if (!user) {
						console.error('Invalid password or email')
						return null
					}

					// Если у пользователя есть OAuth аккаунт, запрещаем вход по паролю
					if (user.accounts.length > 0) {
						console.error('This email is linked to a social login. Please use GitHub or Google')
						return null
					}

					const isPasswordValid = await compare(credentials.password as string, user.password ?? '')

					if (!isPasswordValid) {
						console.error('Invalid password or email')
						return null
					}

					if (!user.emailVerified) {
						console.error('Email is not verified')
						return null
					}

					return {
						id: user.id.toString(),
						email: user.email,
						name: user.name,
						image: user.image,
						role: user.role,
					}
				} catch (error) {
					console.error('Error in authorize callback:', error)
					return null
				}
			},
		}),
	],

	secret: process.env.NEXTAUTH_SECRET,

	session: {
		strategy: 'jwt',
		maxAge: 30 * 60,
		updateAge: 10 * 60,
	},

	callbacks: {
		async jwt({ token }) {
			if (!token.email) {
				return token
			}

			const findUser = await prisma.user.findUnique({
				where: { email: token.email },
				select: { id: true, email: true, name: true, image: true, role: true },
			})

			if (findUser) {
				token.id = findUser.id
				token.email = findUser.email
				token.name = findUser.name
				token.image = findUser.image
				token.role = findUser.role
			}

			return token
		},

		session({ session, token }) {
			if (session?.user) {
				session.user.id = token.id
				session.user.email = token.email
				session.user.role = token.role
			}

			return session
		},
	},
})
