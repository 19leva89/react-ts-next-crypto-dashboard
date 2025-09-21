'use client'

import { ComponentProps } from 'react'
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'

import { cn } from '@/lib'
import { buttonVariants } from '@/components/ui'

/**
 * AlertDialog root component wrapper that extends Radix UI AlertDialog primitive
 * Adds a data-slot attribute for component identification and styling
 * @param props - All props from Radix UI AlertDialog Root component
 * @returns JSX element with AlertDialog Root primitive and data-slot attribute
 */
function AlertDialog({ ...props }: ComponentProps<typeof AlertDialogPrimitive.Root>) {
	return <AlertDialogPrimitive.Root data-slot='alert-dialog' {...props} />
}

/**
 * AlertDialogTrigger component wrapper that extends Radix UI AlertDialog Trigger primitive
 * Adds a data-slot attribute for component identification and styling
 * @param props - All props from Radix UI AlertDialog Trigger component
 * @returns JSX element with AlertDialog Trigger primitive and data-slot attribute
 */
function AlertDialogTrigger({ ...props }: ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
	return <AlertDialogPrimitive.Trigger data-slot='alert-dialog-trigger' {...props} />
}

/**
 * AlertDialogPortal component wrapper that extends Radix UI AlertDialog Portal primitive
 * Adds a data-slot attribute for component identification and styling
 * @param props - All props from Radix UI AlertDialog Portal component
 * @returns JSX element with AlertDialog Portal primitive and data-slot attribute
 */
function AlertDialogPortal({ ...props }: ComponentProps<typeof AlertDialogPrimitive.Portal>) {
	return <AlertDialogPrimitive.Portal data-slot='alert-dialog-portal' {...props} />
}

/**
 * AlertDialogOverlay component wrapper that extends Radix UI AlertDialog Overlay primitive
 * Provides a semi-transparent backdrop with fade animations
 * @param props - Component props including className and Radix UI Overlay props
 * @param props.className - Additional CSS classes to merge with default styling
 * @returns JSX element with styled overlay and animation classes
 */
function AlertDialogOverlay({ className, ...props }: ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
	return (
		<AlertDialogPrimitive.Overlay
			data-slot='alert-dialog-overlay'
			className={cn(
				'fixed inset-0 z-50 bg-black/80 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0',
				className,
			)}
			{...props}
		/>
	)
}

/**
 * AlertDialogContent component wrapper that extends Radix UI AlertDialog Content primitive
 * Renders centered modal content with overlay and animations
 * @param props - Component props including className and Radix UI Content props
 * @param props.className - Additional CSS classes to merge with default styling
 * @returns JSX element with portal, overlay, and styled content container
 */
function AlertDialogContent({ className, ...props }: ComponentProps<typeof AlertDialogPrimitive.Content>) {
	return (
		<AlertDialogPortal>
			<AlertDialogOverlay />

			<AlertDialogPrimitive.Content
				data-slot='alert-dialog-content'
				className={cn(
					'fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background p-6 shadow-lg duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 sm:max-w-lg',
					className,
				)}
				{...props}
			/>
		</AlertDialogPortal>
	)
}

/**
 * AlertDialogHeader component for dialog header section
 * Provides consistent spacing and alignment for dialog headers
 * @param props - Standard div component props including className
 * @param props.className - Additional CSS classes to merge with default styling
 * @returns JSX div element with header styling
 */
function AlertDialogHeader({ className, ...props }: ComponentProps<'div'>) {
	return (
		<div
			data-slot='alert-dialog-header'
			className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
			{...props}
		/>
	)
}

/**
 * AlertDialogFooter component for dialog footer section
 * Provides consistent layout for dialog action buttons
 * @param props - Standard div component props including className
 * @param props.className - Additional CSS classes to merge with default styling
 * @returns JSX div element with footer styling and responsive button layout
 */
function AlertDialogFooter({ className, ...props }: ComponentProps<'div'>) {
	return (
		<div
			data-slot='alert-dialog-footer'
			className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
			{...props}
		/>
	)
}

/**
 * AlertDialogTitle component wrapper that extends Radix UI AlertDialog Title primitive
 * Renders the dialog title with consistent typography
 * @param props - Component props including className and Radix UI Title props
 * @param props.className - Additional CSS classes to merge with default styling
 * @returns JSX element with styled title text
 */
function AlertDialogTitle({ className, ...props }: ComponentProps<typeof AlertDialogPrimitive.Title>) {
	return (
		<AlertDialogPrimitive.Title
			data-slot='alert-dialog-title'
			className={cn('text-lg font-semibold', className)}
			{...props}
		/>
	)
}

/**
 * AlertDialogDescription component wrapper that extends Radix UI AlertDialog Description primitive
 * Renders the dialog description with muted styling
 * @param props - Component props including className and Radix UI Description props
 * @param props.className - Additional CSS classes to merge with default styling
 * @returns JSX element with styled description text
 */
function AlertDialogDescription({
	className,
	...props
}: ComponentProps<typeof AlertDialogPrimitive.Description>) {
	return (
		<AlertDialogPrimitive.Description
			data-slot='alert-dialog-description'
			className={cn('text-sm text-muted-foreground', className)}
			{...props}
		/>
	)
}

/**
 * AlertDialogAction component wrapper that extends Radix UI AlertDialog Action primitive
 * Renders the primary action button with destructive styling
 * @param props - Component props including className and Radix UI Action props
 * @param props.className - Additional CSS classes to merge with button variant styling
 * @returns JSX element with styled action button
 */
function AlertDialogAction({ className, ...props }: ComponentProps<typeof AlertDialogPrimitive.Action>) {
	return (
		<AlertDialogPrimitive.Action
			className={cn(buttonVariants({ variant: 'destructive' }), className)}
			{...props}
		/>
	)
}

/**
 * AlertDialogCancel component wrapper that extends Radix UI AlertDialog Cancel primitive
 * Renders the cancel button with outline styling
 * @param props - Component props including className and Radix UI Cancel props
 * @param props.className - Additional CSS classes to merge with button variant styling
 * @returns JSX element with styled cancel button
 */
function AlertDialogCancel({ className, ...props }: ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
	return (
		<AlertDialogPrimitive.Cancel
			className={cn(buttonVariants({ variant: 'outline' }), className)}
			{...props}
		/>
	)
}

export {
	AlertDialog,
	AlertDialogPortal,
	AlertDialogOverlay,
	AlertDialogTrigger,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogFooter,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogAction,
	AlertDialogCancel,
}
