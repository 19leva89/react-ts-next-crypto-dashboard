import { compare } from 'bcrypt-ts'
import { JWT } from 'next-auth/jwt'
import { Adapter } from 'next-auth/adapters'
import GitHub from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'
import NextAuth, { Session, User } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Credentials from 'next-auth/providers/credentials'

import { prisma } from '@/lib/prisma'
import { getUserByEmail } from '@/data/user'
import { createLoginNotification } from '@/app/api/actions'
import { formLoginSchema } from '@/components/shared/modals/auth-modal/forms/schemas'

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
				const validatedFields = formLoginSchema.safeParse(credentials)
				if (!validatedFields.success) return null

				const { email, password } = validatedFields.data
				if (!email || !password) return null

				const user = await getUserByEmail(email)
				if (!user || !user.emailVerified || user.accounts?.length > 0 || !user.password) {
					return null
				}

				const isPasswordValid = await compare(password, user.password)
				if (!isPasswordValid) return null

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
]

export const authOptions = {
	adapter: PrismaAdapter(prisma) as Adapter,

	secret: process.env.NEXTAUTH_SECRET,

	providers,

	session: {
		strategy: 'jwt' as const,
		maxAge: 30 * 60, // 30 minutes
		updateAge: 10 * 60, // 10 minutes
	},

	callbacks: {
		async jwt({ token }: { token: JWT }) {
			if (!token.email) return token

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
}

export const {
	handlers: { GET, POST },
	auth,
	signIn,
	signOut,
} = NextAuth(authOptions)
