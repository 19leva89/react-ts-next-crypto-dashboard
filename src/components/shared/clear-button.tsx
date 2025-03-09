import { Delete } from 'lucide-react'

import { cn } from '@/lib'

interface Props {
	className?: string
	onClick?: VoidFunction
}

export const ClearButton = ({ onClick, className }: Props) => {
	return (
		<button
			onClick={onClick}
			type="button"
			className={cn(
				'absolute right-4 top-1/2 -translate-y-1/2 opacity-30 hover:opacity-100 cursor-pointer transition-opacity ease-in-out duration-300',
				className,
			)}
		>
			<Delete size={20} />
		</button>
	)
}
