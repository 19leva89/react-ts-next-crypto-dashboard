'use client'

import { ComponentProps } from 'react'
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area'

import { cn } from '@/lib'

/**
 * Scroll area component with custom styled scrollbars and viewport management
 * Handles scrollable content with focus states and built-in scrollbar styling
 * @param props - Scroll area component props
 * @param props.className - Additional CSS classes for styling customization
 * @param props.children - Content to render inside scrollable viewport
 * @param props....props - All other props passed to ScrollAreaPrimitive.Root
 * @returns JSX element with scrollable area containing viewport, scrollbar and corner
 */
function ScrollArea({ className, children, ...props }: ComponentProps<typeof ScrollAreaPrimitive.Root>) {
	return (
		<ScrollAreaPrimitive.Root data-slot='scroll-area' className={cn('relative', className)} {...props}>
			<ScrollAreaPrimitive.Viewport
				data-slot='scroll-area-viewport'
				className='size-full rounded-[inherit] ring-ring/10 outline-ring/50 transition-[color,box-shadow] focus-visible:ring-4 focus-visible:outline-1 dark:ring-ring/20 dark:outline-ring/40'
			>
				{children}
			</ScrollAreaPrimitive.Viewport>
			<ScrollBar />
			<ScrollAreaPrimitive.Corner />
		</ScrollAreaPrimitive.Root>
	)
}

/**
 * Scroll bar component with customizable orientation and thumb styling
 * Handles vertical and horizontal scrollbar presentation with touch-friendly interactions
 * @param props - Scroll bar component props
 * @param props.className - Additional CSS classes for styling customization
 * @param props.orientation - Scrollbar orientation ('vertical' or 'horizontal')
 * @param props....props - All other props passed to ScrollAreaPrimitive.ScrollAreaScrollbar
 * @returns JSX element with styled scrollbar track and thumb
 */
function ScrollBar({
	className,
	orientation = 'vertical',
	...props
}: ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
	return (
		<ScrollAreaPrimitive.ScrollAreaScrollbar
			data-slot='scroll-area-scrollbar'
			orientation={orientation}
			className={cn(
				'flex touch-none p-px transition-colors select-none',
				orientation === 'vertical' && 'h-full w-2.5 border-l border-l-transparent',
				orientation === 'horizontal' && 'h-2.5 flex-col border-t border-t-transparent',
				className,
			)}
			{...props}
		>
			<ScrollAreaPrimitive.ScrollAreaThumb
				data-slot='scroll-area-thumb'
				className='relative flex-1 rounded-full bg-border'
			/>
		</ScrollAreaPrimitive.ScrollAreaScrollbar>
	)
}

export { ScrollArea, ScrollBar }
