import { constructMetadata } from '@/lib'
import { getUserCoinsList } from '@/app/api/actions'
import { ActivitiesContainer } from './_components/activities-container'

export const metadata = constructMetadata({ title: 'Activities' })

// The page must be rendered on the server side
export const dynamic = 'force-dynamic'

const ActivitiesPage = async () => {
	const userCryptos = await getUserCoinsList()

	const cryptoData = userCryptos.map((userCoin) => ({
		coinId: userCoin.coin.id,
		name: userCoin.coinsListIDMap.name,
		symbol: userCoin.coinsListIDMap.symbol,
		currentPrice: userCoin.coin.current_price as number,
		quantity: userCoin.quantity as number,
		image: userCoin.coin.image as string,
	}))

	// Вычисляем общую стоимость портфеля
	const totalPortfolioValue = cryptoData.reduce((total, crypto) => {
		return total + crypto.currentPrice * crypto.quantity
	}, 0)

	return <ActivitiesContainer cryptoData={cryptoData} totalValue={totalPortfolioValue} />
}

export default ActivitiesPage
