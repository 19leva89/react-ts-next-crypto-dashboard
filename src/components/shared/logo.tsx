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
				<div className="flex gap-3 p-2 bg-blue-50 w-56 h-12 rounded-xl transition-all duration-200">
					<div className="flex items-center justify-center p-2 bg-blue-200 rounded-xl">
						<Image alt="Crypto logo" src="/svg/logo-icon.svg" width={20} height={20} priority />
					</div>

					<div className="flex flex-col gap-0 text-blue-600 transition-all duration-100">
						<p className="font-semibold text-xs">Crypto</p>
						<p className="font-medium text-[10px]">Finance app</p>
					</div>
				</div>
			) : (
				<div className="flex items-center justify-center size-8 bg-blue-200 rounded-xl transition-all duration-200">
					<Image alt="Crypto logo" src="/svg/logo-icon.svg" width={20} height={20} priority />
				</div>
			)}
		</div>
	)
}
