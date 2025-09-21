'use client'

import { ComponentProps } from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'

import { cn } from '@/lib'

/**
 * Label component with styled text and accessibility features for form fields
 * Handles label presentation with disabled states and proper spacing for form associations
 * @param props - Label component props
 * @param props.className - Additional CSS classes for styling customization
 * @param props....props - All other props forwarded to LabelPrimitive.Root
 * @returns JSX element with accessible form label and disabled state handling
 */
function Label({ className, ...props }: ComponentProps<typeof LabelPrimitive.Root>) {
	return (
		<LabelPrimitive.Root
			data-slot='label'
			className={cn(
				'flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
				className,
			)}
			{...props}
		/>
	)
}

export { Label }
