import { LoaderIcon } from 'lucide-react'
import { Slot } from '@radix-ui/react-slot'
import { Children, ComponentProps, isValidElement } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib'

const buttonVariants = cva(
	"inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
	{
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
				destructive:
					'bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
				outline: 'border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground',
				secondary: 'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
				ghost: 'hover:bg-accent hover:text-accent-foreground',
				link: 'text-primary underline-offset-4 hover:underline',
			},
			size: {
				default: 'h-10 px-4 py-2 has-[>svg]:px-3',
				sm: 'h-9 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5',
				lg: 'h-11 rounded-md px-6 has-[>svg]:px-4',
				icon: 'size-10',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
)

function Button({
	className,
	variant,
	size,
	asChild = false,
	children,
	disabled,
	loading,
	...props
}: ComponentProps<'button'> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean
		loading?: boolean
	}) {
	const Comp = asChild ? Slot : 'button'
	const childArray = Children.toArray(children)

	let content

	if (loading) {
		if (childArray.length === 2 && isValidElement(childArray[0])) {
			// If two parts are passed (icon + text), replace the first one with Loader2
			content = (
				<>
					<LoaderIcon className='size-5 animate-spin text-primary' />
					{childArray[1]}
				</>
			)
		} else {
			// If there is no icon, just add Loader2 to the left
			content = (
				<>
					<LoaderIcon className='size-5 animate-spin text-primary' />
					{children}
				</>
			)
		}
	} else {
		content = children
	}

	return (
		<Comp
			data-slot='button'
			disabled={disabled || loading}
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		>
			{content}
		</Comp>
	)
}

export { Button, buttonVariants }
