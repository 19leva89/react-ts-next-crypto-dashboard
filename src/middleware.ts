import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'
import { DEFAULT_LOGIN_REDIRECT, apiAuthPrefix, authRoutes, publicRoutes } from '@/routes'

const secret = process.env.NEXTAUTH_SECRET

export async function middleware(req: NextRequest) {
	const { nextUrl } = req
	const { pathname, origin, search } = req.nextUrl

	const token = await getToken({ req, secret })
	const isLoggedIn = !!token

	const isApiAuthRoute = pathname.startsWith(apiAuthPrefix)
	const isAuthRoute = authRoutes.some((route) => pathname === route || pathname.startsWith(route + '/'))
	const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route + '/'))

	// Exclude '/not-auth' from the check to avoid getting stuck
	if (pathname === '/not-auth') {
		return NextResponse.next()
	}

	// 1. Do nothing for API auth routes
	if (isApiAuthRoute) {
		return NextResponse.next()
	}

	// 2. If it's an authorization route and the user is already logged in, redirect
	if (isAuthRoute) {
		if (isLoggedIn) {
			// Redirect logged-in users away from auth routes
			return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl))
		}
		// Allow unauthenticated users to access auth routes
		return NextResponse.next()
	}

	// 3. If this is a secure route and the user is not logged in, redirect to '/not-auth'
	if (!isLoggedIn && !isPublicRoute) {
		const notAuthUrl = new URL('/not-auth', origin)
		notAuthUrl.searchParams.set('callbackUrl', encodeURIComponent(pathname + search))

		return NextResponse.redirect(notAuthUrl)
	}

	// 4. Skip everything else
	return NextResponse.next()
}

// Optionally, don't invoke Middleware on some paths
// API Route Handling Includes '/api' and '/trpc'
// Processing static files Excludes all files with extensions and '_next'
// Main Page Processing '/' Explicitly Enabled
export const config = {
	matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
