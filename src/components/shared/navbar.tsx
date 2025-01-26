'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { ChevronsUpDown, Moon, Sun, Wallet } from 'lucide-react'

import {
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	SidebarTrigger,
	Skeleton,
} from '@/components/ui'
import { useUserInfo } from '@/hooks/use-user-info'

export const Navbar = () => {
	const pathName = usePathname()

	const { user, loading, error } = useUserInfo()
	const { theme, resolvedTheme, setTheme } = useTheme()

	const [mounted, setMounted] = useState(false)

	// Needed to avoid hydration error
	useEffect(() => setMounted(true), [])

	return (
		<nav className="sticky bg-white dark:bg-dark top-0 flex justify-between items-center border-b dark:border-gray-700 py-3 px-4 sm:px-6 max-[460px]:text-sm">
			<div className="flex items-center gap-14">
				<SidebarTrigger />

				<div className="flex lg:block items-center gap-2 min-[460px]:gap-6">
					<div className="flex-col gap-1 flex">
						<h1 className="font-medium capitalize">{pathName.split('/').at(-1) || 'Dashboard'}</h1>

						{loading ? (
							<Skeleton className="h-5 w-36" />
						) : (
							<p className="text-sm text-gray-600 dark:text-slate-300 hidden min-[320px]:block">
								Welcome back, {user?.name || 'Guest'}!
							</p>
						)}
					</div>
				</div>

				<button className="bg-blue-500 dark:bg-blue-600 text-white hidden min-[680px]:flex items-center gap-2 px-5 py-2 rounded-xl selection:hover:bg-blue-600">
					<Wallet size={18} />

					<span>Connect wallet</span>
				</button>
			</div>

			<div className="flex gap-3 text-gray-500 dark:text-white">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" size="lg" className="gap-3 rounded-xl text-sm py-2 px-4 group">
							<span>USD</span>

							<div className="flex-col hidden min-[460px]:flex">
								<ChevronsUpDown
									size={20}
									className="transition-transform duration-300 group-hover:rotate-180"
								/>
							</div>
						</Button>
					</DropdownMenuTrigger>

					<DropdownMenuContent
						align="start"
						className="flex flex-col gap-2 w-[92px] min-w-[5rem] rounded-xl shadow-lg bg-white dark:bg-dark"
					>
						{['CAD', 'EUR', 'XCD'].map((currency, index) => (
							<DropdownMenuItem key={index} className="rounded-xl">
								<button className="w-full text-center duration-500">{currency}</button>
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>

				{mounted && (
					<Button
						variant="outline"
						size="lg"
						onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
						className="flex items-center px-2 w-11 rounded-xl group"
					>
						<div className="transition-transform duration-300 group-hover:rotate-90">
							{resolvedTheme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
						</div>
					</Button>
				)}
			</div>
		</nav>
	)
}
