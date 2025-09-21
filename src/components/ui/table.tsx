import { ComponentProps } from 'react'

import { cn } from '@/lib'

/**
 * Root table component with styled appearance and responsive layout
 * Provides base table structure with full width and consistent text styling
 * @param props - Table component props
 * @param props.className - Additional CSS classes for styling customization
 * @param props....props - All other props forwarded to table HTML element
 * @returns JSX element with table container and data-slot attribute
 */
function Table({ className, ...props }: ComponentProps<'table'>) {
	return <table data-slot='table' className={cn('w-full caption-bottom text-sm', className)} {...props} />
}

/**
 * Table header component with border styling and semantic structure
 * Provides header container with bottom border for visual separation
 * @param props - Table header component props
 * @param props.className - Additional CSS classes for styling customization
 * @param props....props - All other props forwarded to thead HTML element
 * @returns JSX element with table header container and data-slot attribute
 */
function TableHeader({ className, ...props }: ComponentProps<'thead'>) {
	return <thead data-slot='table-header' className={cn('[&_tr]:border-b', className)} {...props} />
}

/**
 * Table body component with row border management
 * Provides body container with conditional borders on rows for clean appearance
 * @param props - Table body component props
 * @param props.className - Additional CSS classes for styling customization
 * @param props....props - All other props forwarded to tbody HTML element
 * @returns JSX element with table body container and data-slot attribute
 */
function TableBody({ className, ...props }: ComponentProps<'tbody'>) {
	return <tbody data-slot='table-body' className={cn('[&_tr:last-child]:border-0', className)} {...props} />
}

/**
 * Table footer component with background and typography styling
 * Provides footer container with muted background and medium font weight
 * @param props - Table footer component props
 * @param props.className - Additional CSS classes for styling customization
 * @param props....props - All other props forwarded to tfoot HTML element
 * @returns JSX element with table footer container and data-slot attribute
 */
function TableFooter({ className, ...props }: ComponentProps<'tfoot'>) {
	return (
		<tfoot
			data-slot='table-footer'
			className={cn('border-t bg-muted/50 font-medium [&>tr]:last:border-b-0', className)}
			{...props}
		/>
	)
}

/**
 * Table row component with hover effects and selection states
 * Handles interactive states with hover highlighting and selection styling
 * @param props - Table row component props
 * @param props.className - Additional CSS classes for styling customization
 * @param props....props - All other props forwarded to tr HTML element
 * @returns JSX element with table row container and data-slot attribute
 */
function TableRow({ className, ...props }: ComponentProps<'tr'>) {
	return (
		<tr
			data-slot='table-row'
			className={cn('border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted', className)}
			{...props}
		/>
	)
}

/**
 * Table header cell component with typography and alignment styling
 * Provides header cell with left alignment, medium font weight, and checkbox support
 * @param props - Table head component props
 * @param props.className - Additional CSS classes for styling customization
 * @param props....props - All other props forwarded to th HTML element
 * @returns JSX element with table header cell and data-slot attribute
 */
function TableHead({ className, ...props }: ComponentProps<'th'>) {
	return (
		<th
			data-slot='table-head'
			className={cn(
				'h-12 px-4 text-left align-middle font-medium whitespace-nowrap text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
				className,
			)}
			{...props}
		/>
	)
}

/**
 * Table data cell component with padding and alignment styling
 * Provides data cell with consistent padding, alignment, and checkbox support
 * @param props - Table cell component props
 * @param props.className - Additional CSS classes for styling customization
 * @param props....props - All other props forwarded to td HTML element
 * @returns JSX element with table data cell and data-slot attribute
 */
function TableCell({ className, ...props }: ComponentProps<'td'>) {
	return (
		<td
			data-slot='table-cell'
			className={cn(
				'p-4 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
				className,
			)}
			{...props}
		/>
	)
}

/**
 * Table caption component with muted styling for accessibility
 * Provides table caption with subtle text styling and proper positioning
 * @param props - Table caption component props
 * @param props.className - Additional CSS classes for styling customization
 * @param props....props - All other props forwarded to caption HTML element
 * @returns JSX element with table caption and data-slot attribute
 */
function TableCaption({ className, ...props }: ComponentProps<'caption'>) {
	return (
		<caption
			data-slot='table-caption'
			className={cn('mt-4 text-sm text-muted-foreground', className)}
			{...props}
		/>
	)
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption }
