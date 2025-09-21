import { cache } from 'react'
import { initTRPC, TRPCError } from '@trpc/server'
// import superjson from 'superjson'

import { auth } from '@/auth'

/**
 * Creates TRPC context with user session data
 * @returns Promise containing user ID from session
 */
export const createTRPCContext = cache(async () => {
	const session = await auth()

	return { userId: session?.user?.id }
})

// Avoid exporting the entire t-object since it's not very descriptive.
// For instance, the use of a t variable is common in i18n libraries.
const t = initTRPC.context<typeof createTRPCContext>().create({
	// transformer: superjson,

	/**
	 * This function formats errors returned by the TRPC server
	 * @param opts - The options object
	 * @param opts.shape - The shape of the error
	 * @param opts.error - The error object
	 * @returns The formatted error object
	 * @see https://trpc.io/docs/server/data-transformers
	 */
	errorFormatter: ({ shape, error }) => ({
		...shape,
		data: {
			...shape.data,
			zodError: error.cause?.message,
		},
	}),
})

// Base router and procedure helpers
export const createTRPCRouter = t.router
export const createCallerFactory = t.createCallerFactory

export const baseProcedure = t.procedure

/**
 * Protected procedure that requires user authentication
 */
export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
	const session = await auth()

	if (!session) {
		throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Unauthorized' })
	}

	return next({ ctx: { ...ctx, auth: session } })
})
