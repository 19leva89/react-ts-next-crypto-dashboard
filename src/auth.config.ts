import { compare } from 'bcryptjs'
import { UserRole } from '@prisma/client'
import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'
import GitHub from 'next-auth/providers/github'
import Credentials from 'next-auth/providers/credentials'

import { prisma } from '@/lib/prisma'

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
			credentials: {
				email: { label: 'Email', type: 'email' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				try {
					if (!credentials?.email || !credentials?.password) return null

					const user = await prisma.user.findUnique({
						where: { email: credentials.email as string },
						include: { accounts: true },
					})

					if (!user) {
						return null
					}

					if (user.accounts?.length > 0) {
						return null
					}

					if (!user.emailVerified) {
						return null
					}

					if (!user.password) return null

					const isPasswordValid = await compare(credentials.password as string, user.password)

					if (!isPasswordValid) {
						return null
					}

					return {
						id: user.id,
						email: user.email,
						name: user.name,
						role: user.role,
					}
				} catch (error) {
					console.error('Authorization error:', error)
					return null
				}
			},
		}),
	],
} satisfies NextAuthConfig
