import { PrismaClient } from '@prisma/client'

export type PrismaTransactionClient = Omit<
	PrismaClient,
	'$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>

export type CategoriesData = {
	category_id: string
	name: string
}[]

export type CoinsListIDMapData = {
	id: string
	symbol: string
	name: string
	image?: string
}[]

export type CoinListData = {
	id: string
	symbol?: string
	name?: string
	description: string | null
	image: string | null
	current_price: number | null
	market_cap: number | null
	market_cap_rank: number | null
	total_volume: number | null
	high_24h: number | null
	low_24h: number | null
	price_change_percentage_24h: number | null
	circulating_supply: number | null
	sparkline_in_7d: {
		price: number[]
	} | null
	price_change_percentage_7d_in_currency: number | null
}

export type CoinsListData = CoinListData[]

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
	}
}

export type TrendingData = {
	coins: {
		item: {
			id: string
			coin_id: number
			name: string
			symbol: string
			market_cap_rank: number
			thumb: string
			slug: string
			price_btc: number
			data: {
				price: number
				price_btc: string
				price_change_percentage_24h: {
					btc: number
					usd: number
				}
				market_cap: string
				market_cap_btc: string
				total_volume: string
				total_volume_btc: string
				sparkline: string
			}
		}
	}[]
}

export type MarketChartData = {
	prices: [number, number][]
	coin: {
		current_price: number
		description: string
		image: string
		market_cap_rank: number
		market_cap: number
		circulating_supply: number
		high_24h: number
		low_24h: number
		coinsListIDMap: {
			id: string
			symbol: string
			name: string
		}
	}
}

export type AidropsData = {
	data: {
		id: string
		project_name: string
		description: string
		status: 'UPCOMING' | 'ONGOING' | 'ENDED'
		coin: {
			id: string
			name: string
			symbol: string
		}
		start_date: string
		end_date: string
		total_prize: number
		winner_count: number
		link: string
	}[]
}
