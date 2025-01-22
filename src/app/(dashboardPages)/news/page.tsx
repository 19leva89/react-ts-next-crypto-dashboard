import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'

import { cryptoNews } from './datas'
import cmcIcon from '@/assets/icons/cmcIcon.svg'
import { ArrowUpIcon, CommentIcon, HeartIcon } from '@/assets/iconComponents'

export const metadata: Metadata = {
	title: 'News',
}

export default function NewsPage() {
	return (
		<>
			<div className="mb-8">
				<h1 className="font-medium text-xl">Last crypto news</h1>
			</div>

			<div className="mb-6 flex flex-wrap gap-3 ">
				{[...cryptoNews, ...cryptoNews, ...cryptoNews].map((news, index) => (
					<Link
						href={news.url || ''}
						key={index}
						target="_blank"
						className="mx-auto max-w-[450px] text-sm w-full sm:w-r1/2 md:w-r1/3 xl:w-r1/4 rounded-xl border dark:border-gray-700 p-2 flex flex-col justify-between gap-2 bg-white dark:bg-slate-800"
					>
						<div className="flex flex-col gap-2">
							<div className="flex items-center gap-2">
								<Image alt="CMC" src={cmcIcon} />

								<div className="flex flex-col">
									<h4 className="font-medium">CoinMarketCap</h4>

									<span className="text-gray-600 dark:text-slate-100 text-sm">News - {news.since}</span>
								</div>
							</div>

							<div className={`h-[200px] rounded-xl w-full bg-gray-100 dark:bg-black`}>
								{news.cover && <img alt={news.title} src={news.cover} className="w-full h-full rounded-xl" />}
							</div>

							<h3 className="font-medium italic">{news.title}</h3>

							<p className="text-sm text-gray-600 dark:text-slate-300">{news.text}</p>
						</div>

						<div className="flex items-center gap-3">
							<div className="flex items-center gap-1">
								<HeartIcon className="size-5" />

								<span>{news.recation}</span>
							</div>

							<div className="flex items-center gap-1">
								<CommentIcon className="size-5" />

								<span>{news.commentCount}</span>
							</div>
						</div>
					</Link>
				))}
			</div>

			<div className="flex justify-center">
				<button className="font-medium rounded-full flex items-center gap-2 p-3 border dark:border-gray-700 bg-slate-50 dark:bg-gray-800">
					<span>Load more</span>

					<ArrowUpIcon className="rotate-180 size-5" />
				</button>
			</div>
		</>
	)
}
