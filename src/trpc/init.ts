import { cache } from 'react'
import { initTRPC, TRPCError } from '@trpc/server'

import { auth } from '@/auth'

export const createTRPCContext = cache(async () => {
	const session = await auth()

	return { userId: session?.user?.id }
})

// Avoid exporting the entire t-object since it's not very descriptive.
// For instance, the use of a t variable is common in i18n libraries.
const t = initTRPC.create({
	/**
	 * @see https://trpc.io/docs/server/data-transformers
	 */
	// transformer: superjson,
})

// Base router and procedure helpers
export const createTRPCRouter = t.router
export const createCallerFactory = t.createCallerFactory

export const baseProcedure = t.procedure

export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
	const session = await auth()

	if (!session) {
		throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Unauthorized' })
	}

	return next({ ctx: { ...ctx, auth: session } })
})
