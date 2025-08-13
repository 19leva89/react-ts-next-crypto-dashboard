import { NextRequest, NextResponse } from 'next/server'

import { getCryptoNews } from '@/lib/newsapi'

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
