import NextAuth from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

import { authOptions } from '@/auth'

const { auth } = NextAuth(authOptions)

const protectedRoutes = [
	'/billing',
	'/cards',
	'/charts',
	'/coins',
	'/notifications',
	'/settings',
	'/transactions',
]

export default auth(async function middleware(req: NextRequest) {
	const session = await auth()

	const isProtected = protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

	if (!session && isProtected) {
		const absoluteURL = new URL('/not-auth', req.nextUrl.origin)

		return NextResponse.redirect(absoluteURL.toString())
	}

	return NextResponse.next()
})

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
	runtime: 'nodejs',
}
