import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

const secret = process.env.NEXTAUTH_SECRET

const protectedRoutes = [
	'/billing',
	'/cards',
	'/charts',
	'/coins',
	'/notifications',
	'/settings',
	'/transactions',
]

export async function middleware(req: NextRequest) {
	const { pathname, origin, search } = req.nextUrl

	const isProtected = protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))
	if (!isProtected) return NextResponse.next()

	const token = await getToken({ req, secret })
	if (!token) {
		const absoluteURL = new URL('/not-auth', origin)

		absoluteURL.searchParams.set('callbackUrl', `${pathname}${search}`)

		return NextResponse.redirect(absoluteURL)
	}

	return NextResponse.next()
}

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
