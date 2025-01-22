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

export type CategoriesData = {
	category_id: string
	name: string
}[]

export type CoinListData = {
	id: string
	symbol: string
	name: string
	image: string
	current_price: number
	market_cap: number
	market_cap_rank: number
	total_volume: number
	price_change_percentage_24h: number
	sparkline_in_7d: {
		price: number[]
	}
	price_change_percentage_7d_in_currency: number | null
}[]

export type MarketChartData = {
	prices: [number, number][]
}

export type CoinsData = {
	id: string
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

export type AidropsData = {
	data: {
		id: string
		project_name: string
		description: string
		status: 'UPCOMING' | 'ONGOING'
		coin: {
			id: number
			name: string
			slug: string
			symbol: string
		}
		start_date: string
		end_date: string
		total_prize: number
		winner_count: number
		link: string
	}[]
}
