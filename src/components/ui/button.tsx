import { Loader2 } from 'lucide-react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { ButtonHTMLAttributes, Children, forwardRef, isValidElement } from 'react'

import { cn } from '@/lib'

const buttonVariants = cva(
	'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
	{
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground hover:bg-primary/80',
				destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
				outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
				secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
				ghost: 'hover:bg-accent hover:text-accent-foreground',
				link: 'text-primary underline-offset-4 hover:underline',
			},
			size: {
				default: 'h-10 px-4 py-2',
				sm: 'h-9 rounded-md px-3',
				lg: 'h-11 rounded-md px-8',
				icon: 'h-10 w-10',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
)

export interface ButtonProps
	extends ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean
	loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, children, disabled, loading, ...props }, ref) => {
		const Comp = asChild ? Slot : 'button'
		const childArray = Children.toArray(children)

		let content

		if (loading) {
			if (childArray.length === 2 && isValidElement(childArray[0])) {
				// If two parts are passed (icon + text), replace the first one with Loader2
				content = (
					<>
						<Loader2 className="w-5 h-5 animate-spin" />
						{childArray[1]}
					</>
				)
			} else {
				// If there is no icon, just add Loader2 to the left
				content = (
					<>
						<Loader2 className="w-5 h-5 animate-spin" />
						{children}
					</>
				)
			}
		} else {
			content = children
		}

		return (
			<Comp
				disabled={disabled || loading}
				className={cn(buttonVariants({ variant, size, className }))}
				ref={ref}
				{...props}
			>
				{content}
			</Comp>
		)
	},
)
Button.displayName = 'Button'

export { Button, buttonVariants }
