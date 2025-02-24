import { NextRequest, NextResponse } from 'next/server'

import { ValidDays } from '@/app/api/constants'
import { makeServerReq } from '@/app/api/make-request'
import { getCgCoinsMarketChartRoute } from '@/app/api/resources'

export async function GET(req: NextRequest, context: { params: any }) {
	try {
		const { coinId } = await context.params
		const daysParam = req.nextUrl.searchParams.get('days')
		const days = daysParam ? parseInt(daysParam) : 1

		if (![1, 7, 30, 365].includes(days)) {
			return new NextResponse(
				JSON.stringify({ error: 'Invalid days parameter. Allowed values: 1, 7, 30, 365' }),
				{
					status: 400,
					headers: { 'Content-Type': 'application/json' },
				},
			)
		}

		const url = getCgCoinsMarketChartRoute(coinId, days as ValidDays)

		// Execute a request to the server
		const result = await makeServerReq(url, 'GET')

		// Check the status and return the appropriate response
		if (result.status === 200) {
			return new NextResponse(JSON.stringify(result.data), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			})
		}

		// If there is an error, return it
		return new NextResponse(JSON.stringify({ error: 'Failed to fetch trending data' }), {
			status: result.status,
			headers: { 'Content-Type': 'application/json' },
		})
	} catch (error) {
		console.error('Error in GET handler:', error)

		// Returning server error
		return new NextResponse(JSON.stringify({ error: 'Server error' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		})
	}
}
