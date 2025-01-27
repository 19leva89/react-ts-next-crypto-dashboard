import { auth } from '@/constants/auth-options'

export const getUserSession = async () => {
	const session = await auth()

	return session?.user ?? null
}
