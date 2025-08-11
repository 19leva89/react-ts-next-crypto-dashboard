import { ValidDays } from '@/constants/chart'
import { GECKO_ROUTE_V3, MARKETCAP_ROUTE_V1 } from '@/routes'

// getTrendingData
export const getCgTrendingRoute = (): string => {
	return `${GECKO_ROUTE_V3}/search/trending`
}

// getCategories
export const getCgCategoriesRoute = (): string => {
	return `${GECKO_ROUTE_V3}/coins/categories/list`
}

// getCoinsList
export const getCgCoinsListRoute = (): string => {
	return `${GECKO_ROUTE_V3}/coins/markets?vs_currency=usd&per_page=250&sparkline=true&price_change_percentage=7d`
}

// updateCoinsList
export const getCgUpdateCoinsListRoute = (coinList: string): string => {
	return `${GECKO_ROUTE_V3}/coins/markets?vs_currency=usd&ids=${coinList}&per_page=250&sparkline=true&price_change_percentage=7d`
}

// updateUserCoinsList
export const getCgUserCoinsListRoute = (coinList: string): string => {
	return `${GECKO_ROUTE_V3}/coins/markets?vs_currency=usd&ids=${coinList}&per_page=250&sparkline=true`
}

// getCoinsListIDMap
export const getCgCoinsListIDMap = (): string => {
	return `${GECKO_ROUTE_V3}/coins/list`
}

// getCoinData
export const getCgCoinsDataRoute = (coinId: string): string => {
	return `${GECKO_ROUTE_V3}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=true`
}

// getCoinsListByCate
export const getCgCoinsListByCateRoute = (cate: string): string => {
	return `${GECKO_ROUTE_V3}/coins/markets?vs_currency=usd&category=${cate}&per_page=250&sparkline=true&price_change_percentage=7d`
}

// getCoinsMarketChart
export const getCgCoinsMarketChartRoute = (coinId: string, days: ValidDays): string => {
	return `${GECKO_ROUTE_V3}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&precision=8`
}

// getAirdrops
export const getCmcOngoingAirdropsDataRoute = (): string => {
	return `${MARKETCAP_ROUTE_V1}/cryptocurrency/airdrops?limit=300&status="ONGOING"`
}

// getAirdrops
export const getCmcUpcomingAirdropsDataRoute = (): string => {
	return `${MARKETCAP_ROUTE_V1}/cryptocurrency/airdrops?limit=300&status="UPCOMING"`
}
