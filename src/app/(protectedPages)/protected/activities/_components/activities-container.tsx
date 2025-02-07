'use client'

import { useEffect, useState } from 'react'
import { LayoutGrid, List } from 'lucide-react'
import useLocalStorageState from 'use-local-storage-state'

import {
	Button,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Skeleton,
} from '@/components/ui'
import { cn } from '@/lib'
import { AddCrypto } from './add-crypto'
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
	const [sortOption, setSortOption] = useState<
		'total-asc' | 'total-desc' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc'
	>('total-desc')

	const sortedCryptoData = [...cryptoData].sort((a, b) => {
		switch (sortOption) {
			case 'total-asc':
				return a.currentPrice * a.quantity - b.currentPrice * b.quantity

			case 'total-desc':
				return b.currentPrice * b.quantity - a.currentPrice * a.quantity

			case 'price-asc':
				return a.currentPrice - b.currentPrice

			case 'price-desc':
				return b.currentPrice - a.currentPrice

			case 'name-asc':
				return a.name.localeCompare(b.name)

			case 'name-desc':
				return b.name.localeCompare(a.name)

			default:
				return 0
		}
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
					<AddCrypto />

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

					{/* Sort crypto */}
					<div className="pr-6">
						<Select
							value={sortOption}
							onValueChange={(value) =>
								setSortOption(
									value as 'total-asc' | 'total-desc' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc',
								)
							}
						>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder="Sort" />
							</SelectTrigger>

							<SelectContent>
								<SelectItem value="total-asc">Total: Low - Hi</SelectItem>
								<SelectItem value="total-desc">Total: Hi - Low</SelectItem>
								<SelectItem value="price-asc">Price: Low - Hi</SelectItem>
								<SelectItem value="price-desc">Price: Hi - Low</SelectItem>
								<SelectItem value="name-asc">Name: A - Z</SelectItem>
								<SelectItem value="name-desc">Name: Z - A</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
			</div>

			<div
				className={cn(
					'flex items-start justify-start w-full p-6',
					viewMode === 'grid' ? 'flex-row flex-wrap gap-4' : 'flex-col gap-2',
				)}
			>
				{cryptoData.length === 0 && (
					<h2 className="flex justify-center w-full">No cryptos added. Add your first crypto!</h2>
				)}

				{sortedCryptoData.map((coin) => (
					<CryptoCard key={coin.coinId} coin={coin} viewMode={viewMode} />
				))}
			</div>
		</div>
	)
}
