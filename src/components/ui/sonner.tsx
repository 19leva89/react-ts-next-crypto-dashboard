'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner, ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
	const { theme = 'system' } = useTheme()

	return (
		<Sonner
			theme={theme as ToasterProps['theme']}
			className='toaster group'
			toastOptions={{
				classNames: {
					toast:
						'!rounded-xl group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
					description: 'group-[.toast]:text-muted-foreground',
					actionButton:
						'!rounded-xl group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-medium',
					cancelButton:
						'!rounded-xl group-[.toast]:bg-muted group-[.toast]:text-muted-foreground font-medium',
				},
			}}
			{...props}
		/>
	)
}

export { Toaster }
