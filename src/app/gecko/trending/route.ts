import { makeServerReq } from '@/app/api/makeReq'
import { getCgTrendingRoute } from '@/app/api/ressources'

export async function GET() {
	const url = getCgTrendingRoute()

	return await makeServerReq(url, 'GET')
}
