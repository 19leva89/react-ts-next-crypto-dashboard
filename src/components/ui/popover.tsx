'use client'

import { ComponentProps } from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'

import { cn } from '@/lib'

/**
 * Main popover component wrapper for popover functionality
 * Handles popover state management and accessibility features
 * @param props - Popover component props
 * @param props....props - All other props forwarded to PopoverPrimitive.Root
 * @returns JSX element with popover root container
 */
function Popover({ ...props }: ComponentProps<typeof PopoverPrimitive.Root>) {
	return <PopoverPrimitive.Root data-slot='popover' {...props} />
}

/**
 * Popover trigger component that opens the popover when activated
 * Handles click events to trigger popover opening with proper accessibility
 * @param props - Popover trigger component props
 * @param props....props - All other props forwarded to PopoverPrimitive.Trigger
 * @returns JSX element with popover trigger button
 */
function PopoverTrigger({ ...props }: ComponentProps<typeof PopoverPrimitive.Trigger>) {
	return <PopoverPrimitive.Trigger data-slot='popover-trigger' {...props} />
}

/**
 * Popover content component that contains the main popover content
 * Handles positioned popover content with animations, alignment and side offset configuration
 * @param props - Popover content component props
 * @param props.className - Additional CSS classes for styling customization
 * @param props.align - Content alignment relative to trigger ('center', 'start', 'end')
 * @param props.sideOffset - Distance from trigger element in pixels
 * @param props....props - All other props forwarded to PopoverPrimitive.Content
 * @returns JSX element with styled popover content container and animations
 */
function PopoverContent({
	className,
	align = 'center',
	sideOffset = 4,
	...props
}: ComponentProps<typeof PopoverPrimitive.Content>) {
	return (
		<PopoverPrimitive.Portal>
			<PopoverPrimitive.Content
				data-slot='popover-content'
				align={align}
				sideOffset={sideOffset}
				className={cn(
					'z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-hidden data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
					className,
				)}
				{...props}
			/>
		</PopoverPrimitive.Portal>
	)
}

/**
 * Popover anchor component for custom positioning reference
 * Handles alternative positioning anchor point when trigger element is not the desired reference
 * @param props - Popover anchor component props
 * @param props....props - All other props forwarded to PopoverPrimitive.Anchor
 * @returns JSX element with popover positioning anchor
 */
function PopoverAnchor({ ...props }: ComponentProps<typeof PopoverPrimitive.Anchor>) {
	return <PopoverPrimitive.Anchor data-slot='popover-anchor' {...props} />
}

export { Popover, PopoverAnchor, PopoverContent, PopoverTrigger }
