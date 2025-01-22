import { NextRequest } from 'next/server'

import { makeServerReq } from '@/app/api/makeReq'
import { getCgCoinsListByCateRoute } from '@/app/api/ressources'

export async function GET(
	request: NextRequest,
	context: { params: { categorie: string } }, // Убедитесь, что типизация правильная
) {
	const { params } = context
	const url = getCgCoinsListByCateRoute(params.categorie)
	return await makeServerReq(url, 'GET')
}
