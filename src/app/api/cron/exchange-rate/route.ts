import { NextRequest, NextResponse } from 'next/server'

import { updateExchangeRate } from '@/actions/cron'

export const maxDuration = 10

/**
 * Handles GET requests for updating exchange rates via cron job
 * Requires Bearer token authorization using CRON_SECRET environment variable
 * @param req - The incoming Next.js request object
 * @returns JSON response indicating success or error
 */
export async function GET(req: NextRequest) {
	try {
		// Checking authorization for cron requests
		const authHeader = req.headers.get('authorization')

		const secret = process.env.CRON_SECRET

		if (authHeader !== `Bearer ${secret}`) {
			return new NextResponse('Unauthorized', {
				status: 401,
			})
		}

		await updateExchangeRate()

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Failed to update exchange rate:', error)

		return NextResponse.json({ error: 'Failed to update exchange rate' }, { status: 500 })
	}
}
