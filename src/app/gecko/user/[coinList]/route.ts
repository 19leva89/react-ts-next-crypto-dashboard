import { NextRequest, NextResponse } from 'next/server'

import { makeServerReq } from '@/app/api/make-request'
import { getCgUserCoinsListRoute } from '@/app/api/resources'

/**
 * Handles GET requests to fetch user-specific coins list data from CoinGecko API
 * @param _req - The incoming Next.js request object (unused)
 * @param context - Route context containing dynamic route parameters
 * @param context.params - Parameters object containing the coinList parameter
 * @returns JSON response containing user coins data or error message
 */
export async function GET(_req: NextRequest, context: { params: any }) {
	try {
		const { coinList } = await context.params
		const url = getCgUserCoinsListRoute(coinList)

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
		return new NextResponse(JSON.stringify({ error: 'Failed to fetch user coins' }), {
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
