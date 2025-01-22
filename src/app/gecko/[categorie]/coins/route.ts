import { NextRequest } from 'next/server'

import { makeServerReq } from '@/app/api/makeReq'
import { getCgCoinsListByCateRoute } from '@/app/api/ressources'

export function GET(request: NextRequest, context: { params: { categorie: string } }) {
	const url = getCgCoinsListByCateRoute(context.params.categorie)

	return makeServerReq(url, 'GET')
}
