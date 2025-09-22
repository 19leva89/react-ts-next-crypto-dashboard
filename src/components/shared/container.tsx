import { ReactNode } from 'react'

import { cn } from '@/lib'

interface Props {
	className?: string
	children: ReactNode
}

export const Container = ({ className, children }: Props) => {
	return (
		<div data-testid='container' className={cn('mx-auto max-w-320', className)}>
			{children}
		</div>
	)
}
