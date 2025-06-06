import { ComponentProps } from 'react'

import { cn } from '@/lib'

function Skeleton({ className, ...props }: ComponentProps<'div'>) {
	return (
		<div
			data-slot='skeleton'
			className={cn('animate-pulse rounded-md bg-primary/10', className)}
			{...props}
		/>
	)
}

export { Skeleton }
