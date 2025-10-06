import { ComponentProps } from 'react'
import { LoaderIcon } from 'lucide-react'

import { cn } from '@/lib'

/**
 * Renders a spinner component
 * @param props - Spinner component props
 * @param props.className - Additional CSS classes for styling customization
 * @param props.props - All other props passed to the SVG component
 * @returns - JSX element with the spinner
 */
function Spinner({ className, ...props }: ComponentProps<'svg'>) {
	return (
		<LoaderIcon
			role='status'
			aria-label='Loading'
			className={cn('size-4 animate-spin text-primary', className)}
			{...props}
		/>
	)
}

export { Spinner }
