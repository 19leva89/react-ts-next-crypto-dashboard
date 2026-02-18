import { connection, NextRequest, NextResponse } from 'next/server'

import { updateCoinsMarketChart } from '@/actions/cron'

export const maxDuration = 60

/**
 * Handles GET requests for updating coins market chart data via cron job
 * Updates market chart data for 1 day period
 * Requires Bearer token authorization using CRON_SECRET environment variable
 * @returns JSON response indicating success or error
 */
export async function GET(req: NextRequest) {
	await connection()

	try {
		// Checking authorization for cron requests
		const authHeader = req.headers.get('authorization')

		const secret = process.env.CRON_SECRET

		if (authHeader !== `Bearer ${secret}`) {
			return new NextResponse('Unauthorized', {
				status: 401,
			})
		}

		await updateCoinsMarketChart(1)

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Failed to update MarketChart:', error)

		return NextResponse.json({ error: 'Failed to update MarketChart' }, { status: 500 })
	}
}
