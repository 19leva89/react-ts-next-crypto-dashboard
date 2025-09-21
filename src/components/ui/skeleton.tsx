import { ComponentProps } from 'react'

import { cn } from '@/lib'

/**
 * Skeleton component for loading states with randomized width and height
 * @param props - Skeleton component props
 * @param props.className - Additional CSS classes for styling customization
 * @param props....props - All other props forwarded to div element
 * @returns JSX element with animated skeleton placeholder
 */
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
