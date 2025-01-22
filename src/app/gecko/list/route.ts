import { makeServerReq } from '@/app/api/makeReq'
import { getCgCoinsListRoute } from '@/app/api/ressources'

export async function GET() {
	const url = getCgCoinsListRoute()

	return await makeServerReq(url, 'GET')
}
