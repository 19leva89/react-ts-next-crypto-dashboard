'use client'

import { useEffect, useState } from 'react'
import { LayoutGrid, List } from 'lucide-react'
import useLocalStorageState from 'use-local-storage-state'

import { AddCrypto } from './add-crypto'
import { Button, Skeleton } from '@/components/ui'
import { AllCryptoPrices } from './all-crypto-prices'
import { CryptoCard, CryptoData } from './crypto-card'

interface Props {
	cryptoData: CryptoData[]
	totalValue: number
}

export const ActivitiesContainer = ({ cryptoData, totalValue }: Props) => {
	const [isMounted, setIsMounted] = useState(false)
	const [viewMode, setViewMode] = useLocalStorageState<'list' | 'grid'>('viewMode', {
		defaultValue: 'grid',
	})

	useEffect(() => {
		setIsMounted(true)
	}, [])

	if (!isMounted) {
		return (
			<div className="flex flex-col w-full">
				<div className="flex items-center justify-between">
					<Skeleton className="h-14 w-full" />
				</div>

				<div className="flex flex-col gap-2 items-start justify-start w-full p-6">
					<Skeleton className="h-24 w-full" />
					<Skeleton className="h-24 w-full" />
					<Skeleton className="h-24 w-full" />
				</div>
			</div>
		)
	}

	return (
		<div className="flex flex-col w-full">
			<div className="flex items-center justify-between">
				<AllCryptoPrices totalValue={totalValue} />

				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setViewMode('grid')}
						className={viewMode === 'grid' ? 'bg-accent' : ''}
					>
						<LayoutGrid className="h-4 w-4" />
					</Button>

					<Button
						variant="ghost"
						size="icon"
						onClick={() => setViewMode('list')}
						className={viewMode === 'list' ? 'bg-accent' : ''}
					>
						<List className="h-4 w-4" />
					</Button>

					<AddCrypto />
				</div>
			</div>

			<div
				className={`flex ${
					viewMode === 'grid' ? 'flex-row flex-wrap gap-4' : 'flex-col gap-2'
				} items-start justify-start w-full p-6`}
			>
				{cryptoData.length === 0 && (
					<h2 className="flex justify-center w-full">No cryptos added. Add your first crypto!</h2>
				)}

				{cryptoData
					.sort((a, b) => b.currentPrice - a.currentPrice)
					.map((coin) => (
						<CryptoCard key={coin.coinId} coin={coin} viewMode={viewMode} />
					))}
			</div>
		</div>
	)
}
