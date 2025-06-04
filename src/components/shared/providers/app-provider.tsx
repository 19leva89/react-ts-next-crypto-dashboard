import { PropsWithChildren } from 'react'
import NextTopLoader from 'nextjs-toploader'
import { SessionProvider } from 'next-auth/react'

import { TRPCReactProvider } from '@/trpc/client'

export const AppProvider = ({ children }: PropsWithChildren) => {
	return (
		<>
			<SessionProvider>
				<TRPCReactProvider>{children}</TRPCReactProvider>
			</SessionProvider>

			<NextTopLoader showSpinner={false} />
		</>
	)
}
