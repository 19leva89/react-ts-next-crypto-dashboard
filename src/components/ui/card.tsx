import { ComponentProps } from 'react'

import { cn } from '@/lib'

/**
 * Card root component that provides a container with consistent styling and layout
 * Creates a bordered container with shadow, padding, and background styling
 * @param props - Standard div component props including className
 * @param props.className - Additional CSS classes to merge with default card styling
 * @returns JSX div element with card container styling
 */
function Card({ className, ...props }: ComponentProps<'div'>) {
	return (
		<div
			data-slot='card'
			className={cn(
				'flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm',
				className,
			)}
			{...props}
		/>
	)
}

/**
 * Card header section component for displaying titles and descriptions at the top of cards
 * Provides consistent spacing and layout for header content
 * @param props - Standard div component props including className
 * @param props.className - Additional CSS classes to merge with default header styling
 * @returns JSX div element with card header styling and padding
 */
function CardHeader({ className, ...props }: ComponentProps<'div'>) {
	return <div data-slot='card-header' className={cn('flex flex-col gap-1.5 px-6', className)} {...props} />
}

/**
 * Card title component for displaying the main heading of a card
 * Applies semibold font weight and proper line height for titles
 * @param props - Standard div component props including className
 * @param props.className - Additional CSS classes to merge with default title styling
 * @returns JSX div element with card title typography styling
 */
function CardTitle({ className, ...props }: ComponentProps<'div'>) {
	return <div data-slot='card-title' className={cn('leading-none font-semibold', className)} {...props} />
}

/**
 * Card description component for displaying secondary text content
 * Applies muted color and smaller font size for descriptive text
 * @param props - Standard div component props including className
 * @param props.className - Additional CSS classes to merge with default description styling
 * @returns JSX div element with muted description text styling
 */
function CardDescription({ className, ...props }: ComponentProps<'div'>) {
	return (
		<div data-slot='card-description' className={cn('text-sm text-muted-foreground', className)} {...props} />
	)
}

/**
 * Card content section component for the main body content of cards
 * Provides consistent horizontal padding for card content areas
 * @param props - Standard div component props including className
 * @param props.className - Additional CSS classes to merge with default content styling
 * @returns JSX div element with card content padding
 */
function CardContent({ className, ...props }: ComponentProps<'div'>) {
	return <div data-slot='card-content' className={cn('px-6', className)} {...props} />
}

/**
 * Card footer section component for actions and additional content at the bottom of cards
 * Provides horizontal layout and consistent padding for footer elements
 * @param props - Standard div component props including className
 * @param props.className - Additional CSS classes to merge with default footer styling
 * @returns JSX div element with card footer styling and flexbox layout
 */
function CardFooter({ className, ...props }: ComponentProps<'div'>) {
	return <div data-slot='card-footer' className={cn('flex items-center px-6', className)} {...props} />
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
