import { NextRequest } from 'next/server'

import { makeServerReq } from '@/app/api/make-request'
import { getCgCoinsDataRoute } from '@/app/api/ressources'

export async function GET(request: NextRequest, context: { params: { coinId: string } }) {
	const url = getCgCoinsDataRoute(context.params.coinId)

	return await makeServerReq(url, 'GET')
}
