import { ComponentProps } from 'react'

import { cn } from '@/lib'

/**
 * Textarea component with responsive sizing and comprehensive interaction states
 * Handles focus management, validation styling, disabled states, and responsive typography
 * @param props - Textarea component props
 * @param props.className - Additional CSS classes for styling customization
 * @param props....props - All other props forwarded to textarea HTML element
 * @returns JSX element with textarea field and data-slot attribute
 */
function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
	return (
		<textarea
			data-slot='textarea'
			className={cn(
				'flex field-sizing-content min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:ring-destructive/40',
				className,
			)}
			{...props}
		/>
	)
}

export { Textarea }
