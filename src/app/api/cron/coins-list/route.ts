'use server'

import { NextRequest, NextResponse } from 'next/server'

import { updateCoinsList } from '@/app/api/actions'

export async function GET(req: NextRequest) {
	try {
		// Проверка авторизации для cron-запросов
		const authHeader = req.headers.get('authorization')

		if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
			return new NextResponse('Unauthorized', {
				status: 401,
			})
		}

		await updateCoinsList()

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Failed to update user coins:', error)

		return NextResponse.json({ error: 'Failed to update user coins' }, { status: 500 })
	}
}
