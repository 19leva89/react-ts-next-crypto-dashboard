'use client'

import NextTopLoader from 'nextjs-toploader'
import { Toaster } from 'react-hot-toast'
import { PropsWithChildren } from 'react'
import { SessionProvider } from 'next-auth/react'

export const AppProvider = ({ children }: PropsWithChildren) => {
	return (
		<>
			<SessionProvider>{children}</SessionProvider>

			<Toaster />

			<NextTopLoader showSpinner={false} />
		</>
	)
}
