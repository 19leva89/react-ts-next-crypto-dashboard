'use client'

import { useState } from 'react'

import { columns } from './columns'
import { DataTable } from './data-table'
import { Skeleton } from '@/components/ui'
import { CategoriesData, CoinListData } from '@/app/api/types'
import { fetchCoinsList, fetchCoinsListByCate } from '@/app/api/actions'
import { CoinDetailModal } from '@/components/shared/modals/coin-detail-modal'

interface Props {
	categories: CategoriesData
	initialCoins: CoinListData
}

export const DataTableSection = ({ categories, initialCoins }: Props) => {
	const [coinsList, setCoinsList] = useState<CoinListData>(initialCoins)
	const [fetchingCoins, setFetchingCoins] = useState<boolean>(false)
	const [showDetailModal, setShowDetailModal] = useState<boolean>(false)
	const [currentCoinId, setCurrentCoinId] = useState<string>('')
	const [currentCategorie, setCurrentCategorie] = useState<string>('All')

	// Handle category selection
	const onCategorieClick = async (cate: string, name?: string) => {
		setFetchingCoins(true)
		setCoinsList([])

		if (cate) {
			name && setCurrentCategorie(name)

			const resp = await fetchCoinsListByCate(cate)
			setFetchingCoins(false)

			if (resp) setCoinsList(resp)
		} else {
			setCurrentCategorie('All')

			const resp = await fetchCoinsList()
			setFetchingCoins(false)

			if (resp) setCoinsList(resp)
		}
	}

	// Handle coin detail modal
	const toggleDetailModal = () => {
		setShowDetailModal(!showDetailModal)
	}

	const onCoinsClick = (coinId: string) => {
		if (coinId) {
			setCurrentCoinId(coinId)
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
					onCoinsClick={onCoinsClick}
					onCategorieClick={onCategorieClick}
				/>
			)}

			<CoinDetailModal
				coinId={currentCoinId}
				showDetailModal={showDetailModal}
				closeModal={toggleDetailModal}
			/>
		</>
	)
}
