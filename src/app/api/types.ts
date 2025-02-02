export type CategoriesData = {
	category_id: string
	name: string
}[]

export type CoinsListIDMapData = {
	id: string
	symbol: string
	name: string
}[]

export type CoinsListData = {
	id: string
	symbol: string
	name: string
	description: string
	image: string
	market_cap_rank: number
}[]

export type CoinData = {
	id: string
	symbol: string
	name: string
	description: { en: string }
	image: string
	market_cap_rank: number
	market_data: {
		current_price: {
			usd: number
		}
		market_cap: {
			usd: number
		}
		total_volume: {
			usd: number
		}
		price_change_percentage_24h: number
		price_change_percentage_7d_in_currency: {
			usd: number
		}
		circulating_supply: number
		high_24h: {
			usd: number
		}
		low_24h: {
			usd: number
		}
	}
	last_updated: string
}

export type TableCoinData = {
	id: string
	name: string
	image: string
	market_data: {
		current_price: {
			usd: number
		}
		market_cap: {
			usd: number
		}
		total_volume: {
			usd: number
		}
		price_change_percentage_24h: number
		price_change_percentage_7d_in_currency: {
			usd: number
		}
	}
	last_updated: string
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
