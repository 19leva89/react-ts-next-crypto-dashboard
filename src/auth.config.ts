import { compare } from 'bcrypt-ts'
import type { NextAuthConfig } from 'next-auth'
import GitHub from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'

import { getUserByEmail } from '@/data/user'
import { LoginSchema } from '@/components/shared/modals/auth-modal/forms/schemas'

export default {
	providers: [
		Google({
			clientId: process.env.AUTH_GOOGLE_ID,
			clientSecret: process.env.AUTH_GOOGLE_SECRET,
		}),
		GitHub({
			clientId: process.env.AUTH_GITHUB_ID,
			clientSecret: process.env.AUTH_GITHUB_SECRET,
		}),
		Credentials({
			credentials: {
				email: { label: 'Email', type: 'email' },
				password: { label: 'Password', type: 'password' },
				rememberMe: { label: 'Remember me', type: 'checkbox' },
			},
			async authorize(credentials) {
				try {
					const validatedFields = LoginSchema.safeParse(credentials)

					if (!validatedFields.success) {
						throw new Error('Invalid fields')
					}

					const { email, password, rememberMe } = validatedFields.data
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

					return {
						id: user.id,
						email: user.email,
						name: user.name,
						role: user.role,
						isTwoFactorEnabled: user.isTwoFactorEnabled,
						isOAuth: user.accounts?.length > 0,
						rememberMe,
					}
				} catch (error) {
					console.error('Authorization error:', error)
					return null
				}
			},
		}),
	],
} satisfies NextAuthConfig
