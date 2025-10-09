'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { format } from 'date-fns'
import { NotebookPenIcon } from 'lucide-react'
import { useSuspenseQuery } from '@tanstack/react-query'

import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '@/components/ui'
import { cn } from '@/lib'
import { useTRPC } from '@/trpc/client'
import { newsSourceLogos } from '@/lib/news-api'
import { newsResponseSchema } from '@/modules/news/schema'
import { ErrorState, LoadingState } from '@/components/shared'

export const NewsView = () => {
	const trpc = useTRPC()

	const [page, setPage] = useState<number>(1)

	const { data } = useSuspenseQuery(trpc.news.getCryptoNews.queryOptions({ page }))

	const totalPages = Math.ceil(data.totalResults / 12)
	const validatedData = newsResponseSchema.parse(data.articles)

	return (
		<>
			<div className='mb-8'>
				<h1 className='text-xl font-medium'>Last crypto news</h1>
			</div>

			<div className='mb-6 flex flex-wrap gap-3 '>
				{validatedData.map((news, i) => (
					<Link
						key={i}
						href={news.url}
						target='_blank'
						rel='noopener noreferrer'
						className='mx-auto flex w-full max-w-[450px] flex-col justify-between gap-2 rounded-xl border bg-white p-2 text-sm transition-all duration-300 ease-in-out hover:scale-[1.02] hover:border-gray-300 hover:shadow-lg sm:w-r1/2 md:w-r1/3 xl:w-r1/4 dark:border-gray-700 dark:bg-slate-800 dark:hover:border-gray-600 dark:hover:shadow-xl'
					>
						<div className='flex flex-col gap-2'>
							<div className='flex items-center gap-2 '>
								<div className='flex size-10 items-center justify-center overflow-hidden rounded-full border border-gray-200 p-2'>
									<Image
										alt={`${news.source.name} logo`}
										src={newsSourceLogos[news.source.name] ?? '/svg/coin-not-found.svg'}
										width={24}
										height={24}
										onError={(e) => (e.currentTarget.src = '/svg/coin-not-found.svg')}
										className='object-cover'
									/>
								</div>

								<div className='flex flex-col'>
									<h4 className='font-medium'>{news.source.name}</h4>

									<span className='text-sm text-gray-600 dark:text-slate-100'>
										{format(news.publishedAt, 'dd MMM yyyy - HH:mm')}
									</span>
								</div>
							</div>

							<div className='h-50 w-full rounded-xl bg-gray-100 dark:bg-black'>
								{news.urlToImage && (
									<Image
										alt={news.title}
										src={news.urlToImage}
										width={212}
										height={200}
										className='size-full rounded-xl'
									/>
								)}
							</div>

							<h3 className='font-medium italic'>{news.title}</h3>

							<p className='text-sm text-gray-600 dark:text-slate-300'>{news.description}</p>
						</div>

						<div className='flex items-center gap-3'>
							<div className='flex items-center gap-1'>
								<NotebookPenIcon size={20} />

								<span>{news.author}</span>
							</div>
						</div>
					</Link>
				))}
			</div>

			<div className='mt-6 flex justify-center'>
				<Pagination>
					<PaginationContent>
						<PaginationItem>
							<PaginationPrevious
								aria-disabled={page === 1}
								onClick={() => setPage((p) => Math.max(1, p - 1))}
								className={cn(
									'rounded-xl transition-colors duration-300 ease-in-out',
									page === 1 && 'pointer-events-auto cursor-not-allowed opacity-50',
								)}
							/>
						</PaginationItem>

						{Array.from({ length: totalPages }).map((_, i) => (
							<PaginationItem key={i}>
								<PaginationLink
									isActive={page === i + 1}
									onClick={() => setPage(i + 1)}
									className='rounded-xl transition-colors duration-300 ease-in-out'
								>
									{i + 1}
								</PaginationLink>
							</PaginationItem>
						))}

						<PaginationItem>
							<PaginationNext
								aria-disabled={page === totalPages}
								onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
								className={cn(
									'rounded-xl transition-colors duration-300 ease-in-out',
									page === totalPages && 'pointer-events-auto cursor-not-allowed opacity-50',
								)}
							/>
						</PaginationItem>
					</PaginationContent>
				</Pagination>
			</div>
		</>
	)
}

export const NewsViewLoading = () => {
	return <LoadingState title='Loading news' description='This may take a few seconds' />
}

export const NewsViewError = () => {
	return <ErrorState title='Failed to load news' description='Please try again later' />
}
