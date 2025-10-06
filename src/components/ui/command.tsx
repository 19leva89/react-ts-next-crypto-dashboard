'use client'

import { ComponentProps } from 'react'
import { SearchIcon } from 'lucide-react'
import { Command as CommandPrimitive } from 'cmdk'

import { cn } from '@/lib'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui'

/**
 * Main command component wrapper with styled container layout
 * Handles full-size flexible column layout with overflow management for command interfaces
 * @param props - Command component props
 * @param props.className - Additional CSS classes for styling customization
 * @param props.props - All other props forwarded to CommandPrimitive
 * @returns JSX element with command container layout
 */
function Command({ className, ...props }: ComponentProps<typeof CommandPrimitive>) {
	return (
		<CommandPrimitive
			data-slot='command'
			className={cn(
				'flex size-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground',
				className,
			)}
			{...props}
		/>
	)
}

/**
 * Command dialog component that wraps command palette in a modal dialog
 * Handles accessible dialog presentation with customizable title and description for screen readers
 * @param props - Command dialog component props
 * @param props.title - Dialog title for accessibility (hidden visually)
 * @param props.description - Dialog description for accessibility (hidden visually)
 * @param props.children - Command content to render inside dialog
 * @param props.props - All other props forwarded to Dialog component
 * @returns JSX element with modal dialog containing command palette
 */
function CommandDialog({
	title = 'Command Palette',
	description = 'Search for a command to run...',
	children,
	...props
}: ComponentProps<typeof Dialog> & {
	title?: string
	description?: string
}) {
	return (
		<Dialog {...props}>
			<DialogHeader className='sr-only'>
				<DialogTitle>{title}</DialogTitle>

				<DialogDescription>{description}</DialogDescription>
			</DialogHeader>

			<DialogContent className='overflow-hidden p-0'>
				<Command className='**:data-[slot=command-input-wrapper]:h-12 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5'>
					{children}
				</Command>
			</DialogContent>
		</Dialog>
	)
}

/**
 * Command input component with search icon and styled text input
 * Handles search functionality within command interface with visual search indicator
 * @param props - Command input component props
 * @param props.className - Additional CSS classes for styling customization
 * @param props.props - All other props forwarded to CommandPrimitive.Input
 * @returns JSX element with search input field and icon
 */
function CommandInput({ className, ...props }: ComponentProps<typeof CommandPrimitive.Input>) {
	return (
		<div data-slot='command-input-wrapper' className='flex h-9 items-center gap-2 border-b px-3'>
			<SearchIcon className='size-4 shrink-0 opacity-50' />

			<CommandPrimitive.Input
				data-slot='command-input'
				className={cn(
					'flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
					className,
				)}
				{...props}
			/>
		</div>
	)
}

/**
 * Command list component that contains scrollable command items
 * Handles vertical scrolling with constrained height for command results display
 * @param props - Command list component props
 * @param props.className - Additional CSS classes for styling customization
 * @param props.props - All other props forwarded to CommandPrimitive.List
 * @returns JSX element with scrollable list container
 */
function CommandList({ className, ...props }: ComponentProps<typeof CommandPrimitive.List>) {
	return (
		<CommandPrimitive.List
			data-slot='command-list'
			className={cn('max-h-75 scroll-py-1 overflow-x-hidden overflow-y-auto', className)}
			{...props}
		/>
	)
}

/**
 * Command empty state component displayed when no results found
 * Handles empty state presentation with centered text layout
 * @param props - Command empty component props
 * @param props.props - All other props forwarded to CommandPrimitive.Empty
 * @returns JSX element with empty state message
 */
function CommandEmpty({ ...props }: ComponentProps<typeof CommandPrimitive.Empty>) {
	return <CommandPrimitive.Empty data-slot='command-empty' className='py-6 text-center text-sm' {...props} />
}

/**
 * Command group component for organizing related command items
 * Handles grouped command items with styled headings and proper spacing
 * @param props - Command group component props
 * @param props.className - Additional CSS classes for styling customization
 * @param props.props - All other props forwarded to CommandPrimitive.Group
 * @returns JSX element with grouped command items container
 */
function CommandGroup({ className, ...props }: ComponentProps<typeof CommandPrimitive.Group>) {
	return (
		<CommandPrimitive.Group
			data-slot='command-group'
			className={cn(
				'overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground',
				className,
			)}
			{...props}
		/>
	)
}

/**
 * Command separator component for visual division between command groups
 * Handles horizontal line separation with consistent border styling
 * @param props - Command separator component props
 * @param props.className - Additional CSS classes for styling customization
 * @param props.props - All other props forwarded to CommandPrimitive.Separator
 * @returns JSX element with horizontal separator line
 */
function CommandSeparator({ className, ...props }: ComponentProps<typeof CommandPrimitive.Separator>) {
	return (
		<CommandPrimitive.Separator
			data-slot='command-separator'
			className={cn('-mx-1 h-px bg-border', className)}
			{...props}
		/>
	)
}

/**
 * Command item component for individual selectable command options
 * Handles interactive command selection with hover states and keyboard navigation
 * @param props - Command item component props
 * @param props.className - Additional CSS classes for styling customization
 * @param props.props - All other props forwarded to CommandPrimitive.Item
 * @returns JSX element with selectable command item
 */
function CommandItem({ className, ...props }: ComponentProps<typeof CommandPrimitive.Item>) {
	return (
		<CommandPrimitive.Item
			data-slot='command-item'
			className={cn(
				"relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
				className,
			)}
			{...props}
		/>
	)
}

/**
 * Command shortcut component for displaying keyboard shortcuts
 * Handles keyboard shortcut text with proper spacing and muted styling
 * @param props - Command shortcut component props
 * @param props.className - Additional CSS classes for styling customization
 * @param props.props - All other props forwarded to span element
 * @returns JSX element with keyboard shortcut text
 */
function CommandShortcut({ className, ...props }: ComponentProps<'span'>) {
	return (
		<span
			data-slot='command-shortcut'
			className={cn('ml-auto text-xs tracking-widest text-muted-foreground', className)}
			{...props}
		/>
	)
}

export {
	Command,
	CommandDialog,
	CommandInput,
	CommandList,
	CommandEmpty,
	CommandGroup,
	CommandItem,
	CommandShortcut,
	CommandSeparator,
}
