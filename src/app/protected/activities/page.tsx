import { Metadata } from 'next'

import { AddCrypto } from './_components/add-crypto'
import { CryptoCard } from './_components/crypto-card'
import { AllCryptoPrices } from './_components/all-crypto-prices'

export const metadata: Metadata = {
	title: 'Activities',
}

const ActivitiesPage = () => {
	const cryptoData = [
		{
			name: 'Bitcoin',
			symbol: 'btc',
			currentPrice: 42000,
			quantity: 1.5,
			image: 'https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png?1696501400',
		},
		{
			name: 'Ethereum',
			symbol: 'eth',
			currentPrice: 2500,
			quantity: 10,
			image: 'https://coin-images.coingecko.com/coins/images/279/large/ethereum.png?1696501628',
		},
	]

	const totalPortfolioValue = cryptoData.reduce((total, crypto) => {
		return total + crypto.currentPrice * crypto.quantity
	}, 0)

	return (
		<div className="flex flex-col w-full">
			<div className="flex items-center justify-between">
				<AllCryptoPrices totalValue={totalPortfolioValue} />

				<AddCrypto />
			</div>

			<div className="flex flex-raw flex-wrap gap-4 items-start justify-start w-full p-6">
				{cryptoData.map((crypto, index) => (
					<CryptoCard
						key={index}
						name={crypto.name}
						symbol={crypto.symbol}
						currentPrice={crypto.currentPrice}
						quantity={crypto.quantity}
						image={crypto.image}
					/>
				))}
			</div>
		</div>
	)
}

export default ActivitiesPage
