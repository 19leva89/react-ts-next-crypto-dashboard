'use client'

import { ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib'
import { Button, Input, Textarea } from '@/components/ui'

/**
 * A container for input groups that allows addons, buttons, and text to be placed around inputs or text areas.
 * Handles alignment variants, focus states, and error styling for the entire group.
 * @param props - InputGroup component props
 * @param props.className - Additional CSS classes for styling customization
 * @param props.children - Child elements like InputGroupInput, InputGroupAddon, etc.
 * @param props.props - All other props forwarded to the div element
 * @returns JSX element with styled input group container and accessibility features
 */
function InputGroup({ className, ...props }: ComponentProps<'div'>) {
	return (
		<div
			role='group'
			data-slot='input-group'
			className={cn(
				'group/input-group relative flex w-full items-center rounded-md border border-input shadow-xs transition-[color,box-shadow] outline-none dark:bg-input/30',
				'h-9 has-[>textarea]:h-auto',

				// Variants based on alignment.
				'has-[>[data-align=inline-start]]:[&>input]:pl-2',
				'has-[>[data-align=inline-end]]:[&>input]:pr-2',
				'has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-start]]:[&>input]:pb-3',
				'has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-end]]:[&>input]:pt-3',

				// Focus state.
				'has-[[data-slot=input-group-control]:focus-visible]:ring-1 has-[[data-slot=input-group-control]:focus-visible]:ring-ring',

				// Error state.
				'has-[[data-slot][aria-invalid=true]]:border-destructive has-[[data-slot][aria-invalid=true]]:ring-destructive/20 dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40',

				className,
			)}
			{...props}
		/>
	)
}

const inputGroupAddonVariants = cva(
	"flex h-auto cursor-text items-center justify-center gap-2 py-1.5 text-sm font-medium text-muted-foreground select-none group-data-[disabled=true]/input-group:opacity-50 [&>kbd]:rounded-[calc(var(--radius)-5px)] [&>svg:not([class*='size-'])]:size-4",
	{
		variants: {
			align: {
				'inline-start': 'order-first pl-3 has-[>button]:ml-[-0.45rem] has-[>kbd]:ml-[-0.35rem]',
				'inline-end': 'order-last pr-3 has-[>button]:mr-[-0.4rem] has-[>kbd]:mr-[-0.35rem]',
				'block-start':
					'order-first w-full justify-start px-3 pt-3 group-has-[>input]/input-group:pt-2.5 [.border-b]:pb-3',
				'block-end':
					'order-last w-full justify-start px-3 pb-3 group-has-[>input]/input-group:pb-2.5 [.border-t]:pt-3',
			},
		},
		defaultVariants: {
			align: 'inline-start',
		},
	},
)

/**
 * An addon element for the input group, such as icons or labels.
 * Supports alignment variants (inline-start, inline-end, block-start, block-end) for positioning.
 * @param props - InputGroupAddon component props
 * @param props.className - Additional CSS classes for styling customization
 * @param props.align - Alignment position: 'inline-start', 'inline-end', 'block-start', or 'block-end'
 * @param props.children - Child elements like icons or text
 * @param props.props - All other props forwarded to the div element
 * @returns JSX element with styled addon and click-to-focus functionality
 * @example
 * <InputGroup>
 *   <InputGroupAddon align="inline-start">
 *     <SearchIcon />
 *   </InputGroupAddon>
 *   <InputGroupInput />
 * </InputGroup>
 */
function InputGroupAddon({
	className,
	align = 'inline-start',
	...props
}: ComponentProps<'div'> & VariantProps<typeof inputGroupAddonVariants>) {
	return (
		<div
			data-slot='input-group-addon'
			data-align={align}
			className={cn(inputGroupAddonVariants({ align }), className)}
			onClick={(e) => {
				if ((e.target as HTMLElement).closest('button')) {
					return
				}

				const control = e.currentTarget.parentElement?.querySelector<HTMLInputElement | HTMLTextAreaElement>(
					'input, textarea',
				)

				control?.focus()
			}}
			{...props}
		/>
	)
}

const inputGroupButtonVariants = cva('flex items-center gap-2 text-sm shadow-none', {
	variants: {
		size: {
			xs: "h-6 gap-1 rounded-[calc(var(--radius)-5px)] px-2 has-[>svg]:px-2 [&>svg:not([class*='size-'])]:size-3.5",
			sm: 'h-8 gap-1.5 rounded-md px-2.5 has-[>svg]:px-2.5',
			'icon-xs': 'size-6 rounded-[calc(var(--radius)-5px)] p-0 has-[>svg]:p-0',
			'icon-sm': 'size-8 p-0 has-[>svg]:p-0',
		},
	},
	defaultVariants: {
		size: 'xs',
	},
})

/**
 * A button within the input group, such as for submitting or toggling.
 * Integrates with Button component and supports size variants for compact layouts.
 * @param props - InputGroupButton component props
 * @param props.className - Additional CSS classes for styling customization
 * @param props.type - Button type: 'button', 'submit', or 'reset'
 * @param props.variant - Button variant: 'ghost' by default for subtle appearance
 * @param props.size - Button size: 'xs', 'sm', 'icon-xs', or 'icon-sm'
 * @param props.children - Button content like text or icons
 * @param props.props - All other props forwarded to the Button element
 * @returns JSX element with styled button integrated into the input group
 * @example
 * <InputGroup>
 *   <InputGroupInput />
 *   <InputGroupButton size="sm">Submit</InputGroupButton>
 * </InputGroup>
 */
function InputGroupButton({
	className,
	type = 'button',
	variant = 'ghost',
	size = 'xs',
	...props
}: Omit<ComponentProps<typeof Button>, 'size'> & VariantProps<typeof inputGroupButtonVariants>) {
	return (
		<Button
			type={type}
			data-size={size}
			variant={variant}
			className={cn(inputGroupButtonVariants({ size }), className)}
			{...props}
		/>
	)
}

/**
 * Static text or icons within the input group.
 * Provides non-interactive elements like labels or prefixes with consistent styling.
 * @param props - InputGroupText component props
 * @param props.className - Additional CSS classes for styling customization
 * @param props.children - Text or icon content
 * @param props.props - All other props forwarded to the span element
 * @returns JSX element with styled static text and pointer-events handling for icons
 * @example
 * <InputGroup>
 *   <InputGroupText>
 *     https://example.com
 *   </InputGroupText>
 *   <InputGroupInput />
 * </InputGroup>
 */
function InputGroupText({ className, ...props }: ComponentProps<'span'>) {
	return (
		<span
			className={cn(
				"flex items-center gap-2 text-sm text-muted-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
				className,
			)}
			{...props}
		/>
	)
}

/**
 * The input element for the input group.
 * Integrates with Input component, removing borders for seamless group appearance.
 * @param props - InputGroupInput component props
 * @param props.className - Additional CSS classes for styling customization
 * @param props.placeholder - Placeholder text for the input
 * @param props.value - Controlled input value
 * @param props.onChange - Change event handler
 * @param props.props - All other props forwarded to the input element (e.g., type, disabled)
 * @returns JSX element with styled input field adapted for input groups
 * @example
 * <InputGroup>
 *   <InputGroupInput placeholder="Enter text..." />
 * </InputGroup>
 */
function InputGroupInput({ className, ...props }: ComponentProps<'input'>) {
	return (
		<Input
			data-slot='input-group-control'
			className={cn(
				'flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent',
				className,
			)}
			{...props}
		/>
	)
}

/**
 * The textarea element for the input group.
 * Integrates with Textarea component, supporting multi-line input in groups.
 * @param props - InputGroupTextarea component props
 * @param props.className - Additional CSS classes for styling customization
 * @param props.placeholder - Placeholder text for the textarea
 * @param props.value - Controlled textarea value
 * @param props.onChange - Change event handler
 * @param props.props - All other props forwarded to the textarea element (e.g., rows, disabled)
 * @returns JSX element with styled textarea adapted for input groups
 * @example
 * <InputGroup>
 *   <InputGroupTextarea placeholder="Enter message..." />
 * </InputGroup>
 */
function InputGroupTextarea({ className, ...props }: ComponentProps<'textarea'>) {
	return (
		<Textarea
			data-slot='input-group-control'
			className={cn(
				'flex-1 resize-none rounded-none border-0 bg-transparent py-3 shadow-none focus-visible:ring-0 dark:bg-transparent',
				className,
			)}
			{...props}
		/>
	)
}

export { InputGroup, InputGroupAddon, InputGroupButton, InputGroupText, InputGroupInput, InputGroupTextarea }
