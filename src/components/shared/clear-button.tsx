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
				'absolute right-4 top-1/2 -translate-y-1/2 opacity-30 hover:opacity-100 cursor-pointer',
				className,
			)}
		>
			<Delete className="h-5 w-5" />
		</button>
	)
}
