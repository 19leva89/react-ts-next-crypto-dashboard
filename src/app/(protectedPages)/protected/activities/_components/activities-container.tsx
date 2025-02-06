'use client'

import { Suspense, useEffect, useState } from 'react'

import { AddCrypto } from './add-crypto'
import { CryptoCardItem } from './crypto-card-item'

import { getUserCoinsList } from '@/app/api/actions'
import { formatPrice } from '@/constants/format-price'

export interface CryptoData {
	coinId: string
	name: string
	symbol: string
	image: string
	currentPrice: number
	quantity: number
}

export const ActivitiesContainer = () => {
	const [isLoading, setIsLoading] = useState<boolean>(true)
	const [userCoinsList, setUserCoinsList] = useState<CryptoData[]>([])

	useEffect(() => {
		const fetchData = async () => {
			try {
				const userCoins = await getUserCoinsList()

				const formattedCoins = userCoins.map((item) => ({
					coinId: item.coinsListIDMap.id,
					name: item.coinsListIDMap.name,
					symbol: item.coinsListIDMap.symbol,
					image: item.coin.image as string,
					currentPrice: item.coin.current_price as number,
					quantity: item.quantity as number,
				}))

				setUserCoinsList(formattedCoins)
			} catch (error) {
				console.error('Error fetching CoinsListIDMap:', error)
			} finally {
				setIsLoading(false)
			}
		}

		fetchData()
	}, [])

	// Вычисляем общую стоимость портфеля
	const totalValue = userCoinsList.reduce((total, crypto) => {
		return total + crypto.currentPrice * crypto.quantity
	}, 0)

	return (
		<div className="flex flex-col w-full">
			<div className="flex items-center justify-between">
				<Suspense fallback={<p>Loading...</p>}>
					<div className="p-2 px-6">
						<h2 className="text-2xl font-bold">Total crypto: ${formatPrice(totalValue, true, 2)}</h2>
					</div>
				</Suspense>

				<AddCrypto />
			</div>

			<div className="flex flex-row flex-wrap items-center justify-start gap-4 p-6">
				{isLoading && userCoinsList.length === 0 && <p>Loading...</p>}

				{userCoinsList.map((coin) => (
					<CryptoCardItem key={coin.coinId} coin={coin} />
				))}

				{!isLoading && userCoinsList.length === 0 && <p>No coins found</p>}
			</div>
		</div>
	)
}
