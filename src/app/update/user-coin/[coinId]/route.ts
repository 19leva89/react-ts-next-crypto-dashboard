import { NextRequest, NextResponse } from 'next/server'

import { updateUserCoinData } from '@/actions/user'

export async function GET(req: NextRequest, context: { params: any }) {
	try {
		const { coinId } = await context.params

		await updateUserCoinData(coinId)

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Failed to update user coin:', error)

		return NextResponse.json({ error: 'Failed to update user coin' }, { status: 500 })
	}
}
