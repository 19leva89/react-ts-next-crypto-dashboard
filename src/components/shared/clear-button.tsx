import { DeleteIcon } from 'lucide-react'

import { cn } from '@/lib'

interface Props {
	className?: string
	onClick?: VoidFunction
}

export const ClearButton = ({ onClick, className }: Props) => {
	return (
		<button
			type='button'
			onClick={onClick}
			className={cn(
				'absolute top-1/2 right-4 -translate-y-1/2 opacity-30 transition-opacity duration-300 ease-in-out hover:opacity-100',
				className,
			)}
		>
			<DeleteIcon size={20} />
		</button>
	)
}
