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
	const token = await getToken({ req, secret })

	const isProtected = protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

	if (!token && isProtected) {
		const absoluteURL = new URL('/not-auth', req.nextUrl.origin)

		return NextResponse.redirect(absoluteURL.toString())
	}

	return NextResponse.next()
}

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
