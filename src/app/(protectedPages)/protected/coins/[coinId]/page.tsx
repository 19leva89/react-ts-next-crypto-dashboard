import { constructMetadata } from '@/lib'
import { getUserCoinData } from '@/app/api/actions'
import { CoinIdContainer } from './_components/container'

// The page must be rendered on the server side
export const dynamic = 'force-dynamic'

interface Props {
	params: Promise<{ coinId: string }>
}

export async function generateMetadata({ params }: Props) {
	const { coinId } = await params

	const formattedCoinId =
		coinId.charAt(0).toUpperCase() +
		coinId
			.slice(1) // First letter is capitalized
			.replace(/-/g, ' ') // Replace all "-" with spaces " "

	return constructMetadata({ title: `${formattedCoinId}` })
}

const CoinIdPage = async ({ params }: Props) => {
	const { coinId } = await params

	if (!coinId) {
		return <div>Invalid coin ID</div>
	}

	const userCoin = await getUserCoinData(coinId)

	if (!userCoin || Array.isArray(userCoin)) {
		return <div>Coin not found</div>
	}

	return <CoinIdContainer coin={userCoin} />
}

export default CoinIdPage
