'use client'

import { useCallback } from 'react'
import { useTheme } from 'next-themes'
import { MoonIcon, SunIcon } from 'lucide-react'

import { Button } from '@/components/ui'
import { META_THEME_COLORS, useMetaColor } from '@/hooks/use-meta-color'

export const ModeToggle = () => {
	const { setMetaColor } = useMetaColor()
	const { setTheme, resolvedTheme } = useTheme()

	const toggleTheme = useCallback(() => {
		setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
		setMetaColor(resolvedTheme === 'dark' ? META_THEME_COLORS.light : META_THEME_COLORS.dark)
	}, [resolvedTheme, setTheme, setMetaColor])

	return (
		<Button
			variant='outline'
			size='lg'
			onClick={toggleTheme}
			className='group flex w-11 items-center rounded-xl px-2 transition-colors duration-300 ease-in-out'
		>
			<div className='relative h-6 w-6 transition-transform duration-300 ease-in-out group-hover:rotate-90'>
				<SunIcon
					size={20}
					className='absolute inset-0 m-auto size-5! opacity-0 transition-opacity duration-300 [html.dark_&]:opacity-100'
				/>

				<MoonIcon
					size={20}
					className='absolute inset-0 m-auto size-5! opacity-0 transition-opacity duration-300 [html.light_&]:opacity-100'
				/>

				<span className='sr-only'>Toggle theme</span>
			</div>
		</Button>
	)
}
