import 'server-only' // <-- ensure this file cannot be imported from the client

import { cache } from 'react'
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query'

import { appRouter } from '@/trpc/routers/_app'
import { createTRPCContext } from '@/trpc/init'
import { makeQueryClient } from '@/trpc/query-client'

// IMPORTANT: Create a stable getter for the query client that will return the same client during the same request
export const getQueryClient = cache(makeQueryClient)

export const trpc = createTRPCOptionsProxy({
	ctx: createTRPCContext,
	router: appRouter,
	queryClient: getQueryClient,
})
