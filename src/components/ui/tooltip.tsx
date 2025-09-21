'use client'

import { ComponentProps } from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'

import { cn } from '@/lib'

/**
 * Tooltip provider component with customizable delay configuration
 * Provides global tooltip context with configurable delay duration for hover activation
 * @param props - Tooltip provider component props
 * @param props.delayDuration - Delay in milliseconds before tooltip appears (defaults to 0)
 * @param props....props - All other props passed to TooltipPrimitive.Provider component
 * @returns JSX element with tooltip provider context and data-slot attribute
 */
function TooltipProvider({ delayDuration = 0, ...props }: ComponentProps<typeof TooltipPrimitive.Provider>) {
	return <TooltipPrimitive.Provider data-slot='tooltip-provider' delayDuration={delayDuration} {...props} />
}

/**
 * Root tooltip component with integrated provider for standalone usage
 * Provides complete tooltip functionality with automatic provider wrapping
 * @param props - Tooltip component props
 * @param props....props - All other props passed to TooltipPrimitive.Root component
 * @returns JSX element with tooltip root wrapped in provider and data-slot attribute
 */
function Tooltip({ ...props }: ComponentProps<typeof TooltipPrimitive.Root>) {
	return (
		<TooltipProvider>
			<TooltipPrimitive.Root data-slot='tooltip' {...props} />
		</TooltipProvider>
	)
}

/**
 * Tooltip trigger component for hover and focus activation
 * Provides trigger element that activates tooltip on hover and keyboard focus
 * @param props - Tooltip trigger component props
 * @param props....props - All other props passed to TooltipPrimitive.Trigger component
 * @returns JSX element with tooltip trigger and data-slot attribute
 */
function TooltipTrigger({ ...props }: ComponentProps<typeof TooltipPrimitive.Trigger>) {
	return <TooltipPrimitive.Trigger data-slot='tooltip-trigger' {...props} />
}

/**
 * Tooltip content component with styled appearance and directional animations
 * Handles positioning, styling, animations, and arrow indicator with portal rendering
 * @param props - Tooltip content component props
 * @param props.className - Additional CSS classes for styling customization
 * @param props.sideOffset - Distance in pixels from trigger element (defaults to 0)
 * @param props.children - Content to display inside the tooltip
 * @param props....props - All other props passed to TooltipPrimitive.Content component
 * @returns JSX element with tooltip content portal, animations, and arrow indicator
 */
function TooltipContent({
	className,
	sideOffset = 0,
	children,
	...props
}: ComponentProps<typeof TooltipPrimitive.Content>) {
	return (
		<TooltipPrimitive.Portal>
			<TooltipPrimitive.Content
				data-slot='tooltip-content'
				sideOffset={sideOffset}
				className={cn(
					'z-50 w-fit rounded-md bg-primary px-3 py-1.5 text-xs text-balance text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
					className,
				)}
				{...props}
			>
				{children}
				<TooltipPrimitive.Arrow className='z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px] bg-primary fill-primary' />
			</TooltipPrimitive.Content>
		</TooltipPrimitive.Portal>
	)
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
