'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { useTRPC } from '@/trpc/client'
import { Skeleton } from '@/components/ui'
import { CategoriesData, CoinListData } from '@/app/api/types'
import { DataTable } from '@/modules/dashboard/ui/components/table-data'
import { columns } from '@/modules/dashboard/ui/components/table-columns'
import { CoinDetailModal } from '@/components/shared/modals/coin-detail-modal'

interface Props {
	categories: CategoriesData
	initialCoins: CoinListData[]
}

export const DataTableContainer = ({ categories, initialCoins }: Props) => {
	const trpc = useTRPC()
	const queryClient = useQueryClient()

	const { data: allCoins } = useQuery({
		...trpc.dashboard.getCoinsList.queryOptions(),
	})

	const { isLoading: isCategoryLoading } = useQuery({
		...trpc.dashboard.getCoinsListByCate.queryOptions(''),
		enabled: false,
	})

	const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
	const [selectedCoinId, setSelectedCoinId] = useState<string>('')
	const [currentCategory, setCurrentCategory] = useState<string>('All')
	const [coinsList, setCoinsList] = useState<CoinListData[]>(initialCoins)

	// Handle category selection
	const onCategoryClick = async (cate: string, name?: string) => {
		if (cate) {
			name && setCurrentCategory(name)

			const data = await queryClient.fetchQuery(trpc.dashboard.getCoinsListByCate.queryOptions(cate))
			if (data) setCoinsList(data)
		} else {
			setCurrentCategory('All')
			if (allCoins) setCoinsList(allCoins)
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
			{isCategoryLoading ? (
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
