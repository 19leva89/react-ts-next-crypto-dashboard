import { NextRequest, NextResponse } from 'next/server'

import { getCryptoNews } from '@/lib/news-api'

/**
 * Handles GET requests for fetching cryptocurrency news articles
 * Supports pagination via 'page' query parameter
 * @param req - The incoming Next.js request object
 * @returns JSON response containing articles and total results count, or error message
 */
export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url)
	const page = Number(searchParams.get('page') || 1)

	try {
		// Execute a request to the server
		const { articles, totalResults } = await getCryptoNews(page)

		// Check the status and return the appropriate response
		return NextResponse.json({ articles, totalResults }, { status: 200 })
	} catch (error) {
		console.error('Error in GET handler:', error)

		// Returning server error
		return NextResponse.json({ error: 'Server error' }, { status: 500 })
	}
}
