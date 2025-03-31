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
			variant="outline"
			size="lg"
			onClick={toggleTheme}
			className="flex items-center px-2 w-11 rounded-xl transition-colors ease-in-out duration-300 group"
		>
			<div className="relative w-6 h-6 transition-transform duration-300 ease-in-out group-hover:rotate-90">
				<SunIcon
					size={20}
					className="absolute size-5! inset-0 m-auto opacity-0 transition-opacity duration-300 [html.dark_&]:opacity-100"
				/>

				<MoonIcon
					size={20}
					className="absolute size-5! inset-0 m-auto opacity-0 transition-opacity duration-300 [html.light_&]:opacity-100"
				/>

				<span className="sr-only">Toggle theme</span>
			</div>
		</Button>
	)
}
