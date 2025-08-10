import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

import { DEFAULT_LOGIN_REDIRECT, apiAuthPrefix, apiCronPrefix, authRoutes, publicRoutes } from '@/routes'

const secret = process.env.AUTH_SECRET

export async function middleware(req: NextRequest) {
	const { nextUrl } = req
	const { pathname, protocol, search } = req.nextUrl

	//! Important to set secureCookie
	const token = await getToken({ req, secret, secureCookie: protocol === 'https:' })
	const isLoggedIn = !!token

	const isAuthRoute = authRoutes.includes(pathname)
	const isApiAuthRoute = pathname.startsWith(apiAuthPrefix)
	const isApiCronRoute = pathname.startsWith(apiCronPrefix)
	const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route + '/'))

	// 1. Do nothing for API auth routes and cron API requests
	if (isApiAuthRoute || isApiCronRoute) {
		return NextResponse.next()
	}

	// 2. If it's an authorization route and the user is already logged in, redirect
	if (isAuthRoute) {
		if (isLoggedIn) {
			// Redirect logged-in users away from auth routes
			return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl))
		}
		// Allow unauthenticated users to access auth routes
		return NextResponse.next()
	}

	// 3. If this is a secure route and the user is not logged in, redirect to '/not-auth'
	if (!isLoggedIn && !isPublicRoute) {
		// Redirect unauthenticated users to the login page
		let callbackUrl = pathname
		if (search) {
			callbackUrl += search
		}

		const encodedCallbackUrl = encodeURIComponent(callbackUrl)

		return NextResponse.redirect(new URL(`/auth/not-auth?callbackUrl=${encodedCallbackUrl}`, nextUrl))
	}

	// 4. Allow access to public routes or logged-in users
	return NextResponse.next()
}

// Optionally, don't invoke Middleware on some paths
// API Route Handling Includes '/api' and '/trpc'
// Processing static files Excludes all files with extensions and '_next'
// Main Page Processing '/' Explicitly Enabled
export const config = {
	matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
