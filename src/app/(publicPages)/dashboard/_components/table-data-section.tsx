'use client'

import { useState } from 'react'

import { DataTable } from './table-data'
import { columns } from './table-columns'
import { Skeleton } from '@/components/ui'
import { CategoriesData } from '@/app/api/types'
import { getCoinsList, getCoinsListByCate } from '@/app/api/actions'
import { CoinDetailModal } from '@/components/shared/modals/coin-detail-modal'

interface Props {
	categories: CategoriesData
	initialCoins: any
}

export const DataTableSection = ({ categories, initialCoins }: Props) => {
	const [coinsList, setCoinsList] = useState(initialCoins)
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
