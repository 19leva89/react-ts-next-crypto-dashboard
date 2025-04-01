import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeftIcon, RefreshCcwIcon } from 'lucide-react'

import { cn } from '@/lib'
import { Button } from '@/components/ui'
import { Title } from '@/components/shared/title'

interface Props {
	title: string
	text: string
	imageUrl: string
	className?: string
}

export const InfoBlock = ({ title, text, imageUrl, className }: Props) => {
	return (
		<div className={cn(className, 'flex flex-wrap items-center justify-center gap-12 m-4')}>
			<div className="flex flex-col">
				<div className="w-full">
					<Title size="lg" text={title} className="font-extrabold" />

					<p className="text-gray-400 text-lg">{text}</p>
				</div>

				<div className="flex gap-5 mt-11">
					<Link href="/">
						<Button
							variant="default"
							size="lg"
							className="text-white rounded-xl transition-colors ease-in-out duration-300"
						>
							<ArrowLeftIcon size={16} />
							Back
						</Button>
					</Link>

					<Link href="">
						<Button
							variant="outline"
							size="lg"
							className="rounded-xl transition-colors ease-in-out duration-300"
						>
							<RefreshCcwIcon size={16} />
							Refresh
						</Button>
					</Link>
				</div>
			</div>

			<Image src={imageUrl} alt={title} width={300} height={300} />
		</div>
	)
}
