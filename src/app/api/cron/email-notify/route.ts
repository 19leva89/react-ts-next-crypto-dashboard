import { NextRequest, NextResponse } from 'next/server'

import { notifyUsersOnPriceTarget } from '@/app/api/actions'

export const maxDuration = 60

export async function GET(req: NextRequest) {
	try {
		// Checking authorization for cron requests
		const authHeader = req.headers.get('authorization')

		if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
			return new NextResponse('Unauthorized', {
				status: 401,
			})
		}

		await notifyUsersOnPriceTarget()

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Failed to send emails:', error)

		return NextResponse.json({ error: 'Failed to send emails' }, { status: 500 })
	}
}
