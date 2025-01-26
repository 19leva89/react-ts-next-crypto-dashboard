import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

import { Api } from '@/services/api-client'

export const useUserInfo = () => {
	const { data: session } = useSession()

	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<boolean>(false)
	const [user, setUser] = useState<{ name: string; email: string; avatar: string } | null>(null)

	useEffect(() => {
		const fetchUserInfo = async () => {
			try {
				setLoading(true)
				const data = await Api.auth.getMe()

				if (data.fullName && data.email) {
					setUser({ name: data.fullName, email: data.email, avatar: data.avatar ?? '' })
				}
			} catch (err) {
				console.error('Error fetching user data:', err)

				setError(true)

				setUser(null)
			} finally {
				setLoading(false)
			}
		}

		fetchUserInfo()
	}, [session])

	return { user, loading, error }
}
