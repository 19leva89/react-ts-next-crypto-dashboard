'use client'

import { ComponentProps } from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'

import { cn } from '@/lib'

/**
 * Root tabs component with flexible layout and gap spacing
 * Provides main tabs container with vertical flex layout and consistent gap
 * @param props - Tabs component props
 * @param props.className - Additional CSS classes for styling customization
 * @param props.props - All other props forwarded to TabsPrimitive.Root
 * @returns JSX element with tabs root container and data-slot attribute
 */
function Tabs({ className, ...props }: ComponentProps<typeof TabsPrimitive.Root>) {
	return <TabsPrimitive.Root data-slot='tabs' className={cn('flex flex-col gap-2', className)} {...props} />
}

/**
 * Tabs list component with styled background and centered alignment
 * Provides tab trigger container with rounded corners, muted background, and flexible width
 * @param props - Tabs list component props
 * @param props.className - Additional CSS classes for styling customization
 * @param props.props - All other props forwarded to TabsPrimitive.List
 * @returns JSX element with tabs list container and data-slot attribute
 */
function TabsList({ className, ...props }: ComponentProps<typeof TabsPrimitive.List>) {
	return (
		<TabsPrimitive.List
			data-slot='tabs-list'
			className={cn(
				'inline-flex h-10 w-fit items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground',
				className,
			)}
			{...props}
		/>
	)
}

/**
 * Tab trigger component with comprehensive styling and interaction states
 * Handles active/inactive states, focus management, disabled states, and icon support
 * @param props - Tabs trigger component props
 * @param props.className - Additional CSS classes for styling customization
 * @param props.props - All other props forwarded to TabsPrimitive.Trigger
 * @returns JSX element with tab trigger button and data-slot attribute
 */
function TabsTrigger({ className, ...props }: ComponentProps<typeof TabsPrimitive.Trigger>) {
	return (
		<TabsPrimitive.Trigger
			data-slot='tabs-trigger'
			className={cn(
				"inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
				className,
			)}
			{...props}
		/>
	)
}

/**
 * Tabs content component with flexible layout and focus management
 * Provides content panel container with flexible height and accessible focus handling
 * @param props - Tabs content component props
 * @param props.className - Additional CSS classes for styling customization
 * @param props.props - All other props forwarded to TabsPrimitive.Content
 * @returns JSX element with tabs content panel and data-slot attribute
 */
function TabsContent({ className, ...props }: ComponentProps<typeof TabsPrimitive.Content>) {
	return (
		<TabsPrimitive.Content
			data-slot='tabs-content'
			className={cn('flex-1 outline-none', className)}
			{...props}
		/>
	)
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
