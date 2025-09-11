'use client'

import { useEffect, useState } from 'react'
import { ChevronUpIcon } from 'lucide-react'

import { cn } from '@/lib'
import { Button } from '@/components/ui'

type Props = {
	className?: string
}

export const ScrollToTop = ({ className }: Props) => {
	const [visible, setVisible] = useState<boolean>(false)

	useEffect(() => {
		const handleScroll = () => {
			const scrolled = window.scrollY
			const screenHeight = window.innerHeight

			if (scrolled > screenHeight) {
				setVisible(true)
			} else {
				setVisible(false)
			}
		}

		window.addEventListener('scroll', handleScroll)

		return () => {
			window.removeEventListener('scroll', handleScroll)
		}
	}, [])

	const scrollToTop = () => {
		window.scrollTo({
			top: 0,
			left: 0,
			behavior: 'smooth',
		})
	}

	return (
		<>
			{visible && (
				<Button
					type='button'
					variant='outline'
					onClick={scrollToTop}
					className={cn(
						'fixed right-11 bottom-11 rounded-full p-0 transition-colors duration-300 ease-in-out',
						className,
					)}
				>
					<ChevronUpIcon width={24} height={24} className='size-6' />
				</Button>
			)}
		</>
	)
}
