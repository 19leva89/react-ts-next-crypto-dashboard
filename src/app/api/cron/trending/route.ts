import { NextRequest, NextResponse } from 'next/server'

import { updateTrendingData } from '@/app/api/actions'

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

		await updateTrendingData()

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Failed to update trending:', error)

		return NextResponse.json({ error: 'Failed to update trending' }, { status: 500 })
	}
}
