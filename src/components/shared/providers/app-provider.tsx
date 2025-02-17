import NextTopLoader from 'nextjs-toploader'
import { PropsWithChildren } from 'react'
import { SessionProvider } from 'next-auth/react'

export const AppProvider = ({ children }: PropsWithChildren) => {
	return (
		<>
			<SessionProvider>{children}</SessionProvider>

			<NextTopLoader showSpinner={false} />
		</>
	)
}
