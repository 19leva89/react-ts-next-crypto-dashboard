import { NextRequest, NextResponse } from 'next/server'

import { updateUserCoinData } from '@/actions/user'

/**
 * Handles GET requests to update user coin data for a specific coin
 * @param _req - The incoming Next.js request object (unused)
 * @param context - Route context containing dynamic route parameters
 * @param context.params - Parameters object containing the coinId parameter
 * @returns JSON response indicating success or error
 */
export async function GET(_req: NextRequest, context: { params: Promise<{ coinId: string }> }) {
	try {
		const { coinId } = await context.params

		await updateUserCoinData(coinId)

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Failed to update user coin:', error)

		return NextResponse.json({ error: 'Failed to update user coin' }, { status: 500 })
	}
}
