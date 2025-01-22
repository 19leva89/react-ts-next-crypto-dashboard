import { makeServerReq } from '@/app/api/makeReq'
import { getCgCategoriesRoute } from '@/app/api/ressources'

export async function GET() {
	const url = getCgCategoriesRoute()

	return await makeServerReq(url, 'GET')
}
