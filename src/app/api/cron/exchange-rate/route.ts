import { NextRequest, NextResponse } from 'next/server'

import { updateExchangeRate } from '@/actions/cron'

export const maxDuration = 10

export async function GET(req: NextRequest) {
	try {
		// Checking authorization for cron requests
		const authHeader = req.headers.get('authorization')

		if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
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
