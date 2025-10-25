import { DefaultJWT } from 'next-auth/jwt'
import { type DefaultUser } from 'next-auth'

import { UserRole } from '../prisma/generated'

declare module 'next-auth' {
	interface User extends DefaultUser {
		role: UserRole
		isTwoFactorEnabled: boolean
		isOAuth: boolean
		rememberMe: boolean
	}

	interface Session {
		user: User
		rememberMe: boolean
	}
}

declare module 'next-auth/jwt' {
	interface JWT extends DefaultJWT {
		id: string
		role: UserRole
		isTwoFactorEnabled: boolean
		isOAuth: boolean
		rememberMe: boolean
	}
}
