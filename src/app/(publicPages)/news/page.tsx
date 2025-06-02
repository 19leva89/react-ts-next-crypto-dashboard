import Link from 'next/link'
import Image from 'next/image'
import { ArrowDownIcon, HeartIcon, MessageSquareTextIcon } from 'lucide-react'

import { cryptoNews } from './data'
import { Button } from '@/components/ui'
import { constructMetadata } from '@/lib'

export const metadata = constructMetadata({ title: 'News' })

// The page must be rendered on the server side
export const dynamic = 'force-dynamic'

const NewsPage = () => {
	return (
		<>
			<div className='mb-8'>
				<h1 className='text-xl font-medium'>Last crypto news</h1>
			</div>

			<div className='mb-6 flex flex-wrap gap-3 '>
				{[...cryptoNews, ...cryptoNews, ...cryptoNews].map((news, index) => (
					<Link
						href={news.url || ''}
						key={index}
						target='_blank'
						className='mx-auto flex w-full max-w-[450px] flex-col justify-between gap-2 rounded-xl border bg-white p-2 text-sm sm:w-r1/2 md:w-r1/3 xl:w-r1/4 dark:border-gray-700 dark:bg-slate-800'
					>
						<div className='flex flex-col gap-2'>
							<div className='flex items-center gap-2'>
								<Image alt='CMC logo' src='/svg/cmc.svg' width={32} height={32} />

								<div className='flex flex-col'>
									<h4 className='font-medium'>CoinMarketCap</h4>

									<span className='text-sm text-gray-600 dark:text-slate-100'>News - {news.since}</span>
								</div>
							</div>

							<div className='h-[200px] w-full rounded-xl bg-gray-100 dark:bg-black'>
								{news.cover && (
									<Image
										alt={news.title}
										src={news.cover}
										width={212}
										height={200}
										className='h-full w-full rounded-xl'
									/>
								)}
							</div>

							<h3 className='font-medium italic'>{news.title}</h3>

							<p className='text-sm text-gray-600 dark:text-slate-300'>{news.text}</p>
						</div>

						<div className='flex items-center gap-3'>
							<div className='flex items-center gap-1'>
								<HeartIcon size={20} />

								<span>{news.reaction}</span>
							</div>

							<div className='flex items-center gap-1'>
								<MessageSquareTextIcon size={20} />

								<span>{news.commentCount}</span>
							</div>
						</div>
					</Link>
				))}
			</div>

			<div className='flex justify-center'>
				<Button
					variant='outline'
					size='lg'
					className='group rounded-xl transition-colors duration-300 ease-in-out'
				>
					<span>Load more</span>

					<div className='relative size-5 transition-transform duration-300 group-hover:rotate-180'>
						<ArrowDownIcon size={16} className='absolute inset-0 m-auto' />
					</div>
				</Button>
			</div>
		</>
	)
}

export default NewsPage
