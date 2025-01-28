import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

import { Api } from '@/services/api-client'

export const useUserInfo = () => {
	const { data: session } = useSession()

	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<boolean>(false)
	const [user, setUser] = useState<{ name: string; email: string; image: string } | null>(null)

	useEffect(() => {
		// Check if the user is logged in
		if (session) {
			const fetchUserInfo = async () => {
				try {
					setLoading(true)
					const data = await Api.auth.getMe()

					if (data.name && data.email) {
						setUser({ name: data.name, email: data.email, image: data.image ?? '' })
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
		} else {
			// If the user is not logged in
			setUser(null)
			setError(false)
			setLoading(false)
		}
	}, [session])

	return { user, loading, error }
}
