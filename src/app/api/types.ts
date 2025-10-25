import { PrismaClient } from '../../../prisma/generated'

export type PrismaTransactionClient = Omit<
	PrismaClient,
	'$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>

export type CoinData = {
	id: string
	quantity?: number
	symbol: string
	name: string
	description: {
		en?: string
	}
	image: {
		thumb: string
	}
	market_cap_rank: number
	market_data: {
		current_price: {
			usd: number
		}
		market_cap: {
			usd: number
		}
		high_24h: {
			usd: number
		}
		low_24h: {
			usd: number
		}
		circulating_supply: number
		sparkline_7d: {
			price: number[]
		}
	}
}

export type Airdrop = {
	id: string
	projectName: string
	description: string
	status: 'UPCOMING' | 'ONGOING' | 'ENDED'
	coin: {
		id: string
		name: string
		symbol: string
	}
	startDate: Date
	endDate: Date
	totalPrize: number
	winnerCount: number
	link: string
}

export type AirdropsData = {
	data: Airdrop[]
}
