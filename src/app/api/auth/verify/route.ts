import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { getUserByEmail } from '@/data/user'
import { getVerificationTokenByToken } from '@/data/verification-token'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
	try {
		const token = req.nextUrl.searchParams.get('token')

		if (!token) {
			return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
		}

		const existingToken = await getVerificationTokenByToken(token)

		if (!existingToken) {
			return NextResponse.json({ error: 'Token does not exist!' }, { status: 400 })
		}

		const hasExpired = new Date(existingToken.expires) < new Date()

		if (hasExpired) {
			return NextResponse.json({ error: 'Token has expired!' }, { status: 400 })
		}

		const existingUser = await getUserByEmail(existingToken.email)

		if (!existingUser) {
			return NextResponse.json({ error: 'Email does not exist!' }, { status: 400 })
		}

		await prisma.user.update({
			where: {
				id: existingUser.id,
			},
			data: {
				emailVerified: new Date(),
				email: existingToken.email,
			},
		})

		await prisma.verificationToken.delete({
			where: {
				id: existingToken.id,
			},
		})

		return NextResponse.redirect(new URL('/?verified', req.url))
	} catch (error) {
		console.log(error)
		return NextResponse.json({ message: '[VERIFY_GET] Server error' }, { status: 500 })
	}
}
