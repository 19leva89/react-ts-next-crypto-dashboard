import { NextRequest, NextResponse } from 'next/server'

import { makeServerReq } from '@/app/api/make-request'
import { getCgCoinsMarketChartRoute } from '@/app/api/ressources'

export async function GET(req: NextRequest, context: { params: any }) {
	try {
		const { coinId } = await context.params
		const url = getCgCoinsMarketChartRoute(coinId)

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
