import { NextRequest, NextResponse } from 'next/server'

import { updateUserCoinsList } from '@/actions/user'

/**
 * Handles GET requests to update user's coins list data
 * Requires userId as a query parameter
 * @param req - The incoming Next.js request object containing query parameters
 * @returns JSON response indicating success or error
 */
export async function GET(req: NextRequest) {
	try {
		const userId = req.nextUrl.searchParams.get('userId')
		if (!userId) throw new Error('User ID is required')

		await updateUserCoinsList(userId)

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Failed to update user coins:', error)

		return NextResponse.json({ error: 'Failed to update user coins' }, { status: 500 })
	}
}
