import { GECKO_ROUTE_V3, MARKETCAP_ROUTE_V1 } from './constants'

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
	return `${GECKO_ROUTE_V3}/coins/markets?vs_currency=usd&ids=${coinList}&per_page=250&sparkline=false`
}

// updateUserCoinsList
export const getCgUserCoinsListRoute = (coinList: string): string => {
	return `${GECKO_ROUTE_V3}/coins/markets?vs_currency=usd&ids=${coinList}&per_page=250&sparkline=false`
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
	return `${GECKO_ROUTE_V3}/coins/markets?vs_currency=usd&category=${cate}&per_page=250&sparkline=true&price_change_percentage=7d`
}

// getCoinsMarketChart
export const getCgCoinsMarketChartRoute = (coinId: string): string => {
	return `${GECKO_ROUTE_V3}/coins/${coinId}/market_chart?vs_currency=usd&days=365&precision=1`
}

// getAidrops
export const getCmcOngoingAidropsDataRoute = (): string => {
	return `${MARKETCAP_ROUTE_V1}/cryptocurrency/airdrops?limit=300&status="ONGOING"`
}

// getAidrops
export const getCmcUpcomingAidropsDataRoute = (): string => {
	return `${MARKETCAP_ROUTE_V1}/cryptocurrency/airdrops?limit=300&status="UPCOMING"`
}
