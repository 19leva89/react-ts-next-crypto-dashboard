import { MarketChart } from '@prisma/client'

export type ValidDays = keyof typeof DAYS_MAPPING
export const DAYS_MAPPING: { [key: number]: keyof MarketChart } = {
	1: 'prices_1d',
	7: 'prices_7d',
	30: 'prices_30d',
	365: 'prices_365d',
} as const

export const COINS_UPDATE_INTERVAL = 10 * 60 * 1000 // 10 minutes
export const MARKET_CHART_UPDATE_INTERVAL = 60 * 60 * 1000 // 1 hour

export const GECKO_ROUTE_V3 = 'https://api.coingecko.com/api/v3'
export const MARKETCAP_ROUTE_V1 = 'https://pro-api.coinmarketcap.com/v1'
