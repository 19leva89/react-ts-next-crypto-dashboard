import { DeleteIcon } from 'lucide-react'

import { cn } from '@/lib'

interface Props {
	className?: string
	onClick?: VoidFunction
}

export const ClearButton = ({ onClick, className }: Props) => {
	return (
		<button
			onClick={onClick}
			type='button'
			className={cn(
				'absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer opacity-30 transition-opacity duration-300 ease-in-out hover:opacity-100',
				className,
			)}
		>
			<DeleteIcon size={20} />
		</button>
	)
}
