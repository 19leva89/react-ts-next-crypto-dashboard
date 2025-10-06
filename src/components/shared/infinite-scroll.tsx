'use client'

import { useEffect } from 'react'

import { Button, Spinner } from '@/components/ui'
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
		<div data-testid='infinite-scroll' className='flex items-center px-4 py-2'>
			<div ref={targetRef} className='h-1' />

			{hasNextPage ? (
				<Button
					data-testid='infinite-scroll-button'
					variant='secondary'
					disabled={!hasNextPage || isFetchingNextPage}
					onClick={() => fetchNextPage()}
					className='rounded-xl transition-colors duration-300 ease-in-out'
				>
					{isFetchingNextPage && <Spinner className='size-5 text-white' />}
					{isFetchingNextPage ? 'Loading...' : 'Load more'}
				</Button>
			) : (
				<p data-testid='infinite-scroll-end' className='text-sm text-muted-foreground'>
					You have reached the end of the list
				</p>
			)}
		</div>
	)
}
