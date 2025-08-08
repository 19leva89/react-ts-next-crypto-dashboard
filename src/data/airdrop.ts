import { prisma } from '@/lib/prisma'
import { makeReq } from '@/app/api/make-request'
import { handleError } from '@/lib/handle-error'
import { Airdrop, AirdropsData } from '@/app/api/types'

export const getAirdrops = async (): Promise<AirdropsData> => {
	try {
		// Getting airdrop data from the DB
		const cachedData = await prisma.airdrop.findMany({
			include: {
				coin: { select: { id: true } },
				coinsListIDMap: { select: { name: true, symbol: true } },
			},
		})

		// If the airdrops data already exists in the DB, return it
		if (cachedData.length) {
			console.log('✅ Using cached Airdrops from DB')

			return {
				data: cachedData.map(({ coin, coinsListIDMap, start_date, end_date, ...rest }) => ({
					...rest,
					coin: { id: coin.id, ...coinsListIDMap },
					startDate: new Date(start_date.toISOString()),
					endDate: new Date(end_date.toISOString()),
					projectName: rest.project_name,
					totalPrize: rest.total_prize,
					winnerCount: rest.winner_count,
				})),
			}
		}

		// If there is no data or it is outdated, request it via API
		console.log('🔄 Outdated records, request Airdrops via API...')
		const response = await makeReq('GET', '/cmc/airdrops')

		if (!response || !Array.isArray(response.data) || !response.data.length) {
			console.warn('⚠️ Empty response from API, using old Airdrops')

			return { data: [] } as AirdropsData
		}

		const transformAirdropData = (airdrop: Airdrop) => ({
			project_name: airdrop.projectName,
			description: airdrop.description,
			status: airdrop.status,
			coinId: airdrop.coin.id,
			coinsListIDMapId: airdrop.coin.id,
			start_date: new Date(airdrop.startDate),
			end_date: new Date(airdrop.endDate),
			total_prize: airdrop.totalPrize,
			winner_count: airdrop.winnerCount,
			link: airdrop.link,
		})

		// Batch processing via transaction
		const upsertOperations = response.data.map((airdrop: Airdrop) =>
			prisma.airdrop.upsert({
				where: { id: airdrop.id },
				update: transformAirdropData(airdrop),
				create: {
					id: airdrop.id,
					...transformAirdropData(airdrop),
				},
			}),
		)

		await prisma.$transaction(upsertOperations)

		// Returning current data from DB
		const updatedData = await prisma.airdrop.findMany({
			include: {
				coin: { select: { id: true } },
				coinsListIDMap: { select: { name: true, symbol: true } },
			},
		})

		console.log('✅ Records Airdrops updated!')

		return {
			data: updatedData.map(({ coin, coinsListIDMap, start_date, end_date, ...rest }) => ({
				...rest,
				coin: { id: coin.id, ...coinsListIDMap },
				startDate: new Date(start_date),
				endDate: new Date(end_date),
				projectName: rest.project_name,
				totalPrize: rest.total_prize,
				winnerCount: rest.winner_count,
			})),
		}
	} catch (error) {
		handleError(error, 'GET_AIRDROPS')

		return { data: [] } as AirdropsData
	}
}
