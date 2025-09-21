'use client'

import { ComponentProps } from 'react'
import * as AvatarPrimitive from '@radix-ui/react-avatar'

import { cn } from '@/lib'

/**
 * Avatar root component wrapper that extends Radix UI Avatar primitive
 * Provides a circular container for user profile images with consistent sizing
 * @param props - Component props including className and Radix UI Avatar Root props
 * @param props.className - Additional CSS classes to merge with default avatar styling
 * @returns JSX element with styled avatar container
 */
function Avatar({ className, ...props }: ComponentProps<typeof AvatarPrimitive.Root>) {
	return (
		<AvatarPrimitive.Root
			data-slot='avatar'
			className={cn('relative flex size-8 shrink-0 overflow-hidden rounded-full', className)}
			{...props}
		/>
	)
}

/**
 * AvatarImage component wrapper that extends Radix UI Avatar Image primitive
 * Renders the actual profile image with proper aspect ratio and sizing
 * @param props - Component props including className and Radix UI Avatar Image props
 * @param props.className - Additional CSS classes to merge with default image styling
 * @returns JSX element with styled avatar image
 */
function AvatarImage({ className, ...props }: ComponentProps<typeof AvatarPrimitive.Image>) {
	return (
		<AvatarPrimitive.Image
			data-slot='avatar-image'
			className={cn('aspect-square size-full', className)}
			{...props}
		/>
	)
}

/**
 * AvatarFallback component wrapper that extends Radix UI Avatar Fallback primitive
 * Displays when the avatar image fails to load, typically showing initials or placeholder
 * @param props - Component props including className and Radix UI Avatar Fallback props
 * @param props.className - Additional CSS classes to merge with default fallback styling
 * @returns JSX element with styled fallback content container
 */
function AvatarFallback({ className, ...props }: ComponentProps<typeof AvatarPrimitive.Fallback>) {
	return (
		<AvatarPrimitive.Fallback
			data-slot='avatar-fallback'
			className={cn('flex size-full items-center justify-center rounded-full bg-muted', className)}
			{...props}
		/>
	)
}

export { Avatar, AvatarImage, AvatarFallback }
