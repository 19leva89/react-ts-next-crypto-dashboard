import { compare } from 'bcryptjs'
import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'
import GitHub from 'next-auth/providers/github'
import Credentials from 'next-auth/providers/credentials'

import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

export default {
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

					// If the user has an OAuth account, prohibit login by password
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
} satisfies NextAuthConfig
