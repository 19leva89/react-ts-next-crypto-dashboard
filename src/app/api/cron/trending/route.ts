import { connection, NextRequest, NextResponse } from 'next/server'

import { updateTrendingData } from '@/actions/cron'

export const maxDuration = 60

/**
 * Handles GET requests for updating trending data via cron job
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

		await updateTrendingData()

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Failed to update trending:', error)

		return NextResponse.json({ error: 'Failed to update trending' }, { status: 500 })
	}
}
