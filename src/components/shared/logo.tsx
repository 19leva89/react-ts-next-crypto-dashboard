import Image from 'next/image'

import { useSidebar } from '@/components/ui'

interface Props {
	className?: string
}

export const Logo = ({ className }: Props) => {
	const { open } = useSidebar()

	return (
		<div className={className}>
			{open ? (
				<div className='flex h-12 w-56 gap-3 rounded-xl bg-blue-50 p-2 transition-all duration-200'>
					<div className='flex items-center justify-center rounded-xl bg-blue-200 p-2'>
						<Image alt='Crypto logo' src='/svg/logo-icon.svg' width={20} height={20} priority />
					</div>

					<div className='flex flex-col gap-0 text-blue-600 transition-all duration-100'>
						<p className='text-xs font-semibold'>Crypto</p>
						<p className='text-[10px] font-medium'>Finance app</p>
					</div>
				</div>
			) : (
				<div className='flex size-8 items-center justify-center rounded-xl bg-blue-200 transition-all duration-200'>
					<Image alt='Crypto logo' src='/svg/logo-icon.svg' width={20} height={20} priority />
				</div>
			)}
		</div>
	)
}
