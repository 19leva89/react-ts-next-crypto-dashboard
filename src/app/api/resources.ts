import { GECKO_ROUTE_V3, MARKETCAP_ROUTE_V1, ValidDays } from './constants'

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
	return `${GECKO_ROUTE_V3}/coins/markets?vs_currency=usd&per_page=250&sparkline=true&price_change_percentage=1h%2C24h%2C7d%2C30d%2C1y`
}

// updateCoinsList
export const getCgUpdateCoinsListRoute = (coinList: string): string => {
	return `${GECKO_ROUTE_V3}/coins/markets?vs_currency=usd&ids=${coinList}&per_page=250&sparkline=false&price_change_percentage=1h%2C24h%2C7d%2C30d%2C1y`
}

// updateUserCoinsList
export const getCgUserCoinsListRoute = (coinList: string): string => {
	return `${GECKO_ROUTE_V3}/coins/markets?vs_currency=usd&ids=${coinList}&per_page=250&sparkline=false&price_change_percentage=1h%2C24h%2C7d%2C30d%2C1y`
}

// getCoinsListIDMap
export const getCgCoinsListIDMap = (): string => {
	return `${GECKO_ROUTE_V3}/coins/list`
}

// getCoinData
export const getCgCoinsDataRoute = (coinId: string): string => {
	return `${GECKO_ROUTE_V3}/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`
}

// getCoinsListByCate
export const getCgCoinsListByCateRoute = (cate: string): string => {
	return `${GECKO_ROUTE_V3}/coins/markets?vs_currency=usd&category=${cate}&per_page=250&sparkline=true&price_change_percentage=1h%2C24h%2C7d%2C30d%2C1y`
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
