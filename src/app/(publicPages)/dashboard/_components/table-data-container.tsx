'use client'

import { useState } from 'react'

import { DataTable } from './table-data'
import { columns } from './table-columns'
import { Skeleton } from '@/components/ui'
import { CategoriesData, CoinListData } from '@/app/api/types'
import { getCoinsList, getCoinsListByCate } from '@/app/api/actions'
import { CoinDetailModal } from '@/components/shared/modals/coin-detail-modal'

interface Props {
	categories: CategoriesData
	initialCoins: CoinListData[]
}

export const DataTableContainer = ({ categories, initialCoins }: Props) => {
	const [coinsList, setCoinsList] = useState(initialCoins)
	const [fetchingCoins, setFetchingCoins] = useState<boolean>(false)
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
	const [selectedCoinId, setSelectedCoinId] = useState<string>('')
	const [currentCategorie, setCurrentCategorie] = useState<string>('All')

	// Handle category selection
	const onCategorieClick = async (cate: string, name?: string) => {
		setFetchingCoins(true)
		setCoinsList([])

		if (cate) {
			name && setCurrentCategorie(name)

			const resp = await getCoinsListByCate(cate)
			setFetchingCoins(false)

			if (resp) setCoinsList(resp)
		} else {
			setCurrentCategorie('All')

			const resp = await getCoinsList()
			setFetchingCoins(false)

			if (resp) setCoinsList(resp)
		}
	}

	// Handle coin detail modal
	const toggleDetailModal = () => {
		setIsModalOpen(!isModalOpen)
	}

	const handleCoinClick = (coinId: string) => {
		if (coinId) {
			setSelectedCoinId(coinId)
			toggleDetailModal()
		}
	}

	return (
		<>
			{fetchingCoins ? (
				<Skeleton className="h-96 w-full rounded-xl" />
			) : (
				<DataTable
					columns={columns}
					data={coinsList}
					categories={categories}
					currentCategorie={currentCategorie}
					onCoinsClick={handleCoinClick}
					onCategorieClick={onCategorieClick}
				/>
			)}

			<CoinDetailModal coinId={selectedCoinId} showDetailModal={isModalOpen} closeModal={toggleDetailModal} />
		</>
	)
}
