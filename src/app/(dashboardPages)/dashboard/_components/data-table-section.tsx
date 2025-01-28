'use client'

import { useEffect, useState } from 'react'

import { columns } from './columns'
import { DataTable } from './data-table'
import { Skeleton } from '@/components/ui'
import { CategoriesData, CoinListData } from '@/app/api/definitions'
import { CoinDetailModal } from '@/components/shared/modals/coin-detail-modal'
import { fetchCategories, fetchCoinsList, fetchCoinsListByCate } from '@/app/api/actions'

export const DataTableSection = () => {
	const [categories, setCategories] = useState<CategoriesData>([])
	const [coinsList, setCoinsList] = useState<CoinListData>([])
	const [fetchingCoins, setFetchingCoins] = useState<boolean>(false)
	const [showDetailModal, setShowDetailModal] = useState<boolean>(false)
	const [currentCoinId, setCurrentCoinId] = useState<string>('')
	const [currentCategorie, setCurrentCategorie] = useState<string>('All')

	// Fetch categories and coin list on component mount
	useEffect(() => {
		fetchCategories().then((resp) => {
			if (resp) {
				setCategories(resp)
			}
		})

		setFetchingCoins(true)

		fetchCoinsList().then((resp) => {
			setFetchingCoins(false)
			if (resp) {
				setCoinsList(resp)
			}
		})
	}, [])

	// Handle category selection
	const onCategorieClick = (cate: string, name?: string) => {
		setFetchingCoins(true)
		setCoinsList([])
		if (cate) {
			name && setCurrentCategorie(name)
			fetchCoinsListByCate(cate).then((resp) => {
				setFetchingCoins(false)
				if (resp) {
					setCoinsList(resp)
				}
			})
		} else {
			setCurrentCategorie('All')
			// if exist, request won't be sent, cause cache in the ls (Local storage)
			fetchCoinsList().then((resp) => {
				setFetchingCoins(false)
				if (resp) {
					setCoinsList(resp)
				}
			})
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
