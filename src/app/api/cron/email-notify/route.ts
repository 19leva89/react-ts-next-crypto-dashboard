import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

import { notifyUsersOnPriceTarget } from '@/actions/user'

export const maxDuration = 60

/**
 * Handles GET requests for sending price target notifications to users via cron job
 * Requires Bearer token authorization using CRON_SECRET environment variable
 * @returns JSON response indicating success or error
 */
export async function GET() {
	try {
		// Checking authorization for cron requests
		const headersList = await headers()
		const authHeader = headersList.get('authorization')

		const secret = process.env.CRON_SECRET

		if (authHeader !== `Bearer ${secret}`) {
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
