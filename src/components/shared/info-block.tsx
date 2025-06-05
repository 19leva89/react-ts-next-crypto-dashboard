'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { ArrowLeftIcon, RefreshCcwIcon, UserIcon } from 'lucide-react'

import { cn } from '@/lib'
import { Button } from '@/components/ui'
import { Title } from '@/components/shared/title'
import { AuthModal } from '@/components/shared/modals/auth-modal'

interface Props {
	type: 'auth' | 'not-found'
	title: string
	text: string
	imageUrl: string
	className?: string
}

export const InfoBlock = ({ title, text, imageUrl, type, className }: Props) => {
	const [openAuthModal, setOpenAuthModal] = useState<boolean>(false)

	return (
		<>
			<div className={cn(className, 'm-4 flex flex-wrap items-center justify-center gap-12')}>
				<div className='flex flex-col'>
					<div className='w-full'>
						<Title size='lg' text={title} className='font-extrabold' />

						<p className='text-lg text-gray-400'>{text}</p>
					</div>

					<div className='mt-11 flex gap-5'>
						<Link href='/'>
							<Button
								variant='default'
								size='lg'
								className='rounded-xl text-white transition-colors duration-300 ease-in-out'
							>
								<ArrowLeftIcon size={16} />
								Back
							</Button>
						</Link>

						{type === 'auth' ? (
							<Button
								variant='outline'
								size='lg'
								onClick={() => {
									setOpenAuthModal(true)
								}}
								className='rounded-xl transition-colors duration-300 ease-in-out'
							>
								<UserIcon size={16} />
								Sign In
							</Button>
						) : (
							<Link href=''>
								<Button
									variant='outline'
									size='lg'
									className='rounded-xl transition-colors duration-300 ease-in-out'
								>
									<RefreshCcwIcon size={16} />
									Refresh
								</Button>
							</Link>
						)}
					</div>
				</div>

				<Image src={imageUrl} alt={title} width={300} height={300} />
			</div>

			<AuthModal open={openAuthModal} onClose={() => setOpenAuthModal(false)} />
		</>
	)
}
