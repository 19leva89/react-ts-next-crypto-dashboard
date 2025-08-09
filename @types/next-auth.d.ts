// Ref: https://next-auth.js.org/getting-started/typescript#module-augmentation

import { DefaultJWT } from 'next-auth/jwt'
import type { UserRole } from '@prisma/client'
import { type DefaultSession } from 'next-auth'

export type ExtendedUser = DefaultSession['user'] & {
	role: UserRole
	isTwoFactorEnabled: boolean
	isOAuth: boolean
}

declare module 'next-auth' {
	interface Session {
		user: ExtendedUser
	}
}

declare module 'next-auth/jwt' {
	interface JWT extends DefaultJWT {
		id: string
		role: UserRole
	}
}
