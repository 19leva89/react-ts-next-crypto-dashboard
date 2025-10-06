'use client'

import { XIcon } from 'lucide-react'
import { ComponentProps } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'

import { cn } from '@/lib'

/**
 * Main dialog component wrapper for modal functionality
 * Handles dialog state management and accessibility features
 * @param props - Dialog component props
 * @param props.props - All other props forwarded to DialogPrimitive.Root
 * @returns JSX element with dialog root container
 */
function Dialog({ ...props }: ComponentProps<typeof DialogPrimitive.Root>) {
	return <DialogPrimitive.Root data-slot='dialog' {...props} />
}

/**
 * Dialog trigger component that opens the modal when activated
 * Handles click events to trigger dialog opening with proper accessibility
 * @param props - Dialog trigger component props
 * @param props.props - All other props forwarded to DialogPrimitive.Trigger
 * @returns JSX element with dialog trigger button
 */
function DialogTrigger({ ...props }: ComponentProps<typeof DialogPrimitive.Trigger>) {
	return <DialogPrimitive.Trigger data-slot='dialog-trigger' {...props} />
}

/**
 * Dialog portal component for rendering dialog content outside DOM hierarchy
 * Handles portal rendering to avoid z-index and overflow issues
 * @param props - Dialog portal component props
 * @param props.props - All other props forwarded to DialogPrimitive.Portal
 * @returns JSX element with portal container
 */
function DialogPortal({ ...props }: ComponentProps<typeof DialogPrimitive.Portal>) {
	return <DialogPrimitive.Portal data-slot='dialog-portal' {...props} />
}

/**
 * Dialog close component for closing the modal dialog
 * Handles dialog dismissal with proper accessibility and focus management
 * @param props - Dialog close component props
 * @param props.props - All other props forwarded to DialogPrimitive.Close
 * @returns JSX element with dialog close button
 */
function DialogClose({ ...props }: ComponentProps<typeof DialogPrimitive.Close>) {
	return <DialogPrimitive.Close data-slot='dialog-close' {...props} />
}

/**
 * Dialog overlay component that provides backdrop for modal dialogs
 * Handles backdrop styling with fade animations and click-to-close functionality
 * @param props - Dialog overlay component props
 * @param props.className - Additional CSS classes for styling customization
 * @param props.props - All other props forwarded to DialogPrimitive.Overlay
 * @returns JSX element with styled dialog backdrop
 */
function DialogOverlay({ className, ...props }: ComponentProps<typeof DialogPrimitive.Overlay>) {
	return (
		<DialogPrimitive.Overlay
			data-slot='dialog-overlay'
			className={cn(
				'fixed inset-0 z-50 bg-black/80 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0',
				className,
			)}
			{...props}
		/>
	)
}

/**
 * Dialog content component that contains the main modal content
 * Handles centered modal positioning with animations and built-in close button
 * @param props - Dialog content component props
 * @param props.className - Additional CSS classes for styling customization
 * @param props.children - Content to render inside dialog
 * @param props.props - All other props forwarded to DialogPrimitive.Content
 * @returns JSX element with centered dialog content and close button
 */
function DialogContent({ className, children, ...props }: ComponentProps<typeof DialogPrimitive.Content>) {
	return (
		<DialogPortal data-slot='dialog-portal'>
			<DialogOverlay />

			<DialogPrimitive.Content
				data-slot='dialog-content'
				className={cn(
					'fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-1rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background p-6 shadow-lg duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 sm:max-w-lg',
					className,
				)}
				{...props}
			>
				{children}
				<DialogPrimitive.Close className="absolute top-4 right-4 cursor-pointer rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
					<XIcon />

					<span className='sr-only'>Close</span>
				</DialogPrimitive.Close>
			</DialogPrimitive.Content>
		</DialogPortal>
	)
}

/**
 * Dialog header component for organizing dialog title and description
 * Handles responsive header layout with proper spacing and text alignment
 * @param props - Dialog header component props
 * @param props.className - Additional CSS classes for styling customization
 * @param props.props - All other props forwarded to div element
 * @returns JSX element with dialog header container
 */
function DialogHeader({ className, ...props }: ComponentProps<'div'>) {
	return (
		<div
			data-slot='dialog-header'
			className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
			{...props}
		/>
	)
}

/**
 * Dialog footer component for action buttons and controls
 * Handles responsive footer layout with proper button alignment and stacking
 * @param props - Dialog footer component props
 * @param props.className - Additional CSS classes for styling customization
 * @param props.props - All other props forwarded to div element
 * @returns JSX element with dialog footer container
 */
function DialogFooter({ className, ...props }: ComponentProps<'div'>) {
	return (
		<div
			data-slot='dialog-footer'
			className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
			{...props}
		/>
	)
}

/**
 * Dialog title component for accessible dialog heading
 * Handles semantic dialog title with proper typography and accessibility attributes
 * @param props - Dialog title component props
 * @param props.className - Additional CSS classes for styling customization
 * @param props.props - All other props forwarded to DialogPrimitive.Title
 * @returns JSX element with dialog title heading
 */
function DialogTitle({ className, ...props }: ComponentProps<typeof DialogPrimitive.Title>) {
	return (
		<DialogPrimitive.Title
			data-slot='dialog-title'
			className={cn('text-lg leading-none font-semibold', className)}
			{...props}
		/>
	)
}

/**
 * Dialog description component for additional dialog context
 * Handles accessible dialog description with muted text styling
 * @param props - Dialog description component props
 * @param props.className - Additional CSS classes for styling customization
 * @param props.props - All other props forwarded to DialogPrimitive.Description
 * @returns JSX element with dialog description text
 */
function DialogDescription({ className, ...props }: ComponentProps<typeof DialogPrimitive.Description>) {
	return (
		<DialogPrimitive.Description
			data-slot='dialog-description'
			className={cn('text-sm text-muted-foreground', className)}
			{...props}
		/>
	)
}

export {
	Dialog,
	DialogPortal,
	DialogOverlay,
	DialogClose,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogFooter,
	DialogTitle,
	DialogDescription,
}
