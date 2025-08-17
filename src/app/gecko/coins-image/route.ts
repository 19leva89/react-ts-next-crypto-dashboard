import { NextRequest, NextResponse } from 'next/server'

import { makeServerReq } from '@/app/api/make-request'
import { getCgCoinsListIDMapImage } from '@/app/api/resources'

export async function GET(req: NextRequest) {
	try {
		// Ensure non-null, valid values for query params
		const pageParam = req.nextUrl.searchParams.get('page') ?? '1'
		const perPageParam = req.nextUrl.searchParams.get('per_page') ?? '100'

		// Basic numeric validation (positive integers)
		const pageNum = Number(pageParam)
		const perPageNum = Number(perPageParam)
		if (!Number.isInteger(pageNum) || pageNum <= 0 || !Number.isInteger(perPageNum) || perPageNum <= 0) {
			return new NextResponse(
				JSON.stringify({ error: 'Invalid query params: page and per_page must be positive integers' }),
				{
					status: 400,
					headers: { 'Content-Type': 'application/json' },
				},
			)
		}

		const url = getCgCoinsListIDMapImage(String(pageNum), String(perPageNum))

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
		return new NextResponse(JSON.stringify({ error: 'Failed to fetch image data' }), {
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
