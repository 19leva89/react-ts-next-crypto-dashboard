import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import GitHub from 'next-auth/providers/github'
import Credentials from 'next-auth/providers/credentials'

import { compare } from 'bcryptjs'
import { Adapter } from 'next-auth/adapters'
import { PrismaAdapter } from '@auth/prisma-adapter'

import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import { saltAndHashPassword } from '@/lib/salt'

export const { auth, handlers, signIn, signOut } = NextAuth({
	adapter: PrismaAdapter(prisma) as Adapter,
	providers: [
		Google({
			clientId: process.env.GOOGLE_CLIENT_ID || '',
			clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
		}),

		GitHub({
			clientId: process.env.GITHUB_ID || '',
			clientSecret: process.env.GITHUB_SECRET || '',
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
				if (!credentials || !credentials.email || !credentials.password) {
					return null
				}

				const email = credentials.email as string

				const user = await prisma.user.findFirst({
					where: {
						email,
					},
				})

				if (!user) {
					return null
				}

				const isPasswordValid = await compare(credentials.password as string, user.password)

				if (!isPasswordValid) {
					return null
				}

				if (!user.emailVerified) {
					return null
				}

				return {
					id: user.id.toString(),
					email: user.email,
					name: user.name,
					image: user.image,
					role: user.role,
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
		async signIn({ user, account }) {
			try {
				if (account?.provider === 'credentials') {
					return true
				}

				if (!user.email || !account?.provider || !account?.providerAccountId) {
					return false
				}

				// Проверяем, существует ли аккаунт
				const existingAccount = await prisma.account.findUnique({
					where: {
						provider_providerAccountId: {
							provider: account.provider,
							providerAccountId: account.providerAccountId,
						},
					},
				})

				if (existingAccount) {
					return true // Пользователь уже зарегистрирован
				}

				// Если аккаунт не найден, проверяем пользователя по email
				const existingUser = await prisma.user.findUnique({
					where: { email: user.email },
				})

				if (existingUser) {
					// Привязываем новый провайдер к существующему пользователю
					await prisma.account.create({
						data: {
							userId: existingUser.id,
							type: account.type,
							provider: account.provider,
							providerAccountId: account.providerAccountId,
							refresh_token: account.refresh_token,
							access_token: account.access_token,
							expires_at: account.expires_at,
							token_type: account.token_type,
							scope: account.scope,
							id_token: account.id_token,
							session_state: account.session_state ? String(account.session_state) : null,
						},
					})

					return true
				}

				// Создаем нового пользователя и привязываем аккаунт
				await prisma.user.create({
					data: {
						email: user.email,
						name: user.name || `User #${user.id}`,
						password: await saltAndHashPassword(user.id as string),
						image: user.image,
						emailVerified: new Date(),
						role: 'USER', // Задаем роль по умолчанию
						accounts: {
							create: {
								type: account.type,
								provider: account.provider,
								providerAccountId: account.providerAccountId,
								refresh_token: account.refresh_token,
								access_token: account.access_token,
								expires_at: account.expires_at,
								token_type: account.token_type,
								scope: account.scope,
								id_token: account.id_token,
								session_state: account.session_state ? String(account.session_state) : null,
							},
						},
					},
				})

				return true
			} catch (error) {
				console.error('Error [SIGNIN]', error)
				return false
			}
		},

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
				session.user.role = token.role
			}

			return session
		},

		// authorized({ auth }) {
		// 	const isAuthenticated = !!auth?.user

		// 	return isAuthenticated
		// },
	},
})
