import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'

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
		<div className={cn(className, 'flex items-center justify-between w-[840px] gap-12')}>
			<div className="flex flex-col">
				<div className="w-[445px]">
					<Title size="lg" text={title} className="font-extrabold" />

					<p className="text-gray-400 text-lg">{text}</p>
				</div>

				<div className="flex gap-5 mt-11">
					<Link href="/">
						<Button variant="outline" className="gap-2">
							<ArrowLeft />
							To the home page
						</Button>
					</Link>

					<a href="">
						<Button variant="secondary">Update</Button>
					</a>
				</div>
			</div>

			<Image src={imageUrl} alt={title} width={300} height={300} />
		</div>
	)
}
