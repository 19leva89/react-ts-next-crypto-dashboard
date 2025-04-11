import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'
import GitHub from 'next-auth/providers/github'

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
	],
} satisfies NextAuthConfig
