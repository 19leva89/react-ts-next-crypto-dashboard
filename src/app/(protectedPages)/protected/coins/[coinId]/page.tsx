import { constructMetadata } from '@/lib'
import { getUserCoinData } from '@/app/api/actions'
import { CoinIdContainer } from './_components/container'

// export const generateMetadata = async ({ params }: { params: { coinId: string } }) => {
// 	const title = await Promise.resolve(params.coinId)
// 	return constructMetadata({ title })
// }

// The page must be rendered on the server side
export const dynamic = 'force-dynamic'

const CoinIdPage = async ({ params }: { params: { coinId: string } }) => {
	if (!params || !params.coinId) {
		return <div>Invalid coin ID</div>
	}

	const coinId = await Promise.resolve(params.coinId)
	const userCoin = await getUserCoinData(coinId)

	// Если данных нет, отобразить сообщение
	if (!userCoin || Array.isArray(userCoin)) {
		return <div>Coin not found</div>
	}

	return <CoinIdContainer coin={userCoin} />
}

export default CoinIdPage
