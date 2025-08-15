import { NextRequest, NextResponse } from 'next/server'

import { updateCoinsMarketChart } from '@/actions/cron'

export const maxDuration = 10

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

		await updateCoinsMarketChart(1)

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Failed to update MarketChart:', error)

		return NextResponse.json({ error: 'Failed to update MarketChart' }, { status: 500 })
	}
}
