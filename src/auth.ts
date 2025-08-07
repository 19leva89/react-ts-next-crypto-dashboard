import { JWT } from 'next-auth/jwt'
import { Adapter } from 'next-auth/adapters'
import NextAuth, { Session, User } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'

import { prisma } from '@/lib/prisma'
import authConfig from '@/auth.config'
import { createLoginNotification } from '@/app/api/actions'

export const authOptions: any = {
	adapter: PrismaAdapter(prisma) as Adapter,

	secret: process.env.NEXTAUTH_SECRET,

	session: {
		strategy: 'jwt',
		maxAge: 30 * 60, // 30 minutes
		updateAge: 10 * 60, // 10 minutes
	},

	callbacks: {
		async jwt({ token }: { token: JWT }) {
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

		async session({ session, token }: { session: Session; token: JWT }) {
			if (session.user) {
				session.user.id = token.id as string
				session.user.email = token.email as string
				session.user.role = token.role as string
			}

			return session
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
}

export const {
	handlers: { GET, POST },
	auth,
	signIn,
	signOut,
} = NextAuth(authOptions)
