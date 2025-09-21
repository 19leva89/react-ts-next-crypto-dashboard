import { ComponentProps } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from 'lucide-react'

import { cn } from '@/lib'
import { Button, buttonVariants } from '@/components/ui'

/**
 * Main pagination navigation wrapper component with accessibility attributes
 * Handles pagination navigation structure with proper ARIA labeling and centered layout
 * @param props - Pagination component props
 * @param props.className - Additional CSS classes for styling customization
 * @param props....props - All other props forwarded to nav element
 * @returns JSX element with accessible pagination navigation container
 */
function Pagination({ className, ...props }: ComponentProps<'nav'>) {
	return (
		<nav
			role='navigation'
			aria-label='pagination'
			data-slot='pagination'
			className={cn('mx-auto flex w-full justify-center', className)}
			{...props}
		/>
	)
}

/**
 * Pagination content component that contains all pagination items in a list
 * Handles horizontal layout for pagination links with proper spacing
 * @param props - Pagination content component props
 * @param props.className - Additional CSS classes for styling customization
 * @param props....props - All other props forwarded to ul element
 * @returns JSX element with pagination items list container
 */
function PaginationContent({ className, ...props }: ComponentProps<'ul'>) {
	return (
		<ul
			data-slot='pagination-content'
			className={cn('flex flex-row items-center gap-1', className)}
			{...props}
		/>
	)
}

/**
 * Pagination item wrapper component for individual pagination elements
 * Handles list item structure for pagination links and controls
 * @param props - Pagination item component props
 * @param props....props - All other props forwarded to li element
 * @returns JSX element with pagination list item wrapper
 */
function PaginationItem({ ...props }: ComponentProps<'li'>) {
	return <li data-slot='pagination-item' {...props} />
}

type PaginationLinkProps = {
	isActive?: boolean
} & Pick<ComponentProps<typeof Button>, 'size'> &
	ComponentProps<'a'>

/**
 * Pagination link component for navigating between pages
 * Handles clickable page links with active state styling and accessibility attributes
 * @param props - Pagination link component props
 * @param props.className - Additional CSS classes for styling customization
 * @param props.isActive - Whether this link represents the current active page
 * @param props.size - Button size variant from Button component
 * @param props....props - All other props forwarded to anchor element
 * @returns JSX element with styled pagination link and current page indication
 */
function PaginationLink({ className, isActive, size = 'icon', ...props }: PaginationLinkProps) {
	return (
		<a
			aria-current={isActive ? 'page' : undefined}
			data-slot='pagination-link'
			data-active={isActive}
			className={cn(
				buttonVariants({
					variant: isActive ? 'outline' : 'ghost',
					size,
				}),
				className,
			)}
			{...props}
		/>
	)
}

/**
 * Pagination previous button component for navigating to previous page
 * Handles previous page navigation with chevron icon and responsive text label
 * @param props - Pagination previous component props
 * @param props.className - Additional CSS classes for styling customization
 * @param props....props - All other props forwarded to PaginationLink
 * @returns JSX element with previous page navigation button
 */
function PaginationPrevious({ className, ...props }: ComponentProps<typeof PaginationLink>) {
	return (
		<PaginationLink
			aria-label='Go to previous page'
			size='default'
			className={cn('gap-1 px-2.5 sm:pl-2.5', className)}
			{...props}
		>
			<ChevronLeftIcon />
			<span className='hidden sm:block'>Previous</span>
		</PaginationLink>
	)
}

/**
 * Pagination next button component for navigating to next page
 * Handles next page navigation with chevron icon and responsive text label
 * @param props - Pagination next component props
 * @param props.className - Additional CSS classes for styling customization
 * @param props....props - All other props forwarded to PaginationLink
 * @returns JSX element with next page navigation button
 */
function PaginationNext({ className, ...props }: ComponentProps<typeof PaginationLink>) {
	return (
		<PaginationLink
			aria-label='Go to next page'
			size='default'
			className={cn('gap-1 px-2.5 sm:pr-2.5', className)}
			{...props}
		>
			<span className='hidden sm:block'>Next</span>
			<ChevronRightIcon />
		</PaginationLink>
	)
}

/**
 * Pagination ellipsis component for indicating omitted pages
 * Handles visual indicator for skipped pages with accessibility considerations
 * @param props - Pagination ellipsis component props
 * @param props.className - Additional CSS classes for styling customization
 * @param props....props - All other props forwarded to span element
 * @returns JSX element with ellipsis indicator and screen reader text
 */
function PaginationEllipsis({ className, ...props }: ComponentProps<'span'>) {
	return (
		<span
			aria-hidden
			data-slot='pagination-ellipsis'
			className={cn('flex size-9 items-center justify-center', className)}
			{...props}
		>
			<MoreHorizontalIcon className='size-4' />
			<span className='sr-only'>More pages</span>
		</span>
	)
}

export {
	Pagination,
	PaginationContent,
	PaginationLink,
	PaginationItem,
	PaginationPrevious,
	PaginationNext,
	PaginationEllipsis,
}
