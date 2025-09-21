'use client'
// ^-- to make sure we can mount the Provider from a server component

// import superjson from 'superjson'
import { PropsWithChildren, useState } from 'react'
import type { QueryClient } from '@tanstack/react-query'
import { QueryClientProvider } from '@tanstack/react-query'
import { createTRPCContext } from '@trpc/tanstack-react-query'
import { createTRPCClient, httpBatchLink, loggerLink, TRPCClient } from '@trpc/client'

import { absoluteUrl } from '@/lib'
import type { AppRouter } from '@/trpc/routers/_app'
import { makeQueryClient } from '@/trpc/query-client'

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>()

let browserQueryClient: QueryClient

/**
 * Gets or creates a QueryClient instance
 * On server: always creates a new client
 * On browser: reuses existing client or creates new one if none exists
 * @returns QueryClient instance
 */
function getQueryClient() {
	if (typeof window === 'undefined') {
		// Server: always make a new query client
		return makeQueryClient()
	}

	// Browser: make a new query client if we don't already have one
	// This is very important, so we don't re-make a new client if React
	// suspends during the initial render. This may not be needed if we
	// have a suspense boundary BELOW the creation of the query client
	if (!browserQueryClient) browserQueryClient = makeQueryClient()

	return browserQueryClient
}

const fullUrl = absoluteUrl('/api/trpc')

/**
 * TRPC React Provider component that wraps the application with TRPC and React Query providers
 * @param props - Component props containing children
 * @returns JSX element with TRPC and Query providers
 */
export function TRPCReactProvider(props: PropsWithChildren) {
	// NOTE: Avoid useState when initializing the query client if you don't
	//       have a suspense boundary between this and the code that may
	//       suspend because React will throw away the client on the initial
	//       render if it suspends and there is no boundary
	const queryClient = getQueryClient()

	const [trpcClient] = useState<TRPCClient<AppRouter>>(() =>
		createTRPCClient<AppRouter>({
			links: [
				loggerLink({
					enabled: (opts) =>
						process.env.NODE_ENV === 'development' ||
						(opts.direction === 'down' && opts.result instanceof Error),
				}),

				httpBatchLink({
					// transformer: superjson,
					url: fullUrl,
				}),
			],
		}),
	)

	return (
		<QueryClientProvider client={queryClient}>
			<TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
				{props.children}
			</TRPCProvider>
		</QueryClientProvider>
	)
}
