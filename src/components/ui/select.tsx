'use client'

import { ComponentProps } from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react'

import { cn } from '@/lib'

/**
 * Main select component wrapper for dropdown select functionality
 * Handles select state management and accessibility features
 * @param props - Select component props
 * @param props.props - All other props forwarded to SelectPrimitive.Root
 * @returns JSX element with select root container
 */
function Select({ ...props }: ComponentProps<typeof SelectPrimitive.Root>) {
	return <SelectPrimitive.Root data-slot='select' {...props} />
}

/**
 * Select group component for organizing related select options
 * Handles grouped select items with proper semantic structure
 * @param props - Select group component props
 * @param props.props - All other props forwarded to SelectPrimitive.Group
 * @returns JSX element with grouped select options container
 */
function SelectGroup({ ...props }: ComponentProps<typeof SelectPrimitive.Group>) {
	return <SelectPrimitive.Group data-slot='select-group' {...props} />
}

/**
 * Select value component that displays the currently selected option
 * Handles selected value presentation with placeholder support
 * @param props - Select value component props
 * @param props.props - All other props forwarded to SelectPrimitive.Value
 * @returns JSX element with current select value display
 */
function SelectValue({ ...props }: ComponentProps<typeof SelectPrimitive.Value>) {
	return <SelectPrimitive.Value data-slot='select-value' {...props} />
}

/**
 * Select trigger component that opens the dropdown when clicked
 * Handles trigger button with chevron icon animation and focus states
 * @param props - Select trigger component props
 * @param props.className - Additional CSS classes for styling customization
 * @param props.children - Content to render inside trigger button
 * @param props.props - All other props forwarded to SelectPrimitive.Trigger
 * @returns JSX element with select trigger button and animated chevron
 */
function SelectTrigger({ className, children, ...props }: ComponentProps<typeof SelectPrimitive.Trigger>) {
	return (
		<SelectPrimitive.Trigger
			data-slot='select-trigger'
			className={cn(
				"group flex h-10 w-fit cursor-pointer items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[placeholder]:text-muted-foreground *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
				className,
			)}
			{...props}
		>
			{children}

			<SelectPrimitive.Icon asChild>
				<div className='relative size-5 transition-transform duration-300 group-hover:rotate-180'>
					<ChevronDownIcon size={16} className='absolute inset-0 m-auto size-4' />
				</div>
			</SelectPrimitive.Icon>
		</SelectPrimitive.Trigger>
	)
}

/**
 * Select content component that contains the dropdown options
 * Handles positioned dropdown content with animations and scroll buttons
 * @param props - Select content component props
 * @param props.className - Additional CSS classes for styling customization
 * @param props.children - Select options and groups to render in dropdown
 * @param props.position - Positioning strategy ('popper' or 'item-aligned')
 * @param props.props - All other props forwarded to SelectPrimitive.Content
 * @returns JSX element with styled dropdown content container and scroll controls
 */
function SelectContent({
	className,
	children,
	position = 'popper',
	...props
}: ComponentProps<typeof SelectPrimitive.Content>) {
	return (
		<SelectPrimitive.Portal>
			<SelectPrimitive.Content
				data-slot='select-content'
				className={cn(
					'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
					position === 'popper' &&
						'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
					className,
				)}
				position={position}
				{...props}
			>
				<SelectScrollUpButton />
				<SelectPrimitive.Viewport
					className={cn(
						'p-1',
						position === 'popper' &&
							'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1',
					)}
				>
					{children}
				</SelectPrimitive.Viewport>
				<SelectScrollDownButton />
			</SelectPrimitive.Content>
		</SelectPrimitive.Portal>
	)
}

/**
 * Select label component for section headings within dropdown
 * Handles non-interactive labels for organizing select options into sections
 * @param props - Select label component props
 * @param props.className - Additional CSS classes for styling customization
 * @param props.props - All other props forwarded to SelectPrimitive.Label
 * @returns JSX element with select section label
 */
function SelectLabel({ className, ...props }: ComponentProps<typeof SelectPrimitive.Label>) {
	return (
		<SelectPrimitive.Label
			data-slot='select-label'
			className={cn('px-2 py-1.5 text-sm font-medium', className)}
			{...props}
		/>
	)
}

/**
 * Select item component for individual selectable options
 * Handles interactive option selection with check indicator and disabled states
 * @param props - Select item component props
 * @param props.className - Additional CSS classes for styling customization
 * @param props.children - Content to display as option text
 * @param props.props - All other props forwarded to SelectPrimitive.Item
 * @returns JSX element with selectable option and selection indicator
 */
function SelectItem({ className, children, ...props }: ComponentProps<typeof SelectPrimitive.Item>) {
	return (
		<SelectPrimitive.Item
			data-slot='select-item'
			className={cn(
				"relative flex w-full cursor-pointer items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
				className,
			)}
			{...props}
		>
			<span className='absolute right-2 flex size-3.5 items-center justify-center'>
				<SelectPrimitive.ItemIndicator>
					<CheckIcon className='size-4' />
				</SelectPrimitive.ItemIndicator>
			</span>
			<SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
		</SelectPrimitive.Item>
	)
}

/**
 * Select separator component for visual division between option groups
 * Handles horizontal line separation with consistent border styling
 * @param props - Select separator component props
 * @param props.className - Additional CSS classes for styling customization
 * @param props.props - All other props forwarded to SelectPrimitive.Separator
 * @returns JSX element with horizontal separator line
 */
function SelectSeparator({ className, ...props }: ComponentProps<typeof SelectPrimitive.Separator>) {
	return (
		<SelectPrimitive.Separator
			data-slot='select-separator'
			className={cn('pointer-events-none -mx-1 my-1 h-px bg-border', className)}
			{...props}
		/>
	)
}

/**
 * Select scroll up button component for navigating long option lists
 * Handles upward scrolling control with chevron icon for dropdown navigation
 * @param props - Select scroll up button component props
 * @param props.className - Additional CSS classes for styling customization
 * @param props.props - All other props forwarded to SelectPrimitive.ScrollUpButton
 * @returns JSX element with scroll up button and chevron icon
 */
function SelectScrollUpButton({
	className,
	...props
}: ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
	return (
		<SelectPrimitive.ScrollUpButton
			data-slot='select-scroll-up-button'
			className={cn('flex cursor-pointer items-center justify-center py-1', className)}
			{...props}
		>
			<ChevronUpIcon className='size-4' />
		</SelectPrimitive.ScrollUpButton>
	)
}

/**
 * Select scroll down button component for navigating long option lists
 * Handles downward scrolling control with chevron icon for dropdown navigation
 * @param props - Select scroll down button component props
 * @param props.className - Additional CSS classes for styling customization
 * @param props.props - All other props forwarded to SelectPrimitive.ScrollDownButton
 * @returns JSX element with scroll down button and chevron icon
 */
function SelectScrollDownButton({
	className,
	...props
}: ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
	return (
		<SelectPrimitive.ScrollDownButton
			data-slot='select-scroll-down-button'
			className={cn('flex cursor-pointer items-center justify-center py-1', className)}
			{...props}
		>
			<ChevronDownIcon className='size-4' />
		</SelectPrimitive.ScrollDownButton>
	)
}

export {
	Select,
	SelectGroup,
	SelectValue,
	SelectTrigger,
	SelectContent,
	SelectLabel,
	SelectItem,
	SelectSeparator,
	SelectScrollUpButton,
	SelectScrollDownButton,
}
