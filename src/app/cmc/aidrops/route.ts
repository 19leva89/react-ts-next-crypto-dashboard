import { makeServerReq } from '@/app/api/makeReq'
import { getCmcOngoingAidropsDataRoute, getCmcUpcomingAidropsDataRoute } from '@/app/api/ressources'

export async function GET() {
	const ongoingUrl = getCmcOngoingAidropsDataRoute()
	const upcomingUrl = getCmcUpcomingAidropsDataRoute()
	const aidropsData: Record<string, any> = { data: [] }

	const ongoingResp = await makeServerReq(ongoingUrl, 'GET', false)
	const upcominResp = await makeServerReq(upcomingUrl, 'GET', false)

	if (ongoingResp.ok) {
		const ongoingAidrops = await ongoingResp.json()
		aidropsData.data = [...ongoingAidrops.data]
	}

	if (upcominResp.ok) {
		const upcomingAidrops = await upcominResp.json()
		aidropsData.data = [...aidropsData.data, ...upcomingAidrops.data]
	}

	if (aidropsData.data.length > 0) {
		return Response.json(aidropsData, { status: 200 })
	}

	if (ongoingResp.ok && upcominResp.ok) {
		return Response.json(aidropsData, { status: 200 })
	}

	return !ongoingResp.ok ? ongoingResp : upcominResp
}
