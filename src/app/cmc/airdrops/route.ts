import { NextResponse } from 'next/server'

import { makeServerReq } from '@/app/api/make-request'
import { getCmcOngoingAirdropsDataRoute, getCmcUpcomingAirdropsDataRoute } from '@/app/api/resources'

/**
 * Handles GET requests to fetch combined ongoing and upcoming airdrops data from CoinMarketCap API
 * Combines data from both ongoing and upcoming airdrops endpoints
 * @returns JSON response containing combined airdrops data or error response
 */
export async function GET() {
	const ongoingUrl = getCmcOngoingAirdropsDataRoute()
	const upcomingUrl = getCmcUpcomingAirdropsDataRoute()
	const airdropsData: Record<string, any> = { data: [] }

	const ongoingResp = await makeServerReq(ongoingUrl, 'GET', false)
	const upcomingResp = await makeServerReq(upcomingUrl, 'GET', false)

	if (ongoingResp.ok) {
		const ongoingAirdrops = await ongoingResp.json()
		airdropsData.data = [...ongoingAirdrops.data]
	}

	if (upcomingResp.ok) {
		const upcomingAirdrops = await upcomingResp.json()
		airdropsData.data = [...airdropsData.data, ...upcomingAirdrops.data]
	}

	if (airdropsData.data.length > 0) {
		return NextResponse.json(airdropsData, { status: 200 })
	}

	if (ongoingResp.ok && upcomingResp.ok) {
		return NextResponse.json(airdropsData, { status: 200 })
	}

	return !ongoingResp.ok ? ongoingResp : upcomingResp
}
