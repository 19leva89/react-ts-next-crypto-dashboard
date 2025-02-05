'use server'

import { NextRequest, NextResponse } from 'next/server'

import { updateCoinsList } from '@/app/api/actions'

export async function GET(req: NextRequest) {
	try {
		await updateCoinsList()

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Failed to update user coins:', error)

		return NextResponse.json({ error: 'Failed to update user coins' }, { status: 500 })
	}
}
