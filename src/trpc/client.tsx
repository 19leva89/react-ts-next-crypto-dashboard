'use client'
// ^-- to make sure we can mount the Provider from a server component

import { PropsWithChildren, useState } from 'react'
import type { QueryClient } from '@tanstack/react-query'
import { QueryClientProvider } from '@tanstack/react-query'
import { createTRPCContext } from '@trpc/tanstack-react-query'
import { createTRPCClient, httpBatchLink, TRPCClient } from '@trpc/client'

import { absoluteUrl } from '@/lib/utils'
import type { AppRouter } from '@/trpc/routers/_app'
import { makeQueryClient } from '@/trpc/query-client'

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>()

let browserQueryClient: QueryClient

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

export function TRPCReactProvider(props: PropsWithChildren) {
	// NOTE: Avoid useState when initializing the query client if you don't
	//       have a suspense boundary between this and the code that may
	//       suspend because React will throw away the client on the initial
	//       render if it suspends and there is no boundary
	const queryClient = getQueryClient()

	const [trpcClient] = useState<TRPCClient<AppRouter>>(() =>
		createTRPCClient<AppRouter>({
			links: [
				httpBatchLink({
					// transformer: superjson, <-- if you use a data transformer
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
