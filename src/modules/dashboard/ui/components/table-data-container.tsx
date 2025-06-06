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
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
	const [selectedCoinId, setSelectedCoinId] = useState<string>('')
	const [fetchingCoins, setFetchingCoins] = useState<boolean>(false)
	const [currentCategory, setCurrentCategory] = useState<string>('All')
	const [coinsList, setCoinsList] = useState<CoinListData[]>(initialCoins)

	// Handle category selection
	const onCategoryClick = async (cate: string, name?: string) => {
		setFetchingCoins(true)
		setCoinsList([])

		if (cate) {
			name && setCurrentCategory(name)

			const resp = await getCoinsListByCate(cate)
			setFetchingCoins(false)

			if (resp) setCoinsList(resp)
		} else {
			setCurrentCategory('All')

			const resp = await getCoinsList()
			setFetchingCoins(false)

			if (resp) setCoinsList(resp)
		}
	}

	// Handle coin detail modal
	const toggleDetailModal = () => setIsModalOpen(!isModalOpen)

	const handleCoinClick = (coinId: string) => {
		if (coinId) {
			setSelectedCoinId(coinId)
			toggleDetailModal()
		}
	}

	return (
		<>
			{fetchingCoins ? (
				<Skeleton className='h-96 rounded-xl' />
			) : (
				<DataTable
					columns={columns}
					data={coinsList}
					categories={categories}
					currentCategory={currentCategory}
					onCoinsClick={handleCoinClick}
					onCategoryClick={onCategoryClick}
				/>
			)}

			<CoinDetailModal coinId={selectedCoinId} showDetailModal={isModalOpen} closeModal={toggleDetailModal} />
		</>
	)
}
