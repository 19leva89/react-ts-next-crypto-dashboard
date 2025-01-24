'use client'

import Link from 'next/link'
import { ReactNode, useEffect, useState } from 'react'

import { themeModeOptions } from '@/lib/definitions'
import { Sidebar, Navbar } from '@/components/shared'
import { themeMode, themeModeKey } from '@/lib/constants'
import { sidebarStateContext, themeContext } from '@/lib/context'

interface BaseDashboardProps {
	children: ReactNode
}

export const BaseDashboard = ({ children }: BaseDashboardProps) => {
	const [sidebarState, setSidebarState] = useState<boolean>(false)
	const [theme, setTheme] = useState<themeModeOptions>(themeMode.light)

	useEffect(() => {
		const currentTheme = localStorage.getItem(themeModeKey)
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
		const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches

		if (currentTheme && (currentTheme === themeMode.light || currentTheme === themeMode.dark)) {
			/* This preference take precendence over all other preferences */
			setTheme(currentTheme)
		} else if (prefersDark) {
			setTheme(themeMode.dark)
		} else if (prefersLight) {
			setTheme(themeMode.light)
		} else {
			setTheme(themeMode.light)
		}
	}, [])

	const updateSidebarState = () => {
		setSidebarState(!sidebarState)
	}

	const updateThemeMode = () => {
		const documtElement = document.querySelector('html')
		if (theme === themeMode.light) {
			setTheme(themeMode.dark)
			localStorage.setItem(themeModeKey, themeMode.dark)
			documtElement?.classList.add('dark')
		} else {
			setTheme(themeMode.light)
			localStorage.setItem(themeModeKey, themeMode.light)
			documtElement?.classList.remove('dark')
		}
	}

	return (
		<themeContext.Provider value={{ theme, setTheme: updateThemeMode }}>
			<sidebarStateContext.Provider value={{ sidebarState, setSidebarState: updateSidebarState }}>
				<Sidebar />

				<main className="ms-0 lg:ms-64 mb-10">
					<Navbar />

					<div className="px-4 sm:px-6 mt-8 max-w-expand mx-auto">{children}</div>

					<div className="text-center text-md mt-10">
						<Link href={'https://www.linkedin.com/in/lev-dmitry'} target="_blank">
							Crypto dashboard 2025 by <span className="underline"> Sobolev</span>
						</Link>
					</div>
				</main>
			</sidebarStateContext.Provider>
		</themeContext.Provider>
	)
}
