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
	description: string
	image: string
	current_price: number
	market_cap: number
	market_cap_rank: number
	total_volume: number
	high_24h: number
	low_24h: number
	price_change_percentage_24h: number
	circulating_supply: number
	sparkline_in_7d: {
		price: number[]
	}
	price_change_percentage_1h_in_currency: number
	price_change_percentage_24h_in_currency: number
	price_change_percentage_7d_in_currency: number
	price_change_percentage_30d_in_currency: number
	price_change_percentage_1y_in_currency: number
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

export interface Transaction {
	id: string
	quantity: number
	price: number
	date: Date
	userCoinId: string
}

export interface UserCoinData {
	coinId: string
	name: string
	symbol: string
	currentPrice: number
	totalQuantity: number
	totalCost: number
	averagePrice: number
	sellPrice?: number
	image: string
	transactions: Transaction[]
}

export type TrendingItem = {
	id: string
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
		market_cap_btc: number
		total_volume: string
		total_volume_btc: number
		sparkline: string
	}
}

export type TrendingCoin = {
	item: TrendingItem
}

export type TrendingData = {
	coins: TrendingCoin[]
}

export type MarketChartData = {
	prices: number[][]
}

export type MarketChartDataPoint = {
	timestamp: Date
	value: number
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
