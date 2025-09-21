'use client'

import { ComponentProps } from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'

import { cn } from '@/lib'

/**
 * Switch component with styled appearance and accessibility features
 * Handles checked/unchecked states with focus management and validation styling
 * @param props - Switch component props
 * @param props.className - Additional CSS classes for styling customization
 * @param props....props - All other props passed to SwitchPrimitive.Root component
 * @returns JSX element with switch root container and thumb indicator
 */
function Switch({ className, ...props }: ComponentProps<typeof SwitchPrimitive.Root>) {
	return (
		<SwitchPrimitive.Root
			data-slot='switch'
			className={cn(
				'peer inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80',
				className,
			)}
			{...props}
		>
			<SwitchPrimitive.Thumb
				data-slot='switch-thumb'
				className={cn(
					'pointer-events-none block size-4 rounded-full bg-background ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0 dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground',
				)}
			/>
		</SwitchPrimitive.Root>
	)
}

export { Switch }
