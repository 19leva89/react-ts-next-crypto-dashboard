'use client'

import { useEffect } from 'react'

import { Button } from '@/components/ui'
import { useIntersectionObserver } from '@/hooks'

interface Props {
	isManual?: boolean
	hasNextPage: boolean
	isFetchingNextPage: boolean
	fetchNextPage: () => void
}

export const InfiniteScroll = ({ isManual, hasNextPage, isFetchingNextPage, fetchNextPage }: Props) => {
	const { targetRef, isIntersecting } = useIntersectionObserver<HTMLDivElement>({
		threshold: 0.5,
		rootMargin: '100px',
	})

	useEffect(() => {
		if (isIntersecting && hasNextPage && !isFetchingNextPage && !isManual) {
			fetchNextPage()
		}
	}, [isIntersecting, hasNextPage, isFetchingNextPage, isManual, fetchNextPage])

	return (
		<div className='flex items-center px-4 py-2'>
			<div ref={targetRef} className='h-1' />

			{hasNextPage ? (
				<Button
					variant='secondary'
					disabled={!hasNextPage || isFetchingNextPage}
					onClick={() => fetchNextPage()}
				>
					{isFetchingNextPage ? 'Loading...' : 'Load more'}
				</Button>
			) : (
				<p className='text-sm text-muted-foreground'>You have reached the end of the list</p>
			)}
		</div>
	)
}
