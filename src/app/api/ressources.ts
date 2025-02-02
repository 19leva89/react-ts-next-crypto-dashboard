import { GECKO_ROUTE_V3, MARKETCAP_ROUTE_V1 } from './constants'

// fetchTrendingData
export const getCgTrendingRoute = (): string => {
	return `${GECKO_ROUTE_V3}/search/trending`
}

// fetchCategories
export const getCgCategoriesRoute = (): string => {
	return `${GECKO_ROUTE_V3}/coins/categories/list`
}

// fetchCoinsList
export const getCgCoinsListRoute = (): string => {
	return `${GECKO_ROUTE_V3}/coins/markets?vs_currency=usd&per_page=250&sparkline=true&price_change_percentage=7d`
}

// fetchCoinsListIDMap
export const getCgCoinsListIDMap = (): string => {
	return `${GECKO_ROUTE_V3}/coins/list`
}

// fetchCoinData
export const getCgCoinsDataRoute = (coinId: string): string => {
	return `${GECKO_ROUTE_V3}/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`
}

// fetchCoinsListByCate
export const getCgCoinsListByCateRoute = (cate: string): string => {
	return `${GECKO_ROUTE_V3}/coins/markets?vs_currency=usd&category=${cate}&per_page=250&sparkline=true&price_change_percentage=7d`
}

// fetchCoinsMarketChart
export const getCgCoinsMarketChartRoute = (coinId: string): string => {
	return `${GECKO_ROUTE_V3}/coins/${coinId}/market_chart?vs_currency=usd&days=365&precision=1`
}

// fetchAidrops
export const getCmcOngoingAidropsDataRoute = (): string => {
	return `${MARKETCAP_ROUTE_V1}/cryptocurrency/airdrops?limit=300&status="ONGOING"`
}

// fetchAidrops
export const getCmcUpcomingAidropsDataRoute = (): string => {
	return `${MARKETCAP_ROUTE_V1}/cryptocurrency/airdrops?limit=300&status="UPCOMING"`
}
