import { NextRequest } from 'next/server'

import { makeServerReq } from '@/app/api/makeReq'
import { getCgCoinsMarketChartRoute } from '@/app/api/ressources'

export function GET(request: NextRequest, context: { params: { coinId: string } }) {
	const url = getCgCoinsMarketChartRoute(context.params.coinId)
	return makeServerReq(url, 'GET')
}
