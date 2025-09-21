import superjson from 'superjson'
import { defaultShouldDehydrateQuery, QueryClient } from '@tanstack/react-query'

/**
 * Creates a new instance of the QueryClient with default options
 * @returns {QueryClient} The newly created QueryClient instance
 */
export function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 30 * 1000,
			},
			dehydrate: {
				serializeData: superjson.serialize,
				shouldDehydrateQuery: (query) =>
					defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
			},
			hydrate: {
				deserializeData: superjson.deserialize,
			},
		},
	})
}
